<template>
  <div class="page">
    <div v-if="loading" class="municipio-shell loading-shell">
      <header class="hero hero-skeleton"><div class="sk-hero" /></header>
      <section class="block"><div v-for="n in 4" :key="n" class="sk-line" /></section>
    </div>

    <div v-else-if="municipio" class="municipio-shell">
      <!-- HERO -->
      <header class="hero">
        <BackButton floating @click="goBack" />

        <div class="hero-media">
          <img
            v-if="heroImage"
            :src="heroImage"
            :alt="municipio.name"
            class="hero-image"
          />
          <div v-else class="hero-fallback" />

          <div class="hero-overlay">
            <nav class="breadcrumb" aria-label="Ubicacion">
              <button type="button" @click="goToExplore">Colombia</button>
              <template v-if="muniDepartamento">
                <span>›</span>
                <span class="crumb-text">{{ muniDepartamento }}</span>
              </template>
              <span>›</span>
              <span class="current">{{ municipio.name }}</span>
            </nav>
            <h1>{{ municipio.name }}</h1>
            <div class="hero-place">
              <p class="hero-place-path">{{ municipioPathLine }}</p>
              <p v-if="muniProvinceLabel" class="hero-place-province">{{ muniProvinceLabel }}</p>
            </div>
          </div>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <strong>{{ destinos.length }}</strong>
            <span>Destinos</span>
          </div>
          <div class="stat">
            <strong>{{ eventosAll.length }}</strong>
            <span>Eventos</span>
          </div>
          <div class="stat">
            <strong>{{ platosAll.length }}</strong>
            <span>Gastronomia</span>
          </div>
        </div>
      </header>

      <!-- QUICK ACTIONS -->
      <section class="quick-actions">
        <button
          v-if="climaHasData"
          type="button"
          class="qa"
          @click="scrollToSection(climaBlock)"
        >
          🌤️<span>Clima</span>
        </button>
        <button
          v-if="eventosAll.length"
          type="button"
          class="qa"
          @click="scrollToSection(eventosBlock)"
        >
          🎭<span>Eventos</span>
        </button>
        <button
          v-if="platosAll.length"
          type="button"
          class="qa"
          @click="scrollToSection(gastronomiaBlock)"
        >
          🍽️<span>Comida</span>
        </button>
        <button
          v-if="destinos.length"
          type="button"
          class="qa"
          @click="scrollToSection(destinosBlock)"
        >
          📍<span>Destinos</span>
        </button>
      </section>

      <!-- DESCRIPCION -->
      <section v-if="municipio.description" class="block">
        <div class="block-head">
          <h2>Sobre el municipio</h2>
          <p class="block-sub">Conoce su esencia antes de planear tu visita</p>
        </div>
        <article class="content-card">
          <p>{{ municipio.description }}</p>
        </article>
      </section>

      <!-- FOTOS Y VIDEOS -->
      <section v-if="hasMunicipioMedia" class="block">
        <div class="block-head">
          <h2>Fotos y videos</h2>
          <p class="block-sub">{{ municipioMediaSummary }}</p>
        </div>
        <div class="content-card gallery-wrap">
          <MediaGallery
            title=""
            :alt-prefix="municipio.name"
            :image-sources="municipioMedia.imageSources"
            :video-sources="municipioMedia.videoSources"
          />
        </div>
      </section>

      <!-- CLIMA -->
      <section v-if="climaHasData" ref="climaBlock" class="block clima">
        <div class="block-head">
          <h2>Clima</h2>
          <p class="block-sub">Perfil general del municipio. No es pronostico diario.</p>
        </div>

        <p v-if="climaResumen" class="clima-resumen">{{ climaResumen }}</p>

        <div class="clima-grid">
        <div v-if="climaTempProm !== null" class="clima-card">
          <div class="clima-k">Temperatura promedio</div>
          <div class="clima-v">{{ climaTempProm }} °C</div>
        </div>

        <div v-if="climaTempRange" class="clima-card">
          <div class="clima-k">Rango típico</div>
          <div class="clima-v">{{ climaTempRange }}</div>
        </div>

        <div v-if="climaAltitud !== null" class="clima-card">
          <div class="clima-k">Altitud</div>
          <div class="clima-v">{{ climaAltitud }} m</div>
        </div>

        <div v-if="climaLluvias" class="clima-card">
          <div class="clima-k">Temporada de lluvias</div>
          <div class="clima-v">{{ climaLluvias }}</div>
        </div>

        <div v-if="climaSeca" class="clima-card">
          <div class="clima-k">Temporada seca</div>
          <div class="clima-v">{{ climaSeca }}</div>
        </div>
      </div>

      <p v-if="climaRecomendacion" class="clima-tip">{{ climaRecomendacion }}</p>

        <details v-if="climaFuentes?.length" class="clima-sources">
          <summary>Fuentes</summary>
          <ul>
            <li v-for="(f, i) in climaFuentes" :key="i">
              <a :href="f.url" target="_blank" rel="noopener noreferrer">
                {{ f.title || f.url }}
              </a>
              <span v-if="f.accessed_at" class="src-date"> (consultado: {{ f.accessed_at }})</span>
            </li>
          </ul>
        </details>
      </section>

      <!-- EVENTOS -->
      <section v-if="eventosAll.length" ref="eventosBlock" class="block eventos">
        <div class="block-head">
          <h2>Eventos culturales</h2>
          <p class="block-sub">Fechas segun fuente. Algunos eventos solo publican mes o temporada.</p>
        </div>

        <div class="filters">
          <div class="filters-top">
            <div class="search-inline">
              <span class="search-icon" aria-hidden="true">🔍</span>
              <input
                v-model="eventoQuery"
                type="search"
                placeholder="Buscar eventos..."
                autocomplete="off"
              />
              <button
                v-if="eventoQuery"
                type="button"
                class="search-clear"
                aria-label="Limpiar busqueda"
                @click="eventoQuery = ''"
              >
                ✕
              </button>
            </div>
            <button
              v-if="hasEventosFilters"
              type="button"
              class="clear"
              @click="resetEventosFilters"
            >
              Limpiar filtros
            </button>
          </div>

          <div v-if="eventoTipoOptions.length" class="categories">
            <button
              type="button"
              :class="{ active: !selectedEventoTipo }"
              @click="selectedEventoTipo = null"
            >
              Todos los tipos
            </button>
            <button
              v-for="tipo in eventoTipoOptions"
              :key="tipo"
              type="button"
              :class="{ active: selectedEventoTipo === tipo }"
              @click="toggleEventoTipo(tipo)"
            >
              {{ tipoEventoLabel(tipo) }}
            </button>
          </div>

          <div class="chips-row">
            <button
              type="button"
              class="fav"
              :class="{ active: onlyEventosDestacados }"
              @click="onlyEventosDestacados = !onlyEventosDestacados"
            >
              ⭐ Solo destacados
            </button>
          </div>

          <div v-if="eventoTagOptions.length" class="categories">
            <button
              type="button"
              :class="{ active: !selectedEventoTag }"
              @click="selectedEventoTag = null"
            >
              Todas las etiquetas
            </button>
            <button
              v-for="tag in eventoTagOptions"
              :key="tag"
              type="button"
              :class="{ active: selectedEventoTag === tag }"
              @click="toggleEventoTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <p class="section-count">
          {{ eventosPagState.total }} evento{{ eventosPagState.total === 1 ? '' : 's' }}
          <span v-if="eventosPagState.hasPagination && !eventosPagState.showAll">
            · pagina {{ eventosPagState.page }} de {{ eventosPagState.totalPages }}
          </span>
          <span v-else-if="eventosPagState.showAll"> · ver todo</span>
        </p>

        <div v-if="displayEventos.length" class="card-grid event-grid">
          <article
            v-for="e in displayEventos"
            :key="e.id"
            class="event-card clickable-card"
            role="button"
            tabindex="0"
            @click="goToEvento(e)"
            @keydown.enter="goToEvento(e)"
          >
            <div v-if="e.imagen" class="card-media">
              <img :src="e.imagen" :alt="e.title" loading="lazy" />
            </div>

            <div class="event-top">
              <h3 class="event-title">{{ e.title }}</h3>
              <span v-if="e.when" class="event-when">{{ e.when }}</span>
            </div>

            <span v-if="e.destacado" class="tipo-pill highlight">Destacado</span>
            <span v-if="e.tipoLabel" class="tipo-pill">{{ e.tipoLabel }}</span>
            <p v-if="e.location" class="event-loc">📍 {{ e.location }}</p>
            <p v-if="e.description" class="event-desc clamp">{{ e.description }}</p>

            <div v-if="e.tags?.length" class="chips">
              <span v-for="t in e.tags.slice(0, 3)" :key="t" class="chip">{{ prettyTag(t) }}</span>
            </div>

            <span class="card-more">Ver detalle →</span>
          </article>
        </div>

        <div v-else class="empty-section">
          <p>No hay eventos con esos filtros.</p>
          <button
            v-if="hasEventosFilters"
            type="button"
            class="btn-secondary"
            @click="resetEventosFilters"
          >
            Limpiar filtros
          </button>
        </div>

        <ListPagination
          v-if="eventosPagState.hasPagination"
          :page="eventosPagState.page"
          :total-pages="eventosPagState.totalPages"
          :total="eventosPagState.total"
          :range-from="eventosPagState.rangeFrom"
          :range-to="eventosPagState.rangeTo"
          :show-all="eventosPagState.showAll"
          :page-size="EVENTOS_PAGE_SIZE"
          @prev="onEventosPrev"
          @next="onEventosNext"
          @view-all="onEventosViewAll"
          @view-paged="onEventosViewPaged"
        />
      </section>

      <!-- GASTRONOMIA -->
      <section v-if="platosAll.length" ref="gastronomiaBlock" class="block gastronomia">
        <div class="block-head">
          <h2>Gastronomia</h2>
          <p v-if="gastronomiaDisclaimer" class="block-sub">{{ gastronomiaDisclaimer }}</p>
        </div>

        <div class="filters">
          <div class="filters-top">
            <div class="search-inline">
              <span class="search-icon" aria-hidden="true">🔍</span>
              <input
                v-model="platoQuery"
                type="search"
                placeholder="Buscar platos..."
                autocomplete="off"
              />
              <button
                v-if="platoQuery"
                type="button"
                class="search-clear"
                aria-label="Limpiar busqueda"
                @click="platoQuery = ''"
              >
                ✕
              </button>
            </div>
            <button
              v-if="hasPlatosFilters"
              type="button"
              class="clear"
              @click="resetPlatosFilters"
            >
              Limpiar filtros
            </button>
          </div>

          <div v-if="platoCategoriaOptions.length" class="categories">
            <button
              type="button"
              :class="{ active: !selectedPlatoCategoria }"
              @click="selectedPlatoCategoria = null"
            >
              Todas las categorias
            </button>
            <button
              v-for="cat in platoCategoriaOptions"
              :key="cat"
              type="button"
              :class="{ active: selectedPlatoCategoria === cat }"
              @click="togglePlatoCategoria(cat)"
            >
              {{ cat }}
            </button>
          </div>

          <div class="chips-row">
            <button
              type="button"
              :class="{ active: selectedPlatoTypical === 'all' }"
              @click="selectedPlatoTypical = 'all'"
            >
              Todos
            </button>
            <button
              type="button"
              :class="{ active: selectedPlatoTypical === 'typical' }"
              @click="selectedPlatoTypical = 'typical'"
            >
              Tipicos del municipio
            </button>
            <button
              type="button"
              :class="{ active: selectedPlatoTypical === 'regional' }"
              @click="selectedPlatoTypical = 'regional'"
            >
              Referencia regional
            </button>
          </div>

          <div v-if="platoTagOptions.length" class="categories">
            <button
              type="button"
              :class="{ active: !selectedPlatoTag }"
              @click="selectedPlatoTag = null"
            >
              Todas las etiquetas
            </button>
            <button
              v-for="tag in platoTagOptions"
              :key="tag"
              type="button"
              :class="{ active: selectedPlatoTag === tag }"
              @click="togglePlatoTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <p class="section-count">
          {{ platosPagState.total }} plato{{ platosPagState.total === 1 ? '' : 's' }}
          <span v-if="platosPagState.hasPagination && !platosPagState.showAll">
            · pagina {{ platosPagState.page }} de {{ platosPagState.totalPages }}
          </span>
          <span v-else-if="platosPagState.showAll"> · ver todo</span>
        </p>

        <div v-if="displayPlatos.length" class="card-grid dish-grid">
          <article
            v-for="p in displayPlatos"
            :key="p.id || p.slug"
            class="dish-card clickable-card"
            role="button"
            tabindex="0"
            @click="goToPlato(p)"
            @keydown.enter="goToPlato(p)"
          >
            <div v-if="p.image_url" class="dish-media">
              <img :src="p.image_url" :alt="p.name" loading="lazy" />
            </div>
            <div v-else class="dish-media placeholder" aria-hidden="true">
              🍽️
            </div>

            <div class="dish-body">
              <div class="dish-top">
                <h3 class="dish-title">{{ p.name }}</h3>
                <span v-if="p.is_typical" class="badge">Tipico</span>
              </div>

              <p v-if="p.categoria" class="dish-cat">{{ p.categoria }}</p>
              <p v-if="p.description" class="dish-desc clamp">{{ p.description }}</p>

              <div v-if="p.tags?.length" class="chips">
                <span v-for="t in p.tags" :key="t" class="chip">{{ prettyTag(t) }}</span>
              </div>

              <span class="card-more">Ver detalle →</span>
            </div>
          </article>
        </div>

        <div v-else class="empty-section">
          <p>No hay platos con esos filtros.</p>
          <button
            v-if="hasPlatosFilters"
            type="button"
            class="btn-secondary"
            @click="resetPlatosFilters"
          >
            Limpiar filtros
          </button>
        </div>

        <ListPagination
          v-if="platosPagState.hasPagination"
          :page="platosPagState.page"
          :total-pages="platosPagState.totalPages"
          :total="platosPagState.total"
          :range-from="platosPagState.rangeFrom"
          :range-to="platosPagState.rangeTo"
          :show-all="platosPagState.showAll"
          :page-size="PLATOS_PAGE_SIZE"
          @prev="onPlatosPrev"
          @next="onPlatosNext"
          @view-all="onPlatosViewAll"
          @view-paged="onPlatosViewPaged"
        />
      </section>

      <!-- DESTINOS -->
      <section v-if="destinos.length" ref="destinosBlock" class="block destinos-section">
        <div class="block-head">
          <h2>Destinos turisticos</h2>
          <p class="block-sub">Lugares y experiencias en {{ municipio.name }}</p>
        </div>

        <div class="filters">
        <div class="filters-top">
        <SearchBox
          v-model="destinoQuery"
          mode="destinos"
          :destinations="destinos"
          :placeholder="destinosSearchPlaceholder"
          @select="onDestinoSearchSelect"
        />

        <button v-if="hasDestinosFilters" type="button" class="clear" @click="resetDestinosFilters">
          Limpiar filtros
        </button>
      </div>

      <div v-if="difficultyOptions.length" class="chips-row">
        <button
          v-for="d in difficultyOptions"
          :key="d"
          :class="{ active: selectedDifficulty === d }"
          @click="toggleDifficulty(d)"
        >
          {{ d }}
        </button>

        <button class="fav" :class="{ active: onlyFavorites }" @click="onlyFavorites = !onlyFavorites">
          ❤️ Solo favoritos
        </button>
      </div>

        <div v-if="categories.length" class="categories">
          <button
            type="button"
            :class="{ active: !selectedCategory }"
            @click="selectedCategory = null"
          >
            Todos
          </button>
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = selectedCategory === category ? null : category"
          >
            {{ category }}
          </button>
        </div>
        </div>

        <p class="destinos-count">
        {{ destinosPagState.total }} destino{{ destinosPagState.total === 1 ? '' : 's' }}
        <span v-if="destinosPagState.hasPagination && !destinosPagState.showAll">
          · página {{ destinosPagState.page }} de {{ destinosPagState.totalPages }}
        </span>
        <span v-else-if="destinosPagState.showAll"> · ver todo</span>
      </p>

        <DestinationList
          v-if="displayDestinos.length"
          :destinations="displayDestinos"
          variant="grid"
          @select="goToDestination"
        />

        <div v-else class="empty-destinos">
          <p>No hay destinos con esos filtros.</p>
          <button v-if="hasDestinosFilters" type="button" class="btn-secondary" @click="resetDestinosFilters">
            Limpiar filtros
          </button>
        </div>

        <ListPagination
          v-if="destinosPagState.hasPagination"
          :page="destinosPagState.page"
          :total-pages="destinosPagState.totalPages"
          :total="destinosPagState.total"
          :range-from="destinosPagState.rangeFrom"
          :range-to="destinosPagState.rangeTo"
          :show-all="destinosPagState.showAll"
          :page-size="LIST_PAGE_SIZE"
          @prev="onDestinosPrev"
          @next="onDestinosNext"
          @view-all="onDestinosViewAll"
          @view-paged="onDestinosViewPaged"
        />
      </section>

      <!-- CTA -->
      <section class="final-cta">
        <h2>Descubre mas de Santander</h2>
        <p>Sigue explorando municipios y destinos cercanos.</p>
        <button type="button" class="btn-primary" @click="goToExplore">
          Explorar mapa
        </button>
      </section>
    </div>

    <div v-else class="municipio-shell empty-page">
      <div class="empty-card">
        <span>😕</span>
        <h2>Municipio no encontrado</h2>
        <p>No pudimos cargar la informacion de este lugar.</p>
        <button type="button" class="btn-primary" @click="goToExplore">
          Volver a explorar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getMunicipioBySlug } from '@/services/municipiosService'
import { getDestinosByMunicipio } from '@/services/destinosService'

import { getEventosByMunicipioId } from '@/services/eventosService'
import { normalizeEvento, tipoEventoLabel } from '@/utils/eventos'
import { normalizeForSearch } from '@/utils/text'
import { useFavorites } from '@/composables/useFavorites'
import { usePagination } from '@/composables/usePagination'

import DestinationList from '@/components/DestinationList.vue'
import SearchBox from '@/components/SearchBox.vue'
import ListPagination from '@/components/ListPagination.vue'
import BackButton from '@/components/BackButton.vue'
import MediaGallery from '@/components/MediaGallery.vue'
import { buildEntityMedia } from '@/utils/media'
import {
  locationPathLine,
  provinceLabel,
  departamentoLabel,
} from '@/utils/locationDisplay.js'
import { AppRoute } from '@/router/links.js'

const LIST_PAGE_SIZE = 12
const EVENTOS_PAGE_SIZE = 6
const PLATOS_PAGE_SIZE = 6

const route = useRoute()
const router = useRouter()

const municipio = ref(null)
const destinos = ref([])

const eventos = ref([])
const eventoQuery = ref('')
const selectedEventoTipo = ref(null)
const selectedEventoTag = ref(null)
const onlyEventosDestacados = ref(false)

const platoQuery = ref('')
const selectedPlatoCategoria = ref(null)
const selectedPlatoTypical = ref('all')
const selectedPlatoTag = ref(null)

const selectedCategory = ref(null)
const destinoQuery = ref('')
const selectedDifficulty = ref(null)
const onlyFavorites = ref(false)

const { isFavorite } = useFavorites()
const loading = ref(true)
const destinosBlock = ref(null)
const climaBlock = ref(null)
const eventosBlock = ref(null)
const gastronomiaBlock = ref(null)

const muniDepartamento = computed(() => departamentoLabel(municipio.value))

const municipioPathLine = computed(() =>
  locationPathLine(municipio.value, ' · ', { includeMunicipio: false }),
)

const muniProvinceLabel = computed(() => provinceLabel(municipio.value))

const municipioMedia = computed(() =>
  buildEntityMedia(municipio.value, {
    imageFields: ['image'],
    galleryField: 'gallery',
    videoFields: [municipio.value?.info],
  }),
)

const heroImage = computed(() => municipioMedia.value.heroImage)

const hasMunicipioMedia = computed(() => municipioMedia.value.totalCount > 0)

const municipioMediaSummary = computed(() => {
  const { imageCount, videoCount } = municipioMedia.value
  const parts = []
  if (imageCount) parts.push(`${imageCount} foto${imageCount === 1 ? '' : 's'}`)
  if (videoCount) parts.push(`${videoCount} video${videoCount === 1 ? '' : 's'}`)
  return parts.join(' · ') || 'Galeria del municipio'
})

const goToExplore = () => router.push(AppRoute.explorar())

const scrollToSection = (el) => {
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Tags llegan como text[]; esto los hace más presentables
const prettyTag = (tag) => {
  if (!tag) return ''
  const cleaned = String(tag).replace(/_/g, ' ').trim()
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

const goBack = () => router.back()

const goToPlato = (plato) => {
  if (!plato?.slug || !municipio.value?.slug) return
  router.push(AppRoute.plato(municipio.value, plato))
}

const goToEvento = (evento) => {
  if (!evento?.id || !municipio.value?.slug) return
  router.push(AppRoute.evento(municipio.value, evento))
}

const goToDestination = (destino) => {
  if (!destino?.slug || !municipio.value?.slug) return
  router.push(AppRoute.destino({ ...destino, municipio: municipio.value }))
}

onMounted(async () => {
  try {
    // 👇 PARAM CORRECTO
    const municipioSlug = route.params.municipioSlug

    // 1️⃣ Municipio
    municipio.value = await getMunicipioBySlug(municipioSlug)

    // 2️⃣ Destinos del municipio
    destinos.value = await getDestinosByMunicipio(municipio.value.id)


    // 3️⃣ Eventos culturales (si existen)
    eventos.value = await getEventosByMunicipioId(municipio.value.id)
  } catch (error) {
    console.error('Error cargando municipio o destinos:', error)
  } finally {
    loading.value = false
  }
})


/* EVENTOS */
const eventosAll = computed(() => {
  const list = Array.isArray(eventos.value) ? eventos.value : []
  return list
    .map(normalizeEvento)
    .filter(Boolean)
    .sort((a, b) => {
      const ad = a._sortDate
      const bd = b._sortDate
      if (ad && bd) return ad - bd
      if (ad && !bd) return -1
      if (!ad && bd) return 1
      return a.title.localeCompare(b.title)
    })
})

const eventoTipoOptions = computed(() => {
  const set = new Set()
  for (const e of eventosAll.value) {
    if (e.tipo) set.add(e.tipo)
  }
  return [...set].sort((a, b) => tipoEventoLabel(a).localeCompare(tipoEventoLabel(b)))
})

const eventoTagOptions = computed(() => {
  const set = new Set()
  for (const e of eventosAll.value) {
    for (const t of e.tags || []) {
      const label = prettyTag(t)
      if (label) set.add(label)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b))
})

const hasEventosFilters = computed(() =>
  Boolean(
    eventoQuery.value ||
      selectedEventoTipo.value ||
      selectedEventoTag.value ||
      onlyEventosDestacados.value,
  ),
)

const resetEventosFilters = () => {
  eventoQuery.value = ''
  selectedEventoTipo.value = null
  selectedEventoTag.value = null
  onlyEventosDestacados.value = false
  eventosPagination.viewPaged()
}

const toggleEventoTipo = (tipo) => {
  selectedEventoTipo.value = selectedEventoTipo.value === tipo ? null : tipo
}

const toggleEventoTag = (tag) => {
  selectedEventoTag.value = selectedEventoTag.value === tag ? null : tag
}

const filteredEventos = computed(() => {
  let results = eventosAll.value

  const q = normalizeForSearch(eventoQuery.value)
  if (q) {
    results = results.filter((e) => {
      const hay = [
        e.title,
        e.description,
        e.location,
        e.tipoLabel,
        ...(e.tags || []),
      ]
        .filter(Boolean)
        .join(' | ')
      return normalizeForSearch(hay).includes(q)
    })
  }

  if (selectedEventoTipo.value) {
    results = results.filter((e) => e.tipo === selectedEventoTipo.value)
  }

  if (onlyEventosDestacados.value) {
    results = results.filter((e) => !!e.destacado)
  }

  if (selectedEventoTag.value) {
    results = results.filter((e) =>
      (e.tags || []).some((t) => prettyTag(t) === selectedEventoTag.value),
    )
  }

  return results
})

const eventosPagination = usePagination(filteredEventos, EVENTOS_PAGE_SIZE)
const displayEventos = computed(() => eventosPagination.displayItems.value)

const eventosPagState = computed(() => ({
  page: eventosPagination.page.value,
  totalPages: eventosPagination.totalPages.value,
  total: eventosPagination.total.value,
  rangeFrom: eventosPagination.rangeFrom.value,
  rangeTo: eventosPagination.rangeTo.value,
  showAll: eventosPagination.showAll.value,
  hasPagination: eventosPagination.hasPagination.value,
}))

const scrollToEventos = () => {
  eventosBlock.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

const onEventosPrev = () => {
  eventosPagination.prevPage()
  scrollToEventos()
}

const onEventosNext = () => {
  eventosPagination.nextPage()
  scrollToEventos()
}

const onEventosViewAll = () => {
  eventosPagination.viewAll()
  scrollToEventos()
}

const onEventosViewPaged = () => {
  eventosPagination.viewPaged()
  scrollToEventos()
}

/* GASTRONOMIA (municipio_platos -> platos) */
const platosAll = computed(() => {
  const rel = municipio.value?.municipio_platos || []
  return rel
    .slice()
    .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
    .map((r) => ({
      ...(r?.platos || {}),
      is_typical: !!r?.is_typical,
      note: r?.note || null,
      sort_order: r?.sort_order ?? 0,
    }))
})

const platoCategoriaOptions = computed(() => {
  const set = new Set()
  for (const p of platosAll.value) {
    if (p.categoria) set.add(String(p.categoria).trim())
  }
  return [...set].sort((a, b) => a.localeCompare(b))
})

const platoTagOptions = computed(() => {
  const set = new Set()
  for (const p of platosAll.value) {
    for (const t of p.tags || []) {
      const label = prettyTag(t)
      if (label) set.add(label)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b))
})

const hasPlatosFilters = computed(() =>
  Boolean(
    platoQuery.value ||
      selectedPlatoCategoria.value ||
      selectedPlatoTag.value ||
      selectedPlatoTypical.value !== 'all',
  ),
)

const resetPlatosFilters = () => {
  platoQuery.value = ''
  selectedPlatoCategoria.value = null
  selectedPlatoTag.value = null
  selectedPlatoTypical.value = 'all'
  platosPagination.viewPaged()
}

const togglePlatoCategoria = (cat) => {
  selectedPlatoCategoria.value = selectedPlatoCategoria.value === cat ? null : cat
}

const togglePlatoTag = (tag) => {
  selectedPlatoTag.value = selectedPlatoTag.value === tag ? null : tag
}

const filteredPlatos = computed(() => {
  let results = platosAll.value

  const q = normalizeForSearch(platoQuery.value)
  if (q) {
    results = results.filter((p) => {
      const hay = [
        p.name,
        p.description,
        p.categoria,
        p.note,
        ...(p.tags || []),
      ]
        .filter(Boolean)
        .join(' | ')
      return normalizeForSearch(hay).includes(q)
    })
  }

  if (selectedPlatoCategoria.value) {
    results = results.filter((p) => String(p.categoria || '').trim() === selectedPlatoCategoria.value)
  }

  if (selectedPlatoTypical.value === 'typical') {
    results = results.filter((p) => p.is_typical)
  } else if (selectedPlatoTypical.value === 'regional') {
    results = results.filter((p) => !p.is_typical)
  }

  if (selectedPlatoTag.value) {
    results = results.filter((p) =>
      (p.tags || []).some((t) => prettyTag(t) === selectedPlatoTag.value),
    )
  }

  return results
})

const platosPagination = usePagination(filteredPlatos, PLATOS_PAGE_SIZE)
const displayPlatos = computed(() => platosPagination.displayItems.value)

const platosPagState = computed(() => ({
  page: platosPagination.page.value,
  totalPages: platosPagination.totalPages.value,
  total: platosPagination.total.value,
  rangeFrom: platosPagination.rangeFrom.value,
  rangeTo: platosPagination.rangeTo.value,
  showAll: platosPagination.showAll.value,
  hasPagination: platosPagination.hasPagination.value,
}))

const scrollToGastronomia = () => {
  gastronomiaBlock.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

const onPlatosPrev = () => {
  platosPagination.prevPage()
  scrollToGastronomia()
}

const onPlatosNext = () => {
  platosPagination.nextPage()
  scrollToGastronomia()
}

const onPlatosViewAll = () => {
  platosPagination.viewAll()
  scrollToGastronomia()
}

const onPlatosViewPaged = () => {
  platosPagination.viewPaged()
  scrollToGastronomia()
}

const gastronomiaDisclaimer = computed(() => {
  const items = platosAll.value
  if (!items.length) return ''
  const hasTypical = items.some((i) => i.is_typical)
  const hasRegional = items.some((i) => !i.is_typical)
  if (hasTypical && hasRegional) {
    return 'Algunos platos estan marcados como tipicos del municipio. Los demas son referencia regional.'
  }
  if (hasRegional && !hasTypical) {
    return 'Listado basado en referencia regional (Santander).'
  }
  return ''
})


/* CLIMA (jsonb en municipios.clima)
   Recomendación de estructura (flexible):
   {
     resumen: string,
     temp_promedio_c: number,
     temp_min_c: number,
     temp_max_c: number,
     altitud_m: number,
     temporada_lluvias: string | string[],
     temporada_seca: string | string[],
     recomendacion: string,
     fuentes: [{ title, url, accessed_at }]
   }
*/

const clima = computed(() => {
  const c = municipio.value?.clima
  return (c && typeof c === 'object') ? c : null
})

const pickNumber = (val) => {
  if (val === null || val === undefined) return null
  const n = Number(val)
  return Number.isFinite(n) ? n : null
}

const joinMaybeArray = (val) => {
  if (!val) return ''
  if (Array.isArray(val)) return val.filter(Boolean).join(', ')
  return String(val)
}

const climaResumen = computed(() => clima.value?.resumen ? String(clima.value.resumen) : '')
const climaTempProm = computed(() => pickNumber(clima.value?.temp_promedio_c))
const climaAltitud = computed(() => pickNumber(clima.value?.altitud_m))

const climaTempRange = computed(() => {
  const min = pickNumber(clima.value?.temp_min_c)
  const max = pickNumber(clima.value?.temp_max_c)
  if (min === null && max === null) return ''
  if (min !== null && max !== null) return String(min) + '–' + String(max) + ' °C'
  if (min !== null) return 'desde ' + String(min) + ' °C'
  return 'hasta ' + String(max) + ' °C'
})

const climaLluvias = computed(() => joinMaybeArray(clima.value?.temporada_lluvias))
const climaSeca = computed(() => joinMaybeArray(clima.value?.temporada_seca))
const climaRecomendacion = computed(() => clima.value?.recomendacion ? String(clima.value.recomendacion) : '')

const climaFuentes = computed(() => {
  const f = clima.value?.fuentes
  if (!Array.isArray(f)) return []
  return f
    .filter(x => x && typeof x === 'object' && x.url)
    .map(x => ({
      title: x.title ? String(x.title) : '',
      url: String(x.url),
      accessed_at: x.accessed_at ? String(x.accessed_at) : ''
    }))
})

const climaHasData = computed(() => {
  const c = clima.value
  if (!c) return false
  // No mostramos la sección si solo hay "fuentes" pero nada más.
  const keys = [
    'resumen',
    'temp_promedio_c',
    'temp_min_c',
    'temp_max_c',
    'altitud_m',
    'temporada_lluvias',
    'temporada_seca',
    'recomendacion'
  ]
  return keys.some((k) => {
    const v = c[k]
    if (v === null || v === undefined) return false
    if (typeof v === 'string') return v.trim().length > 0
    if (typeof v === 'number') return Number.isFinite(v)
    if (Array.isArray(v)) return v.length > 0
    return !!v
  })
})

/* CATEGORÍAS / DIFICULTAD (desde data normalizada) */
const categories = computed(() => {
  const set = new Set()
  for (const d of destinos.value) {
    const cats = d?.categoriesCanon || d?.categories || []
    for (const c of (Array.isArray(cats) ? cats : [])) set.add(c)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
})

const difficultyOptions = computed(() => {
  const set = new Set()
  for (const d of destinos.value) {
    const diff = d?.difficultyCanon || d?.difficulty
    if (diff) set.add(diff)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
})

const hasDestinosFilters = computed(() => {
  return Boolean(destinoQuery.value || selectedCategory.value || selectedDifficulty.value || onlyFavorites.value)
})

const destinosSearchPlaceholder = computed(() =>
  municipio.value?.name
    ? `Buscar destinos en ${municipio.value.name}...`
    : 'Buscar destinos...',
)

const resetDestinosFilters = () => {
  destinoQuery.value = ''
  selectedCategory.value = null
  selectedDifficulty.value = null
  onlyFavorites.value = false
  destinosPagination.viewPaged()
}

const onDestinoSearchSelect = ({ item }) => {
  if (item) goToDestination(item)
}

const toggleDifficulty = (d) => {
  selectedDifficulty.value = selectedDifficulty.value === d ? null : d
}

const filteredDestinos = computed(() => {
  let results = destinos.value

  const q = normalizeForSearch(destinoQuery.value)
  if (q) {
    results = results.filter(d => {
      const hay = [
        d?.name,
        d?.description,
        ...(d?.categoriesCanon || d?.categories || []),
        ...(d?.moodCanon || d?.mood || []),
        d?.difficultyCanon || d?.difficulty
      ].filter(Boolean).join(' | ')
      return normalizeForSearch(hay).includes(q)
    })
  }

  if (selectedCategory.value) {
    results = results.filter(d => {
      const cats = d?.categoriesCanon || d?.categories || []
      return Array.isArray(cats) && cats.includes(selectedCategory.value)
    })
  }

  if (selectedDifficulty.value) {
    results = results.filter(d => (d?.difficultyCanon || d?.difficulty) === selectedDifficulty.value)
  }

  if (onlyFavorites.value) {
    results = results.filter(d => isFavorite(d))
  }

  return results
})

const destinosPagination = usePagination(filteredDestinos, LIST_PAGE_SIZE)

const displayDestinos = computed(() => destinosPagination.displayItems.value)

const destinosPagState = computed(() => ({
  page: destinosPagination.page.value,
  totalPages: destinosPagination.totalPages.value,
  total: destinosPagination.total.value,
  rangeFrom: destinosPagination.rangeFrom.value,
  rangeTo: destinosPagination.rangeTo.value,
  showAll: destinosPagination.showAll.value,
  hasPagination: destinosPagination.hasPagination.value,
}))

const scrollToDestinos = () => {
  destinosBlock.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

const onDestinosPrev = () => {
  destinosPagination.prevPage()
  scrollToDestinos()
}

const onDestinosNext = () => {
  destinosPagination.nextPage()
  scrollToDestinos()
}

const onDestinosViewAll = () => {
  destinosPagination.viewAll()
  scrollToDestinos()
}

const onDestinosViewPaged = () => {
  destinosPagination.viewPaged()
  scrollToDestinos()
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

.municipio-shell {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* HERO */
.hero {
  position: relative;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a2e1a 40%, #16213e 100%);
  color: #fff;
  border-radius: 0 0 28px 28px;
  overflow: hidden;
}

.hero-media {
  position: relative;
  height: clamp(280px, 46vh, 400px);
}

.hero-image,
.hero-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-fallback {
  background: linear-gradient(135deg, #1a3a2a, #2a4a3a);
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

.hero-overlay h1 {
  margin: 0;
  font-size: clamp(1.5rem, 5vw, 2.2rem);
  line-height: 1.12;
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
  font-size: 18px;
}

.qa span {
  font-size: 11px;
  opacity: 0.85;
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
  padding: 0;
}

.gallery-wrap :deep(.media-gallery h2) {
  display: none;
}

/* CLIMA */
.clima {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.clima-resumen {
  margin: 0;
  max-width: 900px;
  line-height: 1.5;
  opacity: 0.9;
}

.clima-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.clima-card {
  border: none;
  border-radius: 16px;
  padding: 14px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.clima-k {
  font-size: 12px;
  opacity: 0.7;
}

.clima-v {
  font-size: 16px;
  font-weight: 700;
  margin-top: 4px;
}

.clima-tip {
  margin: 0;
  font-size: 0.92rem;
  opacity: 0.8;
  line-height: 1.45;
  max-width: 900px;
}

.clima-sources summary {
  cursor: pointer;
  font-size: 0.92rem;
  opacity: 0.85;
}

.clima-sources ul {
  margin: 10px 0 0;
  padding-left: 18px;
}

.clima-sources a {
  color: inherit;
  text-decoration: underline;
}

.src-date {
  opacity: 0.7;
  font-size: 12px;
}

/* CARD GRIDS */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.clickable-card {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.1);
}

.clickable-card:active {
  transform: scale(0.99);
}

.card-more {
  margin-top: auto;
  padding-top: 4px;
  font-size: 0.88rem;
  font-weight: 600;
  opacity: 0.75;
}

.clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-media {
  margin: -12px -14px 8px;
  height: 120px;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tipo-pill {
  width: fit-content;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
}

.tipo-pill.highlight {
  background: #fff3cd;
  color: #7a5b00;
}

.event-card {
  border: none;
  border-radius: 18px;
  padding: 12px 14px 14px;
  background: white;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.event-title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.2;
}

.event-when {
  flex: 0 0 auto;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0,0,0,.06);
  border: 1px solid rgba(0,0,0,.10);
}

.event-loc,
.event-desc {
  margin: 0;
  opacity: 0.82;
  line-height: 1.35;
}

.event-loc {
  font-size: 0.9rem;
}

.event-desc {
  font-size: 0.92rem;
}

.event-src {
  margin-top: 2px;
  font-size: 0.9rem;
  text-decoration: underline;
  color: inherit;
  opacity: 0.9;
  width: fit-content;
}

.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.dish-card {
  border: none;
  border-radius: 18px;
  overflow: hidden;
  background: white;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.dish-media {
  height: 140px;
  background: #f3f3f3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
}

.dish-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-media.placeholder {
  color: rgba(0,0,0,.55);
}

.dish-body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dish-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.dish-title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.2;
}

.badge {
  flex: 0 0 auto;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0,0,0,.06);
  border: 1px solid rgba(0,0,0,.10);
}

.dish-desc {
  margin: 0;
  font-size: 0.92rem;
  opacity: 0.85;
  line-height: 1.35;
}

.dish-cat {
  margin: 0;
  font-size: 0.82rem;
  opacity: 0.7;
  text-transform: capitalize;
}


.dish-note {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.72;
  line-height: 1.35;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f4f4f5;
  border: 1px solid #eee;
}

/* FILTROS */
.filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.destinos-section {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.destinos-count,
.section-count {
  margin: 0 0 12px;
  font-size: 0.88rem;
  color: #666;
}

.search-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
}

.search-inline input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  outline: none;
  min-width: 0;
}

.search-inline .search-icon {
  flex-shrink: 0;
  opacity: 0.6;
}

.search-inline .search-clear {
  flex-shrink: 0;
  border: none;
  background: #f4f4f5;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
}

.empty-section {
  text-align: center;
  padding: 2rem 1rem;
  color: #666;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.empty-destinos {
  text-align: center;
  padding: 2rem 1rem;
  color: #666;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.btn-secondary {
  margin-top: 12px;
  border: none;
  background: #f4f4f5;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.filters-top {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}

.filters-top :deep(.search-box) {
  width: 100%;
  margin-bottom: 0;
}

.filters-top .clear {
  align-self: flex-end;
  border: 1px solid #eee;
  background: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.chips-row,
.categories {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filters button {
  border: none;
  background: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  transition: background 0.15s ease;
}

.filters button.active {
  background: #111;
  color: #fff;
}


.filters .fav {
  background: #ffeef0;
  border-color: #ffd0d8;
}

.filters .fav.active {
  background: #ff2d55;
  color: #fff;
  border-color: #ff2d55;
}

/* CTA */
.final-cta {
  margin: 28px 16px 0;
  padding: 32px 24px;
  border-radius: 24px;
  text-align: center;
  color: #fff;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a2e1a 50%, #16213e 100%);
}

.final-cta h2 {
  margin: 0 0 8px;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
}

.final-cta p {
  margin: 0;
  opacity: 0.88;
}

.btn-primary {
  margin-top: 16px;
  border: none;
  background: #fff;
  color: #111;
  padding: 12px 22px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
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
