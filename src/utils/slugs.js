/** Slugs para URLs legibles (SEO y rutas jerarquicas). */

export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function departamentoSlug(source) {
  if (!source) return 'santander'
  if (typeof source === 'string') return slugify(source) || 'santander'
  return slugify(source.departamento) || 'santander'
}
