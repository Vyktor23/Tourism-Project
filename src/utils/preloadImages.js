/** Precarga URLs en caché del navegador (decode incluido cuando está disponible). */
export const preloadImage = (url) =>
  new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('empty url'))
      return
    }
    const img = new Image()
    img.onload = () => {
      const finish = () => resolve(url)
      if (typeof img.decode === 'function') {
        img.decode().then(finish).catch(finish)
      } else {
        finish()
      }
    }
    img.onerror = () => reject(new Error(`No se pudo cargar: ${url}`))
    img.src = url
  })

export const preloadImages = async (urls) => {
  const list = [...new Set((urls || []).filter(Boolean))]
  if (!list.length) return []

  const settled = await Promise.allSettled(list.map(preloadImage))
  return settled.filter((r) => r.status === 'fulfilled').map((r) => r.value)
}
