import { supabase } from '@/data/clientSupabase.js'

const EVENTO_LIST =
  'id, municipio_id, title, description, location, start_date, end_date, month_hint, tags, source_url, imagen, gallery, tipo, destacado, hora_inicio, hora_fin, costo, organizador, status'

const EVENTO_FULL =
  'id, municipio_id, title, description, location, start_date, end_date, month_hint, tags, source_url, hora_inicio, hora_fin, imagen, gallery, costo, organizador, contacto, tipo, destacado, created_at, status'

const EVENTO_BASIC =
  'id, municipio_id, title, description, location, start_date, end_date, month_hint, tags, source_url'

const isMissingColumn = (msg, col) =>
  new RegExp(col, 'i').test(msg) && /does not exist|column/i.test(msg)

const isSoftError = (msg) => {
  const m = String(msg || '')
  return (
    /relation .*eventos.* does not exist/i.test(m) ||
    /permission denied|row level security|RLS/i.test(m)
  )
}

const withActivoFilter = (query) => query.eq('status', 'activo')

const toMuniId = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export const getEventosByMunicipioId = async (municipioId) => {
  const pk = toMuniId(municipioId)
  if (pk == null) return []

  const run = async (fields, useStatus) => {
    let q = supabase
      .from('eventos')
      .select(fields)
      .eq('municipio_id', pk)
      .order('start_date', { ascending: true, nullsFirst: false })
    if (useStatus) q = withActivoFilter(q)
    return q
  }

  let { data, error } = await run(EVENTO_LIST, true)

  if (error && isMissingColumn(String(error.message || ''), 'status')) {
    ;({ data, error } = await run(EVENTO_LIST, false))
  }

  if (
    error &&
    (isMissingColumn(String(error.message || ''), 'imagen') ||
      isMissingColumn(String(error.message || ''), 'gallery'))
  ) {
    ;({ data, error } = await run(EVENTO_BASIC, false))
  }

  if (error) {
    if (isSoftError(error.message)) {
      console.warn('Eventos no disponibles (tabla/permiso):', error.message)
      return []
    }
    console.error('Error cargando eventos:', error)
    throw error
  }

  return (data || []).filter((row) => !row.status || row.status === 'activo')
}

export const getEventoById = async (id) => {
  if (!id) return null

  const run = async (fields, useStatus) => {
    let q = supabase.from('eventos').select(fields).eq('id', id)
    if (useStatus) q = withActivoFilter(q)
    return q.single()
  }

  let { data, error } = await run(EVENTO_FULL, true)

  if (error && isMissingColumn(String(error.message || ''), 'status')) {
    ;({ data, error } = await run(EVENTO_FULL, false))
  }

  if (error) {
    const msg = String(error.message || '')
    if (
      isMissingColumn(msg, 'contacto') ||
      isMissingColumn(msg, 'imagen') ||
      isMissingColumn(msg, 'gallery')
    ) {
      const listFields = EVENTO_LIST.replace(', status', '')
      ;({ data, error } = await run(listFields, false))
    }
    if (
      error &&
      (isMissingColumn(String(error.message || ''), 'imagen') ||
        isMissingColumn(String(error.message || ''), 'gallery'))
    ) {
      ;({ data, error } = await run(EVENTO_BASIC, false))
    }
  }

  if (error) throw error
  if (data?.status && data.status !== 'activo') return null
  return data
}
