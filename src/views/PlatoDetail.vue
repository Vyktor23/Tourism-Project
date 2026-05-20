<template>
  <div v-if="plato" class="page">
    <section class="hero">
      <button class="back" type="button" @click="goBack">← Volver</button>

      <img
        v-if="plato.image_url"
        :src="plato.image_url"
        :alt="plato.name"
        class="hero-image"
      />
      <div v-else class="hero-placeholder" aria-hidden="true">🍽️</div>

      <div class="hero-overlay">
        <div class="hero-badges">
          <span v-if="relation?.is_typical" class="badge typical">Típico del municipio</span>
          <span v-if="plato.categoria" class="badge">{{ plato.categoria }}</span>
        </div>
        <h1>{{ plato.name }}</h1>
        <p v-if="municipio">{{ municipio.name }}<span v-if="municipio.province"> · {{ municipio.province }}</span></p>
      </div>
    </section>

    <div v-if="plato.tags?.length" class="chips">
      <span v-for="t in plato.tags" :key="t" class="chip">{{ prettyTag(t) }}</span>
    </div>

    <section v-if="metaItems.length" class="highlights">
      <div v-for="item in metaItems" :key="item.k" class="highlight">
        <div class="k">{{ item.k }}</div>
        <div class="v">{{ item.v }}</div>
      </div>
    </section>

    <MediaGallery
      title="Fotos y videos"
      :alt-prefix="plato.name"
      :image-sources="[plato.image_url]"
      :video-sources="videoSources"
    />

    <section v-if="plato.description" class="section">
      <h2>Descripción</h2>
      <p>{{ plato.description }}</p>
    </section>

    <section v-if="plato.historia" class="section">
      <h2>Historia</h2>
      <p>{{ plato.historia }}</p>
    </section>

    <section v-if="ingredientes.length" class="section">
      <h2>Ingredientes</h2>
      <ul class="list">
        <li v-for="(ing, i) in ingredientes" :key="i">{{ ing }}</li>
      </ul>
    </section>

    <section v-if="plato.preparacion" class="section">
      <h2>Preparación</h2>
      <p class="pre-block">{{ plato.preparacion }}</p>
    </section>

    <section v-if="relation?.note" class="section note-box">
      <h2>Nota sobre este municipio</h2>
      <p>{{ relation.note }}</p>
    </section>
  </div>

  <div v-else class="loading">Cargando plato...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MediaGallery from '@/components/MediaGallery.vue'
import { getMunicipioBySlug } from '@/services/municipiosService'
import { getPlatoBySlug, getMunicipioPlatoRelation } from '@/services/platosService'

defineOptions({ name: 'PlatoDetail' })

const route = useRoute()
const router = useRouter()

const municipio = ref(null)
const plato = ref(null)
const relation = ref(null)

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
  return items
})

const videoSources = computed(() => [])

const goBack = () => router.back()

onMounted(async () => {
  try {
    const municipioSlug = route.params.municipioSlug
    const platoSlug = route.params.platoSlug

    municipio.value = await getMunicipioBySlug(municipioSlug)
    plato.value = await getPlatoBySlug(platoSlug)

    if (municipio.value?.id && plato.value?.id) {
      relation.value = await getMunicipioPlatoRelation(municipio.value.id, plato.value.id)
    }
  } catch (err) {
    console.error('Error cargando plato:', err)
  }
})
</script>

<style scoped>
.page {
  padding: 0 16px 100px;
}

.hero {
  position: relative;
  height: 300px;
  margin: 0 -16px;
  overflow: hidden;
  border-radius: 0 0 16px 16px;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  background: #f3f3f3;
}

.back {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  background: white;
  border: none;
  border-radius: 20px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  color: white;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.badge.typical {
  background: rgba(255, 193, 7, 0.25);
}

.hero-overlay h1 {
  margin: 0;
  font-size: 1.75rem;
}

.hero-overlay p {
  margin: 6px 0 0;
  opacity: 0.9;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 0 0;
}

.chip {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
}

.highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.highlight {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
}

.highlight .k {
  font-size: 12px;
  opacity: 0.7;
}

.highlight .v {
  font-weight: 700;
  margin-top: 4px;
}

.section {
  margin-top: 20px;
}

.section h2 {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.section p,
.pre-block {
  margin: 0;
  line-height: 1.6;
  opacity: 0.9;
}

.pre-block {
  white-space: pre-line;
}

.list {
  margin: 0;
  padding-left: 20px;
  line-height: 1.6;
}

.note-box {
  background: #fff8e6;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 14px;
}

.loading {
  padding: 40px 16px;
  text-align: center;
  color: #666;
}
</style>
