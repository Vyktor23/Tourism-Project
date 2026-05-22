import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'tripPlanner'

const defaultTrip = () => ({
  days: [
    { id: 'day-1', label: 'Dia 1', items: [] },
    { id: 'day-2', label: 'Dia 2', items: [] },
    { id: 'day-3', label: 'Dia 3', items: [] },
  ],
})

const loadTrip = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (raw?.days?.length) return raw
  } catch {
    /* ignore */
  }
  return defaultTrip()
}

const trip = ref(loadTrip())

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trip.value))
}

watch(trip, persist, { deep: true })

export function useTripPlanner() {
  const isInTrip = (dest) => {
    const slug = dest?.slug
    if (!slug) return false
    return trip.value.days.some((day) => day.items.some((i) => i.slug === slug))
  }

  const addToDay = (dayId, dest) => {
    if (!dest?.slug || isInTrip(dest)) return
    const day = trip.value.days.find((d) => d.id === dayId)
    if (!day) return
    day.items.push({
      id: dest.id,
      name: dest.name,
      slug: dest.slug,
      image: dest.image,
      municipio: dest.municipio,
    })
  }

  const removeFromDay = (dayId, slug) => {
    const day = trip.value.days.find((d) => d.id === dayId)
    if (!day) return
    day.items = day.items.filter((i) => i.slug !== slug)
  }

  const clearTrip = () => {
    trip.value = defaultTrip()
  }

  const totalItems = computed(() =>
    trip.value.days.reduce((n, day) => n + day.items.length, 0),
  )

  const dayCount = computed(() => trip.value.days.length)

  return {
    trip,
    addToDay,
    removeFromDay,
    isInTrip,
    clearTrip,
    totalItems,
    dayCount,
  }
}
