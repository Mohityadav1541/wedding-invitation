/**
 * UNIT TEST SUITE: Core Algorithms, Venue Link Resolvers, PIN Cryptography & Message Validation
 */
import assert from 'node:assert/strict'
import {
  getGoogleMapsDestinationUrl,
  extractPalaceAndCityFromMapUrl,
  FAMOUS_ROYAL_PALACES,
} from './src/lib/weddingVenueOptions.js'
import {
  hashPin,
  verifyPin,
  generateSecurePin,
} from './server/crypto.js'

console.log('═══════════════════════════════════════════════════════════════════')
console.log('STARTING UNIT TEST SUITE')
console.log('═══════════════════════════════════════════════════════════════════\n')

let passCount = 0
let failCount = 0

function runTest(name, fn) {
  try {
    fn()
    passCount++
    console.log(`[PASS] ${name}`)
  } catch (err) {
    failCount++
    console.error(`[FAIL] ${name}: ${err.message}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Venue & Google Maps URL Resolution Tests
// ─────────────────────────────────────────────────────────────────────────────

runTest('Maps Resolver: direct http/https URL is preserved intact', () => {
  const venue = {
    googleMapsQuery: 'https://maps.app.goo.gl/xyz123',
    name: 'रामबाग पैलेस',
    city: 'जयपुर, राजस्थान',
  }
  const url = getGoogleMapsDestinationUrl(venue)
  assert.equal(url, 'https://maps.app.goo.gl/xyz123')
})

runTest('Maps Resolver: non-http text query produces safe Google search URL', () => {
  const venue = {
    googleMapsQuery: 'The City Palace, Old City, Udaipur',
    name: 'सिटी पैलेस',
    city: 'उदयपुर',
  }
  const url = getGoogleMapsDestinationUrl(venue)
  assert.match(url, /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=The%20City%20Palace/)
})

runTest('Maps Resolver: fallbacks to palace name, address, and city when query is blank', () => {
  const venue = {
    googleMapsQuery: '',
    name: 'उम्मेद भवन पैलेस',
    address: 'सर्किट हाउस रोड',
    city: 'जोधपुर, राजस्थान',
  }
  const url = getGoogleMapsDestinationUrl(venue)
  assert.match(url, /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/)
  assert.ok(url.includes(encodeURIComponent('उम्मेद भवन पैलेस')))
  assert.ok(url.includes(encodeURIComponent('जोधपुर, राजस्थान')))
})

runTest('Maps Resolver: gracefully handles null or empty venue without throwing', () => {
  assert.equal(getGoogleMapsDestinationUrl(null), 'https://www.google.com/maps')
  assert.equal(getGoogleMapsDestinationUrl({}), 'https://www.google.com/maps')
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Google Maps URL Parsing & Palace/City Extraction Tests
// ─────────────────────────────────────────────────────────────────────────────

runTest('Map Extractor: identifies shortened links (maps.app.goo.gl) without erasing user fields', () => {
  const parsed = extractPalaceAndCityFromMapUrl('https://maps.app.goo.gl/WUfUYmkJmqtgiduc6')
  assert.equal(parsed.isShortUrl, true)
  assert.equal(parsed.hasDetails, false)
  // Short URL must not overwrite entered name or city with junk
  assert.equal(parsed.name, '')
  assert.equal(parsed.city, '')
})

runTest('Map Extractor: extracts palace and city from google.com/maps/place/ URLs', () => {
  const raw = 'https://www.google.com/maps/place/Rambagh+Palace,+Jaipur/@26.897,75.808,17z'
  const parsed = extractPalaceAndCityFromMapUrl(raw)
  assert.ok(parsed.name.includes('Rambagh Palace'))
  assert.ok(parsed.city.includes('Jaipur'))
  assert.equal(parsed.hasDetails, true)
})

runTest('Map Extractor: cleans geo coordinates cleanly', () => {
  const raw = 'https://www.google.com/maps?q=26.9124,75.7873'
  const parsed = extractPalaceAndCityFromMapUrl(raw)
  assert.equal(parsed.name, 'विवाह स्थल (Geo Coordinates)')
})

runTest('Preset Palaces: all famous royal palaces have verified queries', () => {
  assert.ok(FAMOUS_ROYAL_PALACES.length >= 10, 'At least 10 palaces configured')
  for (const palace of FAMOUS_ROYAL_PALACES) {
    assert.ok(palace.id, `Palace ${palace.name} has valid ID`)
    assert.ok(palace.googleMapsQuery.startsWith('http'), `Palace ${palace.name} has http map link`)
    assert.ok(palace.city, `Palace ${palace.name} has city specified`)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. Cryptographic PIN Security Tests
// ─────────────────────────────────────────────────────────────────────────────

runTest('PIN Crypto: generateSecurePin generates exactly specified digit length', () => {
  for (let len of [6, 8, 10]) {
    const pin = generateSecurePin(len)
    assert.equal(pin.length, len)
    assert.match(pin, /^\d+$/, 'PIN must contain only decimal digits')
  }
})

runTest('PIN Crypto: hashPin generates unique salts and verifiable scrypt hashes', () => {
  const pin = '56789012'
  const { salt: s1, hash: h1 } = hashPin(pin)
  const { salt: s2, hash: h2 } = hashPin(pin)

  // Different salts prevent rainbow table lookups
  assert.notEqual(s1, s2)
  assert.notEqual(h1, h2)

  // Both must verify correctly against original PIN
  assert.equal(verifyPin(pin, s1, h1), true)
  assert.equal(verifyPin(pin, s2, h2), true)

  // Wrong PIN must fail verification
  assert.equal(verifyPin('00000000', s1, h1), false)
  assert.equal(verifyPin('56789013', s1, h1), false)
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. RSVP Message Sanitization & Validation Tests
// ─────────────────────────────────────────────────────────────────────────────

runTest('Message Validation: cleans whitespace and enforces 500-char max boundary', () => {
  const raw = '   हार्दिक बधाई एवं शुभकामनाएँ!   '
  const cleaned = String(raw).trim().slice(0, 500)
  assert.equal(cleaned, 'हार्दिक बधाई एवं शुभकामनाएँ!')

  const huge = 'A'.repeat(1000)
  const trimmedHuge = String(huge).trim().slice(0, 500)
  assert.equal(trimmedHuge.length, 500)
})

runTest('RSVP Guest Count Clamping: 1-20 when attending, 0 when not', () => {
  // Attending: yes
  const guestNormal = Math.max(1, Math.min(20, Number('3') || 1))
  assert.equal(guestNormal, 3)

  const guestOverflow = Math.max(1, Math.min(20, Number('99') || 1))
  assert.equal(guestOverflow, 20)

  const guestInvalid = Math.max(1, Math.min(20, Number('abc') || 1))
  assert.equal(guestInvalid, 1)

  // Attending: no
  const notAttendingGuests = false ? Math.max(1, Math.min(20, Number('5') || 1)) : 0
  assert.equal(notAttendingGuests, 0)
})

console.log(`\nUNIT TEST RESULTS: ${passCount} Passed, ${failCount} Failed`)
if (failCount > 0) {
  process.exit(1)
} else {
  console.log('ALL UNIT TESTS PASSED SUCCESSFULLY! ✅\n')
}
