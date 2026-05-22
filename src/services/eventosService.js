import { supabase } from '@/data/clientSupabase.js'

const EVENTO_LIST =
  'id, municipio_id, title, description, location, start_date, end_date, month_hint, tags, source_url, imagen, gallery, tipo, destacado, hora_inicio, hora_fin, costo, organizador'

const EVENTO_FULL =
  'id, municipio_id, title, description, location, start_date, end_date, month_hint, tags, source_url, hora_inicio, hora_fin, imagen, gallery, costo, organizador, contacto, tipo, destacado, created_at'

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

export const getEventosByMunicipioId = async (municipioId) => {
  if (!municipioId) return []

  let { data, error } = await supabase
    .from('eventos')
    .select(EVENTO_LIST)
    .eq('municipio_id', municipioId)
    .order('start_date', { ascending: true, nullsFirst: false })

  if (error && (isMissingColumn(String(error.message || ''), 'imagen') || isMissingColumn(String(error.message || ''), 'gallery'))) {
    ;({ data, error } = await supabase
      .from('eventos')
      .select(EVENTO_BASIC)
      .eq('municipio_id', municipioId)
      .order('start_date', { ascending: true, nullsFirst: false }))
  }

  if (error) {
    if (isSoftError(error.message)) {
      console.warn('Eventos no disponibles (tabla/permiso):', error.message)
      return []
    }
    console.error('Error cargando eventos:', error)
    throw error
  }

  return data || []
}

export const getEventoById = async (id) => {
  if (!id) return null

  let { data, error } = await supabase
    .from('eventos')
    .select(EVENTO_FULL)
    .eq('id', id)
    .single()

  if (error) {
    const msg = String(error.message || '')
    if (
      isMissingColumn(msg, 'contacto') ||
      isMissingColumn(msg, 'imagen') ||
      isMissingColumn(msg, 'gallery')
    ) {
      ;({ data, error } = await supabase
        .from('eventos')
        .select(EVENTO_LIST)
        .eq('id', id)
        .single())
    }
    if (
      error &&
      (isMissingColumn(String(error.message || ''), 'imagen') ||
        isMissingColumn(String(error.message || ''), 'gallery'))
    ) {
      ;({ data, error } = await supabase
        .from('eventos')
        .select(EVENTO_BASIC)
        .eq('id', id)
        .single())
    }
  }

  if (error) throw error
  return data
}
