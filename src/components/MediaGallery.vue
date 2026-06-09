<template>
  <section v-if="hasMedia" class="media-gallery">
    <h2 v-if="title">{{ title }}</h2>

    <div v-if="images.length" class="images">
      <button
        v-for="(img, i) in images"
        :key="img"
        type="button"
        class="image-btn"
        @click="openImage(i)"
      >
        <AppImage :src="img" :alt="altPrefix + ' ' + (i + 1)" loading="lazy" />
      </button>
    </div>

    <div v-if="videoEmbeds.length" class="videos">
      <div v-for="(embed, i) in videoEmbeds" :key="embed" class="video-wrap">
        <iframe
          v-if="embed.includes('youtube') || embed.includes('vimeo')"
          :src="embed"
          :title="'Video ' + (i + 1)"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
        <video v-else :src="embed" controls playsinline />
      </div>
    </div>

    <div v-if="showImage" class="lightbox" @click.self="closeImage">
      <AppImage :src="images[activeIndex]" :alt="altPrefix" loading="eager" />
      <button type="button" class="close" @click="closeImage">✕</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uniqueImages, extractVideoUrls, toEmbedUrl } from '@/utils/media'
import AppImage from '@/components/AppImage.vue'

const props = defineProps({
  title: { type: String, default: 'Galería' },
  altPrefix: { type: String, default: 'Imagen' },
  imageSources: { type: Array, default: () => [] },
  videoSources: { type: Array, default: () => [] },
})

const showImage = ref(false)
const activeIndex = ref(0)

const images = computed(() => uniqueImages(...props.imageSources))

const videoEmbeds = computed(() =>
  extractVideoUrls(...props.videoSources)
    .map(toEmbedUrl)
    .filter(Boolean),
)

const hasMedia = computed(() => images.value.length > 0 || videoEmbeds.value.length > 0)

const openImage = (i) => {
  activeIndex.value = i
  showImage.value = true
}

const closeImage = () => {
  showImage.value = false
}
</script>

<style scoped>
.media-gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-gallery h2 {
  margin: 0;
  font-size: 1.1rem;
}

.images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.image-btn {
  border: none;
  padding: 0;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  background: #f3f3f3;
  aspect-ratio: 4 / 3;
}

.image-btn :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.videos {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  overflow: hidden;
  background: #111;
}

.video-wrap iframe,
.video-wrap video {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lightbox :deep(img) {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

.close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: white;
  font-size: 18px;
  cursor: pointer;
}
</style>
