import { supabase } from '@/data/clientSupabase.js'
import { slugify } from '@/utils/slugs.js'
import { withTimeout } from '@/services/admin/withTimeout.js'

const READ_MS = 12000
const WRITE_MS = 15000

export const DESTINO_STATUS_ACTIVO = 'activo'
export const DESTINO_STATUS_INACTIVO = 'inactivo'

const LIST_FIELDS =
  'id, name, slug, municipio_id, status, featured, trending, rating, image, created_at, updated_at'

const FULL_FIELDS = `${LIST_FIELDS}, description, latitude, longitude, gallery, categories, mood, difficulty, reviews_count, sources, historia, horarios, mejor_epoca, recomendaciones, accesibilidad, costo_aproximado, duracion_visita, contacto`

const toIntOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

const toNumberOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const normalizeStatus = (status) =>
  status === DESTINO_STATUS_INACTIVO ? DESTINO_STATUS_INACTIVO : DESTINO_STATUS_ACTIVO

const parseCsv = (text) =>
  String(text || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

const parseJsonField = (text, fallback, label) => {
  const raw = String(text || '').trim()
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(`${label}: JSON invalido.`)
  }
}

const slugExists = async (slug, excludeId = null) => {
  const { data, error } = await supabase.from('destinos').select('id').eq('slug', slug).limit(1)
  if (error) throw error
  const row = data?.[0]
  if (!row) return false
  if (excludeId != null && Number(row.id) === Number(excludeId)) return false
  return true
}

const resolveUniqueSlug = async (nameOrSlug, excludeId = null) => {
  const base = slugify(nameOrSlug) || 'destino'
  if (!(await slugExists(base, excludeId))) return base
  for (let n = 2; n <= 50; n += 1) {
    const candidate = `${base}-${n}`
    if (!(await slugExists(candidate, excludeId))) return candidate
  }
  throw new Error(`No se pudo generar un slug libre para "${base}".`)
}

const buildPayload = async (input, { excludeId = null } = {}) => {
  const name = String(input.name || '').trim()
  if (!name) throw new Error('El nombre del destino es obligatorio.')

  const municipioId = toIntOrNull(input.municipio_id)
  if (!municipioId) throw new Error('Selecciona el municipio del destino.')

  let slug = String(input.slug || '').trim()
  if (!slug) slug = await resolveUniqueSlug(name, excludeId)
  else slug = await resolveUniqueSlug(slug, excludeId)

  return {
    name,
    slug,
    municipio_id: municipioId,
    description: String(input.description || '').trim() || null,
    image: String(input.image || '').trim() || null,
    latitude: toNumberOrNull(input.latitude),
    longitude: toNumberOrNull(input.longitude),
    gallery: Array.isArray(input.gallery) ? input.gallery : parseCsv(input.galleryText),
    categories: Array.isArray(input.categories) ? input.categories : parseCsv(input.categoriesText),
    mood: Array.isArray(input.mood) ? input.mood : parseCsv(input.moodText),
    difficulty: String(input.difficulty || '').trim() || null,
    rating: toNumberOrNull(input.rating),
    reviews_count: toIntOrNull(input.reviews_count) ?? 0,
    featured: !!input.featured,
    trending: !!input.trending,
    historia: String(input.historia || '').trim() || null,
    mejor_epoca: String(input.mejor_epoca || '').trim() || null,
    accesibilidad: String(input.accesibilidad || '').trim() || null,
    costo_aproximado: String(input.costo_aproximado || '').trim() || null,
    duracion_visita: String(input.duracion_visita || '').trim() || null,
    recomendaciones: Array.isArray(input.recomendaciones)
      ? input.recomendaciones
      : parseCsv(input.recomendacionesText),
    horarios: parseJsonField(input.horariosText, {}, 'Horarios'),
    contacto: parseJsonField(input.contactoText, {}, 'Contacto'),
    sources: parseJsonField(input.sourcesText, [], 'Fuentes'),
    updated_at: new Date().toISOString(),
  }
}

export const listDestinosAdmin = async ({ municipioId = null } = {}) => {
  let q = supabase.from('destinos').select(LIST_FIELDS).order('name')
  if (municipioId) q = q.eq('municipio_id', municipioId)

  const { data, error } = await withTimeout(async () => await q, 'cargar destinos', READ_MS)
  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    status: normalizeStatus(row.status),
  }))
}

export const getDestinoAdmin = async (id) => {
  const pk = toIntOrNull(id)
  if (!pk) throw new Error('ID de destino invalido.')

  const { data, error } = await withTimeout(
    async () => await supabase.from('destinos').select(FULL_FIELDS).eq('id', pk).maybeSingle(),
    'cargar destino',
    READ_MS,
  )
  if (error) throw error
  if (!data) throw new Error('Destino no encontrado.')
  return { ...data, status: normalizeStatus(data.status) }
}

export const createDestinoAdmin = async (input) => {
  const built = await buildPayload(input)
  const { updated_at: _u, ...rest } = built
  const payload = { ...rest, status: DESTINO_STATUS_ACTIVO }
  const { error } = await withTimeout(
    async () => await supabase.from('destinos').insert(payload),
    'crear destino',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, slug: payload.slug }
}

export const updateDestinoAdmin = async (id, input) => {
  const pk = toIntOrNull(id)
  if (!pk) throw new Error('ID de destino invalido.')

  const payload = await buildPayload(input, { excludeId: pk })
  const { error } = await withTimeout(
    async () => await supabase.from('destinos').update(payload).eq('id', pk),
    'actualizar destino',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, slug: payload.slug }
}

export const toggleDestinoStatusAdmin = async (row) => {
  const pk = toIntOrNull(row?.id)
  if (!pk) throw new Error('ID de destino invalido.')

  const next =
    normalizeStatus(row?.status) === DESTINO_STATUS_ACTIVO
      ? DESTINO_STATUS_INACTIVO
      : DESTINO_STATUS_ACTIVO

  const { error } = await withTimeout(
    async () =>
      await supabase
        .from('destinos')
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq('id', pk),
    next === DESTINO_STATUS_ACTIVO ? 'activar destino' : 'inactivar destino',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, status: next }
}
