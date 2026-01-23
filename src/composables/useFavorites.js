import { ref, watch } from 'vue'

const favorites = ref(
  JSON.parse(localStorage.getItem('favorites')) || []
)

export function useFavorites() {

  const toggleFavorite = (dest) => {
    const index = favorites.value.findIndex(f => f.id === dest.id)

    if (index === -1) {
      favorites.value.push(dest)
    } else {
      favorites.value.splice(index, 1)
    }
  }

  const isFavorite = (id) => {
    return favorites.value.some(f => f.id === id)
  }

  watch(
    favorites,
    (newVal) => {
      localStorage.setItem('favorites', JSON.stringify(newVal))
    },
    { deep: true }
  )

  return {
    favorites,
    toggleFavorite,
    isFavorite
  }
}