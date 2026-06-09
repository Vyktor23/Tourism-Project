import { supabase } from '@/data/clientSupabase.js'
import { withTimeout } from '@/services/admin/withTimeout.js'

const READ_MS = 12000
const WRITE_MS = 15000

export const PROV_STATUS_ACTIVO = 'activo'
export const PROV_STATUS_INACTIVO = 'inactivo'

const toIntOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

const normalizeStatus = (status) =>
  status === PROV_STATUS_INACTIVO ? PROV_STATUS_INACTIVO : PROV_STATUS_ACTIVO

const buildPayload = (input) => {
  const nombre = String(input.nombre || '').trim()
  const idDepto = toIntOrNull(input.id_departamento)
  if (!nombre) throw new Error('El nombre de la provincia es obligatorio.')
  if (!idDepto) throw new Error('Selecciona el departamento de la provincia.')

  return { nombre, id_departamento: idDepto }
}

export const listProvinciasAdmin = async (idDepartamento = null) => {
  let q = supabase
    .from('provincias')
    .select('id_provincia, nombre, id_departamento, status, created_at')
    .order('nombre')

  if (idDepartamento) q = q.eq('id_departamento', idDepartamento)

  const { data, error } = await withTimeout(async () => await q, 'cargar provincias', READ_MS)
  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    status: normalizeStatus(row.status),
  }))
}

export const createProvinciaAdmin = async (input) => {
  const payload = { ...buildPayload(input), status: PROV_STATUS_ACTIVO }
  const { error } = await withTimeout(
    async () => await supabase.from('provincias').insert(payload),
    'crear provincia',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true }
}

export const updateProvinciaAdmin = async (id, input) => {
  const pk = toIntOrNull(id)
  if (!pk) throw new Error('ID de provincia invalido.')

  const payload = buildPayload(input)
  const { error } = await withTimeout(
    async () => await supabase.from('provincias').update(payload).eq('id_provincia', pk),
    'actualizar provincia',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true }
}

export const setProvinciaStatusAdmin = async (id, status) => {
  const pk = toIntOrNull(id)
  if (!pk) throw new Error('ID de provincia invalido.')

  const next = normalizeStatus(status)
  const { error } = await withTimeout(
    async () =>
      await supabase.from('provincias').update({ status: next }).eq('id_provincia', pk),
    next === PROV_STATUS_ACTIVO ? 'activar provincia' : 'inactivar provincia',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true, status: next }
}

export const toggleProvinciaStatusAdmin = async (row) => {
  const next =
    normalizeStatus(row?.status) === PROV_STATUS_ACTIVO
      ? PROV_STATUS_INACTIVO
      : PROV_STATUS_ACTIVO
  return setProvinciaStatusAdmin(row.id_provincia, next)
}
