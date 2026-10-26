import express from 'express'
import { requirePhotographer, recordAuditLog, revokeWeddingSessions } from '../auth.js'
import { getDb, saveDb } from '../db.js'
import { generateId, generateSecurePin, hashPin } from '../crypto.js'
import { normalizeWeddingDate } from './publicRoutes.js'

const router = express.Router()

// All photographer routes require photographer authorization
router.use(requirePhotographer)

function slugify(text) {
  return String(text || '')
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/**
 * GET /api/photographer/weddings
 * List all wedding projects with RSVP metrics
 */
router.get('/weddings', async (req, res) => {
  const db = getDb()
  const activeWeddings = db.weddings.filter((w) => !w.archived)
  let dbChanged = false

  const list = activeWeddings.map((w) => {
    let activeCred = db.credentials.find((c) => c.weddingId === w.id && c.active)
    if (!activeCred || !activeCred.pin) {
      let targetPin = '12345678'
      if (w.id === 'w-amit-neha') targetPin = '87654321'
      else if (w.id === 'w-rohan-kavya') targetPin = '99887766'
      else if (w.id !== 'w-rahul-priya') targetPin = generateSecurePin(8)

      if (activeCred) {
        activeCred.pin = targetPin
      } else {
        const { salt, hash, algorithm } = hashPin(targetPin)
        activeCred = {
          id: generateId(),
          weddingId: w.id,
          pinHash: hash,
          salt,
          algorithm,
          pin: targetPin,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        db.credentials.push(activeCred)
      }
      dbChanged = true
    }

    const weddingRsvps = db.rsvps.filter((r) => r.weddingId === w.id)
    const confirmedRsvps = weddingRsvps.filter((r) => r.attendance === 'yes')
    const totalAttendees = confirmedRsvps.reduce((sum, r) => sum + (Number(r.guests) || 1), 0)
    const declinedRsvps = weddingRsvps.filter((r) => r.attendance === 'no')

    return {
      id: w.id,
      slug: w.slug,
      brideName: w.brideName,
      groomName: w.groomName,
      bridePhoto: w.bridePhoto || '',
      groomPhoto: w.groomPhoto || '',
      weddingDate: w.weddingDate,
      weddingDateLabel: w.weddingDateLabel,
      weddingTimeLabel: w.weddingTimeLabel,
      venueCity: w.venue?.city || '',
      adminPin: activeCred.pin,
      published: Boolean(w.published),
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      stats: {
        totalRsvps: weddingRsvps.length,
        confirmedRsvps: confirmedRsvps.length,
        declinedRsvps: declinedRsvps.length,
        totalAttendees,
      },
    }
  })

  if (dbChanged) {
    await saveDb()
  }

  res.json({ weddings: list })
})

/**
 * GET /api/photographer/stats
 * Aggregated stats across all projects
 */
router.get('/stats', (req, res) => {
  const db = getDb()
  const activeWeddings = db.weddings.filter((w) => !w.archived)
  const publishedCount = activeWeddings.filter((w) => w.published).length

  let totalRsvps = 0
  let totalConfirmedAttendees = 0
  let totalDeclined = 0

  for (const w of activeWeddings) {
    const rsvps = db.rsvps.filter((r) => r.weddingId === w.id)
    totalRsvps += rsvps.length
    for (const r of rsvps) {
      if (r.attendance === 'yes') {
        totalConfirmedAttendees += Number(r.guests) || 1
      } else {
        totalDeclined += 1
      }
    }
  }

  res.json({
    totalWeddings: activeWeddings.length,
    publishedWeddings: publishedCount,
    draftWeddings: activeWeddings.length - publishedCount,
    totalRsvps,
    totalConfirmedAttendees,
    totalDeclined,
  })
})

/**
 * POST /api/photographer/weddings
 * Create a new wedding project and generate a secure 8-digit admin PIN
 */
router.post('/weddings', async (req, res) => {
  const {
    brideName = '',
    groomName = '',
    weddingDate = '',
    weddingDateLabel = '',
    weddingTimeLabel = '',
    venue = {},
    customSlug = '',
    customPin = '',
    adminPin: inputPin = '',
  } = req.body || {}

  if (!brideName.trim() || !groomName.trim()) {
    return res.status(400).json({ error: 'दुल्हन और दूल्हे का नाम अनिवार्य है।' })
  }

  const db = getDb()
  let baseSlug = customSlug ? slugify(customSlug) : slugify(`${groomName}-weds-${brideName}`)
  if (!baseSlug) baseSlug = `wedding-${Date.now().toString().slice(-6)}`

  // Ensure unique slug
  let finalSlug = baseSlug
  let counter = 1
  while (db.weddings.some((w) => w.slug === finalSlug && !w.archived)) {
    finalSlug = `${baseSlug}-${counter}`
    counter += 1
  }

  const weddingId = `w-${generateId()}`
  const now = new Date().toISOString()

  // Use custom PIN if specified, or generate high-entropy 8-digit PIN
  const adminPin = (customPin || inputPin || '').trim() || generateSecurePin(8)
  const { salt, hash, algorithm } = hashPin(adminPin)

  const newWedding = {
    id: weddingId,
    slug: finalSlug,
    brideName: brideName.trim(),
    groomName: groomName.trim(),
    bridePhoto: '',
    groomPhoto: '',
    ganeshPhoto: '',
    ganeshGardenPhoto: '',
    familyLine: `${brideName.trim()} एवं ${groomName.trim()} परिवार का स्नेह आमंत्रण`,
    blessing: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    weddingDate: normalizeWeddingDate(weddingDate),
    weddingDateLabel,
    weddingTimeLabel,
    venue: {
      name: venue.name || '',
      address: venue.address || '',
      city: venue.city || '',
      googleMapsQuery: venue.googleMapsQuery || '',
    },
    events: [
      {
        id: 'mehendi',
        title: 'मेहंदी',
        subtitle: 'रंग, हँसी और शुभ शुरुआत',
        date: '',
        time: '',
        description: 'सखियों की खिलखिलाहट और मेहंदी की खुशबू के बीच उत्सव की पहली शाम।',
        icon: 'flower',
        attire: 'पारंपरिक हरे और पीले रंग',
      },
      {
        id: 'haldi',
        title: 'हल्दी',
        subtitle: 'मंगल रंगों की रस्म',
        date: '',
        time: '',
        description: 'परिवार और प्रियजनों के स्नेह के साथ हल्दी की पावन रस्म।',
        icon: 'sun',
        attire: 'पीले वस्त्र',
      },
      {
        id: 'sangeet',
        title: 'संगीत संध्या',
        subtitle: 'सुर, ताल और खुशियाँ',
        date: '',
        time: '',
        description: 'गीत-संगीत, नृत्य और यादगार पलों से सजी एक खूबसूरत शाम।',
        icon: 'music',
        attire: 'उत्सवी परिधान',
      },
      {
        id: 'wedding',
        title: 'शुभ विवाह',
        subtitle: 'सात वचनों का पावन बंधन',
        date: '',
        time: '',
        description: 'अग्नि, मंत्रों और अपनों के आशीर्वाद के साक्षी बनकर इस मंगल अवसर की शोभा बढ़ाएँ।',
        icon: 'sparkles',
        attire: 'शाही पारंपरिक परिधान',
      },
    ],
    story: [
      { year: 'एक सुंदर शुरुआत', title: 'पहली मुलाक़ात', description: 'यहाँ अपनी पहली मुलाक़ात की कहानी जोड़ें।' },
      { year: 'शुभ विवाह', title: 'सात फेरे', description: 'दो परिवारों का पावन मिलन।' },
    ],
    customPages: [],
    published: false, // Default draft until reviewed
    archived: false,
    createdAt: now,
    updatedAt: now,
  }

  db.weddings.push(newWedding)
  db.credentials.push({
    id: generateId(),
    weddingId,
    pinHash: hash,
    salt,
    algorithm,
    pin: adminPin,
    active: true,
    createdAt: now,
    updatedAt: now,
  })

  await saveDb()
  recordAuditLog('create_wedding', { weddingId, slug: finalSlug })

  res.status(201).json({
    success: true,
    wedding: {
      ...newWedding,
      adminPin,
    },
    adminPin,
    message: 'नया विवाह प्रोजेक्ट सफलतापूर्वक निर्मित हुआ।',
  })
})

/**
 * GET /api/photographer/weddings/:id
 */
router.get('/weddings/:id', (req, res) => {
  const db = getDb()
  const wedding = db.weddings.find((w) => w.id === req.params.id && !w.archived)
  if (!wedding) {
    return res.status(404).json({ error: 'विवाह प्रोजेक्ट नहीं मिला।' })
  }

  const activeCred = db.credentials.find((c) => c.weddingId === wedding.id && c.active)
  const rsvps = db.rsvps.filter((r) => r.weddingId === wedding.id)
  const confirmed = rsvps.filter((r) => r.attendance === 'yes')
  const totalAttendees = confirmed.reduce((sum, r) => sum + (Number(r.guests) || 1), 0)

  res.json({
    wedding: {
      ...wedding,
      adminPin: activeCred?.pin || '',
    },
    adminPin: activeCred?.pin || '',
    stats: {
      totalRsvps: rsvps.length,
      confirmedRsvps: confirmed.length,
      declinedRsvps: rsvps.filter((r) => r.attendance === 'no').length,
      totalAttendees,
    },
    rsvps: rsvps.slice().reverse(),
  })
})

/**
 * PUT /api/photographer/weddings/:id
 */
router.put('/weddings/:id', async (req, res) => {
  const db = getDb()
  const wedding = db.weddings.find((w) => w.id === req.params.id && !w.archived)
  if (!wedding) {
    return res.status(404).json({ error: 'विवाह प्रोजेक्ट नहीं मिला।' })
  }

  const updates = req.body || {}

  // Handle slug change if requested
  if (updates.slug && updates.slug !== wedding.slug) {
    const candidateSlug = slugify(updates.slug)
    if (!candidateSlug) {
      return res.status(400).json({ error: 'अमान्य URL स्लग।' })
    }
    const slugInUse = db.weddings.some((w) => w.slug === candidateSlug && w.id !== wedding.id && !w.archived)
    if (slugInUse) {
      return res.status(400).json({ error: 'यह URL स्लग पहले से उपयोग में है।' })
    }
    wedding.slug = candidateSlug
  }

  // Update allowed fields
  const allowedFields = [
    'brideName', 'groomName', 'bridePhoto', 'groomPhoto', 'ganeshPhoto',
    'ganeshGardenPhoto', 'bridePhotoFocalMobile', 'bridePhotoFocalDesktop',
    'groomPhotoFocalMobile', 'groomPhotoFocalDesktop', 'ganeshPhotoFocal',
    'familyLine', 'blessing', 'weddingDate',
    'weddingDateLabel', 'weddingTimeLabel', 'venue', 'events', 'story', 'customPages',
    'gallery', 'videos', 'hideGallery', 'hideVideo',
  ]

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      wedding[field] = field === 'weddingDate' ? normalizeWeddingDate(updates[field]) : updates[field]
    }
  }

  wedding.updatedAt = new Date().toISOString()
  await saveDb()
  recordAuditLog('update_wedding', { weddingId: wedding.id })

  res.json({ success: true, wedding, message: 'विवाह विवरण सफलतापूर्वक अपडेट हुए।' })
})

/**
 * PATCH /api/photographer/weddings/:id/publish
 */
router.patch('/weddings/:id/publish', async (req, res) => {
  const db = getDb()
  const wedding = db.weddings.find((w) => w.id === req.params.id && !w.archived)
  if (!wedding) {
    return res.status(404).json({ error: 'विवाह प्रोजेक्ट नहीं मिला।' })
  }

  wedding.published = !wedding.published
  wedding.updatedAt = new Date().toISOString()
  await saveDb()
  recordAuditLog('toggle_publish', { weddingId: wedding.id, published: wedding.published })

  res.json({
    success: true,
    published: wedding.published,
    message: wedding.published ? 'आमंत्रण प्रकाशित कर दिया गया है।' : 'आमंत्रण अप्रकाशित (ड्राफ्ट) कर दिया गया है।',
  })
})

/**
 * POST /api/photographer/weddings/:id/reset-pin
 * Sets a custom PIN or generates a new 8-digit PIN without disrupting existing family sessions
 */
router.post('/weddings/:id/reset-pin', async (req, res) => {
  const db = getDb()
  const wedding = db.weddings.find((w) => w.id === req.params.id && !w.archived)
  if (!wedding) {
    return res.status(404).json({ error: 'विवाह प्रोजेक्ट नहीं मिला।' })
  }

  const { customPin = '', adminPin: inputPin = '' } = req.body || {}
  const targetPin = (customPin || inputPin || '').trim() || generateSecurePin(8)
  const { salt, hash, algorithm } = hashPin(targetPin)
  const now = new Date().toISOString()

  // Deactivate old credentials for this wedding
  for (const cred of db.credentials) {
    if (cred.weddingId === wedding.id) {
      cred.active = false
    }
  }

  // Add new active credential with pin stored for photographer visibility
  db.credentials.push({
    id: generateId(),
    weddingId: wedding.id,
    pinHash: hash,
    salt,
    algorithm,
    pin: targetPin,
    active: true,
    createdAt: now,
    updatedAt: now,
  })

  await saveDb()
  recordAuditLog('reset_admin_pin', { weddingId: wedding.id })

  res.json({
    success: true,
    adminPin: targetPin,
    message: 'विवाह व्यवस्थापक पिन सफलतापूर्वक सेट/अपडेट हो गया है।',
  })
})

/**
 * DELETE /api/photographer/weddings/:id
 */
router.delete('/weddings/:id', async (req, res) => {
  const db = getDb()
  const wedding = db.weddings.find((w) => w.id === req.params.id && !w.archived)
  if (!wedding) {
    return res.status(404).json({ error: 'विवाह प्रोजेक्ट नहीं मिला।' })
  }

  wedding.archived = true
  wedding.published = false
  wedding.updatedAt = new Date().toISOString()

  // Invalidate credentials and sessions
  for (const cred of db.credentials) {
    if (cred.weddingId === wedding.id) {
      cred.active = false
    }
  }
  revokeWeddingSessions(wedding.id)

  await saveDb()
  recordAuditLog('archive_wedding', { weddingId: wedding.id })

  res.json({ success: true, message: 'विवाह प्रोजेक्ट सफलतापूर्वक हटा/आर्काइव कर दिया गया।' })
})

export default router
