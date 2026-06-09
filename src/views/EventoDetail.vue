<template>
  <div class="page">
    <div v-if="loading" class="detail-shell loading-shell">
      <header class="hero hero-skeleton"><div class="sk-hero" /></header>
      <section class="block"><div v-for="n in 3" :key="n" class="sk-line" /></section>
    </div>

    <div v-else-if="evento" class="detail-shell">
      <header class="hero hero-event">
        <BackButton floating @click="goBack" />

        <div class="hero-media">
          <img
            v-if="heroImage"
            :src="heroImage"
            :alt="evento.title"
            class="hero-image"
          />
          <div v-else class="hero-placeholder" aria-hidden="true">🎉</div>

          <div class="hero-overlay">
            <nav class="breadcrumb" aria-label="Ubicacion">
              <button type="button" @click="goToExplore">Colombia</button>
              <template v-if="muniDepartamento">
                <span>›</span>
                <span class="crumb-text">{{ muniDepartamento }}</span>
              </template>
              <template v-if="municipio?.slug">
                <span>›</span>
                <button type="button" @click="goToMunicipio">
                  {{ municipio.name }}
                </button>
              </template>
              <span>›</span>
              <span class="current">{{ evento.title }}</span>
            </nav>

            <div class="hero-badges">
              <span v-if="evento.tipoLabel" class="hero-pill">{{ evento.tipoLabel }}</span>
              <span v-if="evento.destacado" class="hero-pill featured">Destacado</span>
            </div>

            <h1>{{ evento.title }}</h1>
            <div v-if="municipio" class="hero-place">
              <p class="hero-place-path">{{ municipioPathLine }}</p>
              <p v-if="muniProvinceLabel" class="hero-place-province">{{ muniProvinceLabel }}</p>
            </div>
            <p v-if="evento.when" class="hero-when">📅 {{ evento.when }}</p>
          </div>
        </div>

        <div v-if="heroStats.length" class="hero-stats">
          <div v-for="item in heroStats" :key="item.label" class="stat">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </header>

      <section class="quick-actions">
        <button v-if="municipio?.slug" type="button" class="qa" @click="goToMunicipio">
          🏘️<span>Municipio</span>
        </button>
        <button type="button" class="qa" @click="goToExplore">
          🧭<span>Explorar</span>
        </button>
        <button
          v-if="hasContact"
          type="button"
          class="qa"
          @click="scrollToSection(contactBlock)"
        >
          📞<span>Contacto</span>
        </button>
        <a
          v-if="evento.source_url"
          :href="evento.source_url"
          target="_blank"
          rel="noopener noreferrer"
          class="qa qa-link"
        >
          🔗<span>Fuente</span>
        </a>
      </section>

      <section v-if="evento.tags?.length" class="block">
        <div class="block-head">
          <h2>Etiquetas</h2>
        </div>
        <div class="chip-row">
          <span v-for="t in evento.tags" :key="t" class="chip-pill">{{ prettyTag(t) }}</span>
        </div>
      </section>

      <section v-if="hasMedia" class="block">
        <div class="block-head">
          <h2>Galería</h2>
          <p class="block-sub">{{ eventoMediaSummary }}</p>
        </div>
        <div class="content-card gallery-wrap">
          <MediaGallery
            title=""
            :alt-prefix="evento.title"
            :image-sources="eventoMedia.imageSources"
            :video-sources="eventoMedia.videoSources"
          />
        </div>
      </section>

      <section v-if="evento.description" class="block">
        <div class="block-head">
          <h2>Sobre el evento</h2>
          <p class="block-sub">Descripcion y contexto</p>
        </div>
        <article class="content-card">
          <p>{{ evento.description }}</p>
        </article>
      </section>

      <section v-if="evento.location" class="block">
        <div class="block-head">
          <h2>Ubicacion</h2>
        </div>
        <article class="content-card location-card">
          <p>📍 {{ evento.location }}</p>
        </article>
      </section>

      <section v-if="hasContact" ref="contactBlock" class="block">
        <div class="block-head">
          <h2>Contacto</h2>
          <p class="block-sub">Informacion para consultas o reservas</p>
        </div>
        <ul class="contact-grid">
          <li v-for="(c, i) in contactItems" :key="i" class="contact-card">
            <span class="contact-k">{{ c.label }}</span>
            <a v-if="c.href" :href="c.href" target="_blank" rel="noopener noreferrer">{{ c.value }}</a>
            <span v-else class="contact-v">{{ c.value }}</span>
          </li>
        </ul>
      </section>

      <section class="final-cta">
        <h2>Vive la cultura local</h2>
        <p>Descubre mas eventos y planes en {{ municipio?.name || 'Santander' }}.</p>
        <div class="cta-actions">
          <button v-if="municipio?.slug" type="button" class="btn primary" @click="goToMunicipio">
            Ver municipio
          </button>
          <button type="button" class="btn ghost" @click="goToExplore">
            Explorar mas
          </button>
        </div>
      </section>
    </div>

    <div v-else class="detail-shell empty-page">
      <div class="empty-card">
        <span>🎭</span>
        <h2>Evento no encontrado</h2>
        <p>No pudimos cargar la informacion de este evento.</p>
        <button type="button" class="btn primary" @click="goToExplore">
          Volver a explorar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MediaGallery from '@/components/MediaGallery.vue'
import BackButton from '@/components/BackButton.vue'
import {
  locationPathLine,
  provinceLabel,
  departamentoLabel,
} from '@/utils/locationDisplay.js'
import { AppRoute } from '@/router/links.js'
import { getMunicipioBySlug } from '@/services/municipiosService'
import { getEventoById } from '@/services/eventosService'
import { normalizeEvento } from '@/utils/eventos'
import { buildEntityMedia } from '@/utils/media'

defineOptions({ name: 'EventoDetail' })

const route = useRoute()
const router = useRouter()

const municipio = ref(null)
const evento = ref(null)
const loading = ref(true)
const contactBlock = ref(null)

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

const muniDepartamento = computed(() => departamentoLabel(municipio.value))

const municipioPathLine = computed(() => locationPathLine(municipio.value))

const muniProvinceLabel = computed(() => provinceLabel(municipio.value))

const heroStats = computed(() => {
  const items = infoItems.value.slice(0, 3)
  return items.map((x) => ({ label: x.k, value: x.v }))
})

const contactItems = computed(() => {
  const c = evento.value?.contacto
  if (!c || typeof c !== 'object') return []

  const items = []
  const push = (label, value, href) => {
    if (!value) return
    items.push({ label, value: String(value), href: href || null })
  }

  push('Telefono', c.telefono || c.phone, c.telefono ? `tel:${c.telefono}` : null)
  push('WhatsApp', c.whatsapp, c.whatsapp ? `https://wa.me/${String(c.whatsapp).replace(/\D/g, '')}` : null)
  push('Email', c.email, c.email ? `mailto:${c.email}` : null)
  push('Web', c.web || c.website, c.web || c.website)

  return items
})

const hasContact = computed(() => contactItems.value.length > 0)

const eventoMedia = computed(() =>
  buildEntityMedia(evento.value, {
    imageFields: ['imagen'],
    galleryField: 'gallery',
    videoFields: [evento.value?.contacto, evento.value?.source_url],
  }),
)

const heroImage = computed(() => eventoMedia.value.heroImage)

const hasMedia = computed(() => eventoMedia.value.totalCount > 0)

const eventoMediaSummary = computed(() => {
  const { imageCount, videoCount } = eventoMedia.value
  const parts = []
  if (imageCount) parts.push(`${imageCount} foto${imageCount === 1 ? '' : 's'}`)
  if (videoCount) parts.push(`${videoCount} video${videoCount === 1 ? '' : 's'}`)
  return parts.join(' · ') || 'Galeria del evento'
})

const goBack = () => router.back()
const goToExplore = () => router.push(AppRoute.explorar())

const goToMunicipio = () => {
  const m = municipio.value
  if (!m?.slug) return
  router.push(AppRoute.municipio(m))
}

const scrollToSection = (el) => {
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(async () => {
  try {
    const municipioSlug = route.params.municipioSlug
    const eventoId = Number(route.params.eventoId)

    municipio.value = await getMunicipioBySlug(municipioSlug)
    const raw = await getEventoById(eventoId)
    if (raw && municipio.value?.id && Number(raw.municipio_id) !== Number(municipio.value.id)) {
      evento.value = null
    } else {
      evento.value = normalizeEvento(raw)
    }
  } catch (err) {
    console.error('Error cargando evento:', err)
  } finally {
    loading.value = false
  }
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

.detail-shell {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-event {
  background: linear-gradient(165deg, #0a0a0a 0%, #2e1a3a 50%, #16213e 100%);
  color: #fff;
  border-radius: 0 0 28px 28px;
  overflow: hidden;
}

.hero {
  position: relative;
}

.hero-media {
  position: relative;
  height: clamp(280px, 46vh, 400px);
}

.hero-image,
.hero-placeholder {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.hero-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  background: linear-gradient(135deg, #2e1a3a, #4a2060);
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

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.hero-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.hero-pill.featured {
  background: #ff3b30;
  border-color: transparent;
}

.hero-overlay h1 {
  margin: 0;
  font-size: clamp(1.4rem, 5vw, 2rem);
  line-height: 1.15;
}

.hero-when {
  margin: 8px 0 0;
  opacity: 0.9;
  font-size: 0.92rem;
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
  font-size: 0.92rem;
  line-height: 1.3;
}

.stat span {
  display: block;
  font-size: 11px;
  opacity: 0.8;
  margin-top: 4px;
}

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
  text-decoration: none;
  color: inherit;
}

.qa-link {
  justify-content: center;
}

.qa span {
  font-size: 11px;
  opacity: 0.85;
}

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

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-pill {
  background: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
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
  padding: 12px;
}

.gallery-wrap :deep(.media-gallery h2) {
  display: none;
}

.location-card p {
  font-size: 1rem;
  font-weight: 500;
}

.contact-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.contact-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
}

.contact-k {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.contact-card a,
.contact-v {
  font-weight: 600;
  color: #111;
  word-break: break-word;
}

.contact-card a {
  text-decoration: none;
}

.contact-card a:hover {
  text-decoration: underline;
}

.final-cta {
  margin: 28px 16px 0;
  padding: 32px 24px;
  border-radius: 24px;
  text-align: center;
  color: #fff;
  background: linear-gradient(165deg, #0a0a0a 0%, #2e1a3a 50%, #16213e 100%);
}

.final-cta h2 {
  margin: 0 0 8px;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
}

.final-cta p {
  margin: 0;
  opacity: 0.88;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 16px;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.btn.primary {
  background: #fff;
  color: #111;
}

.btn.ghost {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.45);
}

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

  .contact-grid {
    grid-template-columns: repeat(2, 1fr);
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

  .hero-stats {
    grid-template-columns: 1fr;
  }
}
</style>
