import { supabase } from '@/data/clientSupabase.js'

export const getMunicipios = async () => {
  const fieldsWithGallery =
    'id, name, slug, province, departamento, description, image, gallery, id_departamento, id_provincia'
  const fieldsBasic =
    'id, name, slug, province, departamento, description, image, id_departamento, id_provincia'

  let { data, error } = await supabase.from('municipios').select(fieldsWithGallery).order('name')

  if (error && /gallery/i.test(String(error.message || ''))) {
    ;({ data, error } = await supabase.from('municipios').select(fieldsBasic).order('name'))
  }

  if (error) {
    console.error('Error cargando municipios:', error)
    throw error
  }

  return data
}

export const getMunicipioBySlug = async (slug) => {
  // Incluye gastronomía (relación municipio_platos -> platos)
  // Si todavía no creaste la columna platos.image_url, hacemos fallback automático.

  // Clima: se espera una columna municipios.clima (jsonb). Si aún no existe, también hacemos fallback.

  const platoFields =
    'id,name,slug,description,tags,image_url,gallery,categoria,tiempo_preparacion,dificultad'

  const selectWithImagesAndClima = `id,name,slug,province,departamento,description,image,gallery,clima,municipio_platos(is_typical,note,sort_order,platos(${platoFields}))`

  const selectNoImagesAndClima = `id,name,slug,province,departamento,description,image,gallery,clima,municipio_platos(is_typical,note,sort_order,platos(id,name,slug,description,tags))`

  const selectWithImagesNoClima = `id,name,slug,province,departamento,description,image,gallery,municipio_platos(is_typical,note,sort_order,platos(${platoFields}))`

  const selectNoImagesNoClima = 'id,name,slug,province,departamento,description,image,gallery,municipio_platos(is_typical,note,sort_order,platos(id,name,slug,description,tags))'

  let { data, error } = await supabase
    .from('municipios')
    .select(selectWithImagesAndClima)
    .eq('slug', slug)
    .single()

  // Fallbacks por columnas que aún no existen.
  if (error) {
    const msg = String(error.message || '')
    const missingImageUrl = /image_url/i.test(msg)
    const missingGallery = /gallery/i.test(msg) && /does not exist|column/i.test(msg)
    const missingClima = /clima/i.test(msg) && /does not exist|column/i.test(msg)

    const stripGallery = (sel) => sel.replace(/,gallery/g, '')

    if (missingGallery) {
      ;({ data, error } = await supabase
        .from('municipios')
        .select(stripGallery(selectWithImagesAndClima))
        .eq('slug', slug)
        .single())
    }

    if (error && missingImageUrl) {
      ;({ data, error } = await supabase
        .from('municipios')
        .select(missingGallery ? stripGallery(selectNoImagesAndClima) : selectNoImagesAndClima)
        .eq('slug', slug)
        .single())
    }

    if (error && missingClima) {
      ;({ data, error } = await supabase
        .from('municipios')
        .select(
          missingGallery ? stripGallery(selectWithImagesNoClima) : selectWithImagesNoClima,
        )
        .eq('slug', slug)
        .single())
    }

    if (error && missingImageUrl && missingClima) {
      ;({ data, error } = await supabase
        .from('municipios')
        .select(missingGallery ? stripGallery(selectNoImagesNoClima) : selectNoImagesNoClima)
        .eq('slug', slug)
        .single())
    }
  }

  if (error) throw error
  return data
}