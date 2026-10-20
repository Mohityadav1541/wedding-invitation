import crypto from 'node:crypto'

/**
 * Scrypt-based salted computational password/PIN hashing.
 * Resistant to GPU/ASIC brute-force attacks.
 */
export function hashPin(pin, salt = null) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(String(pin).trim(), actualSalt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  })
  return {
    salt: actualSalt,
    hash: derivedKey.toString('hex'),
    algorithm: 'scrypt-N16384-r8-p1',
  }
}

/**
 * Timing-safe PIN verification to prevent timing side-channel attacks.
 */
export function verifyPin(pin, salt, expectedHash) {
  if (!pin || !salt || !expectedHash) return false
  try {
    const derivedKey = crypto.scryptSync(String(pin).trim(), salt, 64, {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 32 * 1024 * 1024,
    })
    const derivedBuf = Buffer.from(derivedKey.toString('hex'), 'hex')
    const expectedBuf = Buffer.from(expectedHash, 'hex')
    if (derivedBuf.length !== expectedBuf.length) return false
    return crypto.timingSafeEqual(derivedBuf, expectedBuf)
  } catch (err) {
    return false
  }
}

/**
 * Generate a cryptographically secure 8-digit random numeric PIN.
 */
export function generateSecurePin(length = 8) {
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1
  return crypto.randomInt(min, max + 1).toString()
}

/**
 * Generate high-entropy session token.
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate UUID for records.
 */
export function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex')
}
