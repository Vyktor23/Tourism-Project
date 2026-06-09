export const INFO_PRACTICA_TIPO_LABELS = {
  emergencia: 'Emergencia',
  salud: 'Salud',
  transporte: 'Transporte',
  servicio: 'Servicio',
  otro: 'Otro',
}

export const INFO_PRACTICA_TIPOS = Object.keys(INFO_PRACTICA_TIPO_LABELS)

export const tipoInformacionPracticaLabel = (tipo) =>
  INFO_PRACTICA_TIPO_LABELS[tipo] || (tipo ? String(tipo) : '')
