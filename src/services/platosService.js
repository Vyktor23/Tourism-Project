import { supabase } from '@/data/clientSupabase.js'

const PLATO_FULL =
  'id, name, slug, description, tags, image_url, gallery, id_departamento, ingredientes, historia, preparacion, categoria, tiempo_preparacion, dificultad, created_at, updated_at, status'

const PLATO_BASIC = 'id, name, slug, description, tags, image_url'

const isMissingColumn = (msg, col) =>
  new RegExp(col, 'i').test(msg) && /does not exist|column/i.test(msg)

const withActivoFilter = (query) => query.eq('status', 'activo')

export const getPlatoBySlug = async (slug) => {
  if (!slug) return null

  const run = async (useStatus, fields) => {
    let q = supabase.from('platos').select(fields).eq('slug', slug)
    if (useStatus) q = withActivoFilter(q)
    return q.single()
  }

  let { data, error } = await run(true, PLATO_FULL)

  if (error && isMissingColumn(String(error.message || ''), 'status')) {
    ;({ data, error } = await run(false, PLATO_FULL))
  }

  if (
    error &&
    (isMissingColumn(String(error.message || ''), 'ingredientes') ||
      isMissingColumn(String(error.message || ''), 'gallery'))
  ) {
    ;({ data, error } = await run(false, PLATO_BASIC))
  }

  if (error) throw error
  if (data?.status && data.status !== 'activo') return null
  return data
}

export const getMunicipioPlatoRelation = async (municipioId, platoId) => {
  if (!municipioId || !platoId) return null

  const { data, error } = await supabase
    .from('municipio_platos')
    .select('is_typical, note, sort_order')
    .eq('municipio_id', municipioId)
    .eq('plato_id', platoId)
    .maybeSingle()

  if (error) {
    console.warn('Relación municipio_platos no disponible:', error.message)
    return null
  }

  return data
}
