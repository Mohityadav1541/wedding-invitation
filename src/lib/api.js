const API_BASE = '/api'
const TOKEN_KEY = 'wedding_session_token'

export function getStoredToken() {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem(TOKEN_KEY) || null
}

export function setStoredToken(token) {
  if (typeof window === 'undefined') return
  if (token) {
    window.sessionStorage.setItem(TOKEN_KEY, token)
  } else {
    window.sessionStorage.removeItem(TOKEN_KEY)
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getStoredToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Send httpOnly cookies
  }

  const response = await fetch(url, config)
  const contentType = response.headers.get('content-type') || ''

  let data
  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || 'अनपेक्षित त्रुटि हुई। कृपया पुनः प्रयास करें।'
    const error = new Error(errorMsg)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

// ── Auth APIs ──
export async function checkSession() {
  try {
    return await request('/auth/session')
  } catch {
    return { authenticated: false, role: null }
  }
}

export async function photographerLogin(pin) {
  const res = await request('/auth/photographer-login', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  })
  if (res.token) setStoredToken(res.token)
  return res
}

export async function weddingAdminLogin(pin) {
  const res = await request('/auth/wedding-admin-login', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  })
  if (res.token) setStoredToken(res.token)
  return res
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' })
  } finally {
    setStoredToken(null)
  }
}

// ── Photographer APIs ──
export async function fetchPhotographerWeddings() {
  return request('/photographer/weddings')
}

export async function fetchPhotographerStats() {
  return request('/photographer/stats')
}

export async function createWedding(payload) {
  return request('/photographer/weddings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchPhotographerWedding(id) {
  return request(`/photographer/weddings/${id}`)
}

export async function updatePhotographerWedding(id, updates) {
  return request(`/photographer/weddings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function togglePublishWedding(id) {
  return request(`/photographer/weddings/${id}/publish`, {
    method: 'PATCH',
  })
}

export async function resetWeddingAdminPin(id, customPin = '') {
  return request(`/photographer/weddings/${id}/reset-pin`, {
    method: 'POST',
    body: JSON.stringify({ customPin }),
  })
}

export async function deleteWedding(id) {
  return request(`/photographer/weddings/${id}`, {
    method: 'DELETE',
  })
}

// ── Wedding Admin APIs ──
export async function fetchWeddingAdminDashboard() {
  return request('/wedding-admin/dashboard')
}

export async function updateWeddingAdminSettings(updates) {
  return request('/wedding-admin/settings', {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export function getWeddingAdminExportUrl() {
  return `${API_BASE}/wedding-admin/rsvps/export`
}

// ── Public APIs ──
export async function fetchPublicWedding(slug) {
  return request(`/public/weddings/${slug}`)
}

export async function submitRsvp(slug, payload) {
  return request(`/public/weddings/${slug}/rsvp`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
