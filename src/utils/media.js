/** Detecta URLs de video soportadas (YouTube, Vimeo, archivo directo). */
export function isVideoUrl(url) {
  if (!url || typeof url !== 'string') return false
  const u = url.trim().toLowerCase()
  return (
    /youtube\.com|youtu\.be/.test(u) ||
    /vimeo\.com/.test(u) ||
    /\.(mp4|webm|ogg)(\?|$)/i.test(u)
  )
}

/** Convierte URL de video a URL embebible (iframe). */
export function toEmbedUrl(url) {
  if (!url) return null
  const raw = String(url).trim()

  const ytShort = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`

  const ytWatch = raw.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`

  const ytEmbed = raw.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/)
  if (ytEmbed) return `https://www.youtube.com/embed/${ytEmbed[1]}`

  const vimeo = raw.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(raw)) return raw

  return null
}

/** Extrae URLs de video desde contacto jsonb u otros campos opcionales. */
export function extractVideoUrls(...sources) {
  const out = []
  const push = (v) => {
    if (!v) return
    const s = String(v).trim()
    if (s && isVideoUrl(s) && !out.includes(s)) out.push(s)
  }

  for (const src of sources) {
    if (!src) continue
    if (typeof src === 'string') {
      push(src)
      continue
    }
    if (typeof src !== 'object') continue

    push(src.video)
    push(src.video_url)
    if (Array.isArray(src.videos)) src.videos.forEach(push)
    if (Array.isArray(src.media)) {
      for (const m of src.media) {
        if (m?.type === 'video') push(m.url)
        else push(m)
      }
    }
  }

  return out
}

/** Lista única de imágenes válidas. */
export function uniqueImages(...sources) {
  const out = []
  const push = (v) => {
    if (!v) return
    const s = String(v).trim()
    if (s && !isVideoUrl(s) && !out.includes(s)) out.push(s)
  }

  for (const src of sources) {
    if (!src) continue
    if (typeof src === 'string') {
      push(src)
      continue
    }
    if (Array.isArray(src)) {
      src.forEach(push)
      continue
    }
    if (typeof src === 'object') {
      push(src.image)
      push(src.image_url)
      push(src.imagen)
      if (Array.isArray(src.gallery)) src.gallery.forEach(push)
      if (Array.isArray(src.images)) src.images.forEach(push)
    }
  }

  return out
}
