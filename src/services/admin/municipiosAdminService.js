import { supabase } from '@/data/clientSupabase.js'
import { slugify } from '@/utils/slugs.js'
import { withTimeout } from '@/services/admin/withTimeout.js'

const READ_MS = 12000
const WRITE_MS = 15000

export const MUNI_STATUS_ACTIVO = 'activo'
export const MUNI_STATUS_INACTIVO = 'inactivo'

const LIST_FIELDS =
  'id, name, slug, id_departamento, id_provincia, status, poblacion, created_at, updated_at'

const FULL_FIELDS = `${LIST_FIELDS}, description, image, gallery, clima, info, altitud, temperatura_promedio, latitude, longitude`

const toIntOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

const toNumberOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const normalizeStatus = (status) =>
  status === MUNI_STATUS_INACTIVO ? MUNI_STATUS_INACTIVO : MUNI_STATUS_ACTIVO

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
  const { data, error } = await supabase.from('municipios').select('id').eq('slug', slug).limit(1)
  if (error) throw error
  const row = data?.[0]
  if (!row) return false
  if (excludeId != null && Number(row.id) === Number(excludeId)) return false
  return true
}

const resolveUniqueSlug = async (nameOrSlug, excludeId = null) => {
  const base = slugify(nameOrSlug) || 'municipio'
  if (!(await slugExists(base, excludeId))) return base
  for (let n = 2; n <= 50; n += 1) {
    const candidate = `${base}-${n}`
    if (!(await slugExists(candidate, excludeId))) return candidate
  }
  throw new Error(`No se pudo generar un slug libre para "${base}".`)
}

const buildPayload = async (input, { excludeId = null } = {}) => {
  const name = String(input.name || '').trim()
  if (!name) throw new Error('El nombre del municipio es obligatorio.')

  const idDepto = toIntOrNull(input.id_departamento)
  if (!idDepto) throw new Error('Selecciona el departamento del municipio.')

  let slug = String(input.slug || '').trim()
  if (!slug) slug = await resolveUniqueSlug(name, excludeId)
  else slug = await resolveUniqueSlug(slug, excludeId)

  const payload = {
    name,
    slug,
    id_departamento: idDepto,
    id_provincia: toIntOrNull(input.id_provincia),
    description: String(input.description || '').trim() || null,
    image: String(input.image || '').trim() || null,
    poblacion: toIntOrNull(input.poblacion),
    altitud: toIntOrNull(input.altitud),
    temperatura_promedio: String(input.temperatura_promedio || '').trim() || null,
    latitude: toNumberOrNull(input.latitude),
    longitude: toNumberOrNull(input.longitude),
    gallery: Array.isArray(input.gallery) ? input.gallery : parseCsv(input.galleryText),
    clima: parseJsonField(input.climaText, {}, 'Clima'),
    info: parseJsonField(input.infoText, {}, 'Info'),
  }

  if (payload.id_provincia == null) payload.id_provincia = null
  return payload
}

export const listMunicipiosAdmin = async ({ idDepartamento = null, idProvincia = null } = {}) => {
  let q = supabase.from('municipios').select(LIST_FIELDS).order('name')
  if (idDepartamento) q = q.eq('id_departamento', idDepartamento)
  if (idProvincia) q = q.eq('id_provincia', idProvincia)

  const { data, error } = await withTimeout(async () => await q, 'cargar municipios', READ_MS)
  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    status: normalizeStatus(row.status),
  }))
}

export const getMunicipioAdmin = async (id) => {
  const pk = toIntOrNull(id)
  if (!pk) throw new Error('ID de municipio invalido.')

  const { data, error } = await withTimeout(
    async () => await supabase.from('municipios').select(FULL_FIELDS).eq('id', pk).maybeSingle(),
    'cargar municipio',
    READ_MS,
  )
  if (error) throw error
  if (!data) throw new Error('Municipio no encontrado.')
  return { ...data, status: normalizeStatus(data.status) }
}

export const createMunicipioAdmin = async (input) => {
  const payload = { ...(await buildPayload(input)), status: MUNI_STATUS_ACTIVO }
  const { error } = await withTimeout(
    async () => await supabase.from('municipios').insert(payload),
    'crear municipio',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, slug: payload.slug }
}

export const updateMunicipioAdmin = async (id, input) => {
  const pk = toIntOrNull(id)
  if (!pk) throw new Error('ID de municipio invalido.')

  const payload = await buildPayload(input, { excludeId: pk })
  const { error } = await withTimeout(
    async () => await supabase.from('municipios').update(payload).eq('id', pk),
    'actualizar municipio',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, slug: payload.slug }
}

export const toggleMunicipioStatusAdmin = async (row) => {
  const pk = toIntOrNull(row?.id)
  if (!pk) throw new Error('ID de municipio invalido.')

  const next =
    normalizeStatus(row?.status) === MUNI_STATUS_ACTIVO
      ? MUNI_STATUS_INACTIVO
      : MUNI_STATUS_ACTIVO

  const { error } = await withTimeout(
    async () => await supabase.from('municipios').update({ status: next }).eq('id', pk),
    next === MUNI_STATUS_ACTIVO ? 'activar municipio' : 'inactivar municipio',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, status: next }
}
