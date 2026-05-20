<template>
  <div v-if="evento" class="page">
    <section class="hero">
      <button class="back" type="button" @click="goBack">← Volver</button>

      <img
        v-if="evento.imagen"
        :src="evento.imagen"
        :alt="evento.title"
        class="hero-image"
      />
      <div v-else class="hero-placeholder" aria-hidden="true">🎉</div>

      <div class="hero-overlay">
        <div class="hero-badges">
          <span v-if="evento.tipoLabel" class="badge">{{ evento.tipoLabel }}</span>
          <span v-if="evento.destacado" class="badge featured">Destacado</span>
        </div>
        <h1>{{ evento.title }}</h1>
        <p v-if="municipio">{{ municipio.name }}<span v-if="municipio.province"> · {{ municipio.province }}</span></p>
      </div>
    </section>

    <section v-if="infoItems.length" class="info-grid">
      <div v-for="item in infoItems" :key="item.k" class="info-card">
        <div class="k">{{ item.k }}</div>
        <div class="v">{{ item.v }}</div>
      </div>
    </section>

    <div v-if="evento.tags?.length" class="chips">
      <span v-for="t in evento.tags" :key="t" class="chip">{{ prettyTag(t) }}</span>
    </div>

    <MediaGallery
      title="Fotos y videos"
      :alt-prefix="evento.title"
      :image-sources="[evento.imagen]"
      :video-sources="[evento.contacto, evento.source_url]"
    />

    <section v-if="evento.description" class="section">
      <h2>Descripción</h2>
      <p>{{ evento.description }}</p>
    </section>

    <section v-if="evento.location" class="section">
      <h2>Ubicación</h2>
      <p>📍 {{ evento.location }}</p>
    </section>

    <section v-if="contactItems.length" class="section">
      <h2>Contacto</h2>
      <ul class="contact-list">
        <li v-for="(c, i) in contactItems" :key="i">
          <span class="contact-k">{{ c.label }}</span>
          <a v-if="c.href" :href="c.href" target="_blank" rel="noopener noreferrer">{{ c.value }}</a>
          <span v-else>{{ c.value }}</span>
        </li>
      </ul>
    </section>

    <a
      v-if="evento.source_url"
      class="source-link"
      :href="evento.source_url"
      target="_blank"
      rel="noopener noreferrer"
    >
      Ver fuente oficial →
    </a>
  </div>

  <div v-else class="loading">Cargando evento...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MediaGallery from '@/components/MediaGallery.vue'
import { getMunicipioBySlug } from '@/services/municipiosService'
import { getEventoById } from '@/services/eventosService'
import { normalizeEvento } from '@/utils/eventos'

defineOptions({ name: 'EventoDetail' })

const route = useRoute()
const router = useRouter()

const municipio = ref(null)
const evento = ref(null)

const prettyTag = (tag) => {
  if (!tag) return ''
  const cleaned = String(tag).replace(/_/g, ' ').trim()
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

const infoItems = computed(() => {
  if (!evento.value) return []
  const items = []
  if (evento.value.when) items.push({ k: 'Fecha', v: evento.value.when })
  if (evento.value.schedule) items.push({ k: 'Horario', v: evento.value.schedule })
  if (evento.value.costo) items.push({ k: 'Costo', v: evento.value.costo })
  if (evento.value.organizador) items.push({ k: 'Organizador', v: evento.value.organizador })
  return items
})

const contactItems = computed(() => {
  const c = evento.value?.contacto
  if (!c || typeof c !== 'object') return []

  const items = []
  const push = (label, value, href) => {
    if (!value) return
    items.push({ label, value: String(value), href: href || null })
  }

  push('Teléfono', c.telefono || c.phone, c.telefono ? `tel:${c.telefono}` : null)
  push('WhatsApp', c.whatsapp, c.whatsapp ? `https://wa.me/${String(c.whatsapp).replace(/\D/g, '')}` : null)
  push('Email', c.email, c.email ? `mailto:${c.email}` : null)
  push('Web', c.web || c.website, c.web || c.website)

  return items
})

const goBack = () => router.back()

onMounted(async () => {
  try {
    const municipioSlug = route.params.municipioSlug
    const eventoId = Number(route.params.eventoId)

    municipio.value = await getMunicipioBySlug(municipioSlug)
    const raw = await getEventoById(eventoId)
    evento.value = normalizeEvento(raw)
  } catch (err) {
    console.error('Error cargando evento:', err)
  }
})
</script>

<style scoped>
.page {
  padding: 0 16px 100px;
}

.hero {
  position: relative;
  height: 280px;
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
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: white;
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72), transparent);
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

.badge.featured {
  background: rgba(229, 57, 53, 0.35);
}

.hero-overlay h1 {
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.2;
}

.hero-overlay p {
  margin: 6px 0 0;
  opacity: 0.9;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.info-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
}

.info-card .k {
  font-size: 12px;
  opacity: 0.7;
}

.info-card .v {
  font-weight: 700;
  margin-top: 4px;
  line-height: 1.3;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.chip {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
}

.section {
  margin-top: 20px;
}

.section h2 {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.section p {
  margin: 0;
  line-height: 1.6;
}

.contact-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-k {
  display: block;
  font-size: 12px;
  opacity: 0.7;
}

.contact-list a {
  color: inherit;
  font-weight: 600;
}

.source-link {
  display: inline-block;
  margin-top: 20px;
  font-weight: 600;
  color: inherit;
}

.loading {
  padding: 40px 16px;
  text-align: center;
  color: #666;
}
</style>
