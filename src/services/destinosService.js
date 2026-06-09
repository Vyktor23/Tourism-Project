import { supabase } from '@/data/clientSupabase.js'
import { normalizeDestino } from '@/utils/destinosTaxonomy'
import { enrichMunicipio, MUNICIPIO_EMBED_SELECT } from '@/utils/municipioEnrich.js'
import { getMunicipioBySlug } from '@/services/municipiosService.js'
import { slugify } from '@/utils/slugs.js'

const DESTINO_FIELDS =
  'id, name, slug, description, latitude, longitude, image, gallery, categories, mood, difficulty, rating, reviews_count, featured, trending, municipio_id, status, historia, horarios, mejor_epoca, recomendaciones, accesibilidad, costo_aproximado, duracion_visita, contacto, sources'

const DESTINO_FIELDS_BASIC =
  'id, name, slug, description, latitude, longitude, image, municipio_id, status, featured, trending, rating'

const toMuniId = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const mapDestino = (d, municipioFallback = null) => {
  const row = coerceNumbers(d)
  if (row && municipioFallback && !row.municipio) {
    row.municipio = municipioFallback
  }
  if (row?.municipio) row.municipio = enrichMunicipio(row.municipio)
  return normalizeDestino(row)
}

const coerceNumbers = (d) => {
  if (!d || typeof d !== 'object') return d
  const rating = d.rating
  const reviews = d.reviews_count
  return {
    ...d,
    rating: rating === null || rating === undefined ? null : Number(rating),
    reviews_count: reviews === null || reviews === undefined ? null : Number(reviews),
  }
}

const withActivoFilter = (query) => query.eq('status', 'activo')

let activeMunicipioIdsCache = null

const getActiveMunicipioIds = async () => {
  if (activeMunicipioIdsCache) return activeMunicipioIdsCache

  let { data, error } = await supabase.from('municipios').select('id').eq('status', 'activo')

  if (error && /column .*status.* does not exist/i.test(String(error.message || ''))) {
    ;({ data, error } = await supabase.from('municipios').select('id'))
  }

  if (error) {
    console.warn('No se pudo filtrar destinos por municipio activo:', error.message)
    return null
  }

  activeMunicipioIdsCache = new Set((data || []).map((m) => Number(m.id)))
  return activeMunicipioIdsCache
}

const filterByActiveMunicipio = async (rows) => {
  const activeIds = await getActiveMunicipioIds()
  if (!activeIds) return rows
  return rows.filter((d) => {
    const mId = toMuniId(d?.municipio_id)
    if (mId == null) return true
    return activeIds.has(mId)
  })
}

const isDestinoActivo = (row) => !row?.status || row.status === 'activo'

const runDestinosSelect = async ({ municipioId = null, slug = null, useStatus = true, fields }) => {
  let q = supabase.from('destinos').select(fields)

  if (municipioId != null) q = q.eq('municipio_id', municipioId)
  if (slug) q = q.eq('slug', slug).limit(1)

  if (useStatus) q = withActivoFilter(q)

  return q
}

const fetchDestinos = async (opts) => {
  const { municipioId = null, slug = null, skipMunicipioFilter = false, municipioFallback = null } =
    opts

  const pk = municipioId != null ? toMuniId(municipioId) : null

  const attempts = [
  async (useStatus) => await runDestinosSelect({ municipioId: pk, slug, useStatus, fields: DESTINO_FIELDS }),
  async (useStatus) =>
    await runDestinosSelect({ municipioId: pk, slug, useStatus, fields: DESTINO_FIELDS_BASIC }),
  ]

  let lastError = null

  for (const attempt of attempts) {
    let { data, error } = await attempt(true)

    if (error && /column .*status.* does not exist/i.test(String(error.message || ''))) {
      ;({ data, error } = await attempt(false))
    }

    if (!error) {
      let rows = (data || []).filter(isDestinoActivo).map((d) => mapDestino(d, municipioFallback))
      if (!skipMunicipioFilter) rows = await filterByActiveMunicipio(rows)
      return rows
    }

    lastError = error
    const msg = String(error.message || '')
    if (!/column|does not exist/i.test(msg)) break
  }

  // Ultimo intento con embed (solo listados globales)
  if (!slug && pk == null) {
    let { data, error } = await supabase
      .from('destinos')
      .select(`*,municipio:municipio_id(${MUNICIPIO_EMBED_SELECT})`)

    if (!error) {
      try {
        error = null
        let rows = (data || []).filter(isDestinoActivo).map((d) => mapDestino(d))
        if (!skipMunicipioFilter) rows = await filterByActiveMunicipio(rows)
        return rows
      } catch {
        /* embed fallo al mapear */
      }
    }
  }

  if (lastError) {
    console.error('Error cargando destinos:', lastError)
    throw lastError
  }

  return []
}

export const getDestinos = async () => fetchDestinos({})

export const getDestinosByMunicipio = async (municipioId, municipioFallback = null) => {
  const pk = toMuniId(municipioId)
  if (pk == null) return []

  return fetchDestinos({
    municipioId: pk,
    skipMunicipioFilter: true,
    municipioFallback,
  })
}

const slugMatches = (a, b) => slugify(a) === slugify(b)

/** Consulta directa por slug con campos minimos (detalle). */
const fetchDestinoBySlugDirect = async (slug, municipioFallback = null) => {
  const s = String(slug || '').trim()
  if (!s) return null

  const fieldSets = [
    DESTINO_FIELDS,
    DESTINO_FIELDS_BASIC,
    'id, name, slug, description, latitude, longitude, image, municipio_id, status',
  ]

  for (const fields of fieldSets) {
    let q = supabase.from('destinos').select(fields).eq('slug', s)
    q = withActivoFilter(q)
    let { data, error } = await q.maybeSingle()

    if (error && /column .*status.* does not exist/i.test(String(error.message || ''))) {
      ;({ data, error } = await supabase.from('destinos').select(fields).eq('slug', s).maybeSingle())
    }

    if (!error && data && isDestinoActivo(data)) {
      return mapDestino(data, municipioFallback)
    }

    const msg = String(error?.message || '')
    if (error && !/column|does not exist/i.test(msg)) {
      console.warn('getDestinoBySlug:', msg)
    }
  }

  return null
}

export const getDestinoBySlug = async (slug, municipioFallback = null) => {
  const s = String(slug || '').trim()
  if (!s) throw new Error('Destino no encontrado')

  const rows = await fetchDestinos({
    slug: s,
    skipMunicipioFilter: true,
    municipioFallback,
  })
  if (rows.length) return rows[0]

  const direct = await fetchDestinoBySlugDirect(s, municipioFallback)
  if (direct) return direct

  throw new Error('Destino no encontrado')
}

/** Carga ficha de destino usando ruta jerarquica (mismo criterio que listados en explore/municipio). */
export const loadDestinoDetailPage = async (destinoSlug, municipioSlug) => {
  const slug = String(destinoSlug || '').trim()
  if (!slug) throw new Error('Destino no encontrado')

  const muniSlug = String(municipioSlug || '').trim()
  if (muniSlug) {
    try {
      const muni = await getMunicipioBySlug(muniSlug)
      if (muni?.id) {
        const list = await getDestinosByMunicipio(muni.id, muni)
        const hit = list.find((d) => slugMatches(d.slug, slug))
        if (hit) return hit
      }
    } catch (e) {
      console.warn('Destino por municipio+slug:', e)
    }
  }

  return getDestinoBySlug(slug)
}
