import express from 'express'
import { requireWeddingAdmin, recordAuditLog } from '../auth.js'
import { getDb, saveDb } from '../db.js'

const router = express.Router()

// All wedding admin routes strictly enforce session-derived weddingId
router.use(requireWeddingAdmin)

/**
 * GET /api/wedding-admin/dashboard
 * Loads dashboard exclusively for the session's wedding
 */
router.get('/dashboard', (req, res) => {
  const db = getDb()
  const weddingId = req.weddingId
  const wedding = req.wedding

  // Strictly filter RSVP records by weddingId
  const rsvps = db.rsvps.filter((r) => r.weddingId === weddingId)
  const confirmed = rsvps.filter((r) => r.attendance === 'yes')
  const declined = rsvps.filter((r) => r.attendance === 'no')
  const confirmedAttendees = confirmed.reduce((sum, r) => sum + (Number(r.guests) || 1), 0)

  // Calculate ceremony counts
  const ceremonyCounts = {}
  for (const r of confirmed) {
    if (Array.isArray(r.selectedEvents)) {
      for (const ev of r.selectedEvents) {
        ceremonyCounts[ev] = (ceremonyCounts[ev] || 0) + (Number(r.guests) || 1)
      }
    }
  }

  res.json({
    wedding: {
      id: wedding.id,
      slug: wedding.slug,
      brideName: wedding.brideName,
      groomName: wedding.groomName,
      bridePhoto: wedding.bridePhoto || '',
      groomPhoto: wedding.groomPhoto || '',
      ganeshPhoto: wedding.ganeshPhoto || '',
      ganeshGardenPhoto: wedding.ganeshGardenPhoto || '',
      familyLine: wedding.familyLine,
      blessing: wedding.blessing,
      weddingDate: wedding.weddingDate,
      weddingDateLabel: wedding.weddingDateLabel,
      weddingTimeLabel: wedding.weddingTimeLabel,
      venue: wedding.venue,
      events: wedding.events,
      story: wedding.story,
      customPages: wedding.customPages || [],
      gallery: wedding.gallery || [],
      videos: wedding.videos || [],
      hideGallery: Boolean(wedding.hideGallery),
      hideVideo: Boolean(wedding.hideVideo),
      published: wedding.published,
    },
    stats: {
      totalSubmissions: rsvps.length,
      confirmedAttendees,
      declinedResponses: declined.length,
      confirmedSubmissions: confirmed.length,
      ceremonyCounts,
    },
    rsvps: rsvps.slice().reverse(),
  })
})

/**
 * PUT /api/wedding-admin/settings
 * Allows the family to update couple photos, venue, and custom details
 */
router.put('/settings', (req, res) => {
  const db = getDb()
  const wedding = db.weddings.find((w) => w.id === req.weddingId && !w.archived)
  if (!wedding) {
    return res.status(404).json({ error: 'विवाह प्रोजेक्ट नहीं मिला।' })
  }

  const updates = req.body || {}
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
      wedding[field] = updates[field]
    }
  }

  wedding.updatedAt = new Date().toISOString()
  saveDb()
  recordAuditLog('family_update_settings', { weddingId: req.weddingId })

  res.json({
    success: true,
    wedding,
    message: 'विवाह विवरण सफलतापूर्वक सहेजे गए।',
  })
})

/**
 * GET /api/wedding-admin/rsvps/export
 * Exports authorized wedding's guest list as CSV
 */
router.get('/rsvps/export', (req, res) => {
  const db = getDb()
  const wedding = req.wedding
  const rsvps = db.rsvps.filter((r) => r.weddingId === req.weddingId)

  const headers = ['नाम (Name)', 'फ़ोन (Phone)', 'उपस्थिति (Attendance)', 'अतिथि संख्या (Guests)', 'कार्यक्रम (Events)', 'संदेश (Message)', 'दिनांक व समय (Submitted At)']
  const rows = rsvps.map((r) => [
    `"${(r.name || '').replace(/"/g, '""')}"`,
    `"${(r.phone || '').replace(/"/g, '""')}"`,
    `"${r.attendance === 'yes' ? 'आएँगे (Attending)' : 'नहीं आ पाएँगे (Declined)'}"`,
    r.attendance === 'yes' ? (r.guests || 1) : 0,
    `"${(Array.isArray(r.selectedEvents) ? r.selectedEvents.join(', ') : '').replace(/"/g, '""')}"`,
    `"${(r.message || '').replace(/"/g, '""')}"`,
    `"${new Date(r.submittedAt).toLocaleString('hi-IN')}"`,
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="wedding-rsvp-${wedding.slug}.csv"`)
  res.send(csvContent)
})

export default router
