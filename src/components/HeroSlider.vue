<template>
  <section class="hero">
    <div class="hero-slider">

      <!-- BOTÓN IZQUIERDO -->
      <button
        class="nav prev"
        @click="prevSlide"
        :disabled="currentIndex === 0"
      >
        ‹
      </button>

      <!-- SLIDES -->
      <div
        class="hero-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(slide, i) in props.slides"
          :key="i"
          class="hero-item"
          :style="{ backgroundImage: `url(${slide.image})` }"
        >
          <div class="overlay"></div>
          <h2>{{ slide.title }}</h2>
        </div>
      </div>

      <!-- BOTÓN DERECHO -->
      <button
        class="nav next"
        @click="nextSlide"
        :disabled="currentIndex === props.slides.length - 1"
      >
        ›
      </button>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  slides: {
    type: Array,
    required: true
  }
})

const currentIndex = ref(0)

const nextSlide = () => {
  if (currentIndex.value < props.slides.length - 1) {
    currentIndex.value++
  }
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}
</script>

<style scoped>
.hero {
  margin-bottom: 20px;
}

.hero-slider {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
}

.hero-track {
  display: flex;
  transition: transform 0.4s ease;
}

.hero-item {
  flex: 0 0 100%;
  height: 400px; /* más grande */
  background-size: contain; /* muestra la imagen completa */
  background-position: center;
  background-repeat: no-repeat; /* evita duplicados */
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 16px;
  color: white;
}

.hero-item h2 {
  z-index: 2;
  font-size: 24px;
  margin-bottom: 20px; /* separa del borde inferior */
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0.05));
}

/* BOTONES */
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 5;
}

.nav.prev {
  left: 10px;
}

.nav.next {
  right: 10px;
}

.nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>