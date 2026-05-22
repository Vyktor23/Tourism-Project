/** Texto de ubicacion: Colombia · departamento · municipio */

export function locationPathParts(municipio) {
  const parts = ['Colombia']
  if (municipio?.departamento) parts.push(municipio.departamento)
  if (municipio?.name) parts.push(municipio.name)
  return parts
}

export function locationPathLine(municipio, separator = ' · ', options = {}) {
  const { includeMunicipio = true } = options
  const parts = ['Colombia']
  if (municipio?.departamento) parts.push(municipio.departamento)
  if (includeMunicipio && municipio?.name) parts.push(municipio.name)
  return parts.join(separator)
}

export function provinceLabel(municipio) {
  const p = municipio?.province
  if (!p) return ''
  if (/^provincia\b/i.test(String(p).trim())) return String(p).trim()
  return `Provincia ${p}`
}

export function departamentoLabel(municipio) {
  return municipio?.departamento?.trim() || ''
}
