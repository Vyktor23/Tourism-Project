<template>
  <div class="page">
    <div class="notfound-shell">
      <section class="hero">
        <BackButton floating @click="goBack" />

        <div class="hero-visual" aria-hidden="true">
          <span class="code-bg">404</span>
          <span class="compass">🧭</span>
        </div>

        <div class="hero-content">
          <h1>Pagina no encontrada</h1>
          <p>La ruta que buscas no existe. Vuelve al inicio y sigue explorando Santander.</p>
        </div>

        <button type="button" class="btn-home" @click="go(AppRoute.inicio())">
          Volver al inicio
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import { AppRoute } from '@/router/links.js'

defineOptions({ name: 'NotFoundPage' })

const router = useRouter()
const go = (routeLocation) => router.push(routeLocation)
const goBack = () => router.back()
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
  background: #f4f4f5;
}

.notfound-shell {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 24px 48px;
  margin: 16px;
  border-radius: 28px;
  color: #fff;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a1a2e 50%, #2d2a4a 100%);
  position: relative;
}

.hero-visual {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.code-bg {
  position: absolute;
  font-size: clamp(6rem, 28vw, 9rem);
  font-weight: 800;
  line-height: 1;
  opacity: 0.14;
  letter-spacing: -0.04em;
  user-select: none;
}

.compass {
  position: relative;
  z-index: 1;
  font-size: 64px;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.35));
  animation: compassFloat 4s ease-in-out infinite;
}

@keyframes compassFloat {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50% { transform: translateY(-6px) rotate(6deg); }
}

.hero-content h1 {
  margin: 0 0 10px;
  font-size: clamp(1.35rem, 5vw, 1.85rem);
  line-height: 1.2;
}

.hero-content p {
  margin: 0 auto;
  max-width: 32ch;
  font-size: 0.95rem;
  opacity: 0.88;
  line-height: 1.5;
}

.btn-home {
  margin-top: 28px;
  border: none;
  background: #fff;
  color: #111;
  padding: 14px 32px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.25);
}

.btn-home:active {
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .compass {
    animation: none;
  }
}

@media (min-width: 640px) {
  .hero {
    margin: 24px 32px;
    padding: 48px 40px 56px;
    border-radius: 32px;
  }
}
</style>
