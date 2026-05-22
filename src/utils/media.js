/** Detecta URLs de video soportadas (YouTube, Vimeo, archivo directo). */
export function isVideoUrl(url) {
  if (!url || typeof url !== 'string') return false
  const u = url.trim().toLowerCase()
  return (
    /youtube\.com|youtu\.be/.test(u) ||
    /vimeo\.com/.test(u) ||
    /\.(mp4|webm|ogg|mov)(\?|$)/i.test(u)
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

  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(raw)) return raw

  return null
}

const urlFromGalleryItem = (item) => {
  if (!item) return null
  if (typeof item === 'string') return item.trim() || null
  if (typeof item === 'object') {
    return (
      item.url ||
      item.src ||
      item.href ||
      item.link ||
      null
    )
  }
  return null
}

const isVideoGalleryItem = (item, url) => {
  if (!url) return false
  if (typeof item === 'object') {
    const type = String(item.type || item.kind || item.media_type || '').toLowerCase()
    if (type === 'video') return true
  }
  return isVideoUrl(url)
}

/** Separa un array gallery en imagenes y videos. */
export function splitGalleryMedia(gallery) {
  const images = []
  const videos = []
  if (!Array.isArray(gallery)) return { images, videos }

  for (const item of gallery) {
    const url = urlFromGalleryItem(item)
    if (!url) continue
    if (isVideoGalleryItem(item, url)) {
      if (!videos.includes(url)) videos.push(url)
    } else if (!images.includes(url)) {
      images.push(url)
    }
  }

  return { images, videos }
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

    if (Array.isArray(src)) {
      const { videos } = splitGalleryMedia(src)
      videos.forEach((v) => push(v))
      continue
    }

    push(src.video)
    push(src.video_url)
    if (Array.isArray(src.videos)) src.videos.forEach(push)
    if (Array.isArray(src.media)) {
      for (const m of src.media) {
        const url = urlFromGalleryItem(m)
        if (url && isVideoGalleryItem(m, url)) push(url)
      }
    }
    if (Array.isArray(src.gallery)) {
      splitGalleryMedia(src.gallery).videos.forEach((v) => push(v))
    }
  }

  return out
}

/** Lista unica de imagenes validas (incluye gallery[] de la BD). */
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
      const { images } = splitGalleryMedia(src)
      images.forEach(push)
      continue
    }
    if (typeof src === 'object') {
      push(src.image)
      push(src.image_url)
      push(src.imagen)
      if (Array.isArray(src.gallery)) {
        splitGalleryMedia(src.gallery).images.forEach(push)
      }
      if (Array.isArray(src.images)) src.images.forEach(push)
    }
  }

  return out
}

/**
 * Arma fuentes de media para MediaGallery y hero.
 * @param {object} entity
 * @param {{ imageFields?: string[], galleryField?: string, videoFields?: any[] }} options
 */
export function buildEntityMedia(entity, options = {}) {
  const imageFields = options.imageFields || ['image', 'image_url', 'imagen']
  const galleryField = options.galleryField || 'gallery'
  const videoFields = options.videoFields || []

  const gallery = entity?.[galleryField]
  const imageSources = [
    ...imageFields.map((f) => entity?.[f]),
    gallery,
  ]
  const videoSources = [...videoFields, gallery]

  const images = uniqueImages(...imageSources)
  const videos = extractVideoUrls(...videoSources)

  return {
    images,
    videos,
    heroImage: images[0] || null,
    imageSources,
    videoSources,
    imageCount: images.length,
    videoCount: videos.length,
    totalCount: images.length + videos.length,
  }
}
