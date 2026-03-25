<template>
  <div class="page">

    <!-- HERO -->
    <header class="hero">
      <button class="back" @click="goBack">←</button>

      <div class="hero-text">
        <span class="location">📍 Santander, Colombia</span>
        <h1>Explora sin límites</h1>
        <p>Destinos y experiencias pensadas para ti</p>
      </div>
    </header>

    <!-- QUICK ACTIONS -->
    <section class="quick-actions">
<<<<<<< HEAD
      <button class="qa" @click="comingSoon('Mapa')">🗺️<span>Mapa</span></button>
      <button class="qa" @click="comingSoon('Experiencias')">🎒<span>Experiencias</span></button>
      <button class="qa" @click="comingSoon('Top')">🔥<span>Top</span></button>
      <button class="qa" @click="comingSoon('Eventos')">🎉<span>Eventos</span></button>
=======
      <button class="qa" :class="{ active: viewMode === 'destinos' && showMap }" @click="openMap">🗺️<span>Mapa</span></button>
      <button class="qa" :class="{ active: viewMode === 'destinos' && showCategoryFilters }" @click="openExperiences">🎒<span>Experiencias</span></button>
      <button class="qa" :class="{ active: sortMode === 'top' }" @click="toggleTop">🔥<span>Top</span></button>
      <button class="qa" @click="openEventos">🎉<span>Eventos</span></button>
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
    </section>

    <!-- SEARCH -->
    <section class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar pueblos, cascadas, planes..."
      />
<<<<<<< HEAD
=======

      <!-- VIEW TOGGLE (misma estética de chips) -->
      <div class="view-toggle">
        <button :class="{ active: viewMode === 'municipios' }" @click="setView('municipios')">
          Municipios
        </button>
        <button :class="{ active: viewMode === 'destinos' }" @click="setView('destinos')">
          Destinos
        </button>
        <button v-if="hasAnyFilter" class="clear" @click="resetFilters">
          Limpiar
        </button>
      </div>

      <!-- ACTIVE FILTERS (chips de estado) -->
      <div v-if="activeFilterChips.length" class="active-filters">
        <span v-for="c in activeFilterChips" :key="c" class="chip">
          {{ c }}
        </span>
      </div>
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
    </section>

    <!-- MOODS -->
    <section class="block">
      <h2>Elige tu mood</h2>
      <div class="moods">
        <div
          v-for="mood in moods"
<<<<<<< HEAD
          :key="mood.label"
          class="mood"
          @click="goTo(mood.route)"
=======
          :key="mood.value"
          class="mood"
          :class="{ active: selectedMood === mood.value }"
          @click="toggleMood(mood.value)"
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
        >
          <span>{{ mood.icon }}</span>
          <p>{{ mood.label }}</p>
        </div>
      </div>
    </section>

    <!-- TRENDING -->
    <section class="block">
      <h2>🔥 Tendencias ahora</h2>

      <div class="trending">
        <div
<<<<<<< HEAD
          v-for="item in trending"
          :key="item.slug"
          class="trend-card"
          @click="goToMunicipio(item)"
        >
          <img :src="item.image" />
          <div class="trend-info">
            <p>{{ item.name }}</p>
            <span>⭐ {{ item.rating || '4.8' }}</span>
=======
          v-for="item in trendingDestinos"
          :key="item.slug"
          class="trend-card"
          @click="goToDestino(item)"
        >
          <img :src="item.image || fallbackImg" :alt="item.name" />
          <div class="trend-info">
            <p>{{ item.name }}</p>
            <span>⭐ {{ Number(item.rating || 0).toFixed(1) }}</span>
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
          </div>
        </div>
      </div>
    </section>

    <!-- Provincias  -->
    <section class="block">
      <h2>Provincias</h2>
      <div class="categories">
        <button
<<<<<<< HEAD
          v-for="prov in provinces"
=======
          v-for="prov in provinceOptions"
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
          :key="prov"
          :class="{ active: selectedProvince === prov }"
          @click="toggleProvince(prov)"
        >
          {{ prov }}
        </button>
      </div>
    </section>

<<<<<<< HEAD
    <!-- GRID -->
    <section class="block">
      <MunicipioList
        v-if="filteredMunicipios.length"
        :municipios="filteredMunicipios"
        :loading="loading"
        variant="grid"
        @select="goToMunicipio"
      />

      <div v-else class="empty">
        <p>No encontramos resultados</p>
      </div>
=======
    <!-- CATEGORÍAS (solo en destinos) -->
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

        <p class="hint">
          Nota: si marcas varias experiencias, se muestran destinos que coincidan con cualquiera de ellas.
        </p>
      </div>
    </section>

    <!-- MAP VIEW -->
    <section v-if="viewMode === 'destinos' && showMap" class="block">
      <div class="map-head">
        <h2>Mapa</h2>
        <button class="close-map" @click="showMap = false">Cerrar</button>
      </div>

      <DestinationsMap
        :destinations="mapDestinos"
        @select="goToDestino"
      />

      <p v-if="!mapDestinos.length" class="map-empty">
        No hay destinos con ubicación para mostrar con esos filtros.
      </p>
    </section>

    <!-- GRID -->
    <section class="block">
      <template v-if="viewMode === 'municipios'">
        <MunicipioList
          v-if="filteredMunicipios.length"
          :municipios="filteredMunicipios"
          :loading="loadingMunicipios"
          variant="grid"
          @select="goToMunicipio"
        />

        <div v-else class="empty">
          <p>No encontramos municipios con esos filtros</p>
        </div>
      </template>

      <template v-else>
        <DestinationList
          :destinations="filteredDestinos"
          :loading="loadingDestinos"
          variant="grid"
          @select="goToDestino"
        >
          <template #empty>
            <p>No encontramos destinos con esos filtros 😕</p>
          </template>
        </DestinationList>
      </template>
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
    </section>

    <!-- CTA -->
    <section class="cta-box">
      <h3>¿No sabes qué elegir?</h3>
      <p>Te ayudamos a encontrar el plan perfecto</p>
      <button @click="goTo('/ai')">Sorpréndeme</button>
    </section>

  </div>
</template>

<script setup>
<<<<<<< HEAD
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import MunicipioList from '@/components/MunicipioList.vue'
import { onMounted } from 'vue'
import { getMunicipios } from '@/services/municipiosService'

defineOptions({ name: 'ExplorePage' })

const municipios = ref([])
const loading = ref(true)

const loadMunicipios = async () => {
  loading.value = true
  try {
    municipios.value = (await getMunicipios()).map(m => ({
      ...m
    }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadMunicipios)
=======
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MunicipioList from '@/components/MunicipioList.vue'
import DestinationList from '@/components/DestinationList.vue'
import DestinationsMap from '@/components/DestinationsMap.vue'

import { getMunicipios } from '@/services/municipiosService'
import { getDestinos } from '@/services/destinosService'
import { normalizeForSearch } from '@/utils/text'
import { useFavorites } from '@/composables/useFavorites'

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

// Orden simple para el botón Top.
// default: sin orden especial (solo filtros)
// top: ordena por rating desc (y si hay empate, por name)
const sortMode = ref('default')

const { isFavorite } = useFavorites()

const router = useRouter()
const searchQuery = ref('')

const loadMunicipios = async () => {
  loadingMunicipios.value = true
  try {
    municipios.value = (await getMunicipios()).map(m => ({ ...m }))
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
  await Promise.all([loadMunicipios(), loadDestinos()])
})

const goToMunicipio = (municipio) => {
  router.push({
    name: 'MunicipioDetail',
    params: { municipioSlug: municipio.slug }
  })
}

const goToDestino = (dest) => {
  const mSlug = dest?.municipio?.slug
  if (!mSlug || !dest?.slug) return
  router.push('/explore/' + mSlug + '/' + dest.slug)
}
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)

const filteredMunicipios = computed(() => {
  let results = municipios.value

<<<<<<< HEAD
  if (searchQuery.value) {
    results = results.filter(m =>
      m.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedProvince.value) {
    results = results.filter(
      m => m.province === selectedProvince.value
    )
=======
  const q = normalizeForSearch(searchQuery.value)
  if (q) {
    results = results.filter(m => {
      const hay = [m?.name, m?.province, m?.departamento, m?.description]
        .filter(Boolean)
        .join(' | ')
      return normalizeForSearch(hay).includes(q)
    })
  }

  if (selectedProvince.value) {
    results = results.filter(m => m.province === selectedProvince.value)
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  }

  return results
})

<<<<<<< HEAD
const router = useRouter()

const searchQuery = ref('')
const selectedProvince = ref(null)

const goToMunicipio = (municipio) => {
  router.push({
    name: 'MunicipioDetail',
    params: {
      municipioSlug: municipio.slug
    }
  })
}

const trending = computed(() => municipios.value.slice(0, 5))

const provinces = [
  'Área Metropolitana de Bucaramanga',
=======
const trendingDestinos = computed(() => {
  const t = destinos.value.filter(d => d?.trending)
  if (t.length) return t.slice(0, 8)
  return [...destinos.value]
    .sort((a, b) => (Number(b?.rating || 0) - Number(a?.rating || 0)))
    .slice(0, 8)
})

const PROVINCE_ORDER = [
  'Área Metropolitana de Bucaramanga',
  'Provincia Metropolitana',
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  'Soto Norte',
  'Soto',
  'Guanentá',
  'Comunera',
  'Vélez',
  'García Rovira',
  'Yariguíes'
]

<<<<<<< HEAD
const moods = [
  { label: 'Aventura', icon: '🌄', route: '/mood/adventure' },
  { label: 'Romántico', icon: '💑', route: '/mood/romantic' },
  { label: 'Relax', icon: '🧘', route: '/mood/relax' },
  { label: 'Familiar', icon: '👨‍👩‍👧', route: '/mood/family' }
]


const toggleProvince = (prov) => {
  selectedProvince.value =
    selectedProvince.value === prov ? null : prov
}

const goTo = (path) => router.push(path)
const goBack = () => router.back()

const comingSoon = (feature) => {
  // MVP: no abrimos rutas fantasma
  alert(`${feature}: más adelante. Primero hagamos que lo básico funcione bien 😄`)
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}
=======
const provinceOptions = computed(() => {
  const set = new Set(municipios.value.map(m => m?.province).filter(Boolean))
  const ordered = PROVINCE_ORDER.filter(p => set.has(p))
  const extras = [...set].filter(p => !PROVINCE_ORDER.includes(p)).sort((a, b) => a.localeCompare(b))
  return [...ordered, ...extras]
})

const moods = [
  { label: 'Aventura', icon: '🌄', value: 'Aventura' },
  { label: 'Romántico', icon: '💑', value: 'Romántico' },
  { label: 'Relax', icon: '🧘', value: 'Relax' },
  { label: 'Familiar', icon: '👨‍👩‍👧', value: 'Familiar' }
]

const categoryOptions = computed(() => {
  const set = new Set()
  for (const d of destinos.value) {
    for (const c of (d?.categoriesCanon || d?.categories || [])) set.add(c)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
})

const difficultyOptions = computed(() => {
  const set = new Set(destinos.value.map(d => d?.difficultyCanon || d?.difficulty).filter(Boolean))
  return [...set].sort((a, b) => a.localeCompare(b))
})

const filteredDestinos = computed(() => {
  let results = destinos.value

  const q = normalizeForSearch(searchQuery.value)
  if (q) {
    results = results.filter(d => {
      const hay = [
        d?.name,
        d?.description,
        d?.municipio?.name,
        d?.municipio?.province,
        ...(d?.categoriesCanon || d?.categories || []),
        ...(d?.moodCanon || d?.mood || []),
        d?.difficultyCanon || d?.difficulty
      ].filter(Boolean).join(' | ')
      return normalizeForSearch(hay).includes(q)
    })
  }

  if (selectedProvince.value) {
    results = results.filter(d => d?.municipio?.province === selectedProvince.value)
  }

  if (selectedMood.value) {
    const m = selectedMood.value
    results = results.filter(d => {
      const moods = d?.moodCanon || d?.mood || []
      if (Array.isArray(moods) && moods.includes(m)) return true

      // Fallback si tu data aún no trae Romántico/Familiar
      const cats = d?.categoriesCanon || d?.categories || []
      if (m === 'Romántico') return cats.includes('Gastronomía') || cats.includes('Cultura')
      if (m === 'Familiar') return cats.includes('Familiar')
      return false
    })
  }

  if (selectedCategories.value.size) {
    results = results.filter(d => {
      const cats = d?.categoriesCanon || d?.categories || []
      if (!Array.isArray(cats) || !cats.length) return false
      // OR: cualquier categoría seleccionada
      for (const c of selectedCategories.value) {
        if (cats.includes(c)) return true
      }
      return false
    })
  }

  if (selectedDifficulty.value) {
    results = results.filter(d => (d?.difficultyCanon || d?.difficulty) === selectedDifficulty.value)
  }

  if (onlyFavorites.value) {
    results = results.filter(d => isFavorite(d))
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

const mapDestinos = computed(() => {
  // Solo destinos con coordenadas válidas
  return filteredDestinos.value.filter(d => {
    const lat = Number(d?.latitude)
    const lng = Number(d?.longitude)
    return !Number.isNaN(lat) && !Number.isNaN(lng)
  })
})

const hasAnyFilter = computed(() => {
  return Boolean(
    searchQuery.value ||
    selectedProvince.value ||
    selectedMood.value ||
    selectedCategories.value.size ||
    selectedDifficulty.value ||
    onlyFavorites.value ||
    sortMode.value !== 'default'
  )
})

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

/* Actions */
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

const resetFilters = () => {
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
}

const openExperiences = () => {
  setView('destinos')
  showCategoryFilters.value = !showCategoryFilters.value
}

const openMap = () => {
  setView('destinos')
  showMap.value = !showMap.value
}

const openEventos = () => {
  // A futuro: feed global. Por ahora, eventos se ven por municipio.
  alert('Eventos: por ahora se ven dentro de cada municipio (detalle). Luego hacemos un feed global.')
}

const goBack = () => router.back()
const goTo = (path) => router.push(path)
</script>

<style scoped>
* { box-sizing: border-box; }
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)

.page {
  overflow-x: hidden;
  padding-bottom: 96px;
  background: #fafafa;
}

/* HERO */
.hero {
  padding: 24px 20px 32px;
  background: linear-gradient(180deg, #0f0f0f, #1c1c1c);
  color: white;
  border-radius: 0 0 32px 32px;
}

.back {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
}

<<<<<<< HEAD
.hero-text {
  margin-top: 16px;
}

.hero-text h1 {
  font-size: 30px;
  margin: 6px 0;
}

.hero-text p {
  opacity: .8;
}

/* QUICK ACTIONS */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px;
  margin-top: 20px;
}

.qa {
  background: white;
  border-radius: 18px;
  padding: 14px 8px;
  border: none;
  box-shadow: 0 8px 20px rgba(0,0,0,.12);
}

.qa span {
  display: block;
  font-size: 12px;
}

/* SEARCH */
.search-section {
  padding: 0 16px 24px;
=======
.hero-text { margin-top: 16px; }
.hero-text h1 { font-size: 30px; margin: 6px 0; }
.hero-text p { opacity: .85; }

/* QUICK ACTIONS */
.quick-actions {
  margin: 18px 16px 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.qa {
  border: none;
  background: white;
  border-radius: 16px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  box-shadow: 0 10px 24px rgba(0,0,0,.08);
  cursor: pointer;
}

.qa.active {
  outline: 2px solid rgba(0,0,0,.2);
}

.qa span { font-size: 12px; opacity: .85; }

/* SEARCH */
.search-section {
  margin: 16px;
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
}

.search-section input {
  width: 100%;
<<<<<<< HEAD
  padding: 14px 16px;
  border-radius: 16px;
  border: none;
  background: #f0f0f0;
}

/* BLOCKS */
.block {
  padding: 0 16px 32px;
}

.block h2 {
  margin-bottom: 14px;
  font-size: 18px;
=======
  border: none;
  outline: none;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f1f1f1;
}

.view-toggle {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}

.view-toggle button {
  border: none;
  background: #fff;
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
}

.view-toggle button.active {
  background: #111;
  color: #fff;
}

.view-toggle .clear {
  margin-left: auto;
  background: #fff;
  border: 1px solid #eee;
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

/* BLOCK */
.block {
  margin: 18px 16px 0;
}

.block h2 {
  margin: 0 0 10px;
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
}

/* MOODS */
.moods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.mood {
  background: #000;
<<<<<<< HEAD
  color: white;
  border-radius: 18px;
  padding: 16px;
  text-align: center;
=======
  color: #fff;
  border-radius: 18px;
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.mood.active {
  outline: 2px solid rgba(255,255,255,.35);
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
}

/* TRENDING */
.trending {
  display: flex;
<<<<<<< HEAD
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.trending::-webkit-scrollbar {
  display: none;
}

.trend-card {
  min-width: 160px;
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0,0,0,.1);
=======
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.trending::-webkit-scrollbar { display: none; }

.trend-card {
  min-width: 160px;
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 10px 24px rgba(0,0,0,.08);
  cursor: pointer;
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
}

.trend-card img {
  width: 100%;
<<<<<<< HEAD
  height: 120px;
=======
  height: 110px;
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  object-fit: cover;
}

.trend-info {
  padding: 10px;
<<<<<<< HEAD
  font-size: 13px;
}

/* CATEGORIES */
.categories {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.categories button {
  padding: 10px 14px;
  border-radius: 16px;
  border: none;
  background: #eee;
}

.categories button.active {
  background: #000;
  color: white;
=======
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.trend-info p { margin: 0; font-size: 13px; }
.trend-info span { font-size: 12px; opacity: .8; }

/* CATEGORIES CHIPS */
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.categories button {
  border: none;
  background: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
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
  gap: 10px;
}

.subfilters .chips button {
  border: none;
  background: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
}

.subfilters .chips button.active {
  background: #111;
  color: #fff;
}

.subfilters .chips .fav {
  background: #ffeef0;
}

.subfilters .chips .fav.active {
  background: #ff2d55;
  color: #fff;
}

.hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: #666;
}

/* MAP */
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
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
}

.map-empty {
  margin-top: 10px;
  color: #666;
  font-size: 13px;
}

/* EMPTY */
.empty {
  width: 100%;
  text-align: center;
  padding: 40px 20px;
  color: #666;
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
}

/* CTA */
.cta-box {
<<<<<<< HEAD
  margin: 24px 16px;
  padding: 24px;
  background: #000;
  color: white;
  border-radius: 24px;
  text-align: center;
}

.cta-box button {
  margin-top: 14px;
  padding: 14px 18px;
  border-radius: 18px;
  border: none;
  background: white;
  font-weight: 600;
}
</style>
=======
  margin: 24px 16px 0;
  border-radius: 22px;
  padding: 18px;
  background: linear-gradient(135deg, #000, #333);
  color: #fff;
}

.cta-box button {
  margin-top: 12px;
  border: none;
  background: #fff;
  color: #000;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
}

@media (min-width: 768px) {
  .quick-actions { grid-template-columns: repeat(4, 1fr); }
}
</style>
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
