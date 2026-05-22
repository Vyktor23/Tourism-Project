<template>
  <div class="page">
    <div class="home-shell">

      <!-- HERO -->
      <header class="hero">
        <div v-if="heroSlides.length" class="hero-slides" aria-hidden="true">
          <div
            v-for="(url, i) in heroSlides"
            :key="url"
            class="hero-slide"
            :class="{ active: i === heroSlideIndex }"
            :style="{ backgroundImage: 'url(' + url + ')' }"
          />
        </div>
        <div class="hero-overlay" />
        <div class="hero-inner">
          <span class="hero-badge">📍 Santander, Colombia</span>
          <h1>Descubre Colombia, vive experiencias</h1>
          <p class="hero-sub">Turismo auténtico, paisajes inolvidables</p>

          <div class="hero-actions">
            <button type="button" class="btn primary" @click="goToExplore()">
              Explorar destinos
            </button>
            <button type="button" class="btn ghost" @click="scrollToMap">
              Ver mapa
            </button>
          </div>

          <div v-if="!loading" class="hero-stats">
            <div class="stat">
              <strong>{{ stats.destinos }}</strong>
              <span>Destinos</span>
            </div>
            <div class="stat">
              <strong>{{ stats.municipios }}</strong>
              <span>Municipios</span>
            </div>
            <div class="stat">
              <strong>{{ stats.rating }}</strong>
              <span>Valoración media</span>
            </div>
          </div>
        </div>
      </header>

      <!-- BÚSQUEDA -->
      <section class="block search-block">
        <SearchBox
          v-model="searchQuery"
          :destinations="destinos"
          :municipios="municipios"
          placeholder="Buscar destinos, municipios o experiencias..."
          @select="onSearchSelect"
        />
      </section>

      <!-- DESTINOS DESTACADOS -->
      <section class="block">
        <div class="block-head">
          <div>
            <h2>Destinos destacados</h2>
            <p class="block-sub">Los planes más recomendados para tu próximo viaje</p>
          </div>
          <button type="button" class="link-btn" @click="goToExplore()">
            Ver todos →
          </button>
        </div>

        <div v-if="loading" class="dest-skeleton">
          <div v-for="n in 4" :key="n" class="sk" />
        </div>

        <div v-else-if="featuredDestinos.length" class="featured-grid">
          <article
            v-for="(dest, index) in featuredDestinos"
            :key="dest.slug || dest.id"
            class="dest-card"
            :class="{ featured: index === 0 }"
            @click="goToDestino(dest)"
          >
            <div class="dest-media">
              <img :src="dest.image || fallbackImg" :alt="dest.name" loading="lazy" />
              <span v-if="index === 0" class="dest-badge">Destacado</span>
              <button
                type="button"
                class="fav-btn"
                :aria-label="isFavorite(dest) ? 'Quitar de favoritos' : 'Guardar en favoritos'"
                @click.stop="toggleFavorite(dest)"
              >
                {{ isFavorite(dest) ? '❤️' : '🤍' }}
              </button>
            </div>
            <div class="dest-body">
              <h3>{{ dest.name }}</h3>
              <p v-if="dest.municipio?.name" class="dest-muni">📍 {{ dest.municipio.name }}</p>
              <p v-if="dest.description" class="dest-desc">
                {{ truncate(dest.description, index === 0 ? 120 : 72) }}
              </p>
              <div class="dest-foot">
                <span v-if="dest.rating">⭐ {{ Number(dest.rating).toFixed(1) }}</span>
                <span v-if="primaryCategory(dest)" class="dest-cat">{{ primaryCategory(dest) }}</span>
              </div>
              <button type="button" class="dest-cta" @click.stop="goToDestino(dest)">
                Ver más
              </button>
            </div>
          </article>
        </div>

        <p v-else class="empty-inline">Pronto habrá destinos destacados disponibles.</p>
      </section>

      <!-- MUNICIPIOS RECOMENDADOS -->
      <section class="block">
        <div class="block-head">
          <div>
            <h2>Municipios para explorar</h2>
            <p class="block-sub">Conoce pueblos y ciudades con encanto propio</p>
          </div>
          <button type="button" class="link-btn" @click="goToExplore()">
            Explorar →
          </button>
        </div>

        <div v-if="loading" class="muni-scroll sk-row">
          <div v-for="n in 4" :key="n" class="sk muni-sk" />
        </div>

        <div v-else-if="featuredMunicipios.length" class="muni-scroll">
          <article
            v-for="muni in featuredMunicipios"
            :key="muni.slug"
            class="muni-card"
            @click="goToMunicipio(muni)"
          >
            <div class="muni-media">
              <img :src="muni.image || fallbackImg" :alt="muni.name" loading="lazy" />
            </div>
            <div class="muni-body">
              <h3>{{ muni.name }}</h3>
              <p v-if="muni.departamento" class="muni-dept">{{ muni.departamento }}</p>
              <button type="button" class="muni-cta" @click.stop="goToMunicipio(muni)">
                Ver mas
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- EXPERIENCIAS TEMÁTICAS -->
      <section class="block">
        <div class="block-head">
          <div>
            <h2>Experiencias temáticas</h2>
            <p class="block-sub">Elige el tipo de plan que más te inspira</p>
          </div>
        </div>

        <div class="themes-grid">
          <button
            v-for="theme in experienceThemes"
            :key="theme.id"
            type="button"
            class="theme-card"
            @click="goToTheme(theme)"
          >
            <span class="theme-icon">{{ theme.icon }}</span>
            <h3>{{ theme.label }}</h3>
            <p>{{ theme.desc }}</p>
            <span class="theme-link">Explorar →</span>
          </button>
        </div>
      </section>

      <!-- MAPA -->
      <section ref="mapSection" class="block map-block">
        <div class="block-head">
          <div>
            <h2>Mapa interactivo</h2>
            <p class="block-sub">Ubica destinos en Santander y planifica tu ruta</p>
          </div>
          <button type="button" class="link-btn" @click="goToExplore({ map: '1' })">
            Abrir en explorar
          </button>
        </div>

        <DestinationsMap
          v-if="mapDestinos.length"
          :destinations="mapDestinos"
          @select="goToDestino"
        />
        <p v-else class="empty-inline">Cargando ubicaciones en el mapa…</p>
      </section>

      <!-- TESTIMONIOS -->
      <section class="block testimonials-block">
        <div class="block-head">
          <div>
            <h2>Historias de viajeros</h2>
            <p class="block-sub">Experiencias reales que inspiran tu próximo viaje</p>
          </div>
        </div>

        <div class="testimonial-carousel">
          <article class="testimonial-card">
            <img
              :src="activeTestimonial.avatar || fallbackImg"
              :alt="activeTestimonial.name"
              class="testimonial-avatar"
            />
            <blockquote>“{{ activeTestimonial.text }}”</blockquote>
            <footer>
              <strong>{{ activeTestimonial.name }}</strong>
              <span>{{ activeTestimonial.location }}</span>
            </footer>
          </article>

          <div class="testimonial-controls">
            <button type="button" aria-label="Anterior" @click="prevTestimonial">‹</button>
            <div class="testimonial-dots">
              <button
                v-for="(_, i) in testimonials"
                :key="i"
                type="button"
                :class="{ active: i === testimonialIndex }"
                :aria-label="'Historia ' + (i + 1)"
                @click="testimonialIndex = i"
              />
            </div>
            <button type="button" aria-label="Siguiente" @click="nextTestimonial">›</button>
          </div>
        </div>
      </section>

      <!-- PROYECTO (TEASER) -->
      <section class="block about-teaser">
        <article class="teaser-card">
          <span class="teaser-badge">{{ project.badge }}</span>
          <p class="teaser-text">
            <strong>{{ project.school }}</strong>
            <span v-if="project.schoolLocation"> · {{ project.schoolLocation }}</span>
            — {{ project.program }}.
          </p>
          <button type="button" class="teaser-btn" @click="go(AppRoute.acercaDe())">
            Leer mas sobre el proyecto
          </button>
        </article>
      </section>

      <!-- CTA FINAL -->
      <section class="final-cta">
        <h2>Planifica tu viaje ahora</h2>
        <p>Arma tu ruta, guarda favoritos y descubre lo mejor de Santander.</p>
        <div class="final-actions">
          <button type="button" class="btn primary" @click="goToExplore()">
            Empezar a explorar
          </button>
          <button type="button" class="btn outline" @click="go(AppRoute.favoritos())">
            Ver mis favoritos
          </button>
          <button type="button" class="btn outline" @click="go(AppRoute.planificarViaje())">
            Planificar mi viaje
          </button>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="site-footer">
        <div class="footer-brand">
          <strong>Turismo Santander</strong>
          <p>Tu guía para descubrir Colombia con confianza.</p>
        </div>
        <nav class="footer-nav" aria-label="Enlaces del sitio">
          <button type="button" @click="goToExplore()">Explorar</button>
          <button type="button" @click="go(AppRoute.favoritos())">Favoritos</button>
          <button type="button" @click="go(AppRoute.mas())">Mas opciones</button>
          <button type="button" @click="go(AppRoute.emergencias())">Emergencias</button>
        </nav>
        <div class="footer-meta">
          <span>📍 Santander, Colombia</span>
          <small>© {{ year }} Turismo Santander</small>
        </div>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import SearchBox from '@/components/SearchBox.vue'
import DestinationsMap from '@/components/DestinationsMap.vue'
import { useFavorites } from '@/composables/useFavorites'
import { getMunicipios } from '@/services/municipiosService'
import { getDestinos } from '@/services/destinosService'
import { projectAbout as project } from '@/data/projectAbout.js'
import { AppRoute } from '@/router/links.js'

defineOptions({ name: 'HomePage' })

const fallbackSvg = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">',
  '  <defs>',
  '    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">',
  '      <stop offset="0" stop-color="#0a0a0a"/>',
  '      <stop offset="1" stop-color="#1a1a2e"/>',
  '    </linearGradient>',
  '  </defs>',
  '  <rect width="100%" height="100%" fill="url(#g)"/>',
  '</svg>',
].join('\n')
const fallbackImg = 'data:image/svg+xml,' + encodeURIComponent(fallbackSvg)

const router = useRouter()
const { toggleFavorite, isFavorite } = useFavorites()

const municipios = ref([])
const destinos = ref([])
const loading = ref(true)
const searchQuery = ref('')
const mapSection = ref(null)
const testimonialIndex = ref(0)
const heroSlides = ref([])
const heroSlideIndex = ref(0)
let testimonialTimer = null
let heroTimer = null

const HERO_SLIDE_MAX = 12
const HERO_SLIDE_MS = 5500

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const buildHeroSlides = () => {
  const urls = new Set()
  for (const d of destinos.value) {
    if (d?.image) urls.add(d.image)
  }
  for (const m of municipios.value) {
    if (m?.image) urls.add(m.image)
  }
  heroSlides.value = shuffle([...urls]).slice(0, HERO_SLIDE_MAX)
  heroSlideIndex.value = 0
}

const nextHeroSlide = () => {
  if (heroSlides.value.length < 2) return
  heroSlideIndex.value = (heroSlideIndex.value + 1) % heroSlides.value.length
}

const startHeroRotation = () => {
  if (heroTimer) clearInterval(heroTimer)
  if (heroSlides.value.length < 2) return
  heroTimer = setInterval(nextHeroSlide, HERO_SLIDE_MS)
}

const year = new Date().getFullYear()

const experienceThemes = [
  {
    id: 'naturaleza',
    icon: '🌄',
    label: 'Naturaleza y aventura',
    desc: 'Paisajes, senderos y miradores',
    category: 'Naturaleza',
  },
  {
    id: 'gastronomia',
    icon: '🍷',
    label: 'Gastronomía y cultura',
    desc: 'Sabores, arte y tradición',
    category: 'Gastronomía',
  },
  {
    id: 'historia',
    icon: '🏛️',
    label: 'Historia y patrimonio',
    desc: 'Lugares con legado',
    category: 'Historia',
  },
  {
    id: 'deportes',
    icon: '🛶',
    label: 'Deportes extremos',
    desc: 'Adrenalina y desafío',
    category: 'Aventura',
    mood: 'Aventura',
  },
]

const testimonials = [
  {
    name: 'Laura M.',
    location: 'Bogotá → San Gil',
    text: 'Las cascadas superaron todo lo que imaginaba. La app me ayudó a armar el día perfecto.',
    avatar: null,
  },
  {
    name: 'Carlos R.',
    location: 'Medellín → Barichara',
    text: 'Barichara es mágica. Encontré miradores y restaurantes locales que no aparecían en otras guías.',
    avatar: null,
  },
  {
    name: 'Andrea P.',
    location: 'Cali → Bucaramanga',
    text: 'Me encantó poder guardar favoritos y volver a ellos cuando planificaba el fin de semana.',
    avatar: null,
  },
]

const truncate = (text, max = 80) => {
  const s = String(text || '').trim()
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + '…'
}

const primaryCategory = (dest) => {
  const cats = dest?.categoriesCanon || dest?.categories || []
  return Array.isArray(cats) ? cats[0] || '' : ''
}

const featuredDestinos = computed(() => {
  const pool = destinos.value
  const trending = pool.filter((d) => d?.trending)
  const list = trending.length
    ? trending
    : [...pool].sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0))
  return list.slice(0, 6)
})

const featuredMunicipios = computed(() => {
  return [...municipios.value]
    .filter((m) => m?.image)
    .sort((a, b) => String(a.name).localeCompare(String(b.name)))
    .slice(0, 8)
})

const mapDestinos = computed(() =>
  destinos.value.filter((d) => {
    const lat = Number(d?.latitude)
    const lng = Number(d?.longitude)
    return !Number.isNaN(lat) && !Number.isNaN(lng)
  }),
)

const stats = computed(() => {
  const ratings = destinos.value
    .map((d) => Number(d?.rating))
    .filter((r) => !Number.isNaN(r) && r > 0)
  const avg = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '—'
  return {
    destinos: destinos.value.length,
    municipios: municipios.value.length,
    rating: avg,
  }
})

const activeTestimonial = computed(
  () => testimonials[testimonialIndex.value] || testimonials[0],
)

const go = (routeLocation) => router.push(routeLocation)

const goToExplore = (query = {}) => {
  router.push(AppRoute.explorar(query))
}

const goToDestino = (dest) => {
  if (!dest?.slug || !dest?.municipio?.slug) return
  router.push(AppRoute.destino(dest))
}

const goToMunicipio = (municipio) => {
  if (!municipio?.slug) return
  router.push(AppRoute.municipio(municipio))
}

const goToTheme = (theme) => {
  const query = { categoria: theme.category }
  if (theme.mood) query.mood = theme.mood
  goToExplore(query)
}

const onSearchSelect = ({ type, item }) => {
  if (type === 'municipio') goToMunicipio(item)
  else goToDestino(item)
}

const scrollToMap = () => {
  mapSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const nextTestimonial = () => {
  testimonialIndex.value = (testimonialIndex.value + 1) % testimonials.length
}

const prevTestimonial = () => {
  testimonialIndex.value =
    testimonialIndex.value > 0 ? testimonialIndex.value - 1 : testimonials.length - 1
}

const assignTestimonialAvatars = () => {
  const imgs = destinos.value.map((d) => d?.image).filter(Boolean)
  testimonials.forEach((t, i) => {
    if (!t.avatar && imgs[i % imgs.length]) t.avatar = imgs[i % imgs.length]
  })
}

onMounted(async () => {
  try {
    const [munis, dests] = await Promise.all([getMunicipios(), getDestinos()])
    municipios.value = munis || []
    destinos.value = dests || []
    assignTestimonialAvatars()
    buildHeroSlides()
    startHeroRotation()
  } catch (e) {
    console.error('Error cargando home:', e)
  } finally {
    loading.value = false
  }

  testimonialTimer = setInterval(nextTestimonial, 6000)
})

onBeforeUnmount(() => {
  if (testimonialTimer) clearInterval(testimonialTimer)
  if (heroTimer) clearInterval(heroTimer)
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

.home-shell {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* HERO */
.hero {
  position: relative;
  min-height: clamp(380px, 62vh, 560px);
  background-color: #0a0a0a;
  border-radius: 0 0 28px 28px;
  overflow: hidden;
}

.hero-slides {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.4s ease-in-out;
  transform: scale(1.04);
}

.hero-slide.active {
  opacity: 1;
  transform: scale(1);
  transition:
    opacity 1.4s ease-in-out,
    transform 8s ease-out;
}

.hero-overlay {
  z-index: 1;
  position: absolute;
  inset: 0;
  background:
    linear-gradient(165deg, rgba(10, 10, 10, 0.75) 0%, rgba(26, 26, 46, 0.55) 55%, rgba(22, 33, 62, 0.4) 100%),
    linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent 50%);
}

.hero-inner {
  position: relative;
  z-index: 2;
  padding: 32px 20px 28px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: inherit;
}

.hero-badge {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.hero-inner h1 {
  font-size: clamp(1.65rem, 5vw, 2.5rem);
  margin: 0 0 8px;
  line-height: 1.12;
  max-width: 16ch;
}

.hero-sub {
  margin: 0;
  opacity: 0.9;
  font-size: clamp(0.95rem, 2.2vw, 1.1rem);
  max-width: 28ch;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn:active {
  transform: scale(0.98);
}

.btn.primary {
  background: #fff;
  color: #111;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.btn.ghost {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(8px);
}

.btn.outline {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 24px;
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
  opacity: 0.82;
}

/* BLOCKS */
.block {
  margin: 20px 16px 0;
}

.block-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
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

.link-btn {
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #111;
  white-space: nowrap;
}

.search-block {
  margin-top: -18px;
  position: relative;
  z-index: 2;
}

/* DESTINOS GRID */
.featured-grid {
  display: grid;
  gap: 14px;
}

.dest-card {
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
}

.dest-card:hover {
  transform: translateY(-3px);
}

.dest-media {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #222;
}

.dest-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dest-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ff3b30;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}

.fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-size: 16px;
}

.dest-body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.dest-body h3 {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.25;
}

.dest-muni {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

.dest-desc {
  margin: 0;
  font-size: 0.88rem;
  color: #555;
  line-height: 1.45;
}

.dest-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #444;
  margin-top: 4px;
}

.dest-cat {
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 999px;
}

.dest-cta {
  margin-top: 10px;
  align-self: flex-start;
  border: none;
  background: #111;
  color: #fff;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

/* MUNICIPIOS SCROLL */
.muni-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.muni-card {
  flex: 0 0 min(260px, 78vw);
  scroll-snap-align: start;
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.muni-card:hover {
  transform: translateY(-3px);
}

.muni-media {
  aspect-ratio: 4 / 3;
  background: #222;
}

.muni-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.muni-body {
  padding: 12px 14px 14px;
}

.muni-body h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.25;
}

.muni-dept {
  margin: 6px 0 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.35;
}

.muni-cta {
  margin-top: 10px;
  border: none;
  background: #f4f4f5;
  color: #111;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
}

/* TEMAS */
.themes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.theme-card {
  border: none;
  background: #fff;
  border-radius: 18px;
  padding: 18px 14px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.theme-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
}

.theme-card h3 {
  margin: 0 0 4px;
  font-size: 0.95rem;
}

.theme-card p {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
  line-height: 1.35;
}

.theme-link {
  display: inline-block;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #111;
}

/* MAPA */
.map-block :deep(.map-wrapper) {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

/* TESTIMONIOS */
.testimonial-carousel {
  background: #fff;
  border-radius: 20px;
  padding: 22px 18px 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
}

.testimonial-card {
  text-align: center;
}

.testimonial-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 14px;
  border: 3px solid #f0f0f0;
}

.testimonial-card blockquote {
  margin: 0;
  font-size: 1rem;
  line-height: 1.55;
  color: #333;
  font-style: italic;
}

.testimonial-card footer {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.testimonial-card footer strong {
  font-size: 0.95rem;
}

.testimonial-card footer span {
  font-size: 0.82rem;
  color: #888;
}

.testimonial-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.testimonial-controls > button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f4f4f5;
  cursor: pointer;
  font-size: 20px;
}

.testimonial-dots {
  display: flex;
  gap: 6px;
}

.testimonial-dots button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: #ddd;
  cursor: pointer;
}

.testimonial-dots button.active {
  background: #111;
  width: 18px;
  border-radius: 999px;
}

/* TEASER PROYECTO */
.about-teaser {
  margin-top: 24px;
}

.teaser-card {
  background: #fff;
  border-radius: 20px;
  padding: 22px 20px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
}

.teaser-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #444;
  background: #f4f4f5;
  padding: 5px 10px;
  border-radius: 999px;
  margin-bottom: 10px;
}

.teaser-text {
  margin: 0 0 16px;
  font-size: 0.92rem;
  color: #555;
  line-height: 1.5;
  max-width: 40ch;
  margin-left: auto;
  margin-right: auto;
}

.teaser-text strong {
  color: #111;
}

.teaser-btn {
  border: none;
  background: #111;
  color: #fff;
  padding: 12px 20px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

/* CTA FINAL */
.final-cta {
  margin: 28px 16px 0;
  padding: 36px 24px;
  border-radius: 24px;
  text-align: center;
  color: #fff;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a1a2e 55%, #16213e 100%);
}

.final-cta h2 {
  margin: 0 0 8px;
  font-size: clamp(1.25rem, 4vw, 1.65rem);
}

.final-cta p {
  margin: 0;
  opacity: 0.88;
  font-size: 0.95rem;
}

.final-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

/* FOOTER */
.site-footer {
  margin: 32px 16px 0;
  padding: 28px 22px;
  background: #0a0a0a;
  color: #fff;
  border-radius: 24px 24px 0 0;
}

.footer-brand strong {
  font-size: 1.1rem;
}

.footer-brand p {
  margin: 6px 0 0;
  font-size: 0.88rem;
  opacity: 0.75;
  line-height: 1.45;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin: 18px 0;
}

.footer-nav button {
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.footer-nav button:hover {
  color: #fff;
}

.footer-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  opacity: 0.65;
}

.empty-inline {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* SKELETON */
.dest-skeleton {
  display: grid;
  gap: 12px;
}

.dest-skeleton .sk,
.muni-sk {
  border-radius: 18px;
  background: linear-gradient(90deg, #eee, #f5f5f5, #eee);
  animation: shimmer 1.2s infinite;
}

.dest-skeleton .sk {
  height: 220px;
}

.sk-row .muni-sk {
  flex: 0 0 240px;
  height: 200px;
}

@keyframes shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* TABLET+ */
@media (min-width: 640px) {
  .themes-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dest-card.featured {
    grid-column: span 2;
    flex-direction: row;
  }

  .dest-card.featured .dest-media {
    flex: 1.15;
    aspect-ratio: auto;
    min-height: 220px;
  }

  .dest-card.featured .dest-body {
    flex: 1;
    justify-content: center;
    padding: 20px;
  }
}

@media (min-width: 1024px) {
  .hero {
    border-radius: 0 0 32px 32px;
  }

  .hero-inner {
    padding: 40px 40px 36px;
  }

  .block,
  .final-cta,
  .site-footer {
    margin-left: 32px;
    margin-right: 32px;
  }

  .featured-grid {
    grid-template-columns: 1.35fr repeat(2, 1fr);
    grid-template-rows: repeat(2, minmax(180px, auto));
  }

  .dest-card.featured {
    grid-row: span 2;
    grid-column: span 1;
    flex-direction: column;
  }

  .dest-card.featured .dest-media {
    aspect-ratio: 4 / 3;
    min-height: 200px;
  }
}
</style>
