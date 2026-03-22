<template>
  <div class="page" v-if="destination">

    <!-- HEADER -->
    <div class="header">
      <button class="back" @click="goBack">← Volver</button>
    </div>

    <!-- HERO -->
    <section class="hero">
      <img v-if="destination.image" :src="destination.image" :alt="destination.name" />

      <!-- ❤️ FAVORITO -->
      <FavoriteButton
        v-if="destination"
        :destination="destination"
        variant="floating"
      />

      <div class="hero-overlay">
        <h1>{{ destination.name }}</h1>
        <p v-if="destination.municipio">
          {{ destination.municipio.name }}
<<<<<<< HEAD
=======
          <span v-if="destination.municipio.province">· {{ destination.municipio.province }}</span>
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
        </p>
      </div>
    </section>

<<<<<<< HEAD
    <!-- TAGS -->
    <div class="tags" v-if="destination.categories?.length">
      <span
        v-for="cat in destination.categories"
        :key="cat"
        class="tag"
      >
        {{ cat }}
      </span>
    </div>

=======
    <!-- CHIPS -->
    <div class="chips" v-if="chips.length">
      <span v-for="c in chips" :key="c" class="chip">{{ c }}</span>
    </div>

    <!-- HIGHLIGHTS -->
    <section class="highlights" v-if="hasHighlights">
      <div v-if="ratingText" class="highlight">
        <div class="k">Rating</div>
        <div class="v">⭐ {{ ratingText }}</div>
        <div v-if="reviewsText" class="sub">{{ reviewsText }}</div>
      </div>

      <div v-if="difficultyText" class="highlight">
        <div class="k">Dificultad</div>
        <div class="v">🧗 {{ difficultyText }}</div>
      </div>

      <div v-if="moodText" class="highlight">
        <div class="k">Mood</div>
        <div class="v">{{ moodText }}</div>
      </div>
    </section>

>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
    <!-- DESCRIPCIÓN -->
    <section class="section">
      <h2>📍 Sobre este destino</h2>
      <p>{{ destination.description }}</p>
    </section>

<<<<<<< HEAD
    <!-- DIFICULTAD -->
    <section class="section" v-if="destination.difficulty">
      <h3>Dificultad</h3>
      <p>{{ destination.difficulty }}</p>
    </section>

=======
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
    <!-- GALERÍA -->
    <section class="section" v-if="gallery.length">
      <h2>📸 Galería</h2>
      <div class="gallery">
        <img
          v-for="(img, i) in gallery"
          :key="i"
          :src="img"
<<<<<<< HEAD
=======
          :alt="'Foto ' + (i + 1) + ' de ' + destination.name"
          loading="lazy"
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
          @click="openImage(i)"
        />
      </div>
    </section>

    <!-- MAPA -->
    <section
      class="section"
<<<<<<< HEAD
      v-if="destination.latitude && destination.longitude"
    >
      <h2>🗺️ Ubicación</h2>
      <DestinationMap
        :lat="destination.latitude"
        :lng="destination.longitude"
=======
      v-if="hasCoords"
    >
      <h2>🗺️ Ubicación</h2>
      <DestinationMap
        :lat="Number(destination.latitude)"
        :lng="Number(destination.longitude)"
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
        :name="destination.name"
      />
    </section>

    <!-- MODAL -->
    <div v-if="showImage" class="image-modal" @click.self="closeImage">
<<<<<<< HEAD
      <img :src="activeImage" />
=======
      <img :src="activeImage" :alt="destination.name" />
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
      <button class="close" @click="closeImage">✕</button>
    </div>
  </div>

  <div v-else class="loading">
    Cargando destino...
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDestinoBySlug } from '@/services/destinosService'
import DestinationMap from '@/components/DestinationMap.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'

defineOptions({ name: 'DestinationDetail' })

const route = useRoute()
const router = useRouter()

const destination = ref(null)
const showImage = ref(false)
const activeIndex = ref(0)

onMounted(async () => {
  try {
    destination.value = await getDestinoBySlug(route.params.destinoSlug)
  } catch (err) {
    console.error('Error cargando destino:', err)
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

const goBack = () => router.back()
<<<<<<< HEAD
=======

const difficultyText = computed(() => destination.value?.difficultyCanon || destination.value?.difficulty || '')

const ratingText = computed(() => {
  const r = destination.value?.rating
  if (r === null || r === undefined || Number.isNaN(Number(r))) return ''
  return Number(r).toFixed(1)
})

const reviewsText = computed(() => {
  const n = destination.value?.reviews_count
  if (n === null || n === undefined || Number.isNaN(Number(n)) || Number(n) <= 0) return ''
  const v = Number(n)
  return v === 1 ? '1 reseña' : (v + ' reseñas')
})

const moodText = computed(() => {
  const moods = destination.value?.moodCanon || destination.value?.mood || []
  if (!Array.isArray(moods) || !moods.length) return ''
  return moods.slice(0, 3).join(' · ')
})

const chips = computed(() => {
  const cats = destination.value?.categoriesCanon || destination.value?.categories || []
  const moods = destination.value?.moodCanon || destination.value?.mood || []
  const out = []
  for (const c of (Array.isArray(cats) ? cats : [])) out.push(c)
  for (const m of (Array.isArray(moods) ? moods : [])) {
    if (!out.includes(m)) out.push(m)
  }
  return out.slice(0, 8)
})

const hasCoords = computed(() => {
  const lat = Number(destination.value?.latitude)
  const lng = Number(destination.value?.longitude)
  return !Number.isNaN(lat) && !Number.isNaN(lng)
})

const hasHighlights = computed(() => Boolean(ratingText.value || difficultyText.value || moodText.value))
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
</script>

<style scoped>
.page {
  padding-bottom: 90px;
}

/* HEADER */
.header {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

<<<<<<< HEAD
.back, .favorite {
=======
.back {
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  background: white;
  border: none;
  border-radius: 20px;
  padding: 8px 12px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0,0,0,.2);
}

/* HERO */
.hero {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
<<<<<<< HEAD
  background: linear-gradient(to top, rgba(0,0,0,.6), transparent);
=======
  background: linear-gradient(to top, rgba(0,0,0,.65), transparent);
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  color: white;
}

.hero-overlay h1 {
  font-size: 28px;
}

.hero-overlay p {
<<<<<<< HEAD
  opacity: .9;
}

/* TAGS */
.tags {
  display: flex;
=======
  opacity: .95;
}

/* CHIPS */
.chips {
  display: flex;
  flex-wrap: wrap;
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  gap: 8px;
  padding: 16px;
}

<<<<<<< HEAD
.tag {
=======
.chip {
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
  background: #f2f2f2;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
}

<<<<<<< HEAD
=======
/* HIGHLIGHTS */
.highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0 16px;
  margin-top: 6px;
}

.highlight {
  background: white;
  border-radius: 16px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0,0,0,.08);
}

.k {
  font-size: 12px;
  color: #666;
}

.v {
  margin-top: 6px;
  font-weight: 700;
}

.sub {
  margin-top: 4px;
  font-size: 12px;
  color: #777;
}

>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
/* SECTIONS */
.section {
  padding: 0 16px;
  margin-top: 24px;
}

.section h2 {
  margin-bottom: 8px;
}

.section p {
  line-height: 1.6;
}

<<<<<<< HEAD
/* HIGHLIGHTS */
.highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
}

.highlight {
  background: white;
  border-radius: 16px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0,0,0,.08);
  font-size: 13px;
}

/* LISTS */
.list li {
  margin-bottom: 6px;
}

=======
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
/* GALLERY */
.gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.gallery img {
  height: 130px;
  object-fit: cover;
  border-radius: 14px;
  cursor: pointer;
}

<<<<<<< HEAD
/* SERVICES */
.services-grid {
  display: grid;
  gap: 12px;
}

.service-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,.08);
}

.service-actions {
  display: flex;
  gap: 10px;
}

.service-actions a {
  background: #f2f2f2;
  padding: 6px 12px;
  border-radius: 20px;
  text-decoration: none;
  color: black;
}

/* CTA */
.cta-section {
  margin: 32px 16px;
  background: linear-gradient(135deg, #000, #333);
  color: white;
  padding: 24px;
  border-radius: 20px;
  text-align: center;
}

.cta {
  margin-top: 12px;
  background: white;
  color: black;
  border: none;
  padding: 12px 20px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
}

=======
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
/* MODAL */
.image-modal {
  position: fixed;
  inset: 0;
<<<<<<< HEAD
  background: rgba(0,0,0,.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.image-modal img {
  max-width: 90%;
  max-height: 80%;
  border-radius: 16px;
}

.close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 50%;
  border: none;
  width: 36px;
  height: 36px;
}
</style>
=======
  background: rgba(0,0,0,.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
}

.image-modal img {
  max-width: 92%;
  max-height: 84%;
  border-radius: 14px;
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
  box-shadow: 0 10px 28px rgba(0,0,0,.25);
}

.loading {
  padding: 40px 16px;
  color: #666;
}

@media (max-width: 520px) {
  .highlights {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
>>>>>>> 0eca8fd (Destinos, eventos, filtros, platos y mas informacion adicional)
