import { supabase } from '@/data/clientSupabase.js'

const ACTIVIDAD_FIELDS =
  'id, destino_id, nombre, descripcion, duracion, dificultad, costo, recomendaciones, orden'

export const getActividadesByDestinoId = async (destinoId) => {
  if (!destinoId) return []

  const { data, error } = await supabase
    .from('actividades')
    .select(ACTIVIDAD_FIELDS)
    .eq('destino_id', destinoId)
    .order('orden', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    const msg = String(error.message || '')
    if (/relation .*actividades.* does not exist/i.test(msg)) {
      console.warn('Tabla actividades no disponible:', msg)
      return []
    }
    console.error('Error cargando actividades:', error)
    throw error
  }

  return data || []
}
