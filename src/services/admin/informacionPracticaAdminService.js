import { supabase } from '@/data/clientSupabase.js'
import { withTimeout } from '@/services/admin/withTimeout.js'
import { INFO_PRACTICA_TIPOS } from '@/utils/informacionPractica.js'

const READ_MS = 12000
const WRITE_MS = 15000

export const INFO_STATUS_ACTIVO = 'activo'
export const INFO_STATUS_INACTIVO = 'inactivo'

const LIST_FIELDS =
  'id, municipio_id, tipo, nombre, status, telefono, direccion, horario, disponibilidad_24h, created_at, updated_at'

const FULL_FIELDS = `${LIST_FIELDS}, descripcion, latitude, longitude`

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

const toNumberOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const normalizeStatus = (status) =>
  status === INFO_STATUS_INACTIVO ? INFO_STATUS_INACTIVO : INFO_STATUS_ACTIVO

const normalizeTipo = (tipo) => {
  const t = String(tipo || '').trim()
  return INFO_PRACTICA_TIPOS.includes(t) ? t : 'servicio'
}

const buildPayload = (input) => {
  const nombre = String(input.nombre || '').trim()
  if (!nombre) throw new Error('El nombre es obligatorio.')

  const municipioId = toIntOrNull(input.municipio_id)
  if (!municipioId) throw new Error('Selecciona el municipio.')

  return {
    municipio_id: municipioId,
    tipo: normalizeTipo(input.tipo),
    nombre,
    descripcion: String(input.descripcion || '').trim() || null,
    telefono: String(input.telefono || '').trim() || null,
    direccion: String(input.direccion || '').trim() || null,
    latitude: toNumberOrNull(input.latitude),
    longitude: toNumberOrNull(input.longitude),
    horario: String(input.horario || '').trim() || null,
    disponibilidad_24h: !!input.disponibilidad_24h,
    updated_at: new Date().toISOString(),
  }
}

export const listInformacionPracticaAdmin = async ({ municipioId = null, tipo = null } = {}) => {
  let q = supabase
    .from('informacion_practica')
    .select(LIST_FIELDS)
    .order('tipo')
    .order('nombre')

  if (municipioId) q = q.eq('municipio_id', municipioId)
  if (tipo) q = q.eq('tipo', tipo)

  const { data, error } = await withTimeout(
    async () => await q,
    'cargar informacion practica',
    READ_MS,
  )
  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    status: normalizeStatus(row.status),
  }))
}

export const getInformacionPracticaAdmin = async (id) => {
  const pk = toBigIntOrNull(id)
  if (!pk) throw new Error('ID invalido.')

  const { data, error } = await withTimeout(
    async () =>
      await supabase.from('informacion_practica').select(FULL_FIELDS).eq('id', pk).maybeSingle(),
    'cargar registro',
    READ_MS,
  )
  if (error) throw error
  if (!data) throw new Error('Registro no encontrado.')
  return { ...data, status: normalizeStatus(data.status) }
}

export const createInformacionPracticaAdmin = async (input) => {
  const { updated_at: _u, ...rest } = buildPayload(input)
  const payload = { ...rest, status: INFO_STATUS_ACTIVO }

  const { data, error } = await withTimeout(
    async () =>
      await supabase.from('informacion_practica').insert(payload).select('id').single(),
    'crear informacion practica',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, id: data.id }
}

export const updateInformacionPracticaAdmin = async (id, input) => {
  const pk = toBigIntOrNull(id)
  if (!pk) throw new Error('ID invalido.')

  const payload = buildPayload(input)
  const { error } = await withTimeout(
    async () => await supabase.from('informacion_practica').update(payload).eq('id', pk),
    'actualizar informacion practica',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, id: pk }
}

export const toggleInformacionPracticaStatusAdmin = async (row) => {
  const pk = toBigIntOrNull(row?.id)
  if (!pk) throw new Error('ID invalido.')

  const next =
    normalizeStatus(row?.status) === INFO_STATUS_ACTIVO
      ? INFO_STATUS_INACTIVO
      : INFO_STATUS_ACTIVO

  const { error } = await withTimeout(
    async () =>
      await supabase
        .from('informacion_practica')
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq('id', pk),
    next === INFO_STATUS_ACTIVO ? 'activar registro' : 'inactivar registro',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, status: next }
}
