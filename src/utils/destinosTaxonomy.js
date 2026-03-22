import { normalizeForSearch } from '@/utils/text'

// Canonical labels used in UI
const CANON = {
  difficulty: {
    facil: 'Fácil',
    'fácil': 'Fácil',
    easy: 'Fácil',
    medio: 'Media',
    media: 'Media',
    intermedio: 'Media',
    moderado: 'Media',
    moderada: 'Media',
    dificil: 'Difícil',
    'difícil': 'Difícil',
    hard: 'Difícil'
  },
  mood: {
    aventura: 'Aventura',
    romantico: 'Romántico',
    'romántico': 'Romántico',
    relax: 'Relax',
    familiar: 'Familiar',
    cultura: 'Cultural'
  },
  category: {
    gastronomia: 'Gastronomía',
    'gastronomía': 'Gastronomía',
    comida: 'Gastronomía',
    food: 'Gastronomía',
    naturaleza: 'Naturaleza',
    nature: 'Naturaleza',
    aventura: 'Aventura',
    culture: 'Cultura',
    cultura: 'Cultura',
    familiar: 'Familiar',
    historia: 'Historia'
  }
}

const titleCase = (s) => {
  const str = String(s ?? '').trim()
  if (!str) return ''
  return str
    .split(/\s+/)
    .map(w => w ? (w[0].toUpperCase() + w.slice(1).toLowerCase()) : '')
    .join(' ')
}

export const canonicalizeDifficulty = (difficulty) => {
  if (!difficulty) return null
  const key = normalizeForSearch(difficulty)
  return CANON.difficulty[key] || titleCase(difficulty)
}

export const canonicalizeMood = (mood) => {
  if (!mood) return null
  const key = normalizeForSearch(mood)
  return CANON.mood[key] || titleCase(mood)
}

export const canonicalizeCategory = (category) => {
  if (!category) return null
  const key = normalizeForSearch(category)
  return CANON.category[key] || titleCase(category)
}

const uniq = (arr) => {
  const out = []
  const seen = new Set()
  for (const it of arr) {
    const v = String(it ?? '').trim()
    if (!v) continue
    const k = normalizeForSearch(v)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(it)
  }
  return out
}

export const normalizeDestino = (dest) => {
  if (!dest || typeof dest !== 'object') return dest

  const categories = Array.isArray(dest.categories) ? dest.categories : []
  const mood = Array.isArray(dest.mood) ? dest.mood : []

  const categoriesCanon = uniq(categories.map(canonicalizeCategory).filter(Boolean))
  const moodCanon = uniq(mood.map(canonicalizeMood).filter(Boolean))
  const difficultyCanon = canonicalizeDifficulty(dest.difficulty)

  // Keep originals, add canonical fields used for filtering / display
  return {
    ...dest,
    categoriesCanon,
    moodCanon,
    difficultyCanon
  }
}
