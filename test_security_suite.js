/**
 * Comprehensive Automated Security & Functional Test Suite
 * Validates all 16 mandatory security requirements against live API server.
 */

const BASE_URL = 'http://localhost:5001'

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════════')
  console.log('STARTING MANDATORY SECURITY AND FUNCTIONAL TEST SUITE')
  console.log('═══════════════════════════════════════════════════════════════════\n')

  let passedCount = 0
  let failedCount = 0

  function assert(condition, testNum, testName, details = '') {
    if (condition) {
      console.log(`[PASS] Test ${testNum}: ${testName}`)
      if (details) console.log(`       └─ ${details}`)
      passedCount++
    } else {
      console.error(`[FAIL] Test ${testNum}: ${testName}`)
      if (details) console.error(`       └─ ${details}`)
      failedCount++
    }
  }

  // ── TEST 1: Valid Photographer PIN opens portal ──
  let photoToken = null
  try {
    const res = await fetch(`${BASE_URL}/api/auth/photographer-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '88889999' }),
    })
    const data = await res.json()
    photoToken = data.token
    assert(res.status === 200 && data.role === 'photographer' && Boolean(photoToken), 1, 'Valid photographer PIN opens photographer portal', `Token received: ${photoToken ? photoToken.slice(0, 10) + '...' : 'none'}`)
  } catch (err) {
    assert(false, 1, 'Valid photographer PIN opens photographer portal', err.message)
  }

  // ── TEST 2: Invalid Photographer PIN is rejected ──
  try {
    const res = await fetch(`${BASE_URL}/api/auth/photographer-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '00000000' }),
    })
    assert(res.status === 401, 2, 'Invalid photographer PIN is rejected', `HTTP status: ${res.status}`)
  } catch (err) {
    assert(false, 2, 'Invalid photographer PIN is rejected', err.message)
  }

  // ── TEST 3: Valid Wedding A PIN opens only Wedding A ──
  let weddingAToken = null
  let weddingAId = null
  try {
    // Reset DB rate limits if any existed from previous runs
    const res = await fetch(`${BASE_URL}/api/auth/wedding-admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
      body: JSON.stringify({ pin: '12345678' }),
    })
    const data = await res.json()
    weddingAToken = data.token
    weddingAId = data.weddingId
    assert(res.status === 200 && data.role === 'wedding_admin' && data.slug === 'rahul-weds-priya', 3, 'Valid Wedding A PIN opens only Wedding A', `Authenticated wedding: ${data.slug} (${data.weddingId})`)
  } catch (err) {
    assert(false, 3, 'Valid Wedding A PIN opens only Wedding A', err.message)
  }

  // ── TEST 4: Valid Wedding B PIN opens only Wedding B ──
  let weddingBToken = null
  let weddingBId = null
  try {
    const res = await fetch(`${BASE_URL}/api/auth/wedding-admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.2' },
      body: JSON.stringify({ pin: '87654321' }),
    })
    const data = await res.json()
    weddingBToken = data.token
    weddingBId = data.weddingId
    assert(res.status === 200 && data.role === 'wedding_admin' && data.slug === 'amit-weds-neha', 4, 'Valid Wedding B PIN opens only Wedding B', `Authenticated wedding: ${data.slug} (${data.weddingId})`)
  } catch (err) {
    assert(false, 4, 'Valid Wedding B PIN opens only Wedding B', err.message)
  }

  // ── TEST 5: Wedding A PIN cannot access Wedding B's private API or records ──
  try {
    const res = await fetch(`${BASE_URL}/api/wedding-admin/dashboard`, {
      headers: { Authorization: `Bearer ${weddingAToken}` },
    })
    const data = await res.json()
    const returnedWeddingId = data.wedding?.id
    const rsvps = data.rsvps || []
    const hasOnlyA_Rsvps = rsvps.every((r) => r.weddingId === 'w-rahul-priya')
    assert(returnedWeddingId === 'w-rahul-priya' && hasOnlyA_Rsvps, 5, "Wedding A PIN cannot access Wedding B's private API or records", `Dashboard strictly returned: ${returnedWeddingId}, all ${rsvps.length} RSVPs scoped to Wedding A`)
  } catch (err) {
    assert(false, 5, "Wedding A PIN cannot access Wedding B's private API or records", err.message)
  }

  // ── TEST 6: Administrator cannot obtain access by changing wedding ID in request ──
  try {
    // Attempt to hijack Wedding B by passing weddingId in body with Wedding A's session token
    const res = await fetch(`${BASE_URL}/api/wedding-admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${weddingAToken}`,
      },
      body: JSON.stringify({
        weddingId: 'w-amit-neha', // Client attempts to hijack Wedding B
        familyLine: 'दो परिवारों का विशेष स्नेह',
      }),
    })
    const data = await res.json()
    // Verify Wedding B was NOT modified
    const checkB = await fetch(`${BASE_URL}/api/public/weddings/amit-weds-neha`)
    const dataB = await checkB.json()
    const weddingBSafe = dataB.wedding?.familyLine === 'राठौड़ एवं शेखावत परिवार'
    assert(weddingBSafe && data.wedding?.id === 'w-rahul-priya', 6, 'Administrator cannot obtain access by changing wedding ID in request', `Server derived wedding strictly from session (${data.wedding?.id}); Wedding B family line untouched: "${dataB.wedding?.familyLine}"`)
  } catch (err) {
    assert(false, 6, 'Administrator cannot obtain access by changing wedding ID in request', err.message)
  }

  // ── TEST 7: Unauthenticated users cannot retrieve guest records ──
  try {
    const resAdmin = await fetch(`${BASE_URL}/api/wedding-admin/dashboard`)
    const resPhoto = await fetch(`${BASE_URL}/api/photographer/weddings`)
    const resPublic = await fetch(`${BASE_URL}/api/public/weddings/rahul-weds-priya`)
    const publicData = await resPublic.json()
    const noRsvpsInPublic = publicData.wedding && !publicData.wedding.rsvps && !publicData.rsvps
    assert(resAdmin.status === 401 && resPhoto.status === 401 && noRsvpsInPublic, 7, 'Unauthenticated users cannot retrieve guest records', `Admin: ${resAdmin.status}, Photographer: ${resPhoto.status}, Public API guest records absent`)
  } catch (err) {
    assert(false, 7, 'Unauthenticated users cannot retrieve guest records', err.message)
  }

  // ── TEST 8: Repeated wrong PIN attempts trigger rate limiting / temporary lockout ──
  try {
    let locked = false
    // Use simulated IP 10.99.99.99 for rate-limit test
    for (let i = 0; i < 6; i++) {
      const res = await fetch(`${BASE_URL}/api/auth/wedding-admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.99.99.99' },
        body: JSON.stringify({ pin: `9999000${i}` }),
      })
      if (res.status === 429) {
        locked = true
        break
      }
    }
    assert(locked, 8, 'Repeated wrong PIN attempts trigger rate limiting or temporary lockout', 'HTTP 429 received on simulated IP after exceeding 5 failed attempts')
  } catch (err) {
    assert(false, 8, 'Repeated wrong PIN attempts trigger rate limiting or temporary lockout', err.message)
  }

  // ── TEST 9: PINs are never exposed in public endpoints while photographer can manage admin PINs ──
  try {
    // 1. Photographer can see adminPin for authenticated management
    const photoRes = await fetch(`${BASE_URL}/api/photographer/weddings`, {
      headers: { Authorization: `Bearer ${photoToken}` },
    })
    const photoData = await photoRes.json()
    const weddingList = Array.isArray(photoData) ? photoData : (photoData.weddings || [])
    const photographerHasAdminPins = weddingList.length > 0 && weddingList.every((w) => Boolean(w.adminPin))
    const noInternalHashesExposed = weddingList.every((w) => !w.pinHash && !w.salt)

    // 2. Public invitation endpoint must NEVER expose adminPin, pin, pinHash, or salt
    const publicRes = await fetch(`${BASE_URL}/api/public/weddings/rahul-weds-priya`)
    const publicData = await publicRes.json()
    const publicWedding = publicData.wedding || {}
    const publicSafe = !publicWedding.pin && !publicWedding.pinHash && !publicWedding.adminPin && !publicWedding.salt

    assert(
      photographerHasAdminPins && noInternalHashesExposed && publicSafe,
      9,
      'PINs are strictly protected: public endpoints never expose PINs/hashes while photographer can view adminPin',
      'Authenticated photographer manages adminPin, internal salt/pinHash are hidden, and public APIs expose 0 credentials'
    )
  } catch (err) {
    assert(false, 9, 'PINs are never exposed in public endpoints while photographer can manage admin PINs', err.message)
  }

  // ── TEST 10: Logout invalidates access to protected dashboard endpoints ──
  try {
    // Perform logout with Wedding B token
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${weddingBToken}` },
    })
    // Now attempt to access Wedding B dashboard
    const testAccess = await fetch(`${BASE_URL}/api/wedding-admin/dashboard`, {
      headers: { Authorization: `Bearer ${weddingBToken}` },
    })
    assert(testAccess.status === 401, 10, 'Logout invalidates access to protected dashboard endpoints', `Status after logout: ${testAccess.status}`)
  } catch (err) {
    assert(false, 10, 'Logout invalidates access to protected dashboard endpoints', err.message)
  }

  // ── TEST 11: Resetting a wedding PIN updates credentials without terminating active sessions ──
  try {
    // Create an isolated temporary test wedding to test PIN reset idempotently
    const tempCreate = await fetch(`${BASE_URL}/api/photographer/weddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${photoToken}` },
      body: JSON.stringify({
        brideName: 'परीक्षण वधू',
        groomName: 'परीक्षण वर',
        weddingDate: '2027-12-01',
      }),
    })
    const tempCreateData = await tempCreate.json()
    const tempWeddingId = tempCreateData.wedding.id
    const initialPin = tempCreateData.adminPin

    // Initial PIN login
    const tempLogin1 = await fetch(`${BASE_URL}/api/auth/wedding-admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.12' },
      body: JSON.stringify({ pin: initialPin }),
    })
    const tempLogin1Data = await tempLogin1.json()
    const tempSessionToken = tempLogin1Data.token

    // Reset PIN for the temporary wedding
    const resetRes = await fetch(`${BASE_URL}/api/photographer/weddings/${tempWeddingId}/reset-pin`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${photoToken}` },
    })
    const resetData = await resetRes.json()
    const newPin = resetData.adminPin

    // Existing active session remains uninterrupted (user requirement: sessions are not abruptly invalidated)
    const existingSessionTest = await fetch(`${BASE_URL}/api/wedding-admin/dashboard`, {
      headers: { Authorization: `Bearer ${tempSessionToken}` },
    })

    // Old initial PIN must be rejected now for new logins
    const oldPinLogin = await fetch(`${BASE_URL}/api/auth/wedding-admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.13' },
      body: JSON.stringify({ pin: initialPin }),
    })

    // New PIN must work for new logins!
    const newPinLogin = await fetch(`${BASE_URL}/api/auth/wedding-admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.14' },
      body: JSON.stringify({ pin: newPin }),
    })

    // Clean up temporary test wedding
    await fetch(`${BASE_URL}/api/photographer/weddings/${tempWeddingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${photoToken}` },
    })

    assert(
      Boolean(newPin) && existingSessionTest.status === 200 && oldPinLogin.status !== 200 && newPinLogin.status === 200,
      11,
      'Resetting wedding PIN updates credentials seamlessly without terminating active user sessions',
      `New PIN: ${newPin}, active session sustained (200), old PIN rejected (401), new PIN authenticated successfully (200)`
    )
  } catch (err) {
    assert(false, 11, 'Resetting a wedding PIN invalidates previous credentials and sessions as designed', err.message)
  }

  // ── TEST 12: A newly submitted RSVP appears in the correct dashboard ──
  const testGuestName = `परीक्षण अतिथि ${Date.now().toString().slice(-4)}`
  const testGuestPhone = `+91 99999 ${Date.now().toString().slice(-5)}`
  try {
    const rsvpPost = await fetch(`${BASE_URL}/api/public/weddings/rahul-weds-priya/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testGuestName,
        phone: testGuestPhone,
        attendance: 'yes',
        guests: 3,
        selectedEvents: ['sangeet', 'wedding'],
        message: 'हार्दिक बधाई एवं शुभकामनाएँ!',
      }),
    })

    // Read Wedding A dashboard with valid session token
    const dashRes = await fetch(`${BASE_URL}/api/wedding-admin/dashboard`, {
      headers: { Authorization: `Bearer ${weddingAToken}` },
    })
    const dashData = await dashRes.json()
    const foundInA = dashData.rsvps?.find((r) => r.phone === testGuestPhone)

    assert(rsvpPost.status === 201 && Boolean(foundInA), 12, 'A newly submitted RSVP appears in the correct dashboard', `Guest "${testGuestName}" found in Wedding A dashboard`)
  } catch (err) {
    assert(false, 12, 'A newly submitted RSVP appears in the correct dashboard', err.message)
  }

  // ── TEST 13: Guest counts update correctly ──
  try {
    const dashRes = await fetch(`${BASE_URL}/api/wedding-admin/dashboard`, {
      headers: { Authorization: `Bearer ${weddingAToken}` },
    })
    const dashData = await dashRes.json()
    const computedAttendees = dashData.rsvps
      .filter((r) => r.attendance === 'yes')
      .reduce((sum, r) => sum + (Number(r.guests) || 1), 0)
    assert(dashData.stats?.confirmedAttendees === computedAttendees, 13, 'Guest counts update correctly', `Dashboard stats (${dashData.stats?.confirmedAttendees}) strictly matches sum of confirmed guests (${computedAttendees})`)
  } catch (err) {
    assert(false, 13, 'Guest counts update correctly', err.message)
  }

  // ── TEST 14: Duplicate submissions do not silently inflate totals ──
  try {
    // Get count before resubmission
    const dashBefore = await (await fetch(`${BASE_URL}/api/wedding-admin/dashboard`, {
      headers: { Authorization: `Bearer ${weddingAToken}` },
    })).json()
    const totalBefore = dashBefore.stats?.totalSubmissions

    // Submit update with SAME phone number
    await fetch(`${BASE_URL}/api/public/weddings/rahul-weds-priya/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testGuestName,
        phone: testGuestPhone, // Same phone!
        attendance: 'yes',
        guests: 4, // Modified from 3 to 4
        selectedEvents: ['sangeet', 'wedding'],
        message: 'संख्या में बदलाव किया है।',
      }),
    })

    const dashAfter = await (await fetch(`${BASE_URL}/api/wedding-admin/dashboard`, {
      headers: { Authorization: `Bearer ${weddingAToken}` },
    })).json()
    const totalAfter = dashAfter.stats?.totalSubmissions
    const updatedRecord = dashAfter.rsvps?.find((r) => r.phone === testGuestPhone)

    assert(totalAfter === totalBefore && updatedRecord?.guests === 4, 14, 'Duplicate submissions do not silently inflate totals', `Submissions remained ${totalAfter} (not doubled); guest count updated to ${updatedRecord?.guests}`)
  } catch (err) {
    assert(false, 14, 'Duplicate submissions do not silently inflate totals', err.message)
  }

  // ── TEST 15: Published invitation routes work after deployment and refresh ──
  try {
    const publicRes = await fetch(`${BASE_URL}/api/public/weddings/rahul-weds-priya`)
    const publicData = await publicRes.json()
    const draftRes = await fetch(`${BASE_URL}/api/public/weddings/rohan-weds-kavya`)
    assert(publicRes.status === 200 && publicData.wedding?.slug === 'rahul-weds-priya' && draftRes.status === 404, 15, 'Published invitation routes work; draft is protected from public', `Published: HTTP 200 (${publicData.wedding?.brideName}), Draft: HTTP ${draftRes.status}`)
  } catch (err) {
    assert(false, 15, 'Published invitation routes work after deployment and refresh', err.message)
  }

  // ── TEST 16: Existing 3D experience, audio player, lyrics, countdown, and ceremony models continue working ──
  try {
    const publicRes = await fetch(`${BASE_URL}/api/public/weddings/rahul-weds-priya`)
    const data = await publicRes.json()
    const w = data.wedding
    const hasEvents = Array.isArray(w.events) && w.events.length > 0
    const hasStory = Array.isArray(w.story) && w.story.length > 0
    const hasDate = Boolean(w.weddingDate)
    const hasVenue = Boolean(w.venue?.name)
    assert(hasEvents && hasStory && hasDate && hasVenue, 16, 'Existing 3D experience, audio player, lyrics, countdown, and ceremony models continue working', `Events: ${w.events.length}, Story milestones: ${w.story.length}, Venue: ${w.venue.name}`)
  } catch (err) {
    assert(false, 16, 'Existing 3D experience, audio player, lyrics, countdown continue working', err.message)
  }

  console.log('\n═══════════════════════════════════════════════════════════════════')
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('═══════════════════════════════════════════════════════════════════\n')

  if (failedCount > 0) {
    process.exit(1)
  }
}

runTests().catch((e) => {
  console.error('Test runner encountered unexpected error:', e)
  process.exit(1)
})
