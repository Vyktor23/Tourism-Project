import { ref, computed, watch, unref } from 'vue'

/**
 * Paginación local con modo "ver todo".
 * @param {import('vue').MaybeRefOrGetter<Array>} itemsSource
 * @param {number} pageSize
 */
export function usePagination(itemsSource, pageSize = 12) {
  const page = ref(1)
  const showAll = ref(false)

  const items = computed(() => {
    const src = unref(itemsSource)
    return Array.isArray(src) ? src : []
  })

  const total = computed(() => items.value.length)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(total.value / pageSize) || 1),
  )

  const displayItems = computed(() => {
    if (showAll.value) return items.value
    const start = (page.value - 1) * pageSize
    return items.value.slice(start, start + pageSize)
  })

  const rangeFrom = computed(() => {
    if (!total.value) return 0
    if (showAll.value) return 1
    return (page.value - 1) * pageSize + 1
  })

  const rangeTo = computed(() => {
    if (showAll.value) return total.value
    return Math.min(page.value * pageSize, total.value)
  })

  const hasPagination = computed(() => total.value > pageSize)

  const isPagedMode = computed(() => hasPagination.value && !showAll.value)

  watch(items, () => {
    page.value = 1
    showAll.value = false
  })

  watch(totalPages, (max) => {
    if (page.value > max) page.value = max
  })

  const goToPage = (p) => {
    showAll.value = false
    const next = Math.min(Math.max(1, p), totalPages.value)
    page.value = next
  }

  const nextPage = () => {
    if (page.value < totalPages.value) goToPage(page.value + 1)
  }

  const prevPage = () => {
    if (page.value > 1) goToPage(page.value - 1)
  }

  const viewAll = () => {
    showAll.value = true
  }

  const viewPaged = () => {
    showAll.value = false
    page.value = 1
  }

  return {
    page,
    showAll,
    total,
    totalPages,
    displayItems,
    rangeFrom,
    rangeTo,
    hasPagination,
    isPagedMode,
    goToPage,
    nextPage,
    prevPage,
    viewAll,
    viewPaged,
    pageSize,
  }
}
