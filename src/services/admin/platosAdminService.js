import { supabase } from '@/data/clientSupabase.js'
import { slugify } from '@/utils/slugs'
import { withTimeout } from '@/services/admin/withTimeout.js'

const READ_MS = 12000
const WRITE_MS = 15000

export const PLATO_STATUS_ACTIVO = 'activo'
export const PLATO_STATUS_INACTIVO = 'inactivo'

const LIST_FIELDS =
  'id, name, slug, id_departamento, status, categoria, image_url, created_at, updated_at'

const FULL_FIELDS = `${LIST_FIELDS}, description, tags, ingredientes, historia, preparacion, tiempo_preparacion, dificultad, gallery`

const toIntOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

const toBigIntOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

const normalizeStatus = (status) =>
  status === PLATO_STATUS_INACTIVO ? PLATO_STATUS_INACTIVO : PLATO_STATUS_ACTIVO

const parseCsv = (text) =>
  String(text || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

const slugExists = async (slug, excludeId = null) => {
  const { data, error } = await supabase.from('platos').select('id').eq('slug', slug).limit(1)
  if (error) throw error
  const row = data?.[0]
  if (!row) return false
  if (excludeId != null && Number(row.id) === Number(excludeId)) return false
  return true
}

const resolveUniqueSlug = async (nameOrSlug, excludeId = null) => {
  const base = slugify(nameOrSlug) || 'plato'
  if (!(await slugExists(base, excludeId))) return base
  for (let n = 2; n <= 50; n += 1) {
    const candidate = `${base}-${n}`
    if (!(await slugExists(candidate, excludeId))) return candidate
  }
  throw new Error(`No se pudo generar un slug libre para "${base}".`)
}

const buildPayload = async (input, { excludeId = null } = {}) => {
  const name = String(input.name || '').trim()
  if (!name) throw new Error('El nombre del plato es obligatorio.')

  let slug = String(input.slug || '').trim()
  if (!slug) slug = await resolveUniqueSlug(name, excludeId)
  else slug = await resolveUniqueSlug(slug, excludeId)

  const idDepto = toBigIntOrNull(input.id_departamento)

  return {
    name,
    slug,
    description: String(input.description || '').trim() || null,
    tags: Array.isArray(input.tags) ? input.tags : parseCsv(input.tagsText),
    image_url: String(input.image_url || '').trim() || null,
    id_departamento: idDepto,
    ingredientes: Array.isArray(input.ingredientes)
      ? input.ingredientes
      : parseCsv(input.ingredientesText),
    historia: String(input.historia || '').trim() || null,
    preparacion: String(input.preparacion || '').trim() || null,
    categoria: String(input.categoria || '').trim() || null,
    tiempo_preparacion: toIntOrNull(input.tiempo_preparacion),
    dificultad: String(input.dificultad || '').trim() || null,
    gallery: Array.isArray(input.gallery) ? input.gallery : parseCsv(input.galleryText),
    updated_at: new Date().toISOString(),
  }
}

export const listPlatosAdmin = async ({ idDepartamento = null } = {}) => {
  let q = supabase.from('platos').select(LIST_FIELDS).order('name')
  if (idDepartamento) q = q.eq('id_departamento', idDepartamento)

  const { data, error } = await withTimeout(async () => await q, 'cargar platos', READ_MS)
  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    status: normalizeStatus(row.status),
  }))
}

export const getPlatoAdmin = async (id) => {
  const pk = toBigIntOrNull(id)
  if (!pk) throw new Error('ID de plato invalido.')

  const { data, error } = await withTimeout(
    async () => await supabase.from('platos').select(FULL_FIELDS).eq('id', pk).maybeSingle(),
    'cargar plato',
    READ_MS,
  )
  if (error) throw error
  if (!data) throw new Error('Plato no encontrado.')
  return { ...data, status: normalizeStatus(data.status) }
}

export const createPlatoAdmin = async (input) => {
  const built = await buildPayload(input)
  const { updated_at: _u, ...rest } = built
  const payload = { ...rest, status: PLATO_STATUS_ACTIVO }

  const { data, error } = await withTimeout(
    async () => await supabase.from('platos').insert(payload).select('id, slug').single(),
    'crear plato',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, id: data.id, slug: data.slug }
}

export const updatePlatoAdmin = async (id, input) => {
  const pk = toBigIntOrNull(id)
  if (!pk) throw new Error('ID de plato invalido.')

  const payload = await buildPayload(input, { excludeId: pk })
  const { error } = await withTimeout(
    async () => await supabase.from('platos').update(payload).eq('id', pk),
    'actualizar plato',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, slug: payload.slug }
}

export const togglePlatoStatusAdmin = async (row) => {
  const pk = toBigIntOrNull(row?.id)
  if (!pk) throw new Error('ID de plato invalido.')

  const next =
    normalizeStatus(row?.status) === PLATO_STATUS_ACTIVO
      ? PLATO_STATUS_INACTIVO
      : PLATO_STATUS_ACTIVO

  const { error } = await withTimeout(
    async () =>
      await supabase
        .from('platos')
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq('id', pk),
    next === PLATO_STATUS_ACTIVO ? 'activar plato' : 'inactivar plato',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, status: next }
}

/** Vinculos plato ↔ municipios */
export const listMunicipioPlatosByPlato = async (platoId) => {
  const pk = toBigIntOrNull(platoId)
  if (!pk) return []

  const { data, error } = await withTimeout(
    async () =>
      await supabase
        .from('municipio_platos')
        .select(
          'municipio_id, plato_id, is_typical, note, sort_order, municipios(id, name, slug, status)',
        )
        .eq('plato_id', pk)
        .order('sort_order')
        .order('municipio_id'),
    'cargar vinculos plato',
    READ_MS,
  )
  if (error) throw error
  return (data || []).map((row) => ({
    municipio_id: row.municipio_id,
    plato_id: row.plato_id,
    is_typical: row.is_typical,
    note: row.note,
    sort_order: row.sort_order,
    municipio_name: row.municipios?.name || `Municipio ${row.municipio_id}`,
    municipio_slug: row.municipios?.slug,
    municipio_status: row.municipios?.status,
  }))
}

export const upsertMunicipioPlatoLink = async (input) => {
  const platoId = toBigIntOrNull(input.plato_id)
  const municipioId = toIntOrNull(input.municipio_id)
  if (!platoId) throw new Error('Plato no valido.')
  if (!municipioId) throw new Error('Selecciona un municipio.')

  const row = {
    plato_id: platoId,
    municipio_id: municipioId,
    is_typical: input.is_typical !== false,
    note: String(input.note || '').trim() || null,
    sort_order: toIntOrNull(input.sort_order) ?? 0,
  }

  const { error } = await withTimeout(
    async () =>
      await supabase.from('municipio_platos').upsert(row, {
        onConflict: 'municipio_id,plato_id',
      }),
    'vincular plato a municipio',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true }
}

export const removeMunicipioPlatoLink = async (platoId, municipioId) => {
  const pId = toBigIntOrNull(platoId)
  const mId = toIntOrNull(municipioId)
  if (!pId || !mId) throw new Error('Vinculo invalido.')

  const { error } = await withTimeout(
    async () =>
      await supabase
        .from('municipio_platos')
        .delete()
        .eq('plato_id', pId)
        .eq('municipio_id', mId),
    'quitar vinculo plato',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true }
}

export const countMunicipioLinksByPlato = async (platoIds) => {
  if (!platoIds?.length) return {}
  const { data, error } = await supabase
    .from('municipio_platos')
    .select('plato_id')
    .in('plato_id', platoIds)
  if (error) {
    console.warn('Conteo vinculos:', error.message)
    return {}
  }
  const counts = {}
  for (const row of data || []) {
    counts[row.plato_id] = (counts[row.plato_id] || 0) + 1
  }
  return counts
}
