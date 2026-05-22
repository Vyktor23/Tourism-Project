<template>
  <div class="page">
    <div class="more-shell">

      <!-- HERO -->
      <header class="hero">
        <BackButton @click="goBack" />

        <div class="hero-text">
          <span class="hero-badge">⚙️ Centro de opciones</span>
          <h1>Mas opciones</h1>
          <p>Todo lo que necesitas para viajar, explorar y sentirte seguro en Santander.</p>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <strong>{{ favorites.length }}</strong>
            <span>Favoritos</span>
          </div>
          <div class="stat">
            <strong>{{ activeLinksCount }}</strong>
            <span>Accesos</span>
          </div>
          <div class="stat">
            <strong>{{ comingSoonCount }}</strong>
            <span>Proximamente</span>
          </div>
        </div>
      </header>

      <!-- ACCESOS RAPIDOS -->
      <section class="quick-actions">
        <button type="button" class="qa" @click="goTo(AppRoute.inicio())">
          🏠<span>Inicio</span>
        </button>
        <button type="button" class="qa" @click="goTo(AppRoute.explorar())">
          🧭<span>Explorar</span>
        </button>
        <button type="button" class="qa" @click="goTo(AppRoute.favoritos())">
          ❤️<span>Favoritos</span>
        </button>
        <button type="button" class="qa qa-danger" @click="goTo(AppRoute.emergencias())">
          🚨<span>SOS</span>
        </button>
      </section>

      <!-- EXPLORAR -->
      <section class="block">
        <div class="block-head">
          <h2>Explora Santander</h2>
          <p class="block-sub">Navega por destinos, categorias y planes</p>
        </div>

        <div class="menu-list">
          <button
            v-for="item in exploreMenu"
            :key="item.id"
            type="button"
            class="menu-card"
            :class="{ disabled: !item.enabled }"
            :disabled="!item.enabled"
            @click="onMenuClick(item)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <div class="menu-body">
              <strong>{{ item.title }}</strong>
              <span class="menu-desc">{{ item.desc }}</span>
            </div>
            <span v-if="item.enabled" class="menu-arrow">›</span>
            <span v-else class="menu-badge">Prox.</span>
          </button>
        </div>
      </section>

      <!-- SEGURIDAD -->
      <section class="block">
        <div class="block-head">
          <h2>Seguridad</h2>
          <p class="block-sub">Herramientas para actuar con calma</p>
        </div>

        <div class="menu-list">
          <button
            v-for="item in safetyMenu"
            :key="item.id"
            type="button"
            class="menu-card"
            :class="{ highlight: item.highlight, disabled: !item.enabled }"
            :disabled="!item.enabled"
            @click="onMenuClick(item)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <div class="menu-body">
              <strong>{{ item.title }}</strong>
              <span class="menu-desc">{{ item.desc }}</span>
            </div>
            <span v-if="item.enabled" class="menu-arrow">›</span>
            <span v-else class="menu-badge">Prox.</span>
          </button>
        </div>
      </section>

      <!-- UTILIDAD -->
      <section class="block">
        <div class="block-head">
          <h2>Utilidad</h2>
          <p class="block-sub">Funciones que llegaran en proximas versiones</p>
        </div>

        <div class="menu-list">
          <button
            v-for="item in utilityMenu"
            :key="item.id"
            type="button"
            class="menu-card disabled"
            disabled
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <div class="menu-body">
              <strong>{{ item.title }}</strong>
              <span class="menu-desc">{{ item.desc }}</span>
            </div>
            <span class="menu-badge">Prox.</span>
          </button>
        </div>
      </section>

      <!-- MI VIAJE -->
      <section class="block">
        <div class="block-head">
          <h2>Planifica tu viaje</h2>
          <p class="block-sub">Organiza favoritos por dias (version basica)</p>
        </div>

        <div class="menu-list">
          <button type="button" class="menu-card" @click="goTo(AppRoute.planificarViaje())">
            <span class="menu-icon">📅</span>
            <div class="menu-body">
              <strong>Mi viaje</strong>
              <span class="menu-desc">Itinerario de 3 dias con tus favoritos</span>
            </div>
            <span class="menu-arrow">›</span>
          </button>
        </div>
      </section>

      <!-- ACERCA DE -->
      <section class="block">
        <div class="block-head">
          <h2>Acerca de la app</h2>
          <p class="block-sub">Proyecto educativo y equipo</p>
        </div>

        <div class="menu-list">
          <button type="button" class="menu-card" @click="goTo(AppRoute.acercaDe())">
            <span class="menu-icon">ℹ️</span>
            <div class="menu-body">
              <strong>About</strong>
              <span class="menu-desc">Proposito, diseno y creditos del proyecto</span>
            </div>
            <span class="menu-arrow">›</span>
          </button>

          <button type="button" class="menu-card disabled" disabled>
            <span class="menu-icon">💬</span>
            <div class="menu-body">
              <strong>Enviar sugerencias</strong>
              <span class="menu-desc">Pronto podras compartir ideas con el equipo</span>
            </div>
            <span class="menu-badge">Prox.</span>
          </button>
        </div>
      </section>

      <!-- CTA -->
      <section class="final-cta">
        <h2>¿Listo para tu proxima aventura?</h2>
        <p>Explora destinos, guarda favoritos y viaja con informacion clara.</p>
        <button type="button" class="btn-cta" @click="goTo(AppRoute.explorar())">
          Empezar a explorar
        </button>
      </section>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import BackButton from '@/components/BackButton.vue'
import { AppRoute } from '@/router/links.js'

defineOptions({ name: 'MorePage' })

const router = useRouter()
const { favorites } = useFavorites()

const exploreMenu = [
  {
    id: 'explore',
    icon: '🗺️',
    title: 'Explorar destinos',
    desc: 'Departamentos, municipios y mapa',
    to: () => AppRoute.explorar(),
    enabled: true,
  },
  {
    id: 'home-dest',
    icon: '🏞️',
    title: 'Destinos destacados',
    desc: 'Recomendados desde el inicio',
    to: () => AppRoute.inicio(),
    enabled: true,
  },
  {
    id: 'nearby',
    icon: '📍',
    title: 'Lugares cercanos',
    desc: 'Segun tu ubicacion en tiempo real',
    to: null,
    enabled: false,
  },
]

const safetyMenu = [
  {
    id: 'emergencies',
    icon: '🚨',
    title: 'Centro de emergencias',
    desc: '123, 112, 119 y compartir ubicacion',
    to: () => AppRoute.emergencias(),
    enabled: true,
    highlight: true,
  },
  {
    id: 'tips',
    icon: '🛡️',
    title: 'Consejos de seguridad',
    desc: 'Recomendaciones para viajeros',
    to: () => AppRoute.consejosSeguridad(),
    enabled: true,
  },
  {
    id: 'alerts',
    icon: '📢',
    title: 'Alertas por zona',
    desc: 'Avisos locales y temporales',
    to: null,
    enabled: false,
  },
]

const utilityMenu = [
  { id: 'offline', icon: '📶', title: 'Modo sin conexion', desc: 'Consulta contenido guardado' },
  { id: 'dark', icon: '🌙', title: 'Modo oscuro', desc: 'Interfaz adaptada a poca luz' },
  { id: 'settings', icon: '⚙️', title: 'Configuracion', desc: 'Preferencias de la app' },
]

const allMenuItems = [...exploreMenu, ...safetyMenu]

const activeLinksCount = computed(
  () => allMenuItems.filter((i) => i.enabled && i.to).length + 7,
)

const comingSoonCount = computed(
  () =>
    allMenuItems.filter((i) => !i.enabled).length +
    utilityMenu.length +
    1,
)

const goBack = () => router.back()
const goTo = (routeLocation) => router.push(routeLocation)

const onMenuClick = (item) => {
  if (!item.enabled || !item.to) return
  goTo(item.to())
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  overflow-x: hidden;
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
  background: #f4f4f5;
}

.more-shell {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* HERO */
.hero {
  padding: 24px 20px 28px;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a1a2e 50%, #2a2040 100%);
  color: white;
  border-radius: 0 0 28px 28px;
}

.hero-text {
  margin-top: 14px;
}

.hero-badge {
  font-size: 13px;
  opacity: 0.88;
}

.hero-text h1 {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  margin: 8px 0 6px;
  line-height: 1.12;
}

.hero-text p {
  margin: 0;
  opacity: 0.88;
  font-size: clamp(0.9rem, 2vw, 1.05rem);
  max-width: 40ch;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.stat {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 12px 10px;
  text-align: center;
}

.stat strong {
  display: block;
  font-size: 1.35rem;
}

.stat span {
  font-size: 11px;
  opacity: 0.8;
}

/* QUICK ACTIONS */
.quick-actions {
  margin: 14px 16px 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.qa {
  border: none;
  background: white;
  border-radius: 14px;
  padding: 12px 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  font-size: 20px;
  transition: transform 0.15s ease;
}

.qa:active {
  transform: scale(0.96);
}

.qa-danger {
  background: linear-gradient(145deg, #ef5350, #c62828);
  color: #fff;
}

.qa span {
  font-size: 11px;
  opacity: 0.85;
}

.qa-danger span {
  opacity: 0.95;
  font-weight: 600;
}

/* BLOCKS */
.block {
  margin: 20px 16px 0;
}

.block-head {
  margin-bottom: 12px;
}

.block-head h2 {
  margin: 0;
  font-size: 1.15rem;
}

.block-sub {
  margin: 4px 0 0;
  font-size: 0.88rem;
  color: #666;
  line-height: 1.4;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-card {
  width: 100%;
  border: none;
  background: #fff;
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.menu-card:not(.disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.1);
}

.menu-card.highlight {
  border-left: 4px solid #e53935;
}

.menu-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-card.disabled:hover {
  transform: none;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
}

.menu-icon {
  font-size: 24px;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f5;
  border-radius: 12px;
}

.menu-card.highlight .menu-icon {
  background: #fff5f5;
}

.menu-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-body strong {
  font-size: 0.95rem;
  color: #111;
}

.menu-desc {
  font-size: 0.82rem;
  color: #666;
  line-height: 1.35;
}

.menu-arrow {
  font-size: 22px;
  color: #bbb;
  flex-shrink: 0;
}

.menu-arrow.chevron {
  transition: transform 0.2s ease;
}

.menu-arrow.chevron.open {
  transform: rotate(90deg);
}

.menu-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f0f0f0;
  color: #666;
  flex-shrink: 0;
}

/* CTA */
.final-cta {
  margin: 28px 16px 0;
  padding: 32px 24px;
  border-radius: 24px;
  text-align: center;
  color: #fff;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a1a2e 55%, #2a2040 100%);
}

.final-cta h2 {
  margin: 0 0 8px;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
}

.final-cta p {
  margin: 0;
  opacity: 0.88;
  font-size: 0.92rem;
}

.btn-cta {
  margin-top: 16px;
  border: none;
  background: #fff;
  color: #111;
  padding: 12px 22px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

@media (min-width: 640px) {
  .quick-actions {
    max-width: 480px;
  }
}

@media (min-width: 1024px) {
  .hero {
    padding: 32px 40px 36px;
    border-radius: 0 0 32px 32px;
  }

  .block,
  .quick-actions,
  .final-cta {
    margin-left: 32px;
    margin-right: 32px;
  }
}

@media (max-width: 520px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
