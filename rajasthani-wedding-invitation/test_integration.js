/**
 * INTEGRATION TEST SUITE: API Endpoints, Auth, RSVP Message Flow, CSV Export, & Multi-tenant Scoping
 */
import assert from 'node:assert/strict'

const BASE_URL = 'http://localhost:5001'

console.log('═══════════════════════════════════════════════════════════════════')
console.log('STARTING INTEGRATION TEST SUITE')
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
  // ── 1. Photographer Auth ──
  let photoToken = null
  await runTest('Photographer Authentication: valid PIN (88889999) grants token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/photographer-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '88889999' }),
    })
    const data = await res.json()
    assert.equal(res.status, 200)
    assert.equal(data.role, 'photographer')
    assert.ok(data.token)
    photoToken = data.token
  })

  await runTest('Photographer Authentication: invalid PIN returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/photographer-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '99999999' }),
    })
    assert.equal(res.status, 401)
  })

  // ── 2. Wedding Admin Auth ──
  let weddingAToken = null
  await runTest('Wedding Admin Auth: valid PIN (12345678) opens Wedding A', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/wedding-admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.168.1.101' },
      body: JSON.stringify({ pin: '12345678' }),
    })
    const data = await res.json()
    assert.equal(res.status, 200)
    assert.equal(data.role, 'wedding_admin')
    assert.equal(data.weddingId, 'w-rahul-priya')
    weddingAToken = data.token
  })

  // ── 3. RSVP Message Submission & Ingestion Pipeline ──
  const testPhone = '+91 98888 77777'
  const testMessage = 'वर-वधू को शुभ विवाह की अशेष शुभकामनाएँ! जीवन मंगलमय हो। (परीक्षण संदेश)'

  await runTest('RSVP Pipeline: submit public RSVP with message on /w/rahul-weds-priya', async () => {
    const res = await fetch(`${BASE_URL}/api/public/weddings/rahul-weds-priya/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'श्रीमती एवं श्री गुप्ता',
        phone: testPhone,
        attendance: 'yes',
        guests: 2,
        selectedEvents: ['wedding', 'sangeet'],
        message: testMessage,
      }),
    })
    const data = await res.json()
    assert.ok(res.status === 200 || res.status === 201, `Status must be 200 or 201, got ${res.status}`)
    assert.ok(data.message.includes('सफलतापूर्वक'))
  })

  await runTest('RSVP Pipeline: wedding admin dashboard displays the exact submitted message', async () => {
    const res = await fetch(`${BASE_URL}/api/wedding-admin/dashboard`, {
      headers: { Authorization: `Bearer ${weddingAToken}` },
    })
    const data = await res.json()
    assert.equal(res.status, 200)
    const foundRsvp = data.rsvps?.find((r) => r.phone === testPhone)
    assert.ok(foundRsvp, 'Submitted RSVP found in admin list')
    assert.equal(foundRsvp.name, 'श्रीमती एवं श्री गुप्ता')
    assert.equal(foundRsvp.message, testMessage)
    assert.equal(foundRsvp.guests, 2)
  })

  await runTest('RSVP Pipeline: anti-duplicate update preserves identity and updates message', async () => {
    const updatedMessage = 'अपडेटेड संदेश: हम समय पर अवश्य पहुँचेंगे!'
    const res = await fetch(`${BASE_URL}/api/public/weddings/rahul-weds-priya/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'श्रीमती एवं श्री गुप्ता',
        phone: testPhone,
        attendance: 'yes',
        guests: 3,
        selectedEvents: ['wedding', 'sangeet', 'haldi'],
        message: updatedMessage,
      }),
    })
    const data = await res.json()
    assert.ok(res.status === 200 || res.status === 201, `Status must be 200 or 201, got ${res.status}`)

    // Verify in admin dashboard
    const dashRes = await fetch(`${BASE_URL}/api/wedding-admin/dashboard`, {
      headers: { Authorization: `Bearer ${weddingAToken}` },
    })
    const dashData = await dashRes.json()
    const matchingRsvps = dashData.rsvps?.filter((r) => r.phone === testPhone)
    assert.equal(matchingRsvps.length, 1, 'RSVP was updated in-place without creating a duplicate record')
    assert.equal(matchingRsvps[0].message, updatedMessage)
    assert.equal(matchingRsvps[0].guests, 3)
  })

  // ── 4. CSV Export with Message Verification ──
  await runTest('CSV Export: exports valid CSV with UTF-8 BOM, headers, and guest message', async () => {
    const res = await fetch(`${BASE_URL}/api/wedding-admin/rsvps/export`, {
      headers: { Authorization: `Bearer ${weddingAToken}` },
    })
    assert.equal(res.status, 200)
    assert.ok(res.headers.get('content-type')?.includes('text/csv'))
    const rawBuffer = Buffer.from(await res.arrayBuffer())

    // Raw byte check: Must start with exact UTF-8 BOM (0xEF, 0xBB, 0xBF)
    assert.equal(rawBuffer[0], 0xEF, 'Byte 0 must be 0xEF')
    assert.equal(rawBuffer[1], 0xBB, 'Byte 1 must be 0xBB')
    assert.equal(rawBuffer[2], 0xBF, 'Byte 2 must be 0xBF')

    const csvText = rawBuffer.toString('utf-8')
    // Must contain message column header
    assert.ok(csvText.includes('संदेश (Message)'))
    // Must contain the guest name and updated message
    assert.ok(csvText.includes('श्रीमती एवं श्री गुप्ता'))
    assert.ok(csvText.includes('हम समय पर अवश्य पहुँचेंगे!'))
  })

  // ── 5. Multi-Tenant Scoping ──
  await runTest('Multi-Tenant Scoping: Wedding A token cannot access Wedding B data', async () => {
    const res = await fetch(`${BASE_URL}/api/wedding-admin/dashboard`, {
      headers: { Authorization: `Bearer ${weddingAToken}` },
    })
    const data = await res.json()
    assert.equal(data.wedding?.id, 'w-rahul-priya')
    const hasAnyB = data.rsvps?.some((r) => r.weddingId !== 'w-rahul-priya')
    assert.equal(hasAnyB, false, 'Dashboard must never leak other weddings RSVP records')
  })

  // ── 6. Photographer Custom PIN Management ──
  await runTest('Photographer Custom PIN: sets custom PIN and enables instant admin login', async () => {
    // 1. Create a temporary wedding
    const createRes = await fetch(`${BASE_URL}/api/photographer/weddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${photoToken}` },
      body: JSON.stringify({
        brideName: 'कस्टम वधू',
        groomName: 'कस्टम वर',
        weddingDate: '2027-11-20',
        customPin: '77665544',
      }),
    })
    const createData = await createRes.json()
    assert.equal(createRes.status, 201)
    const tempWeddingId = createData.wedding.id
    assert.equal(createData.adminPin, '77665544')

    // 2. Admin logs in with that custom PIN
    const loginRes = await fetch(`${BASE_URL}/api/auth/wedding-admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.168.1.102' },
      body: JSON.stringify({ pin: '77665544' }),
    })
    const loginData = await loginRes.json()
    assert.equal(loginRes.status, 200)
    assert.equal(loginData.weddingId, tempWeddingId)

    // 3. Photographer changes the custom PIN
    const resetRes = await fetch(`${BASE_URL}/api/photographer/weddings/${tempWeddingId}/reset-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${photoToken}` },
      body: JSON.stringify({ customPin: '11223344' }),
    })
    const resetData = await resetRes.json()
    assert.equal(resetRes.status, 200)
    assert.equal(resetData.adminPin, '11223344')

    // 4. New custom PIN logs in successfully
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/wedding-admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.168.1.103' },
      body: JSON.stringify({ pin: '11223344' }),
    })
    assert.equal(newLoginRes.status, 200)

    // 5. Clean up temporary wedding
    await fetch(`${BASE_URL}/api/photographer/weddings/${tempWeddingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${photoToken}` },
    })
  })

  // ── 7. Public Safety ──
  await runTest('Public Safety: public wedding invitation endpoint never leaks PIN, pinHash, or salt', async () => {
    const res = await fetch(`${BASE_URL}/api/public/weddings/rahul-weds-priya`)
    const data = await res.json()
    assert.equal(res.status, 200)
    const w = data.wedding || {}
    assert.equal(w.pin, undefined)
    assert.equal(w.adminPin, undefined)
    assert.equal(w.pinHash, undefined)
    assert.equal(w.salt, undefined)
  })

  console.log(`\nINTEGRATION TEST RESULTS: ${passCount} Passed, ${failCount} Failed`)
  if (failCount > 0) {
    process.exit(1)
  } else {
    console.log('ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ✅\n')
  }
}

run()
