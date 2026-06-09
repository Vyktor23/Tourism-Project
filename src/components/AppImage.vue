<template>
  <img
    v-if="currentSrc"
    :class="imgClass"
    :src="currentSrc"
    :alt="alt"
    :loading="loading"
    referrerpolicy="no-referrer"
    decoding="async"
    @error="onError"
  />
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  /** Una URL o varias (si falla la primera, prueba la siguiente). */
  src: { type: [String, Array], default: '' },
  alt: { type: String, default: '' },
  loading: { type: String, default: 'lazy' },
  fallback: { type: String, default: '' },
  /** Clase en el elemento img (el componente no tiene wrapper). */
  imgClass: { type: [String, Array, Object], default: '' },
})

const imgClass = computed(() => props.imgClass)

const sourceList = computed(() => {
  const raw = Array.isArray(props.src) ? props.src : [props.src]
  return raw.map((s) => String(s || '').trim()).filter(Boolean)
})

const index = ref(0)
const currentSrc = ref('')

const applyIndex = () => {
  const list = sourceList.value
  currentSrc.value = list[index.value] || props.fallback || ''
}

watch(sourceList, () => {
  index.value = 0
  applyIndex()
}, { immediate: true })

const onError = () => {
  if (index.value < sourceList.value.length - 1) {
    index.value += 1
    applyIndex()
    return
  }
  if (props.fallback && currentSrc.value !== props.fallback) {
    currentSrc.value = props.fallback
  }
}
</script>
