import { supabase } from '@/data/clientSupabase.js'
import { COLOMBIA_DEPARTAMENTOS } from '@/data/colombiaDepartamentos.js'

const normalizeName = (name) =>
  String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export const getDepartamentosFromDb = async () => {
  const { data, error } = await supabase
    .from('departamentos')
    .select('id_departamento, nombre, capital, id_capital')
    .order('nombre')

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

export const getMunicipioCountByDepartamento = async () => {
  const { data, error } = await supabase
    .from('municipios')
    .select('id_departamento, departamento')

  if (error) {
    console.warn('No se pudo contar municipios por departamento:', error.message)
    return { byId: {}, byName: {} }
  }

  const byId = {}
  const byName = {}

  for (const m of data || []) {
    if (m.id_departamento) {
      byId[m.id_departamento] = (byId[m.id_departamento] || 0) + 1
    }
    if (m.departamento) {
      const key = normalizeName(m.departamento)
      byName[key] = (byName[key] || 0) + 1
    }
  }

  return { byId, byName }
}

/** Departamentos de Colombia con estado según datos en BD. */
export const getDepartamentosExplore = async () => {
  const [dbRows, counts] = await Promise.all([
    getDepartamentosFromDb(),
    getMunicipioCountByDepartamento(),
  ])

  const dbByName = new Map(
    dbRows.map((d) => [
      normalizeName(d.nombre),
      {
        ...d,
        municipioCount:
          counts.byId[d.id_departamento] ||
          counts.byName[normalizeName(d.nombre)] ||
          0,
      },
    ]),
  )

  return COLOMBIA_DEPARTAMENTOS.map((nombre) => {
    const db = dbByName.get(normalizeName(nombre))
    const municipioCount =
      db?.municipioCount || counts.byName[normalizeName(nombre)] || 0

    return {
      nombre,
      id_departamento: db?.id_departamento ?? null,
      capital: db?.capital ?? null,
      municipioCount,
      available: municipioCount > 0,
    }
  })
}

export const getProvinciasByDepartamento = async (idDepartamento) => {
  if (!idDepartamento) return []

  const { data, error } = await supabase
    .from('provincias')
    .select('id_provincia, nombre, id_departamento')
    .eq('id_departamento', idDepartamento)
    .order('nombre')

  if (error) {
    const msg = String(error.message || '')
    if (/relation .*provincias.* does not exist/i.test(msg)) return []
    throw error
  }

  return data || []
}
