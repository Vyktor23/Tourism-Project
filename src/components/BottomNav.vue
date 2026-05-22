<template>
  <!-- EMERGENCY FLOATING BUTTON -->
  <RouterLink
    :to="{ name: 'emergencias' }"
    class="emergency-fab"
    title="Emergencias"
  >
    🚨
  </RouterLink>

  <!-- BOTTOM NAV -->
  <nav class="bottom-nav" aria-label="Navegación principal">
    <RouterLink :to="{ name: 'inicio' }" class="nav-item">
      <span class="nav-icon" aria-hidden="true">🏠</span>
      <span class="nav-label">Inicio</span>
    </RouterLink>

    <RouterLink :to="{ name: 'explorar' }" class="nav-item">
      <span class="nav-icon" aria-hidden="true">🧭</span>
      <span class="nav-label">Explorar</span>
    </RouterLink>

    <RouterLink :to="{ name: 'favoritos' }" class="nav-item">
      <span class="nav-icon" aria-hidden="true">
        ❤️
        <span
          v-if="favorites.length"
          class="badge"
        >
          {{ favorites.length > 9 ? '9+' : favorites.length }}
        </span>
      </span>
      <span class="nav-label">Favoritos</span>
    </RouterLink>

    <RouterLink :to="{ name: 'mas' }" class="nav-item">
      <span class="nav-icon" aria-hidden="true">⋯</span>
      <span class="nav-label">Más</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useFavorites } from '@/composables/useFavorites'

const { favorites } = useFavorites()
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1100;

  display: flex;
  align-items: stretch;
  justify-content: space-around;

  min-height: 64px;
  padding: 6px 8px calc(6px + env(safe-area-inset-bottom, 0px));

  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06);
}

.nav-item {
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: 96px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  padding: 4px 2px;
  text-decoration: none;
  color: #666;
  border-radius: 12px;

  transition: color 0.2s ease, background 0.2s ease, transform 0.15s ease;
}

.nav-item:active {
  transform: scale(0.96);
}

.nav-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  line-height: 1;
}

.nav-label {
  font-size: 10px;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
}

.router-link-active {
  color: #111;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.05);
}

.router-link-active .nav-icon {
  transform: scale(1.05);
}

.badge {
  position: absolute;
  top: -5px;
  right: -9px;

  min-width: 17px;
  height: 17px;
  padding: 0 4px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e53935;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  border-radius: 999px;
  border: 2px solid #fff;
  box-sizing: border-box;
}

.emergency-fab {
  position: fixed;
  bottom: calc(76px + env(safe-area-inset-bottom, 0px));
  right: 16px;

  width: 52px;
  height: 52px;

  background: radial-gradient(circle at top, #ff5252, #b71c1c);
  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 22px;
  color: white;
  text-decoration: none;

  box-shadow: 0 12px 28px rgba(183, 28, 28, 0.45);
  z-index: 1101;
  animation: pulse 2.4s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.55);
  }
  70% {
    box-shadow: 0 0 0 16px rgba(211, 47, 47, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(211, 47, 47, 0);
  }
}
</style>
