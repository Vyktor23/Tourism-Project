import { supabase } from '@/data/clientSupabase.js'

const PLATO_FULL =
  'id, name, slug, description, tags, image_url, id_departamento, ingredientes, historia, preparacion, categoria, tiempo_preparacion, dificultad, created_at, updated_at'

const PLATO_BASIC = 'id, name, slug, description, tags, image_url'

const isMissingColumn = (msg, col) =>
  new RegExp(col, 'i').test(msg) && /does not exist|column/i.test(msg)

export const getPlatoBySlug = async (slug) => {
  if (!slug) return null

  let { data, error } = await supabase
    .from('platos')
    .select(PLATO_FULL)
    .eq('slug', slug)
    .single()

  if (error && isMissingColumn(String(error.message || ''), 'ingredientes')) {
    ;({ data, error } = await supabase
      .from('platos')
      .select(PLATO_BASIC)
      .eq('slug', slug)
      .single())
  }

  if (error) throw error
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
