import { supabase } from '@/data/clientSupabase.js'

const normalizeName = (name) =>
  String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const toDeptoId = (v) => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const isMunicipioActivo = (row) => !row?.status || row.status === 'activo'

const isDeptoActivo = (db) => !db?.status || db.status === 'activo'

export const getDepartamentosFromDb = async ({ soloActivos = true } = {}) => {
  let q = supabase
    .from('departamentos')
    .select('id_departamento, nombre, capital, id_capital, status')
    .order('nombre')

  if (soloActivos) q = q.eq('status', 'activo')

  let { data, error } = await q

  if (error && soloActivos && /column .*status.* does not exist/i.test(String(error.message || ''))) {
    const fallback = await supabase
      .from('departamentos')
      .select('id_departamento, nombre, capital, id_capital')
      .order('nombre')
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    const msg = String(error.message || '')
    if (/relation .*departamentos.* does not exist/i.test(msg)) {
      console.warn('Tabla departamentos no disponible')
      return []
    }
    throw error
  }

  return data || []
}

/** Cuenta municipios activos por id_departamento (sin embed, evita fallos RLS/join). */
export const getMunicipioCountByDepartamento = async () => {
  const accumulate = (rows) => {
    const byId = {}
    const byName = {}
    for (const m of rows || []) {
      if (!isMunicipioActivo(m)) continue
      const deptoId = toDeptoId(m.id_departamento)
      if (deptoId != null) {
        byId[deptoId] = (byId[deptoId] || 0) + 1
      }
      const nombre = m._depto_nombre
      if (nombre) {
        const key = normalizeName(nombre)
        byName[key] = (byName[key] || 0) + 1
      }
    }
    return { byId, byName }
  }

  let { data, error } = await supabase
    .from('municipios')
    .select('id_departamento, status')
    .not('id_departamento', 'is', null)

  if (error && /column .*status.* does not exist/i.test(String(error.message || ''))) {
    ;({ data, error } = await supabase
      .from('municipios')
      .select('id_departamento')
      .not('id_departamento', 'is', null))
  }

  if (error) {
    console.warn('No se pudo contar municipios por departamento:', error.message)
    return { byId: {}, byName: {} }
  }

  const rows = (data || []).map((m) => ({ ...m, _depto_nombre: null }))

  const deptoIds = [...new Set(rows.map((m) => toDeptoId(m.id_departamento)).filter((id) => id != null))]

  if (deptoIds.length) {
    const { data: deptos, error: deptoErr } = await supabase
      .from('departamentos')
      .select('id_departamento, nombre')
      .in('id_departamento', deptoIds)

    if (!deptoErr && deptos?.length) {
      const nombreById = Object.fromEntries(
        deptos.map((d) => [toDeptoId(d.id_departamento), d.nombre]),
      )
      for (const m of rows) {
        const id = toDeptoId(m.id_departamento)
        if (id != null) m._depto_nombre = nombreById[id] || null
      }
    }
  }

  return accumulate(rows)
}

const resolveMunicipioCount = (nombre, db, counts) => {
  const deptoId = toDeptoId(db?.id_departamento)
  if (deptoId != null && counts.byId[deptoId] != null) {
    return counts.byId[deptoId]
  }
  const label = db?.nombre || nombre
  return counts.byName[normalizeName(label)] || 0
}

const mapDepartamentoExplore = (nombre, db, counts) => {
  const municipioCount = resolveMunicipioCount(nombre, db, counts)
  const deptoActivo = isDeptoActivo(db)
  const deptoId = toDeptoId(db?.id_departamento)

  return {
    nombre: db?.nombre || nombre,
    id_departamento: deptoId,
    capital: db?.capital ?? null,
    municipioCount,
    inDb: deptoId != null,
    deptoActivo,
    available: deptoActivo && municipioCount > 0,
    lockedLabel: !deptoActivo
      ? 'Próximamente'
      : municipioCount === 0
        ? 'Próximamente'
        : null,
  }
}

/** Departamentos para Explorar: solo los registrados en BD; ocultos si status inactivo. */
export const getDepartamentosExplore = async () => {
  const [dbRows, counts] = await Promise.all([
    getDepartamentosFromDb({ soloActivos: false }),
    getMunicipioCountByDepartamento(),
  ])

  return dbRows
    .filter(isDeptoActivo)
    .map((db) =>
      mapDepartamentoExplore(db.nombre, {
        ...db,
        id_departamento: toDeptoId(db.id_departamento),
      }, counts),
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

export const getProvinciasByDepartamento = async (idDepartamento) => {
  const deptoId = toDeptoId(idDepartamento)
  if (deptoId == null) return []

  let q = supabase
    .from('provincias')
    .select('id_provincia, nombre, id_departamento, status')
    .eq('id_departamento', deptoId)
    .eq('status', 'activo')
    .order('nombre')

  let { data, error } = await q

  if (error && /column .*status.* does not exist/i.test(String(error.message || ''))) {
    const fallback = await supabase
      .from('provincias')
      .select('id_provincia, nombre, id_departamento')
      .eq('id_departamento', deptoId)
      .order('nombre')
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    const msg = String(error.message || '')
    if (/relation .*provincias.* does not exist/i.test(msg)) return []
    throw error
  }

  return data || []
}
