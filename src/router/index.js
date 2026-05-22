import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Explore from '@/views/Explore.vue'
import Favorites from '@/views/Favorites.vue'
import More from '@/views/More.vue'
import Emergencies from '@/views/Emergencies.vue'
import DestinationDetail from '@/views/DestinationDetail.vue'
import MunicipioDetail from '@/views/MunicipioDetail.vue'
import PlatoDetail from '@/views/PlatoDetail.vue'
import EventoDetail from '@/views/EventoDetail.vue'
import NotFound from '@/views/NotFound.vue'
import About from '@/views/About.vue'
import TripPlanner from '@/views/TripPlanner.vue'
import SafetyTips from '@/views/SafetyTips.vue'

const GEO = '/colombia/:departamentoSlug/:municipioSlug'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    { path: '/', redirect: { name: 'inicio' } },

    { path: '/inicio', name: 'inicio', component: Home, meta: { title: 'Inicio' } },
    { path: '/explorar', name: 'explorar', component: Explore, meta: { title: 'Explorar' } },
    { path: '/favoritos', name: 'favoritos', component: Favorites, meta: { title: 'Favoritos' } },
    { path: '/mas', name: 'mas', component: More, meta: { title: 'Mas opciones' } },
    {
      path: '/emergencias',
      name: 'emergencias',
      component: Emergencies,
      meta: { title: 'Emergencias' },
    },
    {
      path: '/consejos-seguridad',
      name: 'consejos-seguridad',
      component: SafetyTips,
      meta: { title: 'Consejos de seguridad' },
    },
    { path: '/acerca-de', name: 'acerca-de', component: About, meta: { title: 'Acerca de' } },
    {
      path: '/planificar-viaje',
      name: 'planificar-viaje',
      component: TripPlanner,
      meta: { title: 'Planificar viaje' },
    },

    {
      path: GEO,
      name: 'municipio',
      component: MunicipioDetail,
      props: true,
      meta: { title: 'Municipio' },
    },
    {
      path: `${GEO}/destinos/:destinoSlug`,
      name: 'destino',
      component: DestinationDetail,
      props: true,
      meta: { title: 'Destino' },
    },
    {
      path: `${GEO}/gastronomia/:platoSlug`,
      name: 'plato',
      component: PlatoDetail,
      props: true,
      meta: { title: 'Gastronomia' },
    },
    {
      path: `${GEO}/eventos/:eventoId`,
      name: 'evento',
      component: EventoDetail,
      props: true,
      meta: { title: 'Evento' },
    },

    /* Redirecciones — URLs anteriores siguen funcionando */
    { path: '/home', redirect: { name: 'inicio' } },
    { path: '/explore', redirect: { name: 'explorar' } },
    { path: '/favorites', redirect: { name: 'favoritos' } },
    { path: '/more', redirect: { name: 'mas' } },
    { path: '/emergencies', redirect: { name: 'emergencias' } },
    { path: '/safety-tips', redirect: { name: 'consejos-seguridad' } },
    { path: '/about', redirect: { name: 'acerca-de' } },
    { path: '/trip-planner', redirect: { name: 'planificar-viaje' } },

    {
      path: '/explore/:municipioSlug',
      redirect: (to) => ({
        name: 'municipio',
        params: {
          departamentoSlug: 'santander',
          municipioSlug: to.params.municipioSlug,
        },
      }),
    },
    {
      path: '/explore/:municipioSlug/platos/:platoSlug',
      redirect: (to) => ({
        name: 'plato',
        params: {
          departamentoSlug: 'santander',
          municipioSlug: to.params.municipioSlug,
          platoSlug: to.params.platoSlug,
        },
      }),
    },
    {
      path: '/explore/:municipioSlug/eventos/:eventoId',
      redirect: (to) => ({
        name: 'evento',
        params: {
          departamentoSlug: 'santander',
          municipioSlug: to.params.municipioSlug,
          eventoId: to.params.eventoId,
        },
      }),
    },
    {
      path: '/explore/:municipioSlug/:destinoSlug',
      redirect: (to) => ({
        name: 'destino',
        params: {
          departamentoSlug: 'santander',
          municipioSlug: to.params.municipioSlug,
          destinoSlug: to.params.destinoSlug,
        },
      }),
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound, meta: { title: 'No encontrado' } },
  ],
})

const APP_NAME = 'Turismo Santander'

router.afterEach((to) => {
  const section = to.meta?.title
  document.title = section ? `${section} · ${APP_NAME}` : APP_NAME
})

export default router
