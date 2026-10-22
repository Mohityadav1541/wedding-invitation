import express from 'express'
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  verifyPhotographerPin,
  createSession,
  revokeSession,
  getActiveSession,
  extractToken,
  recordAuditLog,
} from '../auth.js'
import { getDb } from '../db.js'
import { verifyPin } from '../crypto.js'

const router = express.Router()

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
}

const DEFAULT_EXPIRY_DAYS = Number(process.env.SESSION_EXPIRY_DAYS) || 7
const DEFAULT_COOKIE_MAX_AGE_MS = DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000

function setSessionCookie(res, token) {
  res.cookie('wedding_platform_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: DEFAULT_COOKIE_MAX_AGE_MS,
  })
}

/**
 * POST /api/auth/photographer-login
 */
router.post('/photographer-login', (req, res) => {
  const ip = getClientIp(req)
  const rateCheck = checkRateLimit(`photo_${ip}`, 5, 15 * 60 * 1000)
  if (rateCheck.locked) {
    return res.status(429).json({ error: rateCheck.message })
  }

  const { pin } = req.body || {}
  if (!pin || typeof pin !== 'string') {
    recordFailedAttempt(`photo_${ip}`, 5, 15 * 60 * 1000)
    return res.status(400).json({ error: 'कृपया फोटोग्राफर पिन दर्ज करें।' })
  }

  const isValid = verifyPhotographerPin(pin)
  if (!isValid) {
    recordFailedAttempt(`photo_${ip}`, 5, 15 * 60 * 1000)
    return res.status(401).json({ error: 'अमान्य फोटोग्राफर पिन दर्ज किया गया।' })
  }

  resetRateLimit(`photo_${ip}`)
  const session = createSession('photographer', null)
  setSessionCookie(res, session.token)
  recordAuditLog('photographer_login', { ip })

  res.json({
    success: true,
    token: session.token,
    role: 'photographer',
    message: 'फोटोग्राफर पोर्टल में आपका स्वागत है।',
  })
})

/**
 * POST /api/auth/wedding-admin-login
 * Shared endpoint for all weddings. Identifies wedding strictly by PIN on the server.
 */
router.post('/wedding-admin-login', (req, res) => {
  const ip = getClientIp(req)
  const rateCheck = checkRateLimit(`wadmin_${ip}`, 5, 15 * 60 * 1000)
  if (rateCheck.locked) {
    return res.status(429).json({ error: rateCheck.message })
  }

  const { pin } = req.body || {}
  if (!pin || typeof pin !== 'string') {
    recordFailedAttempt(`wadmin_${ip}`, 5, 15 * 60 * 1000)
    return res.status(400).json({ error: 'कृपया विवाह व्यवस्थापक पिन दर्ज करें।' })
  }

  const db = getDb()
  const activeCredentials = db.credentials.filter((c) => c.active)
  let matchedWedding = null

  // Verify against server-side credentials using timing-safe scrypt verification
  for (const cred of activeCredentials) {
    const isMatch = verifyPin(pin, cred.salt, cred.pinHash)
    if (isMatch) {
      const wedding = db.weddings.find((w) => w.id === cred.weddingId && !w.archived)
      if (wedding) {
        matchedWedding = wedding
        break
      }
    }
  }

  if (!matchedWedding) {
    recordFailedAttempt(`wadmin_${ip}`, 5, 15 * 60 * 1000)
    // Generic error message without revealing whether any wedding exists
    return res.status(401).json({ error: 'अमान्य पिन दर्ज किया गया। कृपया पुनः प्रयास करें।' })
  }

  resetRateLimit(`wadmin_${ip}`)
  const session = createSession('wedding_admin', matchedWedding.id)
  setSessionCookie(res, session.token)
  recordAuditLog('wedding_admin_login', { weddingId: matchedWedding.id, ip })

  res.json({
    success: true,
    token: session.token,
    role: 'wedding_admin',
    weddingId: matchedWedding.id,
    slug: matchedWedding.slug,
    brideName: matchedWedding.brideName,
    groomName: matchedWedding.groomName,
    message: 'सफलतापूर्वक सत्यापित।',
  })
})

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  const token = extractToken(req)
  if (token) {
    revokeSession(token)
  }
  res.clearCookie('wedding_platform_session')
  res.json({ success: true, message: 'सत्र समाप्त कर दिया गया।' })
})

/**
 * GET /api/auth/session
 */
router.get('/session', (req, res) => {
  const session = getActiveSession(req)
  if (!session) {
    return res.json({ authenticated: false, role: null })
  }

  const db = getDb()
  let weddingInfo = null
  if (session.weddingId) {
    const wedding = db.weddings.find((w) => w.id === session.weddingId)
    if (wedding) {
      weddingInfo = {
        id: wedding.id,
        slug: wedding.slug,
        brideName: wedding.brideName,
        groomName: wedding.groomName,
        weddingDateLabel: wedding.weddingDateLabel,
        published: wedding.published,
      }
    }
  }

  res.json({
    authenticated: true,
    role: session.type,
    weddingId: session.weddingId,
    wedding: weddingInfo,
  })
})

export default router
