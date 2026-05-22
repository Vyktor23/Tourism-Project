<template>
  <div class="page">
    <div class="trip-shell">
      <header class="hero">
        <BackButton @click="goBack" />

        <div class="hero-text">
          <span class="hero-badge">📅 Planifica tu ruta</span>
          <h1>Mi viaje</h1>
          <p>Organiza tus favoritos por dias. Version basica para ir mejorando con el equipo.</p>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <strong>{{ favorites.length }}</strong>
            <span>Favoritos</span>
          </div>
          <div class="stat">
            <strong>{{ totalItems }}</strong>
            <span>En el plan</span>
          </div>
          <div class="stat">
            <strong>{{ dayCount }}</strong>
            <span>Dias</span>
          </div>
        </div>
      </header>

      <section v-if="!favorites.length" class="block">
        <div class="empty-card">
          <span>❤️</span>
          <h2>Guarda destinos primero</h2>
          <p>El planificador usa tus favoritos. Explora y marca los lugares que quieras visitar.</p>
          <button type="button" class="btn-primary" @click="go(AppRoute.explorar())">
            Explorar destinos
          </button>
        </div>
      </section>

      <template v-else>
        <section class="block">
          <div class="block-head">
            <h2>Disponibles</h2>
            <p class="block-sub">Toca un dia para agregar el destino</p>
          </div>

          <p v-if="!pool.length" class="hint">Todos tus favoritos ya estan en el plan.</p>

          <div v-else class="pool-list">
            <article v-for="dest in pool" :key="dest.slug" class="pool-card">
              <img v-if="dest.image" :src="dest.image" :alt="dest.name" />
              <div class="pool-body">
                <strong>{{ dest.name }}</strong>
                <span v-if="dest.municipio?.name">{{ dest.municipio.name }}</span>
              </div>
              <div class="day-picks">
                <button
                  v-for="day in trip.days"
                  :key="day.id"
                  type="button"
                  class="day-pick"
                  @click="addToDay(day.id, dest)"
                >
                  {{ day.label }}
                </button>
              </div>
            </article>
          </div>
        </section>

        <section class="block">
          <div class="block-head">
            <h2>Tu itinerario</h2>
            <button
              v-if="totalItems"
              type="button"
              class="link-btn"
              @click="confirmClear"
            >
              Limpiar plan
            </button>
          </div>

          <div class="days-grid">
            <article v-for="day in trip.days" :key="day.id" class="day-card">
              <h3>{{ day.label }}</h3>
              <p v-if="!day.items.length" class="day-empty">Sin destinos aun</p>
              <ul v-else class="day-list">
                <li v-for="item in day.items" :key="item.slug">
                  <button type="button" class="day-item" @click="goToDestino(item)">
                    <span class="day-item-name">{{ item.name }}</span>
                    <span v-if="item.municipio?.name" class="day-item-muni">
                      {{ item.municipio.name }}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="remove"
                    aria-label="Quitar"
                    @click="removeFromDay(day.id, item.slug)"
                  >
                    ✕
                  </button>
                </li>
              </ul>
            </article>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import { useTripPlanner } from '@/composables/useTripPlanner'
import BackButton from '@/components/BackButton.vue'
import { AppRoute } from '@/router/links.js'

defineOptions({ name: 'TripPlannerPage' })

const router = useRouter()
const { favorites } = useFavorites()
const { trip, addToDay, removeFromDay, isInTrip, clearTrip, totalItems, dayCount } =
  useTripPlanner()

const pool = computed(() => favorites.value.filter((d) => !isInTrip(d)))

const go = (routeLocation) => router.push(routeLocation)
const goBack = () => router.back()

const goToDestino = (dest) => {
  const mSlug = dest?.municipio?.slug
  if (!mSlug || !dest?.slug) return
  router.push(AppRoute.destino(dest))
}

const confirmClear = () => {
  if (confirm('¿Vaciar todo el plan de viaje?')) clearTrip()
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

.trip-shell {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.hero {
  padding: 24px 20px 28px;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a2e3a 50%, #16213e 100%);
  color: #fff;
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
  margin: 8px 0 6px;
  font-size: clamp(1.5rem, 4vw, 2.25rem);
}

.hero-text p {
  margin: 0;
  opacity: 0.88;
  font-size: 0.92rem;
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

.block {
  margin: 20px 16px 0;
}

.block-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
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
}

.link-btn {
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: #c62828;
  cursor: pointer;
}

.empty-card {
  background: #fff;
  border-radius: 22px;
  padding: 36px 24px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
}

.empty-card span {
  font-size: 40px;
}

.empty-card h2 {
  margin: 12px 0 8px;
}

.empty-card p {
  color: #666;
  margin: 0 0 16px;
}

.btn-primary {
  border: none;
  background: #111;
  color: #fff;
  padding: 12px 22px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.hint {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.pool-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pool-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
}

.pool-card img {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  object-fit: cover;
}

.pool-body {
  flex: 1;
  min-width: 120px;
}

.pool-body strong {
  display: block;
  font-size: 0.92rem;
}

.pool-body span {
  font-size: 0.8rem;
  color: #666;
}

.day-picks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
}

.day-pick {
  border: none;
  background: #f4f4f5;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.day-pick:hover {
  background: #111;
  color: #fff;
}

.days-grid {
  display: grid;
  gap: 12px;
}

.day-card {
  background: #fff;
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
}

.day-card h3 {
  margin: 0 0 10px;
  font-size: 1rem;
}

.day-empty {
  margin: 0;
  font-size: 0.88rem;
  color: #999;
}

.day-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-list li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-item {
  flex: 1;
  border: none;
  background: #f4f4f5;
  border-radius: 12px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
}

.day-item-name {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111;
}

.day-item-muni {
  display: block;
  font-size: 0.78rem;
  color: #666;
}

.remove {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  font-size: 12px;
}

@media (min-width: 640px) {
  .days-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .hero {
    padding: 32px 40px 36px;
    border-radius: 0 0 32px 32px;
  }

  .block {
    margin-left: 32px;
    margin-right: 32px;
  }
}
</style>
