<template>
  <div class="page" v-if="destination">
    <!-- HEADER -->
    <div class="header">
      <button class="back" @click="goBack">← Volver</button>
    </div>

    <!-- ❤️ FAVORITO -->
    <button
      class="favorite"
      @click="toggleFavorite(destination)"
    >
      {{ isFav ? '❤️' : '🤍' }}
    </button>

    <!-- HERO IMAGE -->
    <img
      :src="destination.image"
      :alt="destination.name"
      class="hero-img"
    />

    <!-- INFO -->
    <h1 class="title">{{ destination.name }}</h1>

    <!-- CATEGORIES -->
    <div class="tags">
      <span v-for="tag in destination.categories" :key="tag" class="tag">
        {{ tag }}
      </span>
    </div>

    <!-- DESCRIPTION -->
    <p class="description">
      {{ destination.description }}
    </p>

    <!-- EXTRA INFO -->
    <section class="info">
      <div><strong>📍 Ubicación:</strong> {{ destination.location }}</div>
      <div><strong>🌤️ Clima:</strong> {{ destination.weather }}</div>
      <div><strong>🎯 Actividades:</strong> {{ destination.activities }}</div>
    </section>
  </div>

  <div v-else class="page">
    <p>Destino no encontrado</p>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { destinations } from '@/data/destinations'
import { useFavorites } from '@/composables/useFavorites'

const route = useRoute()
const router = useRouter()

const { toggleFavorite, isFavorite } = useFavorites()

const destination = computed(() =>
  destinations.find(d => d.id === route.params.id)
)

// ✅ NUEVO — estado reactivo correcto
const isFav = computed(() =>
  destination.value
    ? isFavorite(destination.value.id)
    : false
)

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.page {
  padding: 16px;
  padding-bottom: 80px;
}

.header {
  margin-bottom: 12px;
}

.back {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.hero-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  margin-bottom: 8px;
}

.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  background: #f2f2f2;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.description {
  margin-bottom: 16px;
  line-height: 1.5;
}

.info div {
  margin-bottom: 8px;
}

.favorite {
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border: none;
  border-radius: 50%;
  padding: 10px;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,.25);
}

.favorite.active {
  background: #ffeded;
  transform: scale(1.1);
}

.page {
  position: relative;
}
</style>