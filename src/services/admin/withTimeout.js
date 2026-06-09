/** Evita que una peticion Supabase deje la UI colgada indefinidamente. */
export const withTimeout = async (task, label, ms = 15000) => {
  let timer = null
  try {
    return await Promise.race([
      (async () => {
        const result = typeof task === 'function' ? await task() : await task
        return result
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Tiempo agotado al ${label}. Revisa red o permisos RLS.`)),
          ms,
        )
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}
