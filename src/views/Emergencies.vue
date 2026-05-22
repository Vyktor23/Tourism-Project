<template>
  <div class="page">
    <div class="emergencies-shell">

      <!-- HERO -->
      <header class="hero">
        <BackButton @click="goBack" />

        <div class="hero-text">
          <span class="hero-badge">🛡️ Centro de seguridad</span>
          <h1>Emergencias</h1>
          <p>Tu respaldo inmediato mientras exploras Santander, Colombia.</p>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <strong>123</strong>
            <span>Urgencias</span>
          </div>
          <div class="stat">
            <strong>112</strong>
            <span>Policia</span>
          </div>
          <div class="stat">
            <strong>24/7</strong>
            <span>Disponible</span>
          </div>
        </div>
      </header>

      <!-- PANICO -->
      <section class="block panic-block">
        <button type="button" class="panic-btn" @click="callEmergency">
          <span class="panic-pulse" aria-hidden="true" />
          <span class="panic-icon">🚨</span>
          <span class="panic-text">
            <strong>Emergencia inmediata</strong>
            <small>Llamar al 123 · Una pulsacion</small>
          </span>
        </button>
        <p class="panic-hint">Usa este boton solo si necesitas ayuda urgente ahora mismo.</p>
      </section>

      <!-- ACCIONES RAPIDAS -->
      <section class="quick-actions">
        <a href="tel:123" class="qa qa-call">
          🚑<span>123</span>
        </a>
        <a href="tel:112" class="qa qa-call">
          🚓<span>112</span>
        </a>
        <a href="tel:119" class="qa qa-call">
          🔥<span>119</span>
        </a>
        <button type="button" class="qa" @click="scrollToLocation">
          📍<span>Ubicacion</span>
        </button>
      </section>

      <!-- SERVICIOS -->
      <section class="block">
        <div class="block-head">
          <h2>Servicios de emergencia</h2>
          <p class="block-sub">Toca una tarjeta para llamar directamente</p>
        </div>

        <div class="service-grid">
          <a
            v-for="svc in emergencyServices"
            :key="svc.tel"
            :href="'tel:' + svc.tel"
            class="service-card"
            :class="svc.tone"
          >
            <span class="service-icon">{{ svc.icon }}</span>
            <div class="service-body">
              <strong>{{ svc.title }}</strong>
              <span class="service-sub">{{ svc.sub }}</span>
              <span class="service-tel">Llamar {{ svc.tel }} →</span>
            </div>
          </a>
        </div>
      </section>

      <!-- UBICACION -->
      <section ref="locationBlock" class="block location-block">
        <div class="block-head">
          <h2>Tu ubicacion</h2>
          <p class="block-sub">
            Comparte donde estas con un familiar o con el servicio de emergencia.
          </p>
        </div>

        <article class="content-card location-card">
          <div v-if="lastCoords" class="coords-box">
            <span class="coords-label">Ultima ubicacion obtenida</span>
            <code>{{ coordsText }}</code>
          </div>

          <p v-if="locationError" class="location-error">{{ locationError }}</p>

          <div class="location-actions">
            <button
              type="button"
              class="btn primary"
              :disabled="locationLoading"
              @click="shareLocation"
            >
              {{ locationLoading ? 'Obteniendo ubicacion…' : 'Compartir ubicacion' }}
            </button>
            <button type="button" class="btn outline" @click="openHospitals">
              Ver hospitales cercanos
            </button>
          </div>
        </article>
      </section>

      <!-- CONSEJOS -->
      <section class="block">
        <div class="block-head">
          <h2>Consejos de seguridad</h2>
          <p class="block-sub">Pequenas acciones que marcan la diferencia</p>
        </div>

        <div class="tips-grid">
          <article v-for="tip in previewTips" :key="tip.id" class="tip-card">
            <span class="tip-icon">{{ tip.icon }}</span>
            <h3>{{ tip.title }}</h3>
            <p>{{ tip.text }}</p>
          </article>
        </div>

        <button type="button" class="btn-more-tips" @click="goToSafetyTips">
          Ver todos los consejos ({{ totalTipsCount }})
        </button>
      </section>

      <!-- NOTA -->
      <section class="final-note">
        <span class="note-icon">ℹ️</span>
        <p>
          Este centro esta pensado para ayudarte a actuar rapido y con calma.
          No reemplaza el criterio de autoridades locales ni servicios oficiales.
        </p>
      </section>

      <section class="final-cta">
        <h2>¿Todo bien por ahora?</h2>
        <p>Sigue explorando con tranquilidad y guarda tus destinos favoritos.</p>
        <button type="button" class="btn-cta" @click="goToExplore">
          Volver a explorar
        </button>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import { AppRoute } from '@/router/links.js'
import {
  safetyTips,
  SAFETY_TIPS_PREVIEW_COUNT,
} from '@/data/safetyTips.js'

defineOptions({ name: 'EmergenciesPage' })

const router = useRouter()
const locationBlock = ref(null)
const locationLoading = ref(false)
const locationError = ref('')
const lastCoords = ref(null)

const emergencyServices = [
  {
    icon: '🚑',
    title: 'Emergencias medicas',
    sub: 'Ambulancia y urgencias',
    tel: '123',
    tone: 'red',
  },
  {
    icon: '🚓',
    title: 'Policia Nacional',
    sub: 'Seguridad y reportes',
    tel: '112',
    tone: 'blue',
  },
  {
    icon: '🔥',
    title: 'Bomberos',
    sub: 'Incendios y rescate',
    tel: '119',
    tone: 'orange',
  },
]

const previewTips = computed(() =>
  safetyTips.slice(0, SAFETY_TIPS_PREVIEW_COUNT),
)

const totalTipsCount = safetyTips.length

const coordsText = computed(() => {
  if (!lastCoords.value) return ''
  const { lat, lng } = lastCoords.value
  return lat.toFixed(5) + ', ' + lng.toFixed(5)
})

const goBack = () => router.back()
const goToExplore = () => router.push(AppRoute.explorar())
const goToSafetyTips = () => router.push(AppRoute.consejosSeguridad())

const callEmergency = () => {
  window.location.href = 'tel:123'
}

const openHospitals = () => {
  const q = lastCoords.value
    ? `${lastCoords.value.lat},${lastCoords.value.lng}`
    : 'hospital+cercano+San+Gil+Santander'
  window.open('https://www.google.com/maps/search/hospital+near+' + encodeURIComponent(q))
}

const scrollToLocation = () => {
  locationBlock.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const shareLocation = () => {
  if (!navigator.geolocation) {
    locationError.value = 'La geolocalizacion no esta disponible en este dispositivo.'
    return
  }

  locationLoading.value = true
  locationError.value = ''

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locationLoading.value = false
      const { latitude, longitude } = pos.coords
      lastCoords.value = { lat: latitude, lng: longitude }
      const url = 'https://maps.google.com/?q=' + latitude + ',' + longitude

      if (navigator.share) {
        navigator
          .share({
            title: 'Mi ubicacion actual',
            text: 'Estoy aqui (Santander, Colombia):',
            url,
          })
          .catch(() => window.open(url))
      } else {
        window.open(url)
      }
    },
    () => {
      locationLoading.value = false
      locationError.value =
        'No pudimos obtener tu ubicacion. Activa el GPS y los permisos del navegador.'
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
  )
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  overflow-x: hidden;
  padding-bottom: calc(110px + env(safe-area-inset-bottom, 0px));
  background: #f4f4f5;
}

.emergencies-shell {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* HERO */
.hero {
  padding: 24px 20px 28px;
  background: linear-gradient(165deg, #1a0505 0%, #5c1010 45%, #1a1a2e 100%);
  color: white;
  border-radius: 0 0 28px 28px;
  position: relative;
}

.hero-text {
  margin-top: 14px;
}

.hero-badge {
  font-size: 13px;
  opacity: 0.9;
}

.hero-text h1 {
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  margin: 8px 0 6px;
  line-height: 1.12;
}

.hero-text p {
  margin: 0;
  opacity: 0.88;
  font-size: clamp(0.9rem, 2vw, 1.05rem);
  max-width: 36ch;
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

/* PANICO */
.block {
  margin: 20px 16px 0;
}

.panic-block {
  margin-top: -8px;
  position: relative;
  z-index: 2;
}

.panic-btn {
  position: relative;
  width: 100%;
  border: none;
  border-radius: 22px;
  padding: 20px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #e53935, #b71c1c);
  box-shadow: 0 16px 40px rgba(183, 28, 28, 0.45);
  overflow: hidden;
  transition: transform 0.15s ease;
}

.panic-btn:active {
  transform: scale(0.98);
}

.panic-pulse {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.25), transparent 60%);
  animation: panicGlow 2s ease-in-out infinite;
}

@keyframes panicGlow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.panic-icon {
  position: relative;
  z-index: 1;
  font-size: 36px;
  flex-shrink: 0;
}

.panic-text {
  position: relative;
  z-index: 1;
  text-align: left;
}

.panic-text strong {
  display: block;
  font-size: 1.15rem;
}

.panic-text small {
  display: block;
  margin-top: 4px;
  font-size: 0.85rem;
  opacity: 0.92;
}

.panic-hint {
  margin: 10px 4px 0;
  font-size: 0.82rem;
  color: #666;
  text-align: center;
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
  font-size: 20px;
  text-decoration: none;
  color: inherit;
}

.qa-call:hover {
  background: #fff5f5;
}

.qa span {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.85;
}

/* BLOCK HEAD */
.block-head {
  margin-bottom: 14px;
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

/* SERVICIOS */
.service-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  background: #fff;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-left: 5px solid #ccc;
}

.service-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
}

.service-card.red { border-left-color: #e53935; }
.service-card.blue { border-left-color: #1e88e5; }
.service-card.orange { border-left-color: #fb8c00; }

.service-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.service-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.service-body strong {
  font-size: 1rem;
}

.service-sub {
  font-size: 0.85rem;
  color: #666;
}

.service-tel {
  margin-top: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #111;
}

/* UBICACION */
.content-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px 16px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
}

.coords-box {
  margin-bottom: 14px;
  padding: 12px;
  background: #f4f4f5;
  border-radius: 12px;
}

.coords-label {
  display: block;
  font-size: 11px;
  color: #666;
  margin-bottom: 6px;
}

.coords-box code {
  font-size: 0.88rem;
  word-break: break-all;
}

.location-error {
  margin: 0 0 12px;
  font-size: 0.88rem;
  color: #c62828;
  line-height: 1.4;
}

.location-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 14px 18px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.btn.primary {
  background: #111;
  color: #fff;
}

.btn.outline {
  background: transparent;
  color: #111;
  border: 1px solid #ddd;
}

/* TIPS */
.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.tip-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
}

.tip-icon {
  font-size: 24px;
}

.tip-card h3 {
  margin: 8px 0 4px;
  font-size: 0.92rem;
}

.tip-card p {
  margin: 0;
  font-size: 0.8rem;
  color: #555;
  line-height: 1.45;
}

.btn-more-tips {
  width: 100%;
  margin-top: 14px;
  border: none;
  background: #111;
  color: #fff;
  padding: 14px 18px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

/* NOTA */
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

/* CTA */
.final-cta {
  margin: 20px 16px 0;
  padding: 28px 22px;
  border-radius: 22px;
  text-align: center;
  color: #fff;
  background: linear-gradient(165deg, #0a0a0a 0%, #3a1515 50%, #16213e 100%);
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
  .service-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .service-card {
    flex-direction: column;
    text-align: center;
    border-left: none;
    border-top: 5px solid #ccc;
  }

  .service-card.red { border-top-color: #e53935; border-left: none; }
  .service-card.blue { border-top-color: #1e88e5; border-left: none; }
  .service-card.orange { border-top-color: #fb8c00; border-left: none; }

  .tips-grid {
    grid-template-columns: repeat(4, 1fr);
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
  .final-cta,
  .panic-block {
    margin-left: 32px;
    margin-right: 32px;
  }
}

@media (max-width: 400px) {
  .tips-grid {
    grid-template-columns: 1fr;
  }
}
</style>
