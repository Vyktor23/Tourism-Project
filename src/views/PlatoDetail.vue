<template>
  <div class="page">
    <div v-if="loading" class="detail-shell loading-shell">
      <header class="hero hero-skeleton"><div class="sk-hero" /></header>
      <section class="block"><div v-for="n in 3" :key="n" class="sk-line" /></section>
    </div>

    <div v-else-if="plato" class="detail-shell">
      <header class="hero hero-food">
        <BackButton floating @click="goBack" />

        <div class="hero-media">
          <img
            v-if="heroImage"
            :src="heroImage"
            :alt="plato.name"
            class="hero-image"
          />
          <div v-else class="hero-placeholder" aria-hidden="true">🍽️</div>

          <div class="hero-overlay">
            <nav class="breadcrumb" aria-label="Ubicacion">
              <button type="button" @click="goToExplore">Colombia</button>
              <template v-if="muniDepartamento">
                <span>›</span>
                <span class="crumb-text">{{ muniDepartamento }}</span>
              </template>
              <template v-if="municipio?.slug">
                <span>›</span>
                <button type="button" @click="goToMunicipio">
                  {{ municipio.name }}
                </button>
              </template>
              <span>›</span>
              <span class="current">{{ plato.name }}</span>
            </nav>

            <div class="hero-badges">
              <span v-if="relation?.is_typical" class="hero-pill typical">Tipico del municipio</span>
              <span v-if="plato.categoria" class="hero-pill">{{ plato.categoria }}</span>
            </div>

            <h1>{{ plato.name }}</h1>
            <div v-if="municipio" class="hero-place">
              <p class="hero-place-path">{{ municipioPathLine }}</p>
              <p v-if="muniProvinceLabel" class="hero-place-province">{{ muniProvinceLabel }}</p>
            </div>
          </div>
        </div>

        <div v-if="heroStats.length" class="hero-stats">
          <div v-for="item in heroStats" :key="item.label" class="stat">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </header>

      <section class="quick-actions">
        <button v-if="municipio?.slug" type="button" class="qa" @click="goToMunicipio">
          🏘️<span>Municipio</span>
        </button>
        <button type="button" class="qa" @click="goToExplore">
          🧭<span>Explorar</span>
        </button>
        <button
          v-if="ingredientes.length"
          type="button"
          class="qa"
          @click="scrollToSection(ingredientesBlock)"
        >
          🥘<span>Ingredientes</span>
        </button>
        <button
          v-if="plato.preparacion"
          type="button"
          class="qa"
          @click="scrollToSection(preparacionBlock)"
        >
          👨‍🍳<span>Preparacion</span>
        </button>
      </section>

      <section v-if="plato.tags?.length" class="block">
        <div class="block-head">
          <h2>Etiquetas</h2>
        </div>
        <div class="chip-row">
          <span v-for="t in plato.tags" :key="t" class="chip-pill">{{ prettyTag(t) }}</span>
        </div>
      </section>

      <section v-if="hasMedia" class="block">
        <div class="block-head">
          <h2>Galería</h2>
          <p class="block-sub">{{ platoMediaSummary }}</p>
        </div>
        <div class="content-card gallery-wrap">
          <MediaGallery
            title=""
            :alt-prefix="plato.name"
            :image-sources="platoMedia.imageSources"
            :video-sources="platoMedia.videoSources"
          />
        </div>
      </section>

      <section v-if="plato.description" class="block">
        <div class="block-head">
          <h2>Sobre el plato</h2>
          <p class="block-sub">Descripcion y caracteristicas</p>
        </div>
        <article class="content-card">
          <p>{{ plato.description }}</p>
        </article>
      </section>

      <section v-if="plato.historia" class="block">
        <div class="block-head">
          <h2>Historia</h2>
          <p class="block-sub">Origen y tradicion gastronomica</p>
        </div>
        <article class="content-card">
          <p>{{ plato.historia }}</p>
        </article>
      </section>

      <section v-if="ingredientes.length" ref="ingredientesBlock" class="block">
        <div class="block-head">
          <h2>Ingredientes</h2>
          <p class="block-sub">{{ ingredientes.length }} ingrediente{{ ingredientes.length === 1 ? '' : 's' }}</p>
        </div>
        <article class="content-card">
          <ul class="ingredient-list">
            <li v-for="(ing, i) in ingredientes" :key="i">{{ ing }}</li>
          </ul>
        </article>
      </section>

      <section v-if="plato.preparacion" ref="preparacionBlock" class="block">
        <div class="block-head">
          <h2>Preparacion</h2>
          <p class="block-sub">Pasos para disfrutarlo en casa</p>
        </div>
        <article class="content-card prep-card">
          <p class="pre-block">{{ plato.preparacion }}</p>
        </article>
      </section>

      <section v-if="relation?.note" class="block">
        <div class="block-head">
          <h2>Nota del municipio</h2>
        </div>
        <article class="content-card note-card">
          <p>{{ relation.note }}</p>
        </article>
      </section>

      <section class="final-cta">
        <h2>Saborea Santander</h2>
        <p>Explora mas platos y experiencias en {{ municipio?.name || 'la region' }}.</p>
        <div class="cta-actions">
          <button v-if="municipio?.slug" type="button" class="btn primary" @click="goToMunicipio">
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
        <span>🍽️</span>
        <h2>Plato no encontrado</h2>
        <p>No pudimos cargar la informacion de este plato.</p>
        <button type="button" class="btn primary" @click="goToExplore">
          Volver a explorar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MediaGallery from '@/components/MediaGallery.vue'
import BackButton from '@/components/BackButton.vue'
import {
  locationPathLine,
  provinceLabel,
  departamentoLabel,
} from '@/utils/locationDisplay.js'
import { AppRoute } from '@/router/links.js'
import { getMunicipioBySlug } from '@/services/municipiosService'
import { getPlatoBySlug, getMunicipioPlatoRelation } from '@/services/platosService'
import { buildEntityMedia } from '@/utils/media'

defineOptions({ name: 'PlatoDetail' })

const route = useRoute()
const router = useRouter()

const municipio = ref(null)
const plato = ref(null)
const relation = ref(null)
const loading = ref(true)
const ingredientesBlock = ref(null)
const preparacionBlock = ref(null)

const prettyTag = (tag) => {
  if (!tag) return ''
  const cleaned = String(tag).replace(/_/g, ' ').trim()
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

const ingredientes = computed(() => {
  const list = plato.value?.ingredientes
  return Array.isArray(list) ? list.filter(Boolean) : []
})

const metaItems = computed(() => {
  const items = []
  if (plato.value?.tiempo_preparacion) {
    items.push({ k: 'Tiempo', v: `${plato.value.tiempo_preparacion} min` })
  }
  if (plato.value?.dificultad) {
    items.push({ k: 'Dificultad', v: plato.value.dificultad })
  }
  if (ingredientes.value.length) {
    items.push({ k: 'Ingredientes', v: String(ingredientes.value.length) })
  }
  return items
})

const heroStats = computed(() =>
  metaItems.value.map((x) => ({ label: x.k, value: x.v })),
)

const muniDepartamento = computed(() => departamentoLabel(municipio.value))

const municipioPathLine = computed(() => locationPathLine(municipio.value))

const muniProvinceLabel = computed(() => provinceLabel(municipio.value))

const platoMedia = computed(() =>
  buildEntityMedia(plato.value, {
    imageFields: ['image_url'],
    galleryField: 'gallery',
  }),
)

const heroImage = computed(() => platoMedia.value.heroImage)

const hasMedia = computed(() => platoMedia.value.totalCount > 0)

const platoMediaSummary = computed(() => {
  const { imageCount, videoCount } = platoMedia.value
  const parts = []
  if (imageCount) parts.push(`${imageCount} foto${imageCount === 1 ? '' : 's'}`)
  if (videoCount) parts.push(`${videoCount} video${videoCount === 1 ? '' : 's'}`)
  return parts.join(' · ') || 'Galeria del plato'
})

const goBack = () => router.back()
const goToExplore = () => router.push(AppRoute.explorar())

const goToMunicipio = () => {
  const m = municipio.value
  if (!m?.slug) return
  router.push(AppRoute.municipio(m))
}

const scrollToSection = (el) => {
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(async () => {
  try {
    const municipioSlug = route.params.municipioSlug
    const platoSlug = route.params.platoSlug

    municipio.value = await getMunicipioBySlug(municipioSlug)
    plato.value = await getPlatoBySlug(platoSlug)

    if (municipio.value?.id && plato.value?.id) {
      relation.value = await getMunicipioPlatoRelation(municipio.value.id, plato.value.id)
      if (!relation.value) plato.value = null
    }
  } catch (err) {
    console.error('Error cargando plato:', err)
  } finally {
    loading.value = false
  }
})
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

.hero-food {
  background: linear-gradient(165deg, #0a0a0a 0%, #3a2a10 45%, #1a1a2e 100%);
  color: #fff;
  border-radius: 0 0 28px 28px;
  overflow: hidden;
}

.hero {
  position: relative;
}

.hero-media {
  position: relative;
  height: clamp(280px, 46vh, 400px);
}

.hero-image,
.hero-placeholder {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.hero-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  background: linear-gradient(135deg, #4a3a20, #6a5028);
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

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.hero-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.hero-pill.typical {
  background: rgba(255, 152, 0, 0.45);
  border-color: rgba(255, 193, 7, 0.5);
}

.hero-overlay h1 {
  margin: 0;
  font-size: clamp(1.4rem, 5vw, 2rem);
  line-height: 1.15;
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
  font-size: 1.1rem;
}

.stat span {
  display: block;
  font-size: 11px;
  opacity: 0.8;
  margin-top: 4px;
}

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

.chip-row {
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

.gallery-wrap {
  padding: 12px;
}

.gallery-wrap :deep(.media-gallery h2) {
  display: none;
}

.ingredient-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.ingredient-list li {
  padding: 10px 12px;
  background: #f4f4f5;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.ingredient-list li::before {
  content: '• ';
  font-weight: 700;
  color: #c47a00;
}

.pre-block {
  white-space: pre-line;
}

.note-card {
  background: linear-gradient(135deg, #fffbeb, #fff8e6);
  border: 1px solid rgba(255, 193, 7, 0.25);
}

.final-cta {
  margin: 28px 16px 0;
  padding: 32px 24px;
  border-radius: 24px;
  text-align: center;
  color: #fff;
  background: linear-gradient(165deg, #0a0a0a 0%, #3a2a10 50%, #16213e 100%);
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

@media (min-width: 640px) {
  .quick-actions {
    max-width: 520px;
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
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
