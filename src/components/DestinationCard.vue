<template>
  <article :class="['destination-card', variant]" @click="onSelect">
    <div class="image-wrapper">
      <img :src="imageSrc" :alt="destination.name" />

      <!-- ❤️ FAVORITO SIEMPRE -->
      <FavoriteButton :destination="destination" @click.stop />

      <span v-if="primaryCategory" class="category">
        {{ primaryCategory }}
      </span>

      <span v-if="destination.trending" class="badge badge-trend-left">🔥</span>
    </div>

    <div class="info">
      <h3 class="title">{{ destination.name }}</h3>
      <p v-if="municipioName" class="location">📍 {{ municipioName }}</p>

      <div class="meta">
        <span v-if="ratingText" class="pill">⭐ {{ ratingText }}</span>
        <span v-if="difficultyText" class="pill">🧗 {{ difficultyText }}</span>
      </div>

      <div v-if="extraCats.length" class="chips">
        <span v-for="c in extraCats" :key="c" class="chip">{{ c }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import FavoriteButton from "@/components/FavoriteButton.vue";

const props = defineProps({
  destination: { type: Object, required: true },
  variant: {
    type: String,
    default: "grid",
  },
});

const emit = defineEmits(["select"]);

const onSelect = () => emit("select", props.destination);

const municipioName = computed(() => props.destination?.municipio?.name || "");

const primaryCategory = computed(() => {
  const cats =
    props.destination?.categoriesCanon || props.destination?.categories || [];
  return cats?.[0] || "";
});

const extraCats = computed(() => {
  const cats =
    props.destination?.categoriesCanon || props.destination?.categories || [];
  return Array.isArray(cats) ? cats.slice(1, 3) : [];
});

const difficultyText = computed(
  () =>
    props.destination?.difficultyCanon || props.destination?.difficulty || "",
);

const ratingText = computed(() => {
  const r = props.destination?.rating;
  if (r === null || r === undefined || Number.isNaN(Number(r))) return "";
  return Number(r).toFixed(1);
});

const imageSrc = computed(() => {
  // Si no hay imagen, evita romper el layout sin depender de servicios externos.
  const svgLines = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">',
    '<rect width="100%" height="100%" fill="#111"/>',
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="28" font-family="sans-serif">',
    "Sin imagen",
    "</text>",
    "</svg>",
  ].join("");

  const uri = "data:image/svg+xml," + encodeURIComponent(svgLines);
  return props.destination?.image || uri;
});
</script>

<style scoped>
.destination-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.destination-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.14);
}

/* IMAGE */
.image-wrapper {
  position: relative;
  height: 150px;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* CATEGORY */
.category {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
}

.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.65);
  color: white;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.badge-trend {
  left: auto;
  right: 10px;
}

/* INFO */
.info {
  padding: 12px;
}

.title {
  font-size: 15px;
  margin-bottom: 4px;
}

.location {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px;
}

.meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  font-size: 12px;
  background: #f2f2f2;
  padding: 5px 10px;
  border-radius: 999px;
}

.chips {
  margin-top: 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  font-size: 11px;
  background: #fafafa;
  border: 1px solid #eee;
  padding: 4px 8px;
  border-radius: 999px;
}

/* VARIANTS */
.destination-card.horizontal {
  display: flex;
}

.destination-card.horizontal .image-wrapper {
  width: 140px;
  height: 100%;
}

.destination-card.compact .image-wrapper {
  height: 110px;
}

.badge-trend-left {
  left: 10px;
  right: auto;
}
</style>
