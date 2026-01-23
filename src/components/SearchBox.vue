<template>
  <div class="search-box">
    <span class="icon">🔍</span>

    <input
      type="text"
      v-model="query"
      placeholder="¿Qué quieres hacer hoy en Santander?"
      @input="emitSearch"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const query = ref('')

const emit = defineEmits(['search'])

const emitSearch = () => {
  emit('search', query.value)
}
</script>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f4f4f4;
  padding: 14px 16px;
  border-radius: 14px;
  margin-bottom: 28px;
}

.search-box input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 16px;
}

.icon {
  font-size: 18px;
}
</style>