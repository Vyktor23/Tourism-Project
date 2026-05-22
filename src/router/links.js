import { departamentoSlug } from '@/utils/slugs.js'

/** Rutas nombradas — un solo lugar para navegar en la app. */
export const AppRoute = {
  inicio: () => ({ name: 'inicio' }),
  explorar: (query) => (query ? { name: 'explorar', query } : { name: 'explorar' }),
  favoritos: () => ({ name: 'favoritos' }),
  mas: () => ({ name: 'mas' }),
  emergencias: () => ({ name: 'emergencias' }),
  consejosSeguridad: () => ({ name: 'consejos-seguridad' }),
  acercaDe: () => ({ name: 'acerca-de' }),
  planificarViaje: () => ({ name: 'planificar-viaje' }),

  municipio: (municipio) => ({
    name: 'municipio',
    params: {
      departamentoSlug: departamentoSlug(municipio),
      municipioSlug: municipio.slug,
    },
  }),

  destino: (destino) => ({
    name: 'destino',
    params: {
      departamentoSlug: departamentoSlug(destino?.municipio),
      municipioSlug: destino?.municipio?.slug,
      destinoSlug: destino.slug,
    },
  }),

  plato: (municipio, plato) => ({
    name: 'plato',
    params: {
      departamentoSlug: departamentoSlug(municipio),
      municipioSlug: municipio.slug,
      platoSlug: plato.slug,
    },
  }),

  evento: (municipio, evento) => ({
    name: 'evento',
    params: {
      departamentoSlug: departamentoSlug(municipio),
      municipioSlug: municipio.slug,
      eventoId: String(evento.id),
    },
  }),
}
