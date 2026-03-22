import { supabase } from '@/data/clientSupabase.js'

// Eventos culturales por municipio.
// Esquema esperado (public.eventos):
// id, municipio_id, title, description, location, start_date, end_date, month_hint, tags (text[]), source_url

export const getEventosByMunicipioId = async (municipioId) => {
  if (!municipioId) return []

  const { data, error } = await supabase
    .from('eventos')
    .select('id, municipio_id, title, description, location, start_date, end_date, month_hint, tags, source_url')
    .eq('municipio_id', municipioId)
    .order('start_date', { ascending: true, nullsFirst: false })

  // Si la tabla aún no existe o hay RLS sin policy, no tumbamos el detalle del municipio.
  if (error) {
    const msg = String(error.message || '')
    const missingTable = /relation .*eventos.* does not exist/i.test(msg)
    const noPolicy = /permission denied|row level security|RLS/i.test(msg)

    if (missingTable || noPolicy) {
      console.warn('Eventos no disponibles (tabla/permiso):', msg)
      return []
    }

    console.error('Error cargando eventos:', error)
    throw error
  }

  return data || []
}
