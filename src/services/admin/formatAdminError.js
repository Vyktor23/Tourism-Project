export const formatAdminError = (err) => {
  const msg = String(err?.message || err || 'Error desconocido')
  const code = err?.code

  if (code === '42501' || /permission denied|row-level security/i.test(msg)) {
    return 'Sin permisos. Tu usuario debe tener rol admin en la tabla profiles.'
  }
  if (/Tiempo agotado/i.test(msg)) return msg
  if (/Sesion/i.test(msg)) return msg
  if (/duplicate key|unique/i.test(msg)) {
    return 'Ya existe un registro con esos datos.'
  }
  return msg
}
