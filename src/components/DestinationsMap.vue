<template>
  <div class="map-wrapper">
    <div class="map-header">
      🗺️ Destinos en el mapa
      <span class="count" v-if="count">({{ count }})</span>
    </div>

    <div ref="mapEl" class="map"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  destinations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select'])

const mapEl = ref(null)
let map
let markersLayer

const count = computed(() => (Array.isArray(props.destinations) ? props.destinations.length : 0))

const customIcon = L.divIcon({
  className: 'custom-marker',
  html: '📍',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

const buildMarkers = () => {
  if (!map || !markersLayer) return
  markersLayer.clearLayers()

  const items = (props.destinations || []).filter(d => {
    const lat = Number(d?.latitude)
    const lng = Number(d?.longitude)
    return !Number.isNaN(lat) && !Number.isNaN(lng)
  })

  for (const d of items) {
    const lat = Number(d.latitude)
    const lng = Number(d.longitude)

    const m = L.marker([lat, lng], { icon: customIcon })
    const title = String(d?.name || 'Destino')

    m.bindPopup('<strong>' + title + '</strong>') // short, no drama
    m.on('click', () => emit('select', d))
    markersLayer.addLayer(m)
  }

  // Fit bounds si hay varios, sino centramos al primero.
  if (items.length >= 2) {
    const bounds = L.latLngBounds(items.map(d => [Number(d.latitude), Number(d.longitude)]))
    map.fitBounds(bounds.pad(0.2))
  } else if (items.length === 1) {
    map.setView([Number(items[0].latitude), Number(items[0].longitude)], 13)
  }
}

onMounted(() => {
  map = L.map(mapEl.value, {
    zoomControl: false,
    scrollWheelZoom: false
  }).setView([7.1, -73.12], 8)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO'
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)

  buildMarkers()
})

watch(
  () => props.destinations,
  () => buildMarkers(),
  { deep: true }
)

onUnmounted(() => {
  if (map) map.remove()
})
</script>

<style scoped>
.map-wrapper {
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0,0,0,.12);
  background: white;
}

.map-header {
  padding: 12px 16px;
  font-weight: 700;
  font-size: 14px;
  background: linear-gradient(135deg, #000, #333);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count {
  font-weight: 600;
  opacity: .85;
}

.map {
  width: 100%;
  height: 320px;
}

:deep(.custom-marker) {
  font-size: 28px;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,.35));
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 14px;
  padding: 4px;
}

:deep(.leaflet-popup-content) {
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 600px) {
  .map { height: 280px; }
}
</style>
