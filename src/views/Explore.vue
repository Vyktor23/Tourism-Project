<template>
  <div class="page">
    <div class="explore-shell">

      <!-- HERO -->
      <header class="hero">
        <button class="back" type="button" @click="goBack">←</button>

        <div class="hero-text">
          <span class="location">📍 {{ heroLocation }}</span>
          <h1>{{ heroTitle }}</h1>
          <p>{{ heroSubtitle }}</p>
        </div>

        <div v-if="selectedDepartamento" class="hero-stats">
          <div class="stat">
            <strong>{{ provinceOptions.length }}</strong>
            <span>Provincias</span>
          </div>
          <div class="stat">
            <strong>{{ scopedMunicipios.length }}</strong>
            <span>Municipios</span>
          </div>
          <div class="stat">
            <strong>{{ scopedDestinos.length }}</strong>
            <span>Destinos</span>
          </div>
        </div>
      </header>

      <!-- DEPARTAMENTOS -->
      <section class="block departments-block">
        <div class="block-head">
          <div>
            <h2>Departamentos</h2>
            <p class="block-sub">
              Explora Colombia por departamento. Por ahora solo {{ availableDeptCount }} está disponible.
            </p>
          </div>
          <button
            v-if="selectedDepartamento"
            type="button"
            class="link-btn"
            @click="clearDepartamento"
          >
            Ver todos
          </button>
        </div>

        <div v-if="loadingDepartamentos" class="dept-skeleton">
          <div v-for="n in 8" :key="n" class="sk" />
        </div>

        <div v-else class="dept-grid">
          <button
            v-for="dept in departamentos"
            :key="dept.nombre"
            type="button"
            class="dept-card"
            :class="{
              active: selectedDepartamento?.nombre === dept.nombre,
              locked: !dept.available,
            }"
            :disabled="!dept.available"
            @click="selectDepartamento(dept)"
          >
            <span class="dept-name">{{ dept.nombre }}</span>
            <span v-if="dept.available" class="dept-meta">
              {{ dept.municipioCount }} municipio{{ dept.municipioCount === 1 ? '' : 's' }}
            </span>
            <span v-else class="dept-meta locked-label">Próximamente</span>
            <span v-if="dept.available && selectedDepartamento?.nombre === dept.nombre" class="dept-check">✓</span>
          </button>
        </div>
      </section>

      <!-- CONTENIDO DEL DEPARTAMENTO SELECCIONADO -->
      <template v-if="selectedDepartamento">

        <!-- BREADCRUMB -->
        <nav class="breadcrumb" aria-label="Ubicación">
          <button type="button" @click="clearDepartamento">Colombia</button>
          <span>›</span>
          <span class="current">{{ selectedDepartamento.nombre }}</span>
        </nav>

        <!-- QUICK ACTIONS -->
        <section class="quick-actions">
          <button
            class="qa"
            :class="{ active: viewMode === 'destinos' && showMap }"
            @click="openMap"
          >
            🗺️<span>Mapa</span>
          </button>
          <button
            class="qa"
            :class="{ active: viewMode === 'destinos' && showCategoryFilters }"
            @click="openExperiences"
          >
            🎒<span>Experiencias</span>
          </button>
          <button class="qa" :class="{ active: sortMode === 'top' }" @click="toggleTop">
            🔥<span>Top</span>
          </button>
          <button class="qa" @click="scrollToProvinces">
            🏞️<span>Provincias</span>
          </button>
        </section>

        <!-- TRENDING -->
        <section ref="trendingSection" class="block trending-block">
          <div class="block-head">
            <div>
              <h2>🔥 En tendencia</h2>
              <p class="block-sub">Los destinos más destacados en {{ selectedDepartamento.nombre }}</p>
            </div>
          </div>

          <div v-if="trendingDestinos.length" class="trending-showcase">
            <article
              v-for="(item, index) in trendingDestinos"
              :key="item.slug"
              class="trend-card"
              :class="{ featured: index === 0 }"
              @click="goToDestino(item)"
            >
              <div class="trend-media">
                <img :src="item.image || fallbackImg" :alt="item.name" loading="lazy" />
                <span v-if="index === 0" class="trend-badge">Destacado</span>
                <span class="trend-rank">#{{ index + 1 }}</span>
              </div>
              <div class="trend-body">
                <h3>{{ item.name }}</h3>
                <p v-if="item.municipio?.name" class="trend-muni">{{ item.municipio.name }}</p>
                <div class="trend-foot">
                  <span v-if="item.rating">⭐ {{ Number(item.rating).toFixed(1) }}</span>
                  <span v-if="item.difficultyCanon || item.difficulty" class="trend-diff">
                    {{ item.difficultyCanon || item.difficulty }}
                  </span>
                </div>
              </div>
            </article>
          </div>

          <p v-else class="empty-inline">No hay destinos en tendencia por ahora.</p>
        </section>

        <!-- PROVINCIAS -->
        <section ref="provincesSection" class="block">
          <div class="block-head">
            <h2>Provincias</h2>
            <p class="block-sub">Filtra municipios y destinos por provincia</p>
          </div>

          <div class="categories">
            <button
              :class="{ active: !selectedProvince }"
              @click="selectedProvince = null"
            >
              Todas
            </button>
            <button
              v-for="prov in provinceOptions"
              :key="prov"
              :class="{ active: selectedProvince === prov }"
              @click="toggleProvince(prov)"
            >
              {{ prov }}
            </button>
          </div>
        </section>

        <!-- SEARCH & VIEW -->
        <section class="search-section">
          <SearchBox
            v-model="searchQuery"
            :mode="viewMode"
            :municipios="scopedMunicipios"
            :destinations="scopedDestinos"
            :placeholder="searchPlaceholder"
            @select="onSearchSelect"
          />

          <div class="view-toggle">
            <button :class="{ active: viewMode === 'municipios' }" @click="setView('municipios')">
              Municipios ({{ filteredMunicipios.length }})
            </button>
            <button :class="{ active: viewMode === 'destinos' }" @click="setView('destinos')">
              Destinos ({{ filteredDestinos.length }})
            </button>
            <button v-if="hasAnyFilter" class="clear" @click="resetFilters">
              Limpiar
            </button>
          </div>

          <div v-if="activeFilterChips.length" class="active-filters">
            <span v-for="c in activeFilterChips" :key="c" class="chip">{{ c }}</span>
          </div>
        </section>

        <!-- MOODS -->
        <section class="block moods-block">
          <h2>Elige tu mood</h2>
          <div class="moods">
            <button
              v-for="mood in moods"
              :key="mood.value"
              type="button"
              class="mood"
              :class="{ active: selectedMood === mood.value }"
              @click="toggleMood(mood.value)"
            >
              <span>{{ mood.icon }}</span>
              <p>{{ mood.label }}</p>
            </button>
          </div>
        </section>

        <!-- CATEGORÍAS -->
        <section v-if="viewMode === 'destinos' && showCategoryFilters" class="block">
          <h2>Experiencias</h2>
          <div class="categories">
            <button
              v-for="cat in categoryOptions"
              :key="cat"
              :class="{ active: selectedCategories.has(cat) }"
              @click="toggleCategory(cat)"
            >
              {{ cat }}
            </button>
          </div>

          <div class="subfilters">
            <div class="chips">
              <button
                v-for="d in difficultyOptions"
                :key="d"
                :class="{ active: selectedDifficulty === d }"
                @click="toggleDifficulty(d)"
              >
                {{ d }}
              </button>
              <button
                class="fav"
                :class="{ active: onlyFavorites }"
                @click="onlyFavorites = !onlyFavorites; setView('destinos')"
              >
                ❤️ Solo favoritos
              </button>
            </div>
          </div>
        </section>

        <!-- MAPA -->
        <section v-if="viewMode === 'destinos' && showMap" class="block">
          <div class="map-head">
            <h2>Mapa</h2>
            <button class="close-map" @click="showMap = false">Cerrar</button>
          </div>
          <DestinationsMap :destinations="mapDestinos" @select="goToDestino" />
          <p v-if="!mapDestinos.length" class="map-empty">
            No hay destinos con ubicación para mostrar con esos filtros.
          </p>
        </section>

        <!-- RESULTADOS -->
        <section ref="resultsBlock" class="block results-block">
          <div class="results-head">
            <h2>{{ viewMode === 'municipios' ? 'Municipios' : 'Destinos' }}</h2>
            <p class="results-count">
              {{ resultsTotal }} resultado{{ resultsTotal === 1 ? '' : 's' }}
              <span v-if="activePagState.hasPagination && !activePagState.showAll">
                · página {{ activePagState.page }} de {{ activePagState.totalPages }}
              </span>
              <span v-else-if="activePagState.showAll"> · ver todo</span>
            </p>
          </div>

          <template v-if="viewMode === 'municipios'">
            <MunicipioList
              v-if="displayMunicipios.length"
              :municipios="displayMunicipios"
              :loading="loadingMunicipios"
              @select="goToMunicipio"
            />
            <div v-else-if="!loadingMunicipios" class="empty">
              <p>No encontramos municipios con esos filtros.</p>
            </div>

            <ListPagination
              v-if="municipiosPagState.hasPagination"
              :page="municipiosPagState.page"
              :total-pages="municipiosPagState.totalPages"
              :total="municipiosPagState.total"
              :range-from="municipiosPagState.rangeFrom"
              :range-to="municipiosPagState.rangeTo"
              :show-all="municipiosPagState.showAll"
              :page-size="LIST_PAGE_SIZE"
              @prev="onMunicipiosPrev"
              @next="onMunicipiosNext"
              @view-all="onMunicipiosViewAll"
              @view-paged="onMunicipiosViewPaged"
            />
          </template>

          <template v-else>
            <DestinationList
              v-if="displayDestinos.length || loadingDestinos"
              :destinations="displayDestinos"
              :loading="loadingDestinos"
              variant="grid"
              @select="goToDestino"
            >
              <template #empty>
                <p>No encontramos destinos con esos filtros.</p>
              </template>
            </DestinationList>
            <div v-else-if="!loadingDestinos" class="empty">
              <p>No encontramos destinos con esos filtros.</p>
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
          </template>
        </section>
      </template>

      <!-- SIN DEPARTAMENTO -->
      <section v-else class="block pick-dept-hint">
        <div class="hint-card">
          <span class="hint-icon">🗺️</span>
          <h3>Selecciona un departamento</h3>
          <p>
            Elige <strong>Santander</strong> (u otro disponible) arriba para ver provincias,
            municipios y destinos turísticos.
          </p>
          <button
            v-if="santanderDept"
            type="button"
            class="hint-cta"
            @click="selectDepartamento(santanderDept)"
          >
            Explorar Santander →
          </button>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import MunicipioList from '@/components/MunicipioList.vue'
import DestinationList from '@/components/DestinationList.vue'
import DestinationsMap from '@/components/DestinationsMap.vue'
import SearchBox from '@/components/SearchBox.vue'
import ListPagination from '@/components/ListPagination.vue'

import { getMunicipios } from '@/services/municipiosService'
import { getDestinos } from '@/services/destinosService'
import { getDepartamentosExplore } from '@/services/departamentosService'
import { normalizeForSearch } from '@/utils/text'
import { useFavorites } from '@/composables/useFavorites'
import { usePagination } from '@/composables/usePagination'

defineOptions({ name: 'ExplorePage' })

const fallbackSvg = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">',
  '  <defs>',
  '    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">',
  '      <stop offset="0" stop-color="#111"/>',
  '      <stop offset="1" stop-color="#333"/>',
  '    </linearGradient>',
  '  </defs>',
  '  <rect width="100%" height="100%" fill="url(#g)"/>',
  '  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="64" fill="#fff" opacity="0.9">Destino</text>',
  '</svg>',
].join('\n')
const fallbackImg = 'data:image/svg+xml,' + encodeURIComponent(fallbackSvg)

const normalizeDept = (name) =>
  String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const router = useRouter()
const { isFavorite } = useFavorites()

const departamentos = ref([])
const selectedDepartamento = ref(null)
const loadingDepartamentos = ref(true)

const municipios = ref([])
const destinos = ref([])
const loadingMunicipios = ref(true)
const loadingDestinos = ref(true)

const viewMode = ref('municipios')
const selectedMood = ref(null)
const selectedProvince = ref(null)
const selectedCategories = ref(new Set())
const selectedDifficulty = ref(null)
const onlyFavorites = ref(false)
const showCategoryFilters = ref(false)
const showMap = ref(false)
const sortMode = ref('default')
const searchQuery = ref('')

const trendingSection = ref(null)
const provincesSection = ref(null)
const resultsBlock = ref(null)

const LIST_PAGE_SIZE = 12

const loadDepartamentos = async () => {
  loadingDepartamentos.value = true
  try {
    departamentos.value = await getDepartamentosExplore()
  } catch (e) {
    console.error(e)
  } finally {
    loadingDepartamentos.value = false
  }
}

const loadMunicipios = async () => {
  loadingMunicipios.value = true
  try {
    municipios.value = (await getMunicipios()).map((m) => ({ ...m }))
  } catch (e) {
    console.error(e)
  } finally {
    loadingMunicipios.value = false
  }
}

const loadDestinos = async () => {
  loadingDestinos.value = true
  try {
    destinos.value = await getDestinos()
  } catch (e) {
    console.error(e)
  } finally {
    loadingDestinos.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadDepartamentos(), loadMunicipios(), loadDestinos()])

  const santander = departamentos.value.find(
    (d) => d.available && normalizeDept(d.nombre) === 'santander',
  )
  if (santander) selectDepartamento(santander)
})

const availableDeptCount = computed(
  () => departamentos.value.filter((d) => d.available).length,
)

const santanderDept = computed(() =>
  departamentos.value.find(
    (d) => d.available && normalizeDept(d.nombre) === 'santander',
  ),
)

const heroLocation = computed(() =>
  selectedDepartamento.value
    ? `${selectedDepartamento.value.nombre}, Colombia`
    : 'Colombia',
)

const heroTitle = computed(() =>
  selectedDepartamento.value
    ? `Explora ${selectedDepartamento.value.nombre}`
    : 'Explora Colombia',
)

const heroSubtitle = computed(() =>
  selectedDepartamento.value
    ? 'Provincias, municipios y destinos en un solo lugar'
    : 'Selecciona un departamento para comenzar',
)

const searchPlaceholder = computed(() =>
  viewMode.value === 'municipios'
    ? 'Buscar municipios, provincias...'
    : 'Buscar cascadas, miradores, planes...',
)

const belongsToSelectedDept = (item, municipioRef = null) => {
  const dept = selectedDepartamento.value
  if (!dept) return true

  const muni = municipioRef || item
  if (dept.id_departamento && muni?.id_departamento) {
    return muni.id_departamento === dept.id_departamento
  }

  const name = muni?.departamento || dept.nombre
  return normalizeDept(name) === normalizeDept(dept.nombre)
}

const scopedMunicipios = computed(() => {
  if (!selectedDepartamento.value) return []
  return municipios.value.filter((m) => belongsToSelectedDept(m))
})

const scopedDestinos = computed(() => {
  if (!selectedDepartamento.value) return []
  return destinos.value.filter((d) => belongsToSelectedDept(d, d.municipio))
})

const selectDepartamento = (dept) => {
  if (!dept?.available) return
  selectedDepartamento.value = dept
  selectedProvince.value = null
  searchQuery.value = ''
  resetFilters(false)
  viewMode.value = 'municipios'
}

const clearDepartamento = () => {
  selectedDepartamento.value = null
  resetFilters()
}

const PROVINCE_ORDER = [
  'Área Metropolitana de Bucaramanga',
  'Provincia Metropolitana',
  'Soto Norte',
  'Soto',
  'Guanentá',
  'Comunera',
  'Vélez',
  'García Rovira',
  'Yariguíes',
]

const provinceOptions = computed(() => {
  const set = new Set(scopedMunicipios.value.map((m) => m?.province).filter(Boolean))
  const ordered = PROVINCE_ORDER.filter((p) => set.has(p))
  const extras = [...set].filter((p) => !PROVINCE_ORDER.includes(p)).sort((a, b) => a.localeCompare(b))
  return [...ordered, ...extras]
})

const trendingDestinos = computed(() => {
  const pool = scopedDestinos.value
  const trending = pool.filter((d) => d?.trending)
  const list = trending.length
    ? trending
    : [...pool].sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0))

  return list.slice(0, 6)
})

const filteredMunicipios = computed(() => {
  let results = scopedMunicipios.value

  const q = normalizeForSearch(searchQuery.value)
  if (q) {
    results = results.filter((m) => {
      const hay = [m?.name, m?.province, m?.departamento, m?.description]
        .filter(Boolean)
        .join(' | ')
      return normalizeForSearch(hay).includes(q)
    })
  }

  if (selectedProvince.value) {
    results = results.filter((m) => m.province === selectedProvince.value)
  }

  return results
})

const moods = [
  { label: 'Aventura', icon: '🌄', value: 'Aventura' },
  { label: 'Romántico', icon: '💑', value: 'Romántico' },
  { label: 'Relax', icon: '🧘', value: 'Relax' },
  { label: 'Familiar', icon: '👨‍👩‍👧', value: 'Familiar' },
]

const categoryOptions = computed(() => {
  const set = new Set()
  for (const d of scopedDestinos.value) {
    for (const c of d?.categoriesCanon || d?.categories || []) set.add(c)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
})

const difficultyOptions = computed(() => {
  const set = new Set(
    scopedDestinos.value.map((d) => d?.difficultyCanon || d?.difficulty).filter(Boolean),
  )
  return [...set].sort((a, b) => a.localeCompare(b))
})

const filteredDestinos = computed(() => {
  let results = scopedDestinos.value

  const q = normalizeForSearch(searchQuery.value)
  if (q) {
    results = results.filter((d) => {
      const hay = [
        d?.name,
        d?.description,
        d?.municipio?.name,
        d?.municipio?.province,
        ...(d?.categoriesCanon || d?.categories || []),
        ...(d?.moodCanon || d?.mood || []),
        d?.difficultyCanon || d?.difficulty,
      ]
        .filter(Boolean)
        .join(' | ')
      return normalizeForSearch(hay).includes(q)
    })
  }

  if (selectedProvince.value) {
    results = results.filter((d) => d?.municipio?.province === selectedProvince.value)
  }

  if (selectedMood.value) {
    const m = selectedMood.value
    results = results.filter((d) => {
      const moodsList = d?.moodCanon || d?.mood || []
      if (Array.isArray(moodsList) && moodsList.includes(m)) return true
      const cats = d?.categoriesCanon || d?.categories || []
      if (m === 'Romántico') return cats.includes('Gastronomía') || cats.includes('Cultura')
      if (m === 'Familiar') return cats.includes('Familiar')
      return false
    })
  }

  if (selectedCategories.value.size) {
    results = results.filter((d) => {
      const cats = d?.categoriesCanon || d?.categories || []
      if (!Array.isArray(cats) || !cats.length) return false
      for (const c of selectedCategories.value) {
        if (cats.includes(c)) return true
      }
      return false
    })
  }

  if (selectedDifficulty.value) {
    results = results.filter(
      (d) => (d?.difficultyCanon || d?.difficulty) === selectedDifficulty.value,
    )
  }

  if (onlyFavorites.value) {
    results = results.filter((d) => isFavorite(d))
  }

  if (sortMode.value === 'top') {
    results = [...results].sort((a, b) => {
      const ra = Number(a?.rating || 0)
      const rb = Number(b?.rating || 0)
      if (rb !== ra) return rb - ra
      return String(a?.name || '').localeCompare(String(b?.name || ''))
    })
  }

  return results
})

const municipiosPagination = usePagination(filteredMunicipios, LIST_PAGE_SIZE)
const destinosPagination = usePagination(filteredDestinos, LIST_PAGE_SIZE)

const displayMunicipios = computed(() => municipiosPagination.displayItems.value)
const displayDestinos = computed(() => destinosPagination.displayItems.value)

const municipiosPagState = computed(() => ({
  page: municipiosPagination.page.value,
  totalPages: municipiosPagination.totalPages.value,
  total: municipiosPagination.total.value,
  rangeFrom: municipiosPagination.rangeFrom.value,
  rangeTo: municipiosPagination.rangeTo.value,
  showAll: municipiosPagination.showAll.value,
  hasPagination: municipiosPagination.hasPagination.value,
}))

const destinosPagState = computed(() => ({
  page: destinosPagination.page.value,
  totalPages: destinosPagination.totalPages.value,
  total: destinosPagination.total.value,
  rangeFrom: destinosPagination.rangeFrom.value,
  rangeTo: destinosPagination.rangeTo.value,
  showAll: destinosPagination.showAll.value,
  hasPagination: destinosPagination.hasPagination.value,
}))

const activePagState = computed(() =>
  viewMode.value === 'municipios' ? municipiosPagState.value : destinosPagState.value,
)

const resultsTotal = computed(() => activePagState.value.total)

const mapDestinos = computed(() =>
  filteredDestinos.value.filter((d) => {
    const lat = Number(d?.latitude)
    const lng = Number(d?.longitude)
    return !Number.isNaN(lat) && !Number.isNaN(lng)
  }),
)

const hasAnyFilter = computed(() =>
  Boolean(
    searchQuery.value ||
    selectedProvince.value ||
    selectedMood.value ||
    selectedCategories.value.size ||
    selectedDifficulty.value ||
    onlyFavorites.value ||
    sortMode.value !== 'default',
  ),
)

const activeFilterChips = computed(() => {
  const chips = []
  if (selectedProvince.value) chips.push(selectedProvince.value)
  if (selectedMood.value) chips.push('Mood: ' + selectedMood.value)
  if (selectedDifficulty.value) chips.push('Dificultad: ' + selectedDifficulty.value)
  if (onlyFavorites.value) chips.push('Solo favoritos')
  if (sortMode.value === 'top') chips.push('Orden: Top')
  for (const c of selectedCategories.value) chips.push(c)
  return chips
})

watch(viewMode, () => {
  municipiosPagination.viewPaged()
  destinosPagination.viewPaged()
})

const onSearchSelect = ({ type, item }) => {
  if (type === 'municipio') goToMunicipio(item)
  else goToDestino(item)
}

const scrollToResults = () => {
  resultsBlock.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

const onMunicipiosPrev = () => {
  municipiosPagination.prevPage()
  scrollToResults()
}

const onMunicipiosNext = () => {
  municipiosPagination.nextPage()
  scrollToResults()
}

const onMunicipiosViewAll = () => {
  municipiosPagination.viewAll()
  scrollToResults()
}

const onMunicipiosViewPaged = () => {
  municipiosPagination.viewPaged()
  scrollToResults()
}

const onDestinosPrev = () => {
  destinosPagination.prevPage()
  scrollToResults()
}

const onDestinosNext = () => {
  destinosPagination.nextPage()
  scrollToResults()
}

const onDestinosViewAll = () => {
  destinosPagination.viewAll()
  scrollToResults()
}

const onDestinosViewPaged = () => {
  destinosPagination.viewPaged()
  scrollToResults()
}

const setView = (mode) => {
  viewMode.value = mode
  if (mode === 'municipios') {
    selectedMood.value = null
    selectedCategories.value = new Set()
    selectedDifficulty.value = null
    onlyFavorites.value = false
    showCategoryFilters.value = false
    sortMode.value = 'default'
    showMap.value = false
  }
}

const toggleMood = (m) => {
  selectedMood.value = selectedMood.value === m ? null : m
  if (selectedMood.value) setView('destinos')
}

const toggleProvince = (prov) => {
  selectedProvince.value = selectedProvince.value === prov ? null : prov
}

const toggleCategory = (cat) => {
  setView('destinos')
  const next = new Set(selectedCategories.value)
  if (next.has(cat)) next.delete(cat)
  else next.add(cat)
  selectedCategories.value = next
}

const toggleDifficulty = (d) => {
  setView('destinos')
  selectedDifficulty.value = selectedDifficulty.value === d ? null : d
}

const toggleTop = () => {
  setView('destinos')
  sortMode.value = sortMode.value === 'top' ? 'default' : 'top'
}

const resetFilters = (clearDept = true) => {
  searchQuery.value = ''
  selectedProvince.value = null
  selectedMood.value = null
  selectedCategories.value = new Set()
  selectedDifficulty.value = null
  onlyFavorites.value = false
  sortMode.value = 'default'
  showCategoryFilters.value = false
  showMap.value = false
  viewMode.value = 'municipios'
  if (clearDept) selectedDepartamento.value = null
}

const openExperiences = () => {
  setView('destinos')
  showCategoryFilters.value = !showCategoryFilters.value
}

const openMap = () => {
  setView('destinos')
  showMap.value = !showMap.value
}

const scrollToTrending = () => {
  trendingSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const scrollToProvinces = () => {
  provincesSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const goToMunicipio = (municipio) => {
  router.push({
    name: 'MunicipioDetail',
    params: { municipioSlug: municipio.slug },
  })
}

const goToDestino = (dest) => {
  const mSlug = dest?.municipio?.slug
  if (!mSlug || !dest?.slug) return
  router.push('/explore/' + mSlug + '/' + dest.slug)
}

const goBack = () => router.back()
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

.explore-shell {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* HERO */
.hero {
  padding: 24px 20px 28px;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a1a2e 55%, #16213e 100%);
  color: white;
  border-radius: 0 0 28px 28px;
}

.back {
  background: rgba(255, 255, 255, 0.12);
  border: none;
  color: white;
  font-size: 18px;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
}

.hero-text {
  margin-top: 14px;
}

.location {
  font-size: 13px;
  opacity: 0.85;
}

.hero-text h1 {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  margin: 8px 0 6px;
  line-height: 1.15;
}

.hero-text p {
  margin: 0;
  opacity: 0.88;
  font-size: clamp(0.9rem, 2vw, 1.05rem);
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

/* BLOCKS */
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

/* DEPARTAMENTOS */
.departments-block {
  margin-top: 16px;
}

.dept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.dept-card {
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  border-radius: 14px;
  padding: 12px 12px 10px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.dept-card:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.dept-card.active {
  border-color: #111;
  background: #111;
  color: #fff;
}

.dept-card.active .dept-meta {
  color: rgba(255, 255, 255, 0.75);
}

.dept-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f8f8;
}

.dept-name {
  display: block;
  font-weight: 700;
  font-size: 0.92rem;
  line-height: 1.2;
}

.dept-meta {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: #666;
}

.locked-label {
  font-style: italic;
}

.dept-check {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 12px;
  font-weight: 700;
}

.dept-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.dept-skeleton .sk {
  height: 72px;
  border-radius: 14px;
  background: linear-gradient(90deg, #eee, #f5f5f5, #eee);
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* BREADCRUMB */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 16px 0;
  font-size: 14px;
}

.breadcrumb button {
  border: none;
  background: none;
  padding: 0;
  font-weight: 600;
  cursor: pointer;
  color: #444;
}

.breadcrumb .current {
  font-weight: 700;
  color: #111;
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

.qa.active {
  outline: 2px solid #111;
  background: #fafafa;
}

.qa span {
  font-size: 11px;
  opacity: 0.85;
}

/* TRENDING */
.trending-block {
  margin-top: 18px;
}

.trending-showcase {
  display: grid;
  gap: 14px;
  grid-auto-flow: column;
  grid-auto-columns: minmax(240px, 78vw);
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.trending-showcase::-webkit-scrollbar {
  height: 6px;
}

.trending-showcase::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 999px;
}

.trend-card {
  scroll-snap-align: start;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
}

.trend-card:hover {
  transform: translateY(-3px);
}

.trend-media {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #222;
}

.trend-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trend-badge {
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

.trend-rank {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
}

.trend-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.trend-body h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.25;
}

.trend-muni {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

.trend-foot {
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #444;
}

.trend-diff {
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 999px;
}

/* SEARCH */
.search-section {
  margin: 16px;
}

.view-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
}

.view-toggle button {
  border: none;
  background: #fff;
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 13px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.view-toggle button.active {
  background: #111;
  color: #fff;
}

.view-toggle .clear {
  margin-left: auto;
  border: 1px solid #e5e5e5;
  box-shadow: none;
}

.active-filters {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.active-filters .chip {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #eee;
}

/* MOODS */
.moods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.mood {
  border: none;
  background: #111;
  color: #fff;
  border-radius: 16px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.mood.active {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  background: #222;
}

.mood p {
  margin: 0;
  font-size: 13px;
}

/* CATEGORIES */
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.categories button {
  border: none;
  background: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
}

.categories button.active {
  background: #111;
  color: #fff;
}

.subfilters {
  margin-top: 12px;
}

.subfilters .chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subfilters .chips button {
  border: none;
  background: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
}

.subfilters .chips button.active {
  background: #111;
  color: #fff;
}

.subfilters .chips .fav.active {
  background: #ff2d55;
}

.map-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.close-map {
  border: none;
  background: #fff;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
}

.map-empty,
.empty-inline {
  color: #666;
  font-size: 14px;
}

.results-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.results-head h2 {
  margin: 0;
  font-size: 1.15rem;
}

.results-count {
  margin: 0;
  font-size: 0.88rem;
  color: #666;
}

.empty {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.pick-dept-hint {
  margin-top: 8px;
}

.hint-card {
  background: #fff;
  border-radius: 20px;
  padding: 28px 22px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
}

.hint-icon {
  font-size: 40px;
}

.hint-card h3 {
  margin: 12px 0 8px;
}

.hint-card p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.hint-cta {
  margin-top: 16px;
  border: none;
  background: #111;
  color: #fff;
  padding: 12px 20px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

/* TABLET */
@media (min-width: 640px) {
  .dept-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .trending-showcase {
    grid-auto-flow: unset;
    grid-auto-columns: unset;
    overflow-x: visible;
    grid-template-columns: repeat(2, 1fr);
  }

  .trend-card.featured {
    grid-column: span 2;
    flex-direction: row;
  }

  .trend-card.featured .trend-media {
    flex: 1.1;
    aspect-ratio: auto;
    min-height: 200px;
  }

  .trend-card.featured .trend-body {
    flex: 1;
    justify-content: center;
    padding: 20px;
  }

  .trend-card.featured .trend-body h3 {
    font-size: 1.35rem;
  }

  .moods {
    grid-template-columns: repeat(4, 1fr);
  }

  .quick-actions {
    max-width: 520px;
  }
}

/* LAPTOP / DESKTOP */
@media (min-width: 1024px) {
  .hero {
    padding: 32px 40px 36px;
    border-radius: 0 0 32px 32px;
  }

  .block,
  .breadcrumb,
  .quick-actions,
  .search-section {
    margin-left: 32px;
    margin-right: 32px;
  }

  .dept-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  .trending-showcase {
    grid-template-columns: 1.4fr repeat(2, 1fr);
    grid-template-rows: repeat(2, minmax(180px, auto));
  }

  .trend-card.featured {
    grid-row: span 2;
    grid-column: span 1;
    flex-direction: column;
  }

  .trend-card.featured .trend-media {
    aspect-ratio: 4 / 3;
    min-height: 220px;
  }

  .trend-card:not(.featured) {
    min-height: 0;
  }

  .trend-card:not(.featured) .trend-media {
    aspect-ratio: 16 / 9;
  }
}

/* TV / ULTRAWIDE */
@media (min-width: 1600px) {
  .explore-shell {
    max-width: 1600px;
  }

  .trending-showcase {
    grid-template-columns: 1.5fr repeat(3, 1fr);
    grid-template-rows: repeat(2, minmax(200px, auto));
  }

  .dept-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
