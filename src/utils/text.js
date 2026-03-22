// Utilidades pequeñas para búsqueda en texto.
// Mantenerlo simple: lowercase + quitar tildes + limpiar espacios.

export const normalizeForSearch = (value) => {
  if (value == null) return ''
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // tildes/diacríticos
    .replace(/\s+/g, ' ')
    .trim()
}
