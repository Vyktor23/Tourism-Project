<template>
  <div v-if="municipio" class="municipio-page">

    <!-- HERO -->
    <section class="hero">
      <img
        v-if="municipio.image"
        :src="municipio.image"
        :alt="municipio.name"
        class="hero-image"
      />
      <div class="hero-overlay">
        <h1>{{ municipio.name }}</h1>
        <p v-if="municipio.province">{{ municipio.province }}</p>
      </div>
    </section>

    <!-- DESCRIPCIÓN -->
    <section class="description" v-if="municipio.description">
      <p>{{ municipio.description }}</p>
    </section>

<<<<<<< HEAD
=======
    <!-- CLIMA (perfil general, NO pronóstico) -->
    <section v-if="climaHasData" class="clima">
      <div class="section-header">
        <h2>Clima</h2>
        <p class="section-sub">
          Perfil general del municipio. No es pronóstico diario.
        </p>
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

    <!-- EVENTOS CULTURALES -->
    <section v-if="eventosVisibles.length" class="eventos">
      <div class="section-header">
        <h2>Eventos culturales</h2>
        <p class="section-sub">Fechas según fuente. Algunos eventos solo publican mes/temporada.</p>
      </div>

      <div class="event-grid">
        <article v-for="e in eventosVisibles" :key="e.id" class="event-card">
          <div class="event-top">
            <h3 class="event-title">{{ e.title }}</h3>
            <span v-if="e.when" class="event-when">{{ e.when }}</span>
          </div>

          <p v-if="e.location" class="event-loc">📍 {{ e.location }}</p>
          <p v-if="e.description" class="event-desc">{{ e.description }}</p>

          <div v-if="e.tags?.length" class="chips">
            <span v-for="t in e.tags" :key="t" class="chip">{{ prettyTag(t) }}</span>
          </div>

          <a
            v-if="e.source_url"
            class="event-src"
            :href="e.source_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            Fuente
          </a>
        </article>
      </div>
    </section>

>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
    <!-- GASTRONOMÍA -->
    <section v-if="gastronomia.length" class="gastronomia">
      <div class="section-header">
        <h2>Gastronomía</h2>
        <p class="section-sub" v-if="gastronomiaDisclaimer">
          {{ gastronomiaDisclaimer }}
        </p>
      </div>

      <div class="dish-grid">
        <article
          v-for="p in gastronomia"
          :key="p.id || p.slug"
          class="dish-card"
        >
          <div class="dish-media" v-if="p.image_url">
            <img :src="p.image_url" :alt="p.name" loading="lazy" />
          </div>
          <div class="dish-media placeholder" v-else aria-hidden="true">
            🍽️
          </div>

          <div class="dish-body">
            <div class="dish-top">
              <h3 class="dish-title">{{ p.name }}</h3>
              <span v-if="p.is_typical" class="badge">Típico</span>
            </div>

            <p v-if="p.description" class="dish-desc">{{ p.description }}</p>
            <!-- <p v-if="p.note" class="dish-note">{{ p.note }}</p> -->

            <div v-if="p.tags?.length" class="chips">
              <span
                v-for="t in p.tags"
                :key="t"
                class="chip"
              >
                {{ prettyTag(t) }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>

<<<<<<< HEAD
    <!-- FILTROS -->
    <section v-if="categories.length" class="filters">
      <button
        :class="{ active: !selectedCategory }"
        @click="selectedCategory = null"
      >
        Todos
      </button>

      <button
        v-for="category in categories"
        :key="category"
        :class="{ active: selectedCategory === category }"
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
=======
    <!-- FILTROS (destinos del municipio) -->
    <section v-if="destinos.length" class="filters">
      <div class="filters-top">
        <input
          v-model="destinoQuery"
          type="text"
          placeholder="Buscar destinos en este municipio..."
        />

        <button v-if="hasDestinosFilters" class="clear" @click="resetDestinosFilters">Limpiar</button>
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
          :class="{ active: !selectedCategory }"
          @click="selectedCategory = null"
        >
          Todos
        </button>

        <button
          v-for="category in categories"
          :key="category"
          :class="{ active: selectedCategory === category }"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
    </section>

    <!-- DESTINOS -->
    <section class="destinos">
      <DestinationList
        :destinations="filteredDestinos"
        @select="goToDestination"
        />
    </section>

  </div>

  <div v-else class="loading">
    Cargando municipio...
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getMunicipioBySlug } from '@/services/municipiosService'
import { getDestinosByMunicipio } from '@/services/destinosService'
<<<<<<< HEAD
=======
import { getEventosByMunicipioId } from '@/services/eventosService'

import { normalizeForSearch } from '@/utils/text'
import { useFavorites } from '@/composables/useFavorites'
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)

import DestinationList from '@/components/DestinationList.vue'

const route = useRoute()
const router = useRouter()

const municipio = ref(null)
const destinos = ref([])
<<<<<<< HEAD
const selectedCategory = ref(null)
=======
const eventos = ref([])
const selectedCategory = ref(null)
const destinoQuery = ref('')
const selectedDifficulty = ref(null)
const onlyFavorites = ref(false)

const { isFavorite } = useFavorites()
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
const loading = ref(true)

// Tags llegan como text[]; esto los hace más presentables
const prettyTag = (tag) => {
  if (!tag) return ''
  const cleaned = String(tag).replace(/_/g, ' ').trim()
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

/* 👉 NAVEGACIÓN AL DESTINO (CORREGIDA) */
const goToDestination = (destino) => {
  router.push({
    name: 'DestinationDetail',
    params: {
      municipioSlug: municipio.value.slug,
      destinoSlug: destino.slug
    }
  })
}

onMounted(async () => {
  try {
    // 👇 PARAM CORRECTO
    const municipioSlug = route.params.municipioSlug

    // 1️⃣ Municipio
    municipio.value = await getMunicipioBySlug(municipioSlug)

    // 2️⃣ Destinos del municipio
    destinos.value = await getDestinosByMunicipio(municipio.value.id)
<<<<<<< HEAD
=======

    // 3️⃣ Eventos culturales (si existen)
    eventos.value = await getEventosByMunicipioId(municipio.value.id)
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  } catch (error) {
    console.error('Error cargando municipio o destinos:', error)
  } finally {
    loading.value = false
  }
})

<<<<<<< HEAD
=======
/* EVENTOS */
const parseISODate = (s) => {
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

const formatDate = (d) => {
  if (!d) return ''
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

const eventosVisibles = computed(() => {
  const list = Array.isArray(eventos.value) ? eventos.value : []
  const normalized = list.map((e) => {
    const start = parseISODate(e.start_date)
    const end = parseISODate(e.end_date)
    let when = ''

    if (start && end) {
      when = formatDate(start) + ' – ' + formatDate(end)
    } else if (start) {
      when = formatDate(start)
    } else if (e.month_hint) {
      when = String(e.month_hint)
    }

    return {
      id: e.id,
      title: e.title || 'Evento',
      description: e.description || '',
      location: e.location || '',
      when,
      tags: Array.isArray(e.tags) ? e.tags : [],
      source_url: e.source_url || '',
      _sortDate: start
    }
  })

  // Orden: por fecha si existe, si no, al final
  return normalized.sort((a, b) => {
    const ad = a._sortDate
    const bd = b._sortDate
    if (ad && bd) return ad - bd
    if (ad && !bd) return -1
    if (!ad && bd) return 1
    return a.title.localeCompare(b.title)
  })
})

>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
/* GASTRONOMÍA (municipio_platos -> platos) */
const gastronomia = computed(() => {
  const rel = municipio.value?.municipio_platos || []
  return rel
    .slice()
    .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
    .map((r) => ({
      ...(r?.platos || {}),
      is_typical: !!r?.is_typical,
      note: r?.note || null,
      sort_order: r?.sort_order ?? 0
    }))
})

// Si hay mezcla de típicos vs. referencia regional, mostramos un aviso pequeño.
const gastronomiaDisclaimer = computed(() => {
  const items = gastronomia.value
  if (!items.length) return ''
  const hasTypical = items.some(i => i.is_typical)
  const hasRegional = items.some(i => !i.is_typical)
  if (hasTypical && hasRegional) {
    return 'Algunos platos están marcados como “Típico” (mencionados específicamente para este municipio). Los demás son referencia regional.'
  }
  if (hasRegional && !hasTypical) {
    return 'Listado basado en referencia regional (Santander).'
  }
  return ''
})

<<<<<<< HEAD
/* CATEGORÍAS */
const categories = computed(() => {
  return [...new Set(
    destinos.value.flatMap(d => d.categories || [])
  )]
})

const filteredDestinos = computed(() => {
  if (!selectedCategory.value) return destinos.value
  return destinos.value.filter(d =>
    d.categories?.includes(selectedCategory.value)
  )
=======
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

const resetDestinosFilters = () => {
  destinoQuery.value = ''
  selectedCategory.value = null
  selectedDifficulty.value = null
  onlyFavorites.value = false
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
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
})
</script>

<style scoped>
.municipio-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* HERO */
.hero {
  position: relative;
  height: 280px;
  border-radius: 16px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.65),
    rgba(0, 0, 0, 0.2)
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
  color: white;
}

.hero-overlay h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.hero-overlay p {
  margin: 0.25rem 0 0;
  opacity: 0.9;
}

/* DESCRIPCIÓN */
.description {
  max-width: 800px;
  line-height: 1.6;
  font-size: 1rem;
}

/* SECCIONES */
.section-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.section-sub {
  margin: 0;
  font-size: 0.92rem;
  opacity: 0.75;
  max-width: 900px;
  line-height: 1.4;
}

/* GASTRONOMÍA */
.gastronomia {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

<<<<<<< HEAD
=======
/* CLIMA */
.clima {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(0,0,0,.02);
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

/* EVENTOS */
.eventos {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.event-card {
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 16px;
  padding: 12px 14px 14px;
  background: white;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
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

>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.dish-card {
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
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

<<<<<<< HEAD
/* .dish-note {
=======
.dish-note {
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.72;
  line-height: 1.35;
<<<<<<< HEAD
} */
=======
}
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.10);
  background: rgba(0,0,0,.03);
}

/* FILTROS */
.filters {
  display: flex;
<<<<<<< HEAD
  gap: 0.75rem;
=======
  flex-direction: column;
  gap: 12px;
}

.filters-top {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filters-top input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f1f1f1;
}

.filters-top .clear {
  border: none;
  background: #fff;
  padding: 10px 12px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid #eee;
}

.chips-row,
.categories {
  display: flex;
  gap: 10px;
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  flex-wrap: wrap;
}

.filters button {
<<<<<<< HEAD
  padding: 0.4rem 0.9rem;
=======
  padding: 0.45rem 0.95rem;
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  border-radius: 999px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
<<<<<<< HEAD
  font-size: 0.9rem;
=======
  font-size: 0.92rem;
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  transition: all 0.2s ease;
}

.filters button:hover {
  background: #f5f5f5;
}

.filters button.active {
  background: #111;
  color: white;
  border-color: #111;
}

<<<<<<< HEAD
=======
.filters .fav {
  background: #ffeef0;
  border-color: #ffd0d8;
}

.filters .fav.active {
  background: #ff2d55;
  color: #fff;
  border-color: #ff2d55;
}

>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
/* DESTINOS */
.destinos {
  margin-top: 1rem;
}

/* LOADING */
.loading {
  padding: 4rem 0;
  text-align: center;
  font-size: 1.1rem;
  opacity: 0.7;
}
</style>
