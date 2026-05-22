<template>
  <div class="page">
    <div class="tips-shell">
      <header class="hero">
        <BackButton @click="goBack" />

        <div class="hero-text">
          <span class="hero-badge">🛡️ Viaja con informacion</span>
          <h1>Consejos de seguridad</h1>
          <p>Recomendaciones practicas para explorar Santander con tranquilidad.</p>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <strong>{{ safetyTips.length }}</strong>
            <span>Consejos</span>
          </div>
          <div class="stat">
            <strong>{{ categoryCount }}</strong>
            <span>Temas</span>
          </div>
          <div class="stat">
            <strong>24/7</strong>
            <span>Emergencias</span>
          </div>
        </div>
      </header>

      <!-- QUICK ACTIONS -->
      <section class="quick-actions">
        <button
          type="button"
          class="qa"
          :class="{ active: showCategoryFilters }"
          @click="showCategoryFilters = !showCategoryFilters"
        >
          🗂️<span>Temas</span>
        </button>
        <button type="button" class="qa qa-danger" @click="go(AppRoute.emergencias())">
          🚨<span>SOS</span>
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
        <button
          v-if="hasAnyFilter"
          type="button"
          class="qa"
          @click="resetFilters"
        >
          ✕<span>Limpiar</span>
        </button>
      </section>

      <!-- VISTA Y ORDEN -->
      <section class="block controls-block">
        <div class="view-toggle">
          <button
            type="button"
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            Cuadricula ({{ filteredTips.length }})
          </button>
          <button
            type="button"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            Lista ({{ filteredTips.length }})
          </button>
          <button
            type="button"
            :class="{ active: sortMode === 'az' }"
            @click="toggleSort('az')"
          >
            A – Z
          </button>
          <button
            v-if="hasAnyFilter"
            type="button"
            class="clear"
            @click="resetFilters"
          >
            Limpiar
          </button>
        </div>

        <div v-if="activeFilterChips.length" class="active-filters">
          <span v-for="chip in activeFilterChips" :key="chip" class="chip">{{ chip }}</span>
        </div>
      </section>

      <!-- TEMAS -->
      <section v-if="showCategoryFilters" class="block">
        <div class="block-head">
          <div>
            <h2>Filtrar por tema</h2>
            <p class="block-sub">Elige un tema para acotar los consejos</p>
          </div>
          <button
            v-if="selectedCategory !== 'all'"
            type="button"
            class="link-btn"
            @click="selectedCategory = 'all'"
          >
            Ver todos
          </button>
        </div>

        <div class="categories">
          <button
            v-for="cat in safetyTipCategories"
            :key="cat.id"
            type="button"
            :class="{ active: selectedCategory === cat.id }"
            @click="toggleCategory(cat.id)"
          >
            {{ cat.label }}
          </button>
        </div>
      </section>

      <!-- RESULTADOS -->
      <section ref="resultsBlock" class="block results-block">
        <div class="results-head">
          <h2>Consejos</h2>
          <p class="results-count">
            {{ resultsTotal }} resultado{{ resultsTotal === 1 ? '' : 's' }}
            <span v-if="tipsPagState.hasPagination && !tipsPagState.showAll">
              · pagina {{ tipsPagState.page }} de {{ tipsPagState.totalPages }}
            </span>
            <span v-else-if="tipsPagState.showAll"> · ver todo</span>
          </p>
        </div>

        <div
          v-if="displayTips.length"
          class="tips-grid"
          :class="{ 'tips-list': viewMode === 'list' }"
        >
          <article
            v-for="tip in displayTips"
            :key="tip.id"
            class="tip-card"
          >
            <span class="tip-icon">{{ tip.icon }}</span>
            <span class="tip-cat">{{ categoryLabel(tip.category) }}</span>
            <h3>{{ tip.title }}</h3>
            <p>{{ tip.text }}</p>
          </article>
        </div>

        <div v-else class="empty">
          <p>No encontramos consejos con esos filtros.</p>
          <button type="button" class="btn-secondary" @click="resetFilters">
            Limpiar filtros
          </button>
        </div>

        <ListPagination
          v-if="tipsPagState.hasPagination"
          :page="tipsPagState.page"
          :total-pages="tipsPagState.totalPages"
          :total="tipsPagState.total"
          :range-from="tipsPagState.rangeFrom"
          :range-to="tipsPagState.rangeTo"
          :show-all="tipsPagState.showAll"
          :page-size="LIST_PAGE_SIZE"
          @prev="onTipsPrev"
          @next="onTipsNext"
          @view-all="onTipsViewAll"
          @view-paged="onTipsViewPaged"
        />
      </section>

      <section class="final-note">
        <span class="note-icon">ℹ️</span>
        <p>
          Estos consejos son orientacion general para viajeros. Ante una emergencia real,
          usa el centro de emergencias y los numeros oficiales.
        </p>
      </section>

      <section class="final-cta">
        <h2>¿Necesitas ayuda urgente?</h2>
        <p>Accede al centro de emergencias con llamadas directas y ubicacion.</p>
        <button type="button" class="btn-cta" @click="go(AppRoute.emergencias())">
          Ir a emergencias
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import ListPagination from '@/components/ListPagination.vue'
import BackButton from '@/components/BackButton.vue'
import { usePagination } from '@/composables/usePagination'
import {
  safetyTips,
  safetyTipCategories,
} from '@/data/safetyTips.js'
import { AppRoute } from '@/router/links.js'

defineOptions({ name: 'SafetyTipsPage' })

const LIST_PAGE_SIZE = 12

const router = useRouter()
const resultsBlock = ref(null)
const selectedCategory = ref('all')
const showCategoryFilters = ref(false)
const viewMode = ref('grid')
const sortMode = ref('default')

const categoryCount = safetyTipCategories.filter((c) => c.id !== 'all').length

const categoryLabels = Object.fromEntries(
  safetyTipCategories
    .filter((c) => c.id !== 'all')
    .map((c) => [c.id, c.label]),
)

const categoryLabel = (id) => categoryLabels[id] || id

const filteredTips = computed(() => {
  let results = [...safetyTips]

  if (selectedCategory.value !== 'all') {
    results = results.filter((t) => t.category === selectedCategory.value)
  }

  if (sortMode.value === 'az') {
    results.sort((a, b) => a.title.localeCompare(b.title, 'es'))
  } else if (sortMode.value === 'za') {
    results.sort((a, b) => b.title.localeCompare(a.title, 'es'))
  }

  return results
})

const tipsPagination = usePagination(filteredTips, LIST_PAGE_SIZE)
const displayTips = computed(() => tipsPagination.displayItems.value)

const tipsPagState = computed(() => ({
  page: tipsPagination.page.value,
  totalPages: tipsPagination.totalPages.value,
  total: tipsPagination.total.value,
  rangeFrom: tipsPagination.rangeFrom.value,
  rangeTo: tipsPagination.rangeTo.value,
  showAll: tipsPagination.showAll.value,
  hasPagination: tipsPagination.hasPagination.value,
}))

const resultsTotal = computed(() => tipsPagState.value.total)

const hasAnyFilter = computed(
  () => selectedCategory.value !== 'all' || sortMode.value !== 'default',
)

const activeFilterChips = computed(() => {
  const chips = []
  if (selectedCategory.value !== 'all') {
    chips.push(categoryLabel(selectedCategory.value))
  }
  if (sortMode.value === 'az') chips.push('Orden: A – Z')
  if (sortMode.value === 'za') chips.push('Orden: Z – A')
  return chips
})

const toggleCategory = (catId) => {
  selectedCategory.value = selectedCategory.value === catId ? 'all' : catId
}

const toggleSort = (mode) => {
  sortMode.value = sortMode.value === mode ? 'default' : mode
}

const resetFilters = () => {
  selectedCategory.value = 'all'
  sortMode.value = 'default'
  showCategoryFilters.value = false
  tipsPagination.viewPaged()
}

const scrollToResults = () => {
  resultsBlock.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

const onTipsPrev = () => {
  tipsPagination.prevPage()
  scrollToResults()
}

const onTipsNext = () => {
  tipsPagination.nextPage()
  scrollToResults()
}

const onTipsViewAll = () => {
  tipsPagination.viewAll()
  scrollToResults()
}

const onTipsViewPaged = () => {
  tipsPagination.viewPaged()
  scrollToResults()
}

watch(viewMode, () => {
  tipsPagination.viewPaged()
})

const go = (routeLocation) => router.push(routeLocation)
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

.tips-shell {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.hero {
  padding: 24px 20px 28px;
  background: linear-gradient(165deg, #0f1a2e 0%, #1a3a5c 50%, #1a1a2e 100%);
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
  font-size: clamp(1.4rem, 4vw, 2.1rem);
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
  font-size: 18px;
}

.qa.active {
  outline: 2px solid #111;
  background: #fafafa;
}

.qa-danger {
  background: linear-gradient(145deg, #ef5350, #c62828);
  color: #fff;
}

.qa-danger span {
  opacity: 0.95;
  font-weight: 600;
}

.qa span {
  font-size: 11px;
  opacity: 0.85;
}

.controls-block .view-toggle {
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
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  white-space: nowrap;
}

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

.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tips-grid.tips-list {
  grid-template-columns: 1fr;
}

.tips-list .tip-card {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto auto;
  column-gap: 12px;
  align-items: start;
}

.tips-list .tip-icon {
  grid-row: 1 / span 3;
}

.tips-list .tip-cat {
  grid-column: 2;
}

.tips-list .tip-card h3,
.tips-list .tip-card p {
  grid-column: 2;
}

.tip-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
}

.tip-icon {
  font-size: 26px;
}

.tip-cat {
  display: block;
  margin-top: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #888;
}

.tip-card h3 {
  margin: 6px 0 4px;
  font-size: 0.92rem;
}

.tip-card p {
  margin: 0;
  font-size: 0.8rem;
  color: #555;
  line-height: 1.45;
}

.empty {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.btn-secondary {
  margin-top: 12px;
  border: 1px solid #ddd;
  background: #fff;
  padding: 12px 20px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.final-note {
  margin: 24px 16px 0;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.note-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.final-note p {
  margin: 0;
  font-size: 0.88rem;
  color: #555;
  line-height: 1.5;
}

.final-cta {
  margin: 20px 16px 0;
  padding: 28px 22px;
  border-radius: 22px;
  text-align: center;
  color: #fff;
  background: linear-gradient(165deg, #1a0505 0%, #5c1010 45%, #16213e 100%);
}

.final-cta h2 {
  margin: 0 0 8px;
  font-size: 1.2rem;
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
  .tips-grid:not(.tips-list) {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .hero {
    padding: 32px 40px 36px;
    border-radius: 0 0 32px 32px;
  }

  .block,
  .quick-actions,
  .final-note,
  .final-cta {
    margin-left: 32px;
    margin-right: 32px;
  }

  .tips-grid:not(.tips-list) {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 520px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 400px) {
  .tips-grid:not(.tips-list) {
    grid-template-columns: 1fr;
  }
}
</style>
