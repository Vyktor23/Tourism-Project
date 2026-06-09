import { supabase } from '@/data/clientSupabase.js'

const LIST_FIELDS =
  'id, municipio_id, tipo, nombre, descripcion, telefono, direccion, latitude, longitude, horario, disponibilidad_24h, status'

const isMissingColumn = (msg, col) =>
  new RegExp(col, 'i').test(msg) && /does not exist|column/i.test(msg)

const isSoftError = (msg) => {
  const m = String(msg || '')
  return (
    /relation .*informacion_practica.* does not exist/i.test(m) ||
    /permission denied|row level security|RLS/i.test(m)
  )
}

const withActivoFilter = (query) => query.eq('status', 'activo')

export const getInformacionPracticaByMunicipioId = async (municipioId, { tipo = null } = {}) => {
  if (!municipioId) return []

  const run = async (useStatus) => {
    let q = supabase
      .from('informacion_practica')
      .select(LIST_FIELDS)
      .eq('municipio_id', municipioId)
      .order('tipo')
      .order('nombre')
    if (tipo) q = q.eq('tipo', tipo)
    if (useStatus) q = withActivoFilter(q)
    return q
  }

  let { data, error } = await run(true)

  if (error && isMissingColumn(String(error.message || ''), 'status')) {
    ;({ data, error } = await run(false))
  }

  if (error) {
    if (isSoftError(error.message)) {
      console.warn('Informacion practica no disponible:', error.message)
      return []
    }
    console.error('Error cargando informacion practica:', error)
    throw error
  }

  return (data || []).filter((row) => !row.status || row.status === 'activo')
}

export const getInformacionPracticaById = async (id) => {
  if (!id) return null

  const run = async (useStatus) => {
    let q = supabase.from('informacion_practica').select(LIST_FIELDS).eq('id', id)
    if (useStatus) q = withActivoFilter(q)
    return q.single()
  }

  let { data, error } = await run(true)

  if (error && isMissingColumn(String(error.message || ''), 'status')) {
    ;({ data, error } = await run(false))
  }

  if (error) throw error
  if (data?.status && data.status !== 'activo') return null
  return data
}
