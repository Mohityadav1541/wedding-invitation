/**
 * Video URL Normalizer & Parser for Wedding Video Player
 * Supports:
 * - YouTube (Standard watch URLs, youtu.be short links, YouTube Shorts, embed URLs)
 * - Google Drive (view, open, uc, preview share links)
 * - Vimeo (standard and player URLs)
 * - Instagram Reels
 * - Direct MP4 / WebM video files (Cloudinary, AWS S3, Supabase, self-hosted)
 * - Iframe embed code pasting
 */

export function cleanVideoInput(input) {
  if (!input || typeof input !== 'string') return ''
  let text = input.trim()

  // 1. If user pasted an <iframe> snippet, extract the src attribute
  const iframeMatch = text.match(/<iframe[^>]+src=["']([^"']+)["']/i)
  if (iframeMatch && iframeMatch[1]) {
    text = iframeMatch[1].trim()
  }

  // 2. Extract first http/https URL if mixed with conversational text
  const urlMatch = text.match(/https?:\/\/[^\s"'<>]+/i)
  if (urlMatch) {
    text = urlMatch[0].trim()
  }

  return text
}

export function parseVideoUrl(input) {
  const cleanUrl = cleanVideoInput(input)
  if (!cleanUrl) {
    return {
      type: 'none',
      id: null,
      cleanUrl: '',
      embedUrl: '',
      isEmbed: false,
      isValid: false,
      platformLabel: '',
      isShorts: false,
      defaultPoster: '',
    }
  }

  // ── A. YouTube ──
  // Matches:
  // - youtube.com/watch?v=ID
  // - youtu.be/ID
  // - youtube.com/shorts/ID
  // - youtube.com/embed/ID
  // - m.youtube.com/watch?v=ID
  const isShorts = /youtube\.com\/shorts\//i.test(cleanUrl)
  const ytMatch = cleanUrl.match(
    /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/|m\.youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/i
  )
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1]
    return {
      type: 'youtube',
      id: videoId,
      cleanUrl,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`,
      isEmbed: true,
      isValid: true,
      isShorts,
      platformLabel: isShorts ? 'YouTube Shorts' : 'YouTube',
      defaultPoster: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      maxresPoster: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    }
  }

  // ── B. Google Drive ──
  // Matches:
  // - drive.google.com/file/d/FILE_ID/view...
  // - drive.google.com/open?id=FILE_ID
  // - drive.google.com/uc?id=FILE_ID
  const gdMatch = cleanUrl.match(
    /drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?.*id=([a-zA-Z0-9_-]+)|uc\?.*id=([a-zA-Z0-9_-]+))/i
  )
  if (gdMatch) {
    const fileId = gdMatch[1] || gdMatch[2] || gdMatch[3]
    return {
      type: 'googledrive',
      id: fileId,
      cleanUrl,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      isEmbed: true,
      isValid: true,
      isShorts: false,
      platformLabel: 'Google Drive',
      defaultPoster: '',
    }
  }

  // ── C. Vimeo ──
  // Matches:
  // - vimeo.com/ID
  // - player.vimeo.com/video/ID
  const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/i)
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1]
    return {
      type: 'vimeo',
      id: videoId,
      cleanUrl,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&playsinline=1`,
      isEmbed: true,
      isValid: true,
      isShorts: false,
      platformLabel: 'Vimeo',
      defaultPoster: '',
    }
  }

  // ── D. Instagram Reel / Post ──
  // Matches:
  // - instagram.com/reel/CODE
  // - instagram.com/p/CODE
  const instaMatch = cleanUrl.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/i)
  if (instaMatch && instaMatch[1]) {
    const code = instaMatch[1]
    return {
      type: 'instagram',
      id: code,
      cleanUrl,
      embedUrl: `https://www.instagram.com/reel/${code}/embed/`,
      isEmbed: true,
      isValid: true,
      isShorts: true,
      platformLabel: 'Instagram Reel',
      defaultPoster: '',
    }
  }

  // ── E. Direct Video File / Media Stream ──
  const isDirectExtension = /\.(mp4|webm|m4v|ogv|mov)(\?.*)?$/i.test(cleanUrl)
  return {
    type: 'direct',
    id: null,
    cleanUrl,
    embedUrl: cleanUrl,
    isEmbed: false,
    isValid: Boolean(cleanUrl.startsWith('http')),
    isShorts: false,
    platformLabel: isDirectExtension ? 'डायरेक्ट MP4' : 'वीडियो लिंक',
    defaultPoster: '',
  }
}
