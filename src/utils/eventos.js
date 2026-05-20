export const EVENTO_TIPO_LABELS = {
  festival: 'Festival',
  feria: 'Feria',
  deportivo: 'Deportivo',
  cultural: 'Cultural',
  religioso: 'Religioso',
  otro: 'Otro',
}

const parseISODate = (s) => {
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

export const formatDate = (d) => {
  if (!d) return ''
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const formatTime = (t) => {
  if (!t) return ''
  const s = String(t).trim()
  const match = s.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return s
  const h = match[1].padStart(2, '0')
  return `${h}:${match[2]}`
}

export const formatEventWhen = (evento) => {
  const start = parseISODate(evento?.start_date)
  const end = parseISODate(evento?.end_date)

  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  if (start) return formatDate(start)
  if (evento?.month_hint) return String(evento.month_hint)
  return ''
}

export const formatEventSchedule = (evento) => {
  const start = formatTime(evento?.hora_inicio)
  const end = formatTime(evento?.hora_fin)
  if (start && end) return `${start} – ${end}`
  if (start) return `Desde ${start}`
  if (end) return `Hasta ${end}`
  return ''
}

export const tipoEventoLabel = (tipo) =>
  EVENTO_TIPO_LABELS[tipo] || (tipo ? String(tipo) : '')

/** Normaliza fila de eventos para listas y detalle. */
export const normalizeEvento = (e) => {
  if (!e) return null

  const when = formatEventWhen(e)
  const schedule = formatEventSchedule(e)

  return {
    ...e,
    when,
    schedule,
    tipoLabel: tipoEventoLabel(e.tipo),
    tags: Array.isArray(e.tags) ? e.tags : [],
    _sortDate: parseISODate(e.start_date),
  }
}
