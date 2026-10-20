import { getDb, saveDb } from './db.js'
import { generateSessionToken, hashPin, verifyPin } from './crypto.js'

// Default photographer PIN if not supplied in environment.
// In production, configure PHOTOGRAPHER_PIN in server environment variables.
const PHOTOGRAPHER_DEFAULT_PIN = process.env.PHOTOGRAPHER_PIN || '88889999'

// Cache photographer hash dynamically
let photographerHashCache = null
function getPhotographerHash() {
  if (photographerHashCache) return photographerHashCache
  const targetPin = process.env.PHOTOGRAPHER_PIN || PHOTOGRAPHER_DEFAULT_PIN
  photographerHashCache = hashPin(targetPin)
  return photographerHashCache
}

export function verifyPhotographerPin(pin) {
  const { salt, hash } = getPhotographerHash()
  return verifyPin(pin, salt, hash)
}

/**
 * Session creation
 */
export function createSession(type, weddingId = null, durationMs = 365 * 24 * 60 * 60 * 1000) {
  const db = getDb()
  const token = generateSessionToken()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + durationMs).toISOString()

  const session = {
    token,
    type, // 'photographer' | 'wedding_admin'
    weddingId,
    createdAt: now.toISOString(),
    expiresAt,
  }

  db.sessions.push(session)
  saveDb()
  return session
}

/**
 * Revoke specific session (logout)
 */
export function revokeSession(token) {
  if (!token) return
  const db = getDb()
  db.sessions = db.sessions.filter((s) => s.token !== token)
  saveDb()
}

/**
 * Revoke all sessions for a specific wedding (called upon PIN reset)
 */
export function revokeWeddingSessions(weddingId) {
  if (!weddingId) return
  const db = getDb()
  db.sessions = db.sessions.filter((s) => s.weddingId !== weddingId)
  saveDb()
}

/**
 * Extract session token from cookie or Authorization header
 */
export function extractToken(req) {
  if (req.cookies && req.cookies.wedding_platform_session) {
    return req.cookies.wedding_platform_session
  }
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim()
  }
  return null
}

/**
 * Get valid session
 */
export function getActiveSession(req) {
  const token = extractToken(req)
  if (!token) return null
  const db = getDb()
  const now = new Date().toISOString()
  const session = db.sessions.find((s) => s.token === token && s.expiresAt > now)
  return session || null
}

/**
 * Middleware: require Photographer authorization
 */
export function requirePhotographer(req, res, next) {
  const session = getActiveSession(req)
  if (!session || session.type !== 'photographer') {
    return res.status(401).json({
      error: 'फोटोग्राफर प्रमाणीकरण आवश्यक है। कृपया पुनः प्रवेश करें।',
      code: 'UNAUTHORIZED_PHOTOGRAPHER',
    })
  }
  req.session = session
  next()
}

/**
 * Middleware: require Wedding Admin authorization
 * Enforces strict wedding scoping from session only.
 */
export function requireWeddingAdmin(req, res, next) {
  const session = getActiveSession(req)
  if (!session || session.type !== 'wedding_admin' || !session.weddingId) {
    return res.status(401).json({
      error: 'विवाह व्यवस्थापक प्रमाणीकरण आवश्यक है। कृपया पुनः PIN दर्ज करें।',
      code: 'UNAUTHORIZED_ADMIN',
    })
  }

  const db = getDb()
  const wedding = db.weddings.find((w) => w.id === session.weddingId && !w.archived)
  if (!wedding) {
    return res.status(403).json({
      error: 'यह विवाह उपलब्ध नहीं है अथवा हटा दिया गया है।',
      code: 'WEDDING_NOT_FOUND',
    })
  }

  req.session = session
  req.weddingId = session.weddingId
  req.wedding = wedding
  next()
}

/**
 * Rate limiting helper for login endpoints.
 * Lockout after 5 failed attempts for 15 minutes.
 */
export function checkRateLimit(ipKey, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const db = getDb()
  const now = Date.now()
  const record = db.rateLimits[ipKey]

  if (record) {
    if (record.lockoutUntil && record.lockoutUntil > now) {
      const waitMinutes = Math.ceil((record.lockoutUntil - now) / 60000)
      return {
        locked: true,
        message: `अत्यधिक असफल प्रयास। सुरक्षा कारणों से ${waitMinutes} मिनट बाद पुनः प्रयास करें।`,
      }
    }
    // Reset window if expired
    if (now - record.firstAttempt > windowMs) {
      delete db.rateLimits[ipKey]
      saveDb()
    }
  }

  return { locked: false }
}

export function recordFailedAttempt(ipKey, maxAttempts = 5, lockoutMs = 15 * 60 * 1000) {
  const db = getDb()
  const now = Date.now()
  const record = db.rateLimits[ipKey] || { count: 0, firstAttempt: now }
  record.count += 1
  record.lastAttempt = now

  if (record.count >= maxAttempts) {
    record.lockoutUntil = now + lockoutMs
  }
  db.rateLimits[ipKey] = record
  saveDb()
}

export function resetRateLimit(ipKey) {
  const db = getDb()
  if (db.rateLimits[ipKey]) {
    delete db.rateLimits[ipKey]
    saveDb()
  }
}

/**
 * Log administrative operations
 */
export function recordAuditLog(action, details = {}) {
  const db = getDb()
  db.auditLogs.push({
    id: generateSessionToken().slice(0, 16),
    action,
    details,
    timestamp: new Date().toISOString(),
  })
  // Keep last 500 audit logs
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(-500)
  }
  saveDb()
}
