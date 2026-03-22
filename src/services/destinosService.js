import { supabase } from '@/data/clientSupabase.js'
<<<<<<< HEAD
=======
import { normalizeDestino } from '@/utils/destinosTaxonomy'

const coerceNumbers = (d) => {
  if (!d || typeof d !== 'object') return d
  const rating = d.rating
  const reviews = d.reviews_count
  return {
    ...d,
    rating: rating === null || rating === undefined ? null : Number(rating),
    reviews_count: reviews === null || reviews === undefined ? null : Number(reviews)
  }
}
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)

/* TODOS LOS DESTINOS */
export const getDestinos = async () => {
  const { data, error } = await supabase
    .from('destinos')
<<<<<<< HEAD
    .select(`
      *,
      municipio:municipio_id (
        id,
        name,
        slug
      )
    `)
=======
    .select('*,municipio:municipio_id(id,name,slug,province,departamento)')
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)

  if (error) {
    console.error('Error cargando destinos:', error)
    throw error
  }

<<<<<<< HEAD
  return data
=======
  return (data || []).map(d => normalizeDestino(coerceNumbers(d)))
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
}

/* DESTINOS POR MUNICIPIO */
export const getDestinosByMunicipio = async (municipioId) => {
  const { data, error } = await supabase
    .from('destinos')
<<<<<<< HEAD
    .select(`
      *,
      municipio:municipio_id (
        id,
        name,
        slug
      )
    `)
    .eq('municipio_id', municipioId)

  if (error) throw error
  return data
=======
    .select('*,municipio:municipio_id(id,name,slug,province,departamento)')
    .eq('municipio_id', municipioId)

  if (error) throw error
  return (data || []).map(d => normalizeDestino(coerceNumbers(d)))
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
}

/* DESTINO POR SLUG */
export const getDestinoBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('destinos')
<<<<<<< HEAD
    .select(`
      *,
      municipio:municipio_id (
        id,
        name,
        slug,
        province
      )
    `)
=======
    .select('*,municipio:municipio_id(id,name,slug,province,departamento)')
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
    .eq('slug', slug)
    .single()

  if (error) throw error
<<<<<<< HEAD
  return data
}
=======
  return normalizeDestino(coerceNumbers(data))
}
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
