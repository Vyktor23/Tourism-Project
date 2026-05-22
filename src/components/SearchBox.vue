<template>
  <div class="search-box" :class="{ open: showSuggestions }">
    <span class="icon">🔍</span>

    <input
      ref="inputRef"
      type="search"
      :value="query"
      :placeholder="placeholderText"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      role="combobox"
      :aria-expanded="showSuggestions"
      aria-autocomplete="list"
      @input="onInput"
      @focus="focused = true"
      @blur="onBlur"
      @keydown.down.prevent="moveHighlight(1)"
      @keydown.up.prevent="moveHighlight(-1)"
      @keydown.enter.prevent="pickHighlighted"
      @keydown.escape="closeSuggestions"
    />

    <button
      v-if="query"
      type="button"
      class="clear-btn"
      aria-label="Limpiar búsqueda"
      @click="clearQuery"
    >
      ✕
    </button>

    <ul
      v-if="showSuggestions"
      class="suggestions"
      role="listbox"
    >
      <li
        v-for="(s, i) in suggestions"
        :key="s.key"
        role="option"
        :aria-selected="i === highlightIndex"
      >
        <button
          type="button"
          class="suggestion"
          :class="{ active: i === highlightIndex }"
          @mousedown.prevent="selectSuggestion(s)"
        >
          <span class="suggestion-icon">{{ s.icon }}</span>
          <img
            v-if="s.image"
            :src="s.image"
            :alt="''"
            class="suggestion-img"
          />
          <div class="text">
            <strong>{{ s.title }}</strong>
            <small v-if="s.subtitle">{{ s.subtitle }}</small>
            <small v-if="s.hint" class="hint">{{ s.hint }}</small>
          </div>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { normalizeForSearch } from '@/utils/text'

const props = defineProps({
  modelValue: { type: String, default: '' },
  mode: {
    type: String,
    default: 'destinos',
    validator: (v) => ['destinos', 'municipios'].includes(v),
  },
  destinations: { type: Array, default: () => [] },
  municipios: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  maxSuggestions: { type: Number, default: 8 },
  minChars: { type: Number, default: 1 },
})

const emit = defineEmits(['update:modelValue', 'search', 'select'])

const query = ref(props.modelValue)
const focused = ref(false)
const highlightIndex = ref(-1)
const inputRef = ref(null)

watch(
  () => props.modelValue,
  (v) => {
    if (v !== query.value) query.value = v
  },
)

const placeholderText = computed(() => {
  if (props.placeholder) return props.placeholder
  return props.mode === 'municipios'
    ? 'Buscar municipio o provincia...'
    : 'Buscar destino, municipio o experiencia...'
})

const scoreText = (text, q) => {
  const n = normalizeForSearch(text)
  if (!n || !n.includes(q)) return 0
  if (n.startsWith(q)) return 3
  if (n.split(' ').some((w) => w.startsWith(q))) return 2
  return 1
}

const buildMunicipioSuggestions = (q) => {
  const scored = []

  for (const m of props.municipios) {
    const fields = [
      { text: m?.name, weight: 3 },
      { text: m?.province, weight: 2 },
      { text: m?.departamento, weight: 1 },
      { text: m?.description, weight: 1 },
    ]

    let score = 0
    for (const f of fields) {
      score = Math.max(score, scoreText(f.text, q) * f.weight)
    }

    if (!score) continue

    scored.push({
      key: 'm-' + (m.slug || m.id),
      type: 'municipio',
      item: m,
      icon: '🏘️',
      title: m.name,
      subtitle: m.province || m.departamento || '',
      hint: m.departamento && m.province ? m.departamento : '',
      image: m.image || null,
      score,
    })
  }

  return scored.sort((a, b) => b.score - a.score)
}

const buildDestinoSuggestions = (q) => {
  const scored = []

  for (const d of props.destinations) {
    const cats = (d?.categoriesCanon || d?.categories || []).join(' ')
    const moods = (d?.moodCanon || d?.mood || []).join(' ')

    const fields = [
      { text: d?.name, weight: 3 },
      { text: d?.municipio?.name, weight: 2 },
      { text: d?.municipio?.province, weight: 1 },
      { text: d?.description, weight: 1 },
      { text: cats, weight: 1 },
      { text: moods, weight: 1 },
      { text: d?.difficultyCanon || d?.difficulty, weight: 1 },
    ]

    let score = 0
    for (const f of fields) {
      score = Math.max(score, scoreText(f.text, q) * f.weight)
    }

    if (!score) continue

    scored.push({
      key: 'd-' + (d.slug || d.id),
      type: 'destino',
      item: d,
      icon: '📍',
      title: d.name,
      subtitle: d.municipio?.name || '',
      hint: cats ? cats.split(' ').slice(0, 2).join(' · ') : '',
      image: d.image || null,
      score,
    })
  }

  return scored.sort((a, b) => b.score - a.score)
}

const suggestions = computed(() => {
  const q = normalizeForSearch(query.value)
  if (q.length < props.minChars) return []

  const list =
    props.mode === 'municipios'
      ? buildMunicipioSuggestions(q)
      : buildDestinoSuggestions(q)

  return list.slice(0, props.maxSuggestions)
})

const showSuggestions = computed(
  () => focused.value && suggestions.value.length > 0,
)

const onInput = (e) => {
  query.value = e.target.value
  highlightIndex.value = -1
  emit('update:modelValue', query.value)
  emit('search', query.value)
}

const onBlur = () => {
  window.setTimeout(() => {
    focused.value = false
    highlightIndex.value = -1
  }, 150)
}

const closeSuggestions = () => {
  focused.value = false
  highlightIndex.value = -1
}

const clearQuery = () => {
  query.value = ''
  highlightIndex.value = -1
  emit('update:modelValue', '')
  emit('search', '')
  inputRef.value?.focus()
}

const selectSuggestion = (s) => {
  query.value = s.title
  emit('update:modelValue', s.title)
  emit('search', s.title)
  emit('select', { type: s.type, item: s.item })
  closeSuggestions()
}

const moveHighlight = (delta) => {
  if (!suggestions.value.length) return
  const max = suggestions.value.length - 1
  if (highlightIndex.value < 0) {
    highlightIndex.value = delta > 0 ? 0 : max
    return
  }
  highlightIndex.value = Math.min(max, Math.max(0, highlightIndex.value + delta))
}

const pickHighlighted = () => {
  if (highlightIndex.value >= 0 && suggestions.value[highlightIndex.value]) {
    selectSuggestion(suggestions.value[highlightIndex.value])
  }
}
</script>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  position: relative;
}

.search-box.open {
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

.search-box input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 15px;
  min-width: 0;
}

.icon {
  font-size: 18px;
  flex-shrink: 0;
}

.clear-btn {
  border: none;
  background: #f0f0f0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  flex-shrink: 0;
}

.suggestions {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  margin: 0;
  padding: 6px;
  list-style: none;
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14);
  max-height: min(320px, 50vh);
  overflow-y: auto;
  z-index: 1090;
}

.suggestion {
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  border-radius: 12px;
}

.suggestion:hover,
.suggestion.active {
  background: #f5f5f5;
}

.suggestion-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.suggestion-img {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.text {
  min-width: 0;
  flex: 1;
}

.text strong {
  display: block;
  font-size: 14px;
  line-height: 1.25;
}

.text small {
  display: block;
  color: #666;
  font-size: 12px;
  margin-top: 2px;
}

.text .hint {
  color: #999;
  font-size: 11px;
}
</style>
