import { useEffect, useState } from 'react'
import { weddingData as defaultWeddingData } from '../data/weddingData.js'

const SETTINGS_KEY = 'rajasthani-wedding-settings'
const PAGES_KEY = 'rajasthani-wedding-pages'
const SETTINGS_EVENT = 'rajasthani-wedding-settings-change'
const PAGES_EVENT = 'rajasthani-wedding-pages-change'

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function readWeddingOverrides() {
  if (typeof window === 'undefined') return {}
  return safeParse(window.localStorage.getItem(SETTINGS_KEY), {}) || {}
}

export function getWeddingData() {
  const overrides = readWeddingOverrides()
  return {
    ...defaultWeddingData,
    ...overrides,
    venue: { ...defaultWeddingData.venue, ...(overrides.venue || {}) },
    events: Array.isArray(overrides.events) ? overrides.events : defaultWeddingData.events,
    story: Array.isArray(overrides.story) ? overrides.story : defaultWeddingData.story,
  }
}

export function useWeddingData() {
  const [data, setData] = useState(() => getWeddingData())
  useEffect(() => {
    const refresh = () => setData(getWeddingData())
    window.addEventListener(SETTINGS_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(SETTINGS_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return data
}

export function saveWeddingSettings(updates) {
  const next = {
    ...readWeddingOverrides(),
    ...updates,
    venue: { ...(readWeddingOverrides().venue || {}), ...(updates.venue || {}) },
  }
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(SETTINGS_EVENT))
  return getWeddingData()
}

export function getCustomPages() {
  if (typeof window === 'undefined') return []
  const pages = safeParse(window.localStorage.getItem(PAGES_KEY), [])
  return Array.isArray(pages) ? pages : []
}

export function useCustomPages() {
  const [pages, setPages] = useState(() => getCustomPages())
  useEffect(() => {
    const refresh = () => setPages(getCustomPages())
    window.addEventListener(PAGES_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(PAGES_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return pages
}

export function saveCustomPages(pages) {
  window.localStorage.setItem(PAGES_KEY, JSON.stringify(pages))
  window.dispatchEvent(new Event(PAGES_EVENT))
  return pages
}

export async function compressImageFile(file, maxSize = 1400, quality = 0.82) {
  if (!file || !file.type?.startsWith('image/')) throw new Error('कृपया JPG, PNG या WebP चित्र चुनें।')
  if (file.size > 12 * 1024 * 1024) throw new Error('चित्र 12 MB से छोटा होना चाहिए।')
  const imageUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('चित्र पढ़ा नहीं जा सका।'))
    reader.readAsDataURL(file)
  })
  const image = await new Promise((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('यह चित्र खोला नहीं जा सका।'))
    element.src = imageUrl
  })
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('चित्र को संपीड़ित नहीं किया जा सका।')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

export function toSlug(value) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 55)
}

export const reservedSlugs = new Set(['admin', 'ganesh', 'events', 'story', 'venue', 'gallery', 'rsvp', 'invite', 'src', 'public'])
