<template>
  <div class="page">
    <!-- LOADING -->
    <div v-if="loading" class="detail-shell">
      <header class="hero hero-skeleton">
        <BackButton floating @click="goBack" />
        <div class="sk-hero" />
      </header>
      <section class="block">
        <div v-for="n in 3" :key="n" class="sk-line" />
      </section>
    </div>

    <div v-else-if="destination" class="detail-shell">
      <!-- HERO -->
      <header class="hero">
        <BackButton floating @click="goBack" />

        <div class="hero-media">
          <img
            v-if="destination.image"
            :src="destination.image"
            :alt="destination.name"
          />
          <div v-else class="hero-fallback" />

          <FavoriteButton
            :destination="destination"
            variant="floating"
          />

          <div class="hero-overlay">
            <nav class="breadcrumb" aria-label="Ubicacion">
              <button type="button" @click="goToExplore">Colombia</button>
              <template v-if="muniDepartamento">
                <span>›</span>
                <span class="crumb-text">{{ muniDepartamento }}</span>
              </template>
              <template v-if="destination.municipio?.slug">
                <span>›</span>
                <button type="button" @click="goToMunicipio">
                  {{ destination.municipio.name }}
                </button>
              </template>
              <span>›</span>
              <span class="current">{{ destination.name }}</span>
            </nav>

            <span v-if="destination.trending" class="hero-badge">🔥 En tendencia</span>
            <h1>{{ destination.name }}</h1>
            <div v-if="destination.municipio" class="hero-place">
              <p class="hero-place-path">{{ municipioPathLine }}</p>
              <p v-if="muniProvinceLabel" class="hero-place-province">{{ muniProvinceLabel }}</p>
            </div>
          </div>
        </div>

        <div v-if="hasHighlights" class="hero-stats">
          <div v-if="ratingText" class="stat">
            <strong>⭐ {{ ratingText }}</strong>
            <span>Valoracion</span>
            <small v-if="reviewsText">{{ reviewsText }}</small>
          </div>
          <div v-if="difficultyText" class="stat">
            <strong>{{ difficultyText }}</strong>
            <span>Dificultad</span>
          </div>
          <div v-if="moodText" class="stat">
            <strong>{{ moodShort }}</strong>
            <span>Experiencia</span>
          </div>
        </div>
      </header>

      <!-- CHIPS -->
      <section v-if="chips.length" class="block chips-block">
        <div class="categories">
          <span v-for="c in chips" :key="c" class="chip-pill">{{ c }}</span>
        </div>
      </section>

      <!-- QUICK ACTIONS -->
      <section class="quick-actions">
        <button
          v-if="destination.municipio?.slug"
          type="button"
          class="qa"
          @click="goToMunicipio"
        >
          🏘️<span>Municipio</span>
        </button>
        <button type="button" class="qa" @click="goToExplore">
          🧭<span>Explorar</span>
        </button>
        <button
          v-if="hasCoords"
          type="button"
          class="qa"
          @click="scrollToMap"
        >
          🗺️<span>Mapa</span>
        </button>
        <button type="button" class="qa" @click="go(AppRoute.favoritos())">
          ❤️<span>Favoritos</span>
        </button>
      </section>

      <!-- DESCRIPCION -->
      <section class="block">
        <div class="block-head">
          <h2>Sobre este destino</h2>
          <p class="block-sub">Lo que debes saber antes de visitarlo</p>
        </div>
        <article class="content-card">
          <p>{{ destination.description || 'Pronto agregaremos mas informacion sobre este lugar.' }}</p>
        </article>
      </section>

      <!-- GALERIA -->
      <section v-if="gallery.length" class="block">
        <div class="block-head">
          <h2>Galeria</h2>
          <p class="block-sub">{{ gallery.length }} imagen{{ gallery.length === 1 ? '' : 'es' }}</p>
        </div>
        <div class="gallery-scroll">
          <button
            v-for="(img, i) in gallery"
            :key="i"
            type="button"
            class="gallery-item"
            @click="openImage(i)"
          >
            <img
              :src="img"
              :alt="'Foto ' + (i + 1) + ' de ' + destination.name"
              loading="lazy"
            />
          </button>
        </div>
      </section>

      <!-- MAPA -->
      <section v-if="hasCoords" ref="mapBlock" class="block">
        <div class="block-head">
          <h2>Ubicacion</h2>
          <p class="block-sub">Encuentra este destino en el mapa</p>
        </div>
        <DestinationMap
          :lat="Number(destination.latitude)"
          :lng="Number(destination.longitude)"
          :name="destination.name"
        />
      </section>

      <!-- CTA -->
      <section class="final-cta">
        <h2>Planifica tu visita</h2>
        <p>Explora mas destinos en {{ destination.municipio?.name || 'Santander' }}.</p>
        <div class="cta-actions">
          <button
            v-if="destination.municipio?.slug"
            type="button"
            class="btn primary"
            @click="goToMunicipio"
          >
            Ver municipio
          </button>
          <button type="button" class="btn ghost" @click="goToExplore">
            Explorar mas
          </button>
        </div>
      </section>
    </div>

    <div v-else class="detail-shell empty-page">
      <div class="empty-card">
        <span>😕</span>
        <h2>Destino no encontrado</h2>
        <p>No pudimos cargar la informacion de este lugar.</p>
        <button type="button" class="btn primary" @click="goToExplore">
          Volver a explorar
        </button>
      </div>
    </div>

    <!-- MODAL GALERIA -->
    <div v-if="showImage && activeImage" class="image-modal" @click.self="closeImage">
      <img :src="activeImage" :alt="destination?.name || 'Galeria'" />
      <button type="button" class="close" aria-label="Cerrar" @click="closeImage">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDestinoBySlug } from '@/services/destinosService'
import DestinationMap from '@/components/DestinationMap.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import BackButton from '@/components/BackButton.vue'
import {
  locationPathLine,
  provinceLabel,
  departamentoLabel,
} from '@/utils/locationDisplay.js'
import { AppRoute } from '@/router/links.js'

defineOptions({ name: 'DestinationDetail' })

const route = useRoute()
const router = useRouter()

const destination = ref(null)
const loading = ref(true)
const showImage = ref(false)
const activeIndex = ref(0)
const mapBlock = ref(null)

onMounted(async () => {
  try {
    destination.value = await getDestinoBySlug(route.params.destinoSlug)
  } catch (err) {
    console.error('Error cargando destino:', err)
  } finally {
    loading.value = false
  }
})

const gallery = computed(() => destination.value?.gallery || [])
const activeImage = computed(() => gallery.value[activeIndex.value])

const openImage = (i) => {
  activeIndex.value = i
  showImage.value = true
}

const closeImage = () => {
  showImage.value = false
}

const go = (routeLocation) => router.push(routeLocation)
const goBack = () => router.back()
const goToExplore = () => router.push(AppRoute.explorar())

const goToMunicipio = () => {
  const m = destination.value?.municipio
  if (!m?.slug) return
  router.push(AppRoute.municipio(m))
}

const scrollToMap = () => {
  mapBlock.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const muniDepartamento = computed(() =>
  departamentoLabel(destination.value?.municipio),
)

const municipioPathLine = computed(() =>
  locationPathLine(destination.value?.municipio),
)

const muniProvinceLabel = computed(() =>
  provinceLabel(destination.value?.municipio),
)

const difficultyText = computed(
  () => destination.value?.difficultyCanon || destination.value?.difficulty || '',
)

const ratingText = computed(() => {
  const r = destination.value?.rating
  if (r === null || r === undefined || Number.isNaN(Number(r))) return ''
  return Number(r).toFixed(1)
})

const reviewsText = computed(() => {
  const n = destination.value?.reviews_count
  if (n === null || n === undefined || Number.isNaN(Number(n)) || Number(n) <= 0) return ''
  const v = Number(n)
  return v === 1 ? '1 resena' : v + ' resenas'
})

const moodText = computed(() => {
  const moods = destination.value?.moodCanon || destination.value?.mood || []
  if (!Array.isArray(moods) || !moods.length) return ''
  return moods.slice(0, 3).join(' · ')
})

const moodShort = computed(() => {
  const t = moodText.value
  if (!t) return ''
  return t.length > 18 ? t.slice(0, 16) + '…' : t
})

const chips = computed(() => {
  const cats = destination.value?.categoriesCanon || destination.value?.categories || []
  const moods = destination.value?.moodCanon || destination.value?.mood || []
  const out = []
  for (const c of Array.isArray(cats) ? cats : []) out.push(c)
  for (const m of Array.isArray(moods) ? moods : []) {
    if (!out.includes(m)) out.push(m)
  }
  return out.slice(0, 8)
})

const hasCoords = computed(() => {
  const lat = Number(destination.value?.latitude)
  const lng = Number(destination.value?.longitude)
  return !Number.isNaN(lat) && !Number.isNaN(lng)
})

const hasHighlights = computed(() =>
  Boolean(ratingText.value || difficultyText.value || moodText.value),
)
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

.detail-shell {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* HERO */
.hero {
  position: relative;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a1a2e 55%, #16213e 100%);
  color: #fff;
  border-radius: 0 0 28px 28px;
  overflow: hidden;
}

.hero-media {
  position: relative;
  height: clamp(300px, 48vh, 420px);
}

.hero-media img,
.hero-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-fallback {
  background: linear-gradient(135deg, #222, #444);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.78), transparent 55%);
}

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 12px;
}

.breadcrumb button {
  border: none;
  background: none;
  padding: 0;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  font-weight: 600;
}

.breadcrumb .current {
  color: #fff;
  font-weight: 700;
  opacity: 0.95;
}

.breadcrumb .crumb-text {
  opacity: 0.92;
}

.hero-place {
  margin-top: 4px;
}

.hero-place-path {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.92;
  line-height: 1.4;
}

.hero-place-province {
  margin: 4px 0 0;
  font-size: 0.85rem;
  opacity: 0.8;
}

.hero-badge {
  align-self: flex-start;
  background: #ff3b30;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 8px;
}

.hero-overlay h1 {
  margin: 0;
  font-size: clamp(1.5rem, 5vw, 2.2rem);
  line-height: 1.12;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 16px 16px 20px;
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
  font-size: 1rem;
  line-height: 1.25;
}

.stat span {
  display: block;
  font-size: 11px;
  opacity: 0.8;
  margin-top: 4px;
}

.stat small {
  display: block;
  font-size: 10px;
  opacity: 0.7;
  margin-top: 2px;
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
}

.chips-block .categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-pill {
  background: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
}

.content-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px 16px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
}

.content-card p {
  margin: 0;
  line-height: 1.65;
  color: #444;
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
  font-size: 18px;
}

.qa span {
  font-size: 11px;
  opacity: 0.85;
}

/* GALERIA */
.gallery-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
}

.gallery-item {
  flex: 0 0 min(280px, 82vw);
  scroll-snap-align: start;
  border: none;
  padding: 0;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.1);
}

.gallery-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
}

.gallery-item:hover img {
  transform: scale(1.03);
}

/* MAP */
.block :deep(.map-wrapper) {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

/* CTA */
.final-cta {
  margin: 28px 16px 0;
  padding: 32px 24px;
  border-radius: 24px;
  text-align: center;
  color: #fff;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a1a2e 55%, #16213e 100%);
}

.final-cta h2 {
  margin: 0 0 8px;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
}

.final-cta p {
  margin: 0;
  opacity: 0.88;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 16px;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.btn.primary {
  background: #fff;
  color: #111;
}

.btn.ghost {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.45);
}

/* EMPTY / LOADING */
.empty-page {
  padding: 40px 16px;
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

.hero-skeleton {
  position: relative;
  min-height: 320px;
}

.sk-hero {
  height: 280px;
  background: linear-gradient(90deg, #222, #333, #222);
  animation: shimmer 1.2s infinite;
}

.sk-line {
  height: 16px;
  border-radius: 8px;
  background: #e8e8e8;
  margin-bottom: 10px;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* MODAL */
.image-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
  padding: 20px;
}

.image-modal img {
  max-width: 100%;
  max-height: 88vh;
  border-radius: 14px;
  object-fit: contain;
}

.close {
  position: fixed;
  top: 18px;
  right: 18px;
  background: white;
  border: none;
  border-radius: 999px;
  width: 42px;
  height: 42px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
}

@media (min-width: 640px) {
  .quick-actions {
    max-width: 480px;
  }

  .gallery-scroll {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow: visible;
  }

  .gallery-item {
    flex: unset;
  }
}

@media (min-width: 1024px) {
  .hero {
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
  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
