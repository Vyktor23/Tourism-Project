import { supabase } from '@/data/clientSupabase.js'

const BASE_FIELDS =
  'id, name, slug, description, image, id_departamento, id_provincia, poblacion, altitud, temperatura_promedio, latitude, longitude, created_at, updated_at'

const fieldsWithGallery = `${BASE_FIELDS}, gallery, clima, info`
const fieldsBasic = BASE_FIELDS

const attachTerritoryNames = async (rows) => {
  if (!rows?.length) return []

  const deptoIds = [...new Set(rows.map((m) => m.id_departamento).filter((id) => id != null))]
  const provIds = [...new Set(rows.map((m) => m.id_provincia).filter((id) => id != null))]

  const [deptosRes, provsRes] = await Promise.all([
    deptoIds.length
      ? supabase.from('departamentos').select('id_departamento, nombre').in('id_departamento', deptoIds)
      : Promise.resolve({ data: [], error: null }),
    provIds.length
      ? supabase.from('provincias').select('id_provincia, nombre').in('id_provincia', provIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (deptosRes.error) console.warn('Nombres departamento:', deptosRes.error.message)
  if (provsRes.error) console.warn('Nombres provincia:', provsRes.error.message)

  const deptoMap = Object.fromEntries((deptosRes.data || []).map((d) => [d.id_departamento, d.nombre]))
  const provMap = Object.fromEntries((provsRes.data || []).map((p) => [p.id_provincia, p.nombre]))

  return rows.map((m) => ({
    ...m,
    departamento: deptoMap[m.id_departamento] || null,
    province: provMap[m.id_provincia] || null,
  }))
}

const applyActivoFilter = (query) => query.eq('status', 'activo')

const MUNICIPIO_IS_ACTIVE = (row) => !row?.status || row.status === 'activo'

/** Todos los municipios (con status) para Explorar — incluye inactivos como bloqueados. */
export const getMunicipiosForExplore = async () => {
  const fieldsWithStatus = `${fieldsWithGallery}, status`
  const fieldsBasicStatus = `${fieldsBasic}, status`

  let { data, error } = await supabase.from('municipios').select(fieldsWithStatus).order('name')

  if (error && /column .*status.* does not exist/i.test(String(error.message || ''))) {
    ;({ data, error } = await supabase.from('municipios').select(fieldsWithGallery).order('name'))
  }

  if (error && /gallery|clima|info/i.test(String(error.message || ''))) {
    ;({ data, error } = await supabase.from('municipios').select(fieldsBasicStatus).order('name'))
    if (error && /column .*status.* does not exist/i.test(String(error.message || ''))) {
      ;({ data, error } = await supabase.from('municipios').select(fieldsBasic).order('name'))
    }
  }

  if (error) {
    console.error('Error cargando municipios (explore):', error)
    throw error
  }

  const enriched = await attachTerritoryNames(data || [])
  return enriched.map((m) => ({
    ...m,
    available: MUNICIPIO_IS_ACTIVE(m),
  }))
}

export const getMunicipios = async () => {
  let q = applyActivoFilter(supabase.from('municipios').select(fieldsWithGallery)).order('name')
  let { data, error } = await q

  if (error && /column .*status.* does not exist/i.test(String(error.message || ''))) {
    ;({ data, error } = await supabase.from('municipios').select(fieldsWithGallery).order('name'))
  }

  if (error && /gallery|clima|info/i.test(String(error.message || ''))) {
    q = applyActivoFilter(supabase.from('municipios').select(fieldsBasic))
    ;({ data, error } = await q.order('name'))
    if (error && /column .*status.* does not exist/i.test(String(error.message || ''))) {
      ;({ data, error } = await supabase.from('municipios').select(fieldsBasic).order('name'))
    }
  }

  if (error) {
    console.error('Error cargando municipios:', error)
    throw error
  }

  return attachTerritoryNames(data || [])
}

export const getMunicipioBySlug = async (slug) => {
  const platoFields =
    'id,name,slug,description,tags,image_url,gallery,categoria,tiempo_preparacion,dificultad,status'

  const muniFields = 'id,name,slug,description,image,gallery,clima,id_departamento,id_provincia'

  const selectWithImagesAndClima = `${muniFields},municipio_platos(is_typical,note,sort_order,platos(${platoFields}))`

  const selectNoImagesAndClima = `${muniFields},municipio_platos(is_typical,note,sort_order,platos(id,name,slug,description,tags))`

  const selectWithImagesNoClima = `id,name,slug,description,image,gallery,${muniFields},municipio_platos(is_typical,note,sort_order,platos(${platoFields}))`

  const selectNoImagesNoClima = `id,name,slug,description,image,gallery,${muniFields},municipio_platos(is_typical,note,sort_order,platos(id,name,slug,description,tags))`

  let q = supabase.from('municipios').select(selectWithImagesAndClima).eq('slug', slug)
  q = applyActivoFilter(q)
  let { data, error } = await q.single()

  if (error && /column .*status.* does not exist/i.test(String(error.message || ''))) {
    ;({ data, error } = await supabase
      .from('municipios')
      .select(selectWithImagesAndClima)
      .eq('slug', slug)
      .single())
  }

  if (error) {
    const msg = String(error.message || '')
    const missingImageUrl = /image_url/i.test(msg)
    const missingGallery = /gallery/i.test(msg) && /does not exist|column/i.test(msg)
    const missingClima = /clima/i.test(msg) && /does not exist|column/i.test(msg)
    const missingPlatoStatus = /status/i.test(msg) && /does not exist|column/i.test(msg)

    const stripGallery = (sel) => sel.replace(/,gallery/g, '')

    if (missingPlatoStatus) {
      const pf = platoFields.replace(/,status/g, '')
      const swic = `${muniFields},municipio_platos(is_typical,note,sort_order,platos(${pf}))`
      ;({ data, error } = await applyActivoFilter(supabase.from('municipios').select(swic))
        .eq('slug', slug)
        .single())
      if (error && /column .*status.* does not exist/i.test(String(error.message || ''))) {
        ;({ data, error } = await supabase.from('municipios').select(swic).eq('slug', slug).single())
      }
    }

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

  const [enriched] = await attachTerritoryNames([data])
  return enriched
}
