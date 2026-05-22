<template>
  <button
    type="button"
    class="back-btn"
    :class="{ floating }"
    aria-label="Volver"
    @click="$emit('click')"
  >
    <span class="back-icon" aria-hidden="true">←</span>
    <span class="back-label">Volver</span>
  </button>
</template>

<script setup>
defineProps({
  /** Posicion fija sobre heroes con imagen (detalle) */
  floating: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  min-height: 44px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #111;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
  line-height: 1;
  flex-shrink: 0;
}

.back-btn:active {
  transform: scale(0.98);
}

.back-icon {
  font-size: 16px;
  line-height: 1;
}

.back-label {
  letter-spacing: 0.01em;
}

.back-btn.floating {
  position: absolute;
  top: max(16px, env(safe-area-inset-top, 0px));
  left: 16px;
  z-index: 20;
}
</style>
