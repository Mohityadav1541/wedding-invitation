import express from 'express'
import { getDb, saveDb } from '../db.js'
import { generateId } from '../crypto.js'
import { getActiveSession } from '../auth.js'
import { cleanGoogleMapsInput, extractPalaceAndCityFromMapUrl } from '../../src/lib/weddingVenueOptions.js'

const router = express.Router()

/**
 * GET /api/public/weddings/:slug
 * Retrieves public wedding invitation details by slug.
 * Private credentials, PINs, and guest RSVP lists are strictly excluded.
 */
router.get('/weddings/:slug', (req, res) => {
  const { slug } = req.params
  const db = getDb()
  const wedding = db.weddings.find((w) => w.slug === slug && !w.archived)

  if (!wedding) {
    return res.status(404).json({ error: 'शुभ विवाह आमंत्रण उपलब्ध नहीं है।' })
  }

  // If unpublished, allow viewing only if authenticated photographer is previewing
  if (!wedding.published) {
    const session = getActiveSession(req)
    if (session && session.type === 'photographer') {
      return res.json({
        wedding: sanitizePublicWedding(wedding, true),
      })
    }
    return res.status(404).json({ error: 'यह आमंत्रण अभी प्रकाशित नहीं किया गया है।' })
  }

  res.json({
    wedding: sanitizePublicWedding(wedding, false),
  })
})

export function normalizeWeddingDate(dateStr) {
  if (!dateStr) return ''
  let raw = String(dateStr).trim()
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}:/.test(raw)) {
    raw = raw.replace(/^(\d{4}-\d{2}-\d{2}):/, '$1T18:30:')
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    raw = `${raw}T18:30:00+05:30`
  }
  return raw
}

function sanitizePublicWedding(w, isPreview = false) {
  return {
    id: w.id,
    slug: w.slug,
    brideName: w.brideName,
    groomName: w.groomName,
    bridePhoto: w.bridePhoto || '',
    bridePhotoFocalMobile: w.bridePhotoFocalMobile || '50% 18%',
    bridePhotoFocalDesktop: w.bridePhotoFocalDesktop || '50% 18%',
    groomPhoto: w.groomPhoto || '',
    groomPhotoFocalMobile: w.groomPhotoFocalMobile || '50% 16%',
    groomPhotoFocalDesktop: w.groomPhotoFocalDesktop || '50% 16%',
    ganeshPhoto: w.ganeshPhoto || '',
    ganeshGardenPhoto: w.ganeshGardenPhoto || '',
    ganeshPhotoFocal: w.ganeshPhotoFocal || '50% 25%',
    familyLine: w.familyLine,
    blessing: w.blessing,
    weddingDate: normalizeWeddingDate(w.weddingDate),
    weddingDateLabel: w.weddingDateLabel,
    weddingTimeLabel: w.weddingTimeLabel,
    venue: w.venue || {},
    events: w.events || [],
    story: w.story || [],
    gallery: w.gallery || [],
    videos: w.videos || [],
    hideGallery: Boolean(w.hideGallery),
    hideVideo: Boolean(w.hideVideo),
    customPages: (w.customPages || []).filter((p) => p.showInNav !== false || true),
    published: w.published,
    isPreview,
  }
}

/**
 * POST /api/public/weddings/:slug/rsvp
 * Public RSVP submission. Server-validated, scoped to wedding, rate-limited and duplicate-safe.
 */
router.post('/weddings/:slug/rsvp', async (req, res) => {
  const { slug } = req.params
  const db = getDb()
  const wedding = db.weddings.find((w) => w.slug === slug && !w.archived)

  if (!wedding || !wedding.published) {
    return res.status(404).json({ error: 'यह विवाह आमंत्रण उत्तर स्वीकार नहीं कर रहा है।' })
  }

  const {
    name = '',
    phone = '',
    attendance = 'yes',
    guests = 1,
    selectedEvents = [],
    message = '',
  } = req.body || {}

  // Server-side input validation
  const cleanName = String(name).trim().slice(0, 100)
  const cleanPhone = String(phone).trim().slice(0, 25)
  const cleanMessage = String(message).trim().slice(0, 500)
  const isAttending = attendance === 'yes'
  const guestCount = isAttending ? Math.max(1, Math.min(20, Number(guests) || 1)) : 0

  if (!cleanName) {
    return res.status(400).json({ error: 'कृपया अपना नाम दर्ज करें।' })
  }

  const now = new Date().toISOString()

  // Prevent duplicate double-counting by phone number within the same wedding
  const existingIndex = cleanPhone
    ? db.rsvps.findIndex((r) => r.weddingId === wedding.id && r.phone === cleanPhone)
    : -1

  let rsvpId
  if (existingIndex >= 0) {
    // Update existing response
    rsvpId = db.rsvps[existingIndex].id
    db.rsvps[existingIndex] = {
      ...db.rsvps[existingIndex],
      name: cleanName,
      attendance: isAttending ? 'yes' : 'no',
      guests: guestCount,
      selectedEvents: Array.isArray(selectedEvents) ? selectedEvents : [],
      message: cleanMessage,
      updatedAt: now,
    }
  } else {
    // Create new record
    rsvpId = generateId()
    db.rsvps.push({
      id: rsvpId,
      weddingId: wedding.id,
      name: cleanName,
      phone: cleanPhone,
      attendance: isAttending ? 'yes' : 'no',
      guests: guestCount,
      selectedEvents: Array.isArray(selectedEvents) ? selectedEvents : [],
      message: cleanMessage,
      submittedAt: now,
      updatedAt: now,
    })
  }

  await saveDb()

  res.status(201).json({
    success: true,
    message: isAttending
      ? 'आपका उत्तर एवं शुभकामनाएँ सफलतापूर्वक दर्ज कर ली गई हैं। हम आपके आगमन की प्रतीक्षा करेंगे!'
      : 'आपका संदेश सफलतापूर्वक दर्ज कर लिया गया है। धन्यवाद!',
    id: rsvpId,
  })
})

/**
 * POST /api/public/resolve-map
 * Resolves short links, iframes, and mobile share texts to direct Google Maps URLs,
 * and extracts palace name, city, and address.
 */
router.post('/resolve-map', async (req, res) => {
  const { url = '' } = req.body || {}
  const cleaned = cleanGoogleMapsInput(url)
  if (!cleaned) {
    return res.status(400).json({ error: 'मान्य Google Maps लिंक प्रदान करें।' })
  }

  let finalUrl = cleaned
  let pageTitle = ''

  // If short URL (maps.app.goo.gl, goo.gl/maps), expand via redirect
  if (/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(cleaned)) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)
      const fetchRes = await fetch(cleaned, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'hi,en;q=0.9',
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      finalUrl = fetchRes.url || cleaned
      const html = await fetchRes.text().catch(() => '')
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
      if (titleMatch && titleMatch[1]) {
        pageTitle = titleMatch[1].replace(/\s*[-–—]\s*Google Maps/i, '').trim()
      }
    } catch {
      // If network unreachable or timeout, fallback to local parsing
    }
  }

  const parsed = extractPalaceAndCityFromMapUrl(finalUrl)

  // If page title is present and parsed lacks name
  if (!parsed.name && pageTitle && !pageTitle.toLowerCase().includes('google maps')) {
    const titleParts = pageTitle.split(',').map((s) => s.trim()).filter(Boolean)
    parsed.name = titleParts[0] || ''
    if (titleParts.length > 1 && !parsed.city) {
      parsed.city = titleParts.slice(1).join(', ')
    }
    parsed.hasDetails = Boolean(parsed.name || parsed.city)
  }

  res.json({
    success: true,
    cleanUrl: cleaned,
    resolvedUrl: finalUrl,
    name: parsed.name || '',
    city: parsed.city || '',
    address: parsed.address || '',
    hasDetails: parsed.hasDetails || false,
    isShortUrl: parsed.isShortUrl || false,
  })
})

export default router
