import { supabase } from '@/data/clientSupabase.js'
import { withTimeout } from '@/services/admin/withTimeout.js'

const READ_MS = 12000
const WRITE_MS = 15000

export const DEPTO_STATUS_ACTIVO = 'activo'
export const DEPTO_STATUS_INACTIVO = 'inactivo'

const toIntOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

const normalizeStatus = (status) =>
  status === DEPTO_STATUS_INACTIVO ? DEPTO_STATUS_INACTIVO : DEPTO_STATUS_ACTIVO

const buildPayload = (input) => {
  const nombre = String(input.nombre || '').trim()
  const capital = String(input.capital || '').trim()
  if (!nombre) throw new Error('El nombre del departamento es obligatorio.')
  if (!capital) throw new Error('La capital del departamento es obligatoria.')

  const payload = { nombre, capital }
  const idCapital = toIntOrNull(input.id_capital)
  if (idCapital != null) payload.id_capital = idCapital
  else payload.id_capital = null

  return payload
}

export const listDepartamentosAdmin = async () => {
  const { data, error } = await withTimeout(
    async () =>
      await supabase
        .from('departamentos')
        .select('id_departamento, nombre, capital, id_capital, status, created_at')
        .order('nombre'),
    'cargar departamentos',
    READ_MS,
  )
  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    status: normalizeStatus(row.status),
  }))
}

/** Municipios para asignar id_capital (opcional). */
export const listMunicipiosBriefAdmin = async ({ soloActivos = false } = {}) => {
  let q = supabase.from('municipios').select('id, name, status').order('name').limit(500)
  if (soloActivos) q = q.eq('status', 'activo')

  const { data, error } = await withTimeout(async () => await q, 'cargar municipios', READ_MS)
  if (error) {
    console.warn('Municipios para capital:', error.message)
    return []
  }
  return data || []
}

export const createDepartamentoAdmin = async (input) => {
  const payload = { ...buildPayload(input), status: DEPTO_STATUS_ACTIVO }
  const { error } = await withTimeout(
    async () => await supabase.from('departamentos').insert(payload),
    'crear departamento',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true }
}

export const updateDepartamentoAdmin = async (id, input) => {
  const pk = toIntOrNull(id)
  if (!pk) throw new Error('ID de departamento invalido.')

  const payload = buildPayload(input)
  const { error } = await withTimeout(
    async () => await supabase.from('departamentos').update(payload).eq('id_departamento', pk),
    'actualizar departamento',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true }
}

export const setDepartamentoStatusAdmin = async (id, status) => {
  const pk = toIntOrNull(id)
  if (!pk) throw new Error('ID de departamento invalido.')

  const next = normalizeStatus(status)
  const { error } = await withTimeout(
    async () =>
      await supabase.from('departamentos').update({ status: next }).eq('id_departamento', pk),
    next === DEPTO_STATUS_ACTIVO ? 'activar departamento' : 'inactivar departamento',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, status: next }
}

export const toggleDepartamentoStatusAdmin = async (row) => {
  const next =
    normalizeStatus(row?.status) === DEPTO_STATUS_ACTIVO
      ? DEPTO_STATUS_INACTIVO
      : DEPTO_STATUS_ACTIVO
  return setDepartamentoStatusAdmin(row.id_departamento, next)
}
