/** Aplana joins Supabase departamentos(nombre) / provincias(nombre) a strings de UI. */
export const enrichMunicipio = (row) => {
  if (!row || typeof row !== 'object') return row

  const deptoRaw = row.departamento
  const provRaw = row.provincia

  const departamento =
    typeof deptoRaw === 'string'
      ? deptoRaw.trim() || null
      : deptoRaw?.nombre?.trim?.() || null

  const province =
    typeof provRaw === 'string'
      ? provRaw.trim() || null
      : provRaw?.nombre?.trim?.() || null

  const { departamento: _d, provincia: _p, ...rest } = row
  return { ...rest, departamento, province }
}

export const MUNICIPIO_EMBED_SELECT =
  'id,name,slug,id_departamento,id_provincia,departamento:departamentos(nombre),provincia:provincias(nombre)'
