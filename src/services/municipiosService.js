import { supabase } from '@/data/clientSupabase.js'

export const getMunicipios = async () => {
  const { data, error } = await supabase
    .from('municipios')
    .select('id, name, slug, province, description, image')
    .order('name')

  if (error) {
    console.error('Error cargando municipios:', error)
    throw error
  }

  return data
}

export const getMunicipioBySlug = async (slug) => {
  // Incluye gastronomía (relación municipio_platos -> platos)
  // Si todavía no creaste la columna platos.image_url, hacemos fallback automático.
<<<<<<< HEAD

  const selectWithImages = `
    id,
    name,
    slug,
    province,
    departamento,
    description,
    image,
    municipio_platos (
      is_typical,
      note,
      sort_order,
      platos (
        id,
        name,
        slug,
        description,
        tags,
        image_url
      )
    )
  `

  const selectNoImages = `
    id,
    name,
    slug,
    province,
    departamento,
    description,
    image,
    municipio_platos (
      is_typical,
      note,
      sort_order,
      platos (
        id,
        name,
        slug,
        description,
        tags
      )
    )
  `

  let { data, error } = await supabase
    .from('municipios')
    .select(selectWithImages)
    .eq('slug', slug)
    .single()

  // Postgres error típico: column "image_url" does not exist
  if (error && /image_url/i.test(error.message || '')) {
    ;({ data, error } = await supabase
      .from('municipios')
      .select(selectNoImages)
      .eq('slug', slug)
      .single())
=======
  // Clima: se espera una columna municipios.clima (jsonb). Si aún no existe, también hacemos fallback.

  const selectWithImagesAndClima = 'id,name,slug,province,departamento,description,image,clima,municipio_platos(is_typical,note,sort_order,platos(id,name,slug,description,tags,image_url))'

  const selectNoImagesAndClima = 'id,name,slug,province,departamento,description,image,clima,municipio_platos(is_typical,note,sort_order,platos(id,name,slug,description,tags))'

  const selectWithImagesNoClima = 'id,name,slug,province,departamento,description,image,municipio_platos(is_typical,note,sort_order,platos(id,name,slug,description,tags,image_url))'

  const selectNoImagesNoClima = 'id,name,slug,province,departamento,description,image,municipio_platos(is_typical,note,sort_order,platos(id,name,slug,description,tags))'

  let { data, error } = await supabase
    .from('municipios')
    .select(selectWithImagesAndClima)
    .eq('slug', slug)
    .single()

  // Fallbacks por columnas que aún no existen.
  if (error) {
    const msg = String(error.message || '')
    const missingImageUrl = /image_url/i.test(msg)
    const missingClima = /clima/i.test(msg) && /does not exist|column/i.test(msg)

    // Caso 1: falta image_url pero clima existe
    if (missingImageUrl && !missingClima) {
      ;({ data, error } = await supabase
        .from('municipios')
        .select(selectNoImagesAndClima)
        .eq('slug', slug)
        .single())
    }

    // Caso 2: falta clima pero image_url existe
    if (!missingImageUrl && missingClima) {
      ;({ data, error } = await supabase
        .from('municipios')
        .select(selectWithImagesNoClima)
        .eq('slug', slug)
        .single())
    }

    // Caso 3: faltan ambos
    if (missingImageUrl && missingClima) {
      ;({ data, error } = await supabase
        .from('municipios')
        .select(selectNoImagesNoClima)
        .eq('slug', slug)
        .single())
    }
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  }

  if (error) throw error
  return data
}