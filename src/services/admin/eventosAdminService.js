import { supabase } from '@/data/clientSupabase.js'
import { withTimeout } from '@/services/admin/withTimeout.js'

const READ_MS = 12000
const WRITE_MS = 15000

export const EVENTO_STATUS_ACTIVO = 'activo'
export const EVENTO_STATUS_INACTIVO = 'inactivo'

export const EVENTO_TIPOS = ['festival', 'feria', 'deportivo', 'cultural', 'religioso', 'otro']

const LIST_FIELDS =
  'id, municipio_id, title, status, tipo, destacado, start_date, end_date, month_hint, location, imagen, created_at'

const FULL_FIELDS = `${LIST_FIELDS}, description, tags, source_url, hora_inicio, hora_fin, costo, organizador, contacto, gallery`

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
  status === EVENTO_STATUS_INACTIVO ? EVENTO_STATUS_INACTIVO : EVENTO_STATUS_ACTIVO

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

const normalizeTime = (v) => {
  const s = String(v || '').trim()
  if (!s) return null
  const match = s.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return s
  return `${match[1].padStart(2, '0')}:${match[2]}:00`
}

const normalizeTipo = (tipo) => {
  const t = String(tipo || 'cultural').trim()
  return EVENTO_TIPOS.includes(t) ? t : 'cultural'
}

const buildPayload = (input) => {
  const title = String(input.title || '').trim()
  if (!title) throw new Error('El titulo del evento es obligatorio.')

  const municipioId = toIntOrNull(input.municipio_id)
  if (!municipioId) throw new Error('Selecciona el municipio del evento.')

  return {
    title,
    municipio_id: municipioId,
    description: String(input.description || '').trim() || null,
    location: String(input.location || '').trim() || null,
    start_date: String(input.start_date || '').trim() || null,
    end_date: String(input.end_date || '').trim() || null,
    month_hint: String(input.month_hint || '').trim() || null,
    tags: Array.isArray(input.tags) ? input.tags : parseCsv(input.tagsText),
    source_url: String(input.source_url || '').trim() || null,
    hora_inicio: normalizeTime(input.hora_inicio),
    hora_fin: normalizeTime(input.hora_fin),
    imagen: String(input.imagen || '').trim() || null,
    costo: String(input.costo || '').trim() || null,
    organizador: String(input.organizador || '').trim() || null,
    contacto: parseJsonField(input.contactoText, {}, 'Contacto'),
    tipo: normalizeTipo(input.tipo),
    destacado: !!input.destacado,
    gallery: Array.isArray(input.gallery) ? input.gallery : parseCsv(input.galleryText),
  }
}

export const listEventosAdmin = async ({ municipioId = null } = {}) => {
  let q = supabase
    .from('eventos')
    .select(LIST_FIELDS)
    .order('start_date', { ascending: true, nullsFirst: false })
    .order('title')

  if (municipioId) q = q.eq('municipio_id', municipioId)

  const { data, error } = await withTimeout(async () => await q, 'cargar eventos', READ_MS)
  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    status: normalizeStatus(row.status),
  }))
}

export const getEventoAdmin = async (id) => {
  const pk = toBigIntOrNull(id)
  if (!pk) throw new Error('ID de evento invalido.')

  const { data, error } = await withTimeout(
    async () => await supabase.from('eventos').select(FULL_FIELDS).eq('id', pk).maybeSingle(),
    'cargar evento',
    READ_MS,
  )
  if (error) throw error
  if (!data) throw new Error('Evento no encontrado.')
  return { ...data, status: normalizeStatus(data.status) }
}

export const createEventoAdmin = async (input) => {
  const payload = { ...buildPayload(input), status: EVENTO_STATUS_ACTIVO }

  const { data, error } = await withTimeout(
    async () => await supabase.from('eventos').insert(payload).select('id').single(),
    'crear evento',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, id: data.id }
}

export const updateEventoAdmin = async (id, input) => {
  const pk = toBigIntOrNull(id)
  if (!pk) throw new Error('ID de evento invalido.')

  const payload = buildPayload(input)
  const { error } = await withTimeout(
    async () => await supabase.from('eventos').update(payload).eq('id', pk),
    'actualizar evento',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, id: pk }
}

export const toggleEventoStatusAdmin = async (row) => {
  const pk = toBigIntOrNull(row?.id)
  if (!pk) throw new Error('ID de evento invalido.')

  const next =
    normalizeStatus(row?.status) === EVENTO_STATUS_ACTIVO
      ? EVENTO_STATUS_INACTIVO
      : EVENTO_STATUS_ACTIVO

  const { error } = await withTimeout(
    async () => await supabase.from('eventos').update({ status: next }).eq('id', pk),
    next === EVENTO_STATUS_ACTIVO ? 'activar evento' : 'inactivar evento',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, status: next }
}
