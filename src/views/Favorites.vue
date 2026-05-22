<template>
  <div class="page">
    <div class="favorites-shell">

      <!-- HERO -->
      <header class="hero">
        <BackButton @click="goBack" />

        <div class="hero-text">
          <span class="location">❤️ Tu coleccion personal</span>
          <h1>Mis favoritos</h1>
          <p>{{ heroSubtitle }}</p>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <strong>{{ favorites.length }}</strong>
            <span>Guardados</span>
          </div>
          <div class="stat">
            <strong>{{ uniqueMunicipios }}</strong>
            <span>Municipios</span>
          </div>
          <div class="stat">
            <strong>{{ categoryOptions.length }}</strong>
            <span>Categorias</span>
          </div>
        </div>
      </header>

      <!-- SIN FAVORITOS -->
      <section v-if="!favorites.length" class="block">
        <div class="empty-hero-card">
          <span class="empty-icon">💫</span>
          <h2>Aun no tienes favoritos</h2>
          <p>
            Explora destinos en Santander y toca el corazon para guardar los lugares
            que quieras visitar. Apareceran aqui listos para tu proximo viaje.
          </p>
          <button type="button" class="btn-primary" @click="goToExplore">
            Explorar destinos
          </button>
        </div>
      </section>

      <template v-else>
        <!-- BUSQUEDA -->
        <section class="block search-block">
          <SearchBox
            v-model="searchQuery"
            :destinations="favorites"
            placeholder="Buscar en tus favoritos..."
            @select="onSearchSelect"
          />
        </section>

        <!-- QUICK ACTIONS -->
        <section class="quick-actions">
          <button type="button" class="qa qa-trip" @click="goToTripPlanner">
            📅<span>Mi viaje</span>
          </button>
          <button
            type="button"
            class="qa"
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            ⊞<span>Cuadricula</span>
          </button>
          <button
            type="button"
            class="qa"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            ☰<span>Lista</span>
          </button>
          <button type="button" class="qa" @click="goToExplore">
            🧭<span>Explorar mas</span>
          </button>
          <button
            v-if="hasActiveFilters"
            type="button"
            class="qa"
            @click="resetFilters"
          >
            ✕<span>Limpiar</span>
          </button>
        </section>

        <!-- CATEGORIAS -->
        <section v-if="categoryOptions.length" class="block">
          <div class="block-head">
            <h2>Filtrar por experiencia</h2>
          </div>
          <div class="categories">
            <button
              type="button"
              :class="{ active: !selectedCategory }"
              @click="selectedCategory = ''"
            >
              Todas
            </button>
            <button
              v-for="cat in categoryOptions"
              :key="cat"
              type="button"
              :class="{ active: selectedCategory === cat }"
              @click="toggleCategory(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </section>

        <!-- ORDEN -->
        <section class="block sort-block">
          <div class="view-toggle">
            <button
              type="button"
              :class="{ active: sortMode === 'az' }"
              @click="sortMode = 'az'"
            >
              A – Z
            </button>
            <button
              type="button"
              :class="{ active: sortMode === 'za' }"
              @click="sortMode = 'za'"
            >
              Z – A
            </button>
            <button
              type="button"
              class="fav-sort"
              :class="{ active: sortMode === 'recent' }"
              @click="sortMode = 'recent'"
            >
              Recientes
            </button>
          </div>
          <p v-if="activeFilterChips.length" class="active-filters">
            <span v-for="chip in activeFilterChips" :key="chip" class="chip">{{ chip }}</span>
          </p>
        </section>

        <!-- DESTACADO -->
        <section v-if="featuredFavorite && !hasActiveFilters" class="block">
          <div class="block-head">
            <div>
              <h2>Tu proximo plan</h2>
              <p class="block-sub">El destino que guardaste para no olvidar</p>
            </div>
          </div>

          <article class="spotlight-card" @click="goToFavorite(featuredFavorite)">
            <div class="spotlight-media">
              <img
                :src="featuredFavorite.image || fallbackImg"
                :alt="featuredFavorite.name"
                loading="lazy"
              />
              <span class="spotlight-badge">Favorito</span>
              <button
                type="button"
                class="spotlight-fav"
                aria-label="Quitar de favoritos"
                @click.stop="toggleFavorite(featuredFavorite)"
              >
                ❤️
              </button>
            </div>
            <div class="spotlight-body">
              <h3>{{ featuredFavorite.name }}</h3>
              <p v-if="featuredFavorite.municipio?.name" class="spotlight-muni">
                📍 {{ featuredFavorite.municipio.name }}
              </p>
              <div v-if="spotlightCategories.length" class="spotlight-chips">
                <span v-for="c in spotlightCategories" :key="c" class="mini-chip">{{ c }}</span>
              </div>
              <button type="button" class="spotlight-cta" @click.stop="goToFavorite(featuredFavorite)">
                Ver destino →
              </button>
            </div>
          </article>
        </section>

        <!-- LISTA -->
        <section
          v-if="filteredFavorites.length > 1 || hasActiveFilters"
          ref="resultsBlock"
          class="block results-block"
        >
          <div class="results-head">
            <h2>{{ resultsTitle }}</h2>
            <p class="results-count">
              {{ filteredFavorites.length }} destino{{ filteredFavorites.length === 1 ? '' : 's' }}
            </p>
          </div>

          <div v-if="filteredFavorites.length === 0" class="empty-filter">
            <span>🔍</span>
            <h3>Nada coincide con tu busqueda</h3>
            <p>Prueba otro nombre o quita algun filtro.</p>
            <button type="button" class="btn-secondary" @click="resetFilters">
              Limpiar filtros
            </button>
          </div>

          <DestinationList
            v-else
            :destinations="listDestinations"
            :variant="viewMode"
            :card-variant="viewMode === 'list' ? 'horizontal' : 'grid'"
            @select="goToFavorite"
          />
        </section>

        <!-- CTA -->
        <section class="final-cta">
          <h2>Sigue armando tu ruta</h2>
          <p>Descubre mas lugares y organiza tu itinerario por dias.</p>
          <div class="cta-actions">
            <button type="button" class="btn-primary light" @click="goToTripPlanner">
              Planificar mi viaje
            </button>
            <button type="button" class="btn-secondary light" @click="goToExplore">
              Explorar Santander
            </button>
          </div>
        </section>

        <!-- VACIAR -->
        <section class="block danger-block">
          <button type="button" class="clear-btn" @click="confirmClearAll">
            Vaciar todos los favoritos
          </button>
        </section>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import { normalizeForSearch } from '@/utils/text'
import SearchBox from '@/components/SearchBox.vue'
import DestinationList from '@/components/DestinationList.vue'
import BackButton from '@/components/BackButton.vue'
import { AppRoute } from '@/router/links.js'

defineOptions({ name: 'FavoritesPage' })

const fallbackSvg = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">',
  '<rect width="100%" height="100%" fill="#111"/>',
  '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="28" font-family="sans-serif">Destino</text>',
  '</svg>',
].join('')
const fallbackImg = 'data:image/svg+xml,' + encodeURIComponent(fallbackSvg)

const router = useRouter()
const { favorites, toggleFavorite, clearAll } = useFavorites()

const searchQuery = ref('')
const sortMode = ref('recent')
const selectedCategory = ref('')
const viewMode = ref('grid')
const resultsBlock = ref(null)

const getCategories = (item) => item?.categoriesCanon || item?.categories || []

const categoryOptions = computed(() => {
  const set = new Set()
  for (const f of favorites.value) {
    for (const c of getCategories(f)) {
      if (c) set.add(c)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b))
})

const uniqueMunicipios = computed(() => {
  const slugs = new Set(
    favorites.value.map((f) => f?.municipio?.slug).filter(Boolean),
  )
  return slugs.size
})

const heroSubtitle = computed(() => {
  if (!favorites.value.length) {
    return 'Guarda lugares increibles y crea tu ruta sonada'
  }
  if (favorites.value.length === 1) {
    return 'Tienes 1 destino guardado para tu proxima aventura'
  }
  return `Tienes ${favorites.value.length} destinos listos para explorar`
})

const hasActiveFilters = computed(
  () => Boolean(searchQuery.value || selectedCategory.value || sortMode.value !== 'recent'),
)

const activeFilterChips = computed(() => {
  const chips = []
  if (searchQuery.value) chips.push('Busqueda: ' + searchQuery.value)
  if (selectedCategory.value) chips.push(selectedCategory.value)
  if (sortMode.value === 'az') chips.push('Orden: A – Z')
  if (sortMode.value === 'za') chips.push('Orden: Z – A')
  return chips
})

const orderedFavorites = computed(() => {
  const list = [...favorites.value]
  if (sortMode.value === 'recent') return [...list].reverse()
  const sorted = list.sort((a, b) =>
    String(a?.name || '').localeCompare(String(b?.name || '')),
  )
  return sortMode.value === 'za' ? sorted.reverse() : sorted
})

const filteredFavorites = computed(() => {
  const q = normalizeForSearch(searchQuery.value)

  return orderedFavorites.value.filter((item) => {
    if (selectedCategory.value) {
      const cats = getCategories(item)
      if (!cats.includes(selectedCategory.value)) return false
    }

    if (!q) return true

    const hay = [
      item?.name,
      item?.municipio?.name,
      ...getCategories(item),
    ]
      .filter(Boolean)
      .join(' | ')

    return normalizeForSearch(hay).includes(q)
  })
})

const featuredFavorite = computed(() => {
  const list = filteredFavorites.value
  return list.length ? list[0] : null
})

const listDestinations = computed(() => {
  const list = filteredFavorites.value
  if (!list.length) return []
  if (hasActiveFilters.value) return list
  if (list.length === 1) return []
  return list.slice(1)
})

const spotlightCategories = computed(() => {
  const cats = getCategories(featuredFavorite.value || {})
  return cats.slice(0, 3)
})

const resultsTitle = computed(() =>
  hasActiveFilters.value ? 'Resultados' : 'Todos tus favoritos',
)

const toggleCategory = (cat) => {
  selectedCategory.value = selectedCategory.value === cat ? '' : cat
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  sortMode.value = 'recent'
}

const onSearchSelect = ({ item }) => {
  goToFavorite(item)
}

const goToFavorite = (item) => {
  const mSlug = item?.municipio?.slug
  if (!mSlug || !item?.slug) return
  router.push(AppRoute.destino(item))
}

const goToExplore = () => router.push(AppRoute.explorar())
const goToTripPlanner = () => router.push(AppRoute.planificarViaje())

const confirmClearAll = () => {
  if (confirm('¿Eliminar todos los favoritos? Esta accion no se puede deshacer.')) {
    clearAll()
    resetFilters()
  }
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

.favorites-shell {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* HERO */
.hero {
  padding: 24px 20px 28px;
  background: linear-gradient(165deg, #0a0a0a 0%, #2a1020 45%, #1a1a2e 100%);
  color: white;
  border-radius: 0 0 28px 28px;
}

.hero-text {
  margin-top: 14px;
}

.location {
  font-size: 13px;
  opacity: 0.88;
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

.search-block {
  margin-top: -12px;
  position: relative;
  z-index: 2;
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

.qa-trip {
  background: linear-gradient(145deg, #1a1a2e, #2a2040);
  color: #fff;
}

.qa-trip span {
  opacity: 0.95;
  font-weight: 600;
}

.qa span {
  font-size: 11px;
  opacity: 0.85;
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

/* SORT */
.view-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.view-toggle .fav-sort.active {
  background: #ff2d55;
}

.active-filters {
  margin: 10px 0 0;
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

/* SPOTLIGHT */
.spotlight-card {
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.spotlight-card:hover {
  transform: translateY(-3px);
}

.spotlight-media {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #222;
}

.spotlight-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spotlight-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ff2d55;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}

.spotlight-fav {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-size: 18px;
}

.spotlight-body {
  padding: 16px;
}

.spotlight-body h3 {
  margin: 0;
  font-size: 1.15rem;
}

.spotlight-muni {
  margin: 6px 0 0;
  font-size: 0.88rem;
  color: #666;
}

.spotlight-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.mini-chip {
  font-size: 11px;
  background: #f4f4f5;
  padding: 4px 10px;
  border-radius: 999px;
}

.spotlight-cta {
  margin-top: 14px;
  border: none;
  background: #111;
  color: #fff;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

/* RESULTS */
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

/* EMPTY STATES */
.empty-hero-card {
  background: #fff;
  border-radius: 22px;
  padding: 36px 24px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 48px;
}

.empty-hero-card h2 {
  margin: 14px 0 8px;
}

.empty-hero-card p {
  margin: 0;
  color: #666;
  line-height: 1.55;
  max-width: 36ch;
  margin-left: auto;
  margin-right: auto;
}

.empty-filter {
  text-align: center;
  padding: 40px 20px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.empty-filter span {
  font-size: 36px;
}

.empty-filter h3 {
  margin: 12px 0 6px;
}

.empty-filter p {
  margin: 0 0 16px;
  color: #666;
}

/* BUTTONS */
.btn-primary {
  margin-top: 20px;
  border: none;
  background: #111;
  color: #fff;
  padding: 12px 22px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary.light {
  background: #fff;
  color: #111;
}

.btn-secondary {
  border: none;
  background: #f4f4f5;
  color: #111;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

/* CTA */
.final-cta {
  margin: 28px 16px 0;
  padding: 32px 24px;
  border-radius: 24px;
  text-align: center;
  color: #fff;
  background: linear-gradient(165deg, #0a0a0a 0%, #2a1020 50%, #16213e 100%);
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

.cta-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
  align-items: center;
}

.btn-secondary.light {
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: transparent;
  color: #fff;
  padding: 12px 22px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

/* CLEAR */
.danger-block {
  text-align: center;
  padding-bottom: 8px;
}

.clear-btn {
  border: none;
  background: transparent;
  color: #c62828;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (min-width: 640px) {
  .quick-actions {
    max-width: 480px;
  }

  .spotlight-card {
    display: flex;
  }

  .spotlight-media {
    flex: 1.1;
    aspect-ratio: auto;
    min-height: 220px;
  }

  .spotlight-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
</style>
