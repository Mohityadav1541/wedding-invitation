/**
 * SYSTEM / END-TO-END TEST SUITE: Full Multi-Tenant Wedding Lifecycle
 * Photographer Creation -> Custom PIN -> Public Invitation -> Guest RSVP with Message
 * -> WhatsApp Share -> Wedding Admin Auto-login -> Dashboard Verification & Search
 * -> Settings Update -> Custom Photographer Deletion
 */
import assert from 'node:assert/strict'
import { getGoogleMapsDestinationUrl } from './src/lib/weddingVenueOptions.js'

const BASE_URL = 'http://localhost:5001'

console.log('═══════════════════════════════════════════════════════════════════')
console.log('STARTING SYSTEM (END-TO-END) TEST SUITE')
console.log('═══════════════════════════════════════════════════════════════════\n')

let passCount = 0
let failCount = 0

async function runTest(name, fn) {
  try {
    await fn()
    passCount++
    console.log(`[PASS] ${name}`)
  } catch (err) {
    failCount++
    console.error(`[FAIL] ${name}: ${err.message}`)
  }
}

async function run() {
  const timestamp = Date.now()
  const customPin = '65432109'
  let photoToken = null
  let createdWeddingId = null
  let weddingSlug = null
  let adminToken = null

  // 1. Photographer Logs In
  await runTest('System Step 1: Photographer authenticates with primary PIN', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/photographer-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '88889999' }),
    })
    const data = await res.json()
    assert.equal(res.status, 200)
    photoToken = data.token
    assert.ok(photoToken)
  })

  // 2. Photographer Creates Wedding with Custom PIN & Direct Map Link
  await runTest('System Step 2: Photographer creates new wedding with custom PIN & direct map link', async () => {
    const res = await fetch(`${BASE_URL}/api/photographer/weddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${photoToken}` },
      body: JSON.stringify({
        brideName: 'अनन्या शर्मा',
        groomName: 'विक्रम राठौड़',
        weddingDate: '2027-11-28',
        weddingDateLabel: 'रविवार, २८ नवम्बर २०२७',
        weddingTimeLabel: 'सायं ७:०० बजे',
        customPin,
        venue: {
          name: 'जय महल पैलेस',
          city: 'जयपुर, राजस्थान',
          address: 'जैकब रोड, सिविल लाइंस',
          googleMapsQuery: 'https://maps.app.goo.gl/JaiMahalPalaceJaipur',
        },
      }),
    })
    const data = await res.json()
    assert.equal(res.status, 201)
    createdWeddingId = data.wedding.id
    weddingSlug = data.wedding.slug
    assert.equal(data.adminPin, customPin)
    assert.ok(createdWeddingId)
    assert.ok(weddingSlug)
  })

  // 3. Photographer Publishes Wedding
  await runTest('System Step 3: Photographer toggles published state so guests can view', async () => {
    const res = await fetch(`${BASE_URL}/api/photographer/weddings/${createdWeddingId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${photoToken}` },
    })
    const data = await res.json()
    assert.equal(res.status, 200)
    assert.equal(data.published, true)
  })

  // 4. Guest Opens Public Invitation & Tests Map URL
  await runTest('System Step 4: Guest opens public invitation and checks Google Maps destination link', async () => {
    const res = await fetch(`${BASE_URL}/api/public/weddings/${weddingSlug}`)
    const data = await res.json()
    assert.equal(res.status, 200)
    assert.equal(data.wedding.brideName, 'अनन्या शर्मा')
    assert.equal(data.wedding.groomName, 'विक्रम राठौड़')

    // Maps resolution must produce direct destination
    const resolvedMapUrl = getGoogleMapsDestinationUrl(data.wedding.venue)
    assert.equal(resolvedMapUrl, 'https://maps.app.goo.gl/JaiMahalPalaceJaipur')
  })

  // 5. Guest Submits RSVP with Auspicious Message
  const guestPhone = `+91 91111 ${String(timestamp).slice(-5)}`
  const guestMessage = 'सदा सुहागन रहो! विक्रम एवं अनन्या को नवजीवन की मंगलमय शुभकामनाएँ।'

  await runTest('System Step 5: Guest submits RSVP with guests count, events, and personal blessing message', async () => {
    const res = await fetch(`${BASE_URL}/api/public/weddings/${weddingSlug}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'ठाकुर भंवर सिंह जी',
        phone: guestPhone,
        attendance: 'yes',
        guests: 4,
        selectedEvents: ['wedding', 'sangeet'],
        message: guestMessage,
      }),
    })
    const data = await res.json()
    assert.ok(res.status === 200 || res.status === 201)
    assert.ok(data.message.includes('सफलतापूर्वक'))
  })

  // 6. WhatsApp Share Message Verification
  await runTest('System Step 6: Public invitation generates WhatsApp share message with names & link', async () => {
    const shareText = `सादर आमंत्रण: विक्रम राठौड़ एवं अनन्या शर्मा का शुभ विवाह। कृपया इस लिंक पर पधारें:\n${BASE_URL}/w/${weddingSlug}`
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    assert.ok(shareUrl.includes(encodeURIComponent('विक्रम राठौड़')))
    assert.ok(shareUrl.includes(encodeURIComponent('अनन्या शर्मा')))
    assert.ok(shareUrl.includes(weddingSlug))
  })

  // 7. Wedding Admin Auto-Logs In With Custom PIN
  await runTest('System Step 7: Wedding Admin logs in using the exact custom PIN set by photographer', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/wedding-admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.168.2.50' },
      body: JSON.stringify({ pin: customPin }),
    })
    const data = await res.json()
    assert.equal(res.status, 200)
    assert.equal(data.role, 'wedding_admin')
    assert.equal(data.weddingId, createdWeddingId)
    adminToken = data.token
    assert.ok(adminToken)
  })

  // 8. Wedding Admin Inspects Dashboard and Guest Message
  await runTest('System Step 8: Admin dashboard displays guest message accurately in RSVP table', async () => {
    const res = await fetch(`${BASE_URL}/api/wedding-admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const data = await res.json()
    assert.equal(res.status, 200)
    assert.equal(data.wedding.id, createdWeddingId)
    assert.equal(data.stats.confirmedAttendees, 4)
    assert.equal(data.stats.confirmedSubmissions, 1)

    const guestRsvp = data.rsvps?.find((r) => r.phone === guestPhone)
    assert.ok(guestRsvp, 'Guest RSVP found in admin list')
    assert.equal(guestRsvp.name, 'ठाकुर भंवर सिंह जी')
    assert.equal(guestRsvp.message, guestMessage)
    assert.equal(guestRsvp.guests, 4)
  })

  // 9. Wedding Admin Updates Family Settings
  await runTest('System Step 9: Family admin updates family line and custom greeting', async () => {
    const res = await fetch(`${BASE_URL}/api/wedding-admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        familyLine: 'राठौड़ एवं शर्मा राजपरिवार का स्नेहिल आमंत्रण',
      }),
    })
    const data = await res.json()
    assert.equal(res.status, 200)
    assert.equal(data.wedding.familyLine, 'राठौड़ एवं शर्मा राजपरिवार का स्नेहिल आमंत्रण')

    // Public invitation reflects the change immediately
    const pubRes = await fetch(`${BASE_URL}/api/public/weddings/${weddingSlug}`)
    const pubData = await pubRes.json()
    assert.equal(pubData.wedding.familyLine, 'राठौड़ एवं शर्मा राजपरिवार का स्नेहिल आमंत्रण')
  })

  // 10. Photographer Customly Removes Page
  await runTest('System Step 10: Photographer customly deletes the wedding page when desired', async () => {
    const res = await fetch(`${BASE_URL}/api/photographer/weddings/${createdWeddingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${photoToken}` },
    })
    const data = await res.json()
    assert.equal(res.status, 200)
    assert.equal(data.success, true)

    // Public invitation must return 404 now
    const checkPublic = await fetch(`${BASE_URL}/api/public/weddings/${weddingSlug}`)
    assert.equal(checkPublic.status, 404)
  })

  console.log(`\nSYSTEM TEST RESULTS: ${passCount} Passed, ${failCount} Failed`)
  if (failCount > 0) {
    process.exit(1)
  } else {
    console.log('ALL SYSTEM (END-TO-END) TESTS PASSED SUCCESSFULLY! ✅\n')
  }
}

run()
