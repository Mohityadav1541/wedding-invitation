import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Film,
  Heart,
  Image as ImageIcon,
  ImagePlus,
  KeyRound,
  Lock,
  LogOut,
  MapPin,
  RefreshCw,
  Save,
  Search,
  Share2,
  Upload,
  UserCheck,
  UserX,
  Users,
  X,
  Sparkles,
} from 'lucide-react'
import {
  checkSession,
  weddingAdminLogin,
  logout,
  fetchWeddingAdminDashboard,
  updateWeddingAdminSettings,
  getWeddingAdminExportUrl,
} from '../lib/api.js'
import { compressImageFile } from '../lib/weddingSettings.js'
import { RajPortrait } from '../components/RajPortrait.jsx'
import {
  formatCalendarDateToHindi,
  formatTimeToHindi,
  extractDateInputVal,
  extractTimeInputVal,
} from '../lib/weddingEventOptions.js'
import {
  FAMOUS_ROYAL_PALACES,
  VENUE_REGIONS,
  extractPalaceAndCityFromMapUrl,
  getGoogleMapsDestinationUrl,
} from '../lib/weddingVenueOptions.js'

export default function WeddingAdminPortal() {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [busyLogin, setBusyLogin] = useState(false)

  // Dashboard Data
  const [dashboard, setDashboard] = useState(null)
  const [activeTab, setActiveTab] = useState('rsvp') // 'rsvp' | 'details'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAttendance, setFilterAttendance] = useState('all') // 'all' | 'yes' | 'no'
  const [notice, setNotice] = useState('')
  const [copiedUrl, setCopiedUrl] = useState(false)

  // Edit settings
  const [settingsDraft, setSettingsDraft] = useState(null)
  const [busySaveSettings, setBusySaveSettings] = useState(false)
  const [busyUpload, setBusyUpload] = useState(false)
  const [portraitPreviewMode, setPortraitPreviewMode] = useState('mobile')

  useEffect(() => {
    checkSession()
      .then((res) => {
        if (res.authenticated && res.role === 'wedding_admin' && res.weddingId) {
          setAuthenticated(true)
          loadDashboard()
        } else {
          setAuthenticated(false)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await fetchWeddingAdminDashboard()
      setDashboard(data)
      setSettingsDraft(data.wedding)
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        setAuthenticated(false)
      } else {
        showNotice(err.message || 'डैशबोर्ड लोड नहीं हुआ।')
      }
    }
  }

  const showNotice = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice((cur) => (cur === msg ? '' : cur)), 6000)
  }

  const attemptAutoLogin = async (pinToTry) => {
    const trimmed = (pinToTry || '').trim()
    if (!trimmed || busyLogin) return
    setLoginError('')
    setBusyLogin(true)
    try {
      await weddingAdminLogin(trimmed)
      setAuthenticated(true)
      setPinInput('')
      await loadDashboard()
    } catch (err) {
      setLoginError(err.message || 'अमान्य पिन दर्ज किया गया।')
    } finally {
      setBusyLogin(false)
    }
  }

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    await attemptAutoLogin(pinInput)
  }

  const handleLogout = async () => {
    await logout()
    setAuthenticated(false)
    setDashboard(null)
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    if (!settingsDraft) return
    setBusySaveSettings(true)
    try {
      const res = await updateWeddingAdminSettings(settingsDraft)
      showNotice(res.message || 'बदलाव सुरक्षित कर लिए गए हैं।')
      await loadDashboard()
    } catch (err) {
      showNotice(err.message || 'सुरक्षित नहीं हो सका।')
    } finally {
      setBusySaveSettings(false)
    }
  }

  const handleImageUpload = async (field, file) => {
    if (!file || !settingsDraft) return
    setBusyUpload(true)
    try {
      const compressed = await compressImageFile(file, 1400, 0.82)
      setSettingsDraft((prev) => ({ ...prev, [field]: compressed }))
      showNotice('चित्र प्रोसेस हो गया। बदलाव लागू करने के लिए नीचे सेव बटन दबाएँ।')
    } catch (err) {
      showNotice(err.message || 'चित्र अपलोड नहीं हो सका।')
    } finally {
      setBusyUpload(false)
    }
  }

  const handleGalleryPhotoUpload = async (index, file) => {
    if (!file || !settingsDraft) return
    setBusyUpload(true)
    try {
      const compressed = await compressImageFile(file, 1400, 0.82)
      setSettingsDraft((prev) => {
        const cur = Array.isArray(prev.gallery) ? [...prev.gallery] : []
        const newPhoto = {
          id: cur[index]?.id || `photo-${Date.now()}-${index}`,
          url: compressed,
          aspect: '4:3',
        }
        if (index < cur.length) {
          cur[index] = newPhoto
        } else {
          cur.push(newPhoto)
        }
        return { ...prev, gallery: cur.slice(0, 4) }
      })
      showNotice('गैलरी तस्वीर प्रोसेस हो गई। नीचे सेव बटन दबाएँ।')
    } catch (err) {
      showNotice(err.message || 'तस्वीर अपलोड नहीं हो सकी।')
    } finally {
      setBusyUpload(false)
    }
  }

  const handleRemoveGalleryPhoto = (index) => {
    setSettingsDraft((prev) => {
      const cur = Array.isArray(prev.gallery) ? [...prev.gallery] : []
      cur.splice(index, 1)
      return { ...prev, gallery: cur }
    })
    showNotice('तस्वीर हटा दी गई। नीचे सेव बटन दबाएँ।')
  }

  const handleSetDemoGallery = () => {
    setSettingsDraft((prev) => ({
      ...prev,
      hideGallery: false,
      gallery: [
        { id: 'demo-g-1', url: '/images/gallery-haldi.jpg', aspect: '4:3' },
        { id: 'demo-g-2', url: '/images/gallery-sangeet.jpg', aspect: '4:3' },
        { id: 'demo-g-3', url: prev.bridePhoto || '/images/bride-priya.jpg', aspect: '3:4' },
        { id: 'demo-g-4', url: prev.groomPhoto || '/images/groom-rahul.jpg', aspect: '3:4' },
      ],
    }))
    showNotice('४ डेमो तस्वीरें सेट कर दी गईं। सेव बटन दबाकर लागू करें।')
  }

  const handleSetDemoVideo = () => {
    setSettingsDraft((prev) => ({
      ...prev,
      hideVideo: false,
      videos: [
        {
          id: 'demo-v-1',
          aspect: '9:16',
          poster: '/images/wedding-reel-mobile.jpg',
          videoUrl: '',
        },
      ],
    }))
    showNotice('डेमो वीडियो सेट कर दिया गया। सेव बटन दबाकर लागू करें।')
  }

  const handleVideoPosterUpload = async (file) => {
    if (!file || !settingsDraft) return
    setBusyUpload(true)
    try {
      const compressed = await compressImageFile(file, 1200, 0.82)
      setSettingsDraft((prev) => {
        const cur = Array.isArray(prev.videos) && prev.videos.length > 0
          ? { ...prev.videos[0], poster: compressed }
          : { id: `vid-${Date.now()}`, aspect: '9:16', poster: compressed, videoUrl: '' }
        return { ...prev, videos: [cur] }
      })
      showNotice('वीडियो पोस्टर प्रोसेस हो गया। नीचे सेव बटन दबाएँ।')
    } catch (err) {
      showNotice(err.message || 'पोस्टर अपलोड नहीं हो सका।')
    } finally {
      setBusyUpload(false)
    }
  }

  const copyPublicUrl = () => {
    if (!dashboard?.wedding?.slug) return
    const url = `${window.location.origin}/w/${dashboard.wedding.slug}`
    navigator.clipboard.writeText(url)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2500)
  }

  // Filter RSVPs
  const rsvps = dashboard?.rsvps || []
  const filteredRsvps = rsvps.filter((r) => {
    if (filterAttendance === 'yes' && r.attendance !== 'yes') return false
    if (filterAttendance === 'no' && r.attendance !== 'no') return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchesName = (r.name || '').toLowerCase().includes(q)
      const matchesPhone = (r.phone || '').toLowerCase().includes(q)
      const matchesMsg = (r.message || '').toLowerCase().includes(q)
      return matchesName || matchesPhone || matchesMsg
    }
    return true
  })

  // Loading state
  if (loading) {
    return (
      <div className="admin-login-shell">
        <div className="admin-login-card" style={{ textAlign: 'center', padding: '60px 30px' }}>
          <div className="admin-login-seal">श्री</div>
          <p className="admin-eyebrow">शाही विवाह आमंत्रण</p>
          <h2>व्यवस्थापक पोर्टल लोड हो रहा है…</h2>
        </div>
      </div>
    )
  }

  // Login Screen: Shared Single Entry for ALL weddings
  if (!authenticated) {
    return (
      <div className="admin-login-shell">
        <div className="admin-login-card">
          <Link to="/" className="admin-back-link">
            <ArrowLeft size={15} /> मुख्य आमंत्रण पर लौटें
          </Link>
          <div className="admin-login-seal">श्री</div>
          <p className="admin-eyebrow">शुभ विवाह · परिवार व्यवस्थापक</p>
          <h1>व्यवस्थापक प्रवेश</h1>
          <p>
            फोटोग्राफर द्वारा प्रदान किया गया अपना <strong>8-अंकीय विवाह PIN</strong> दर्ज करें। सर्वर आपके विवाह की पहचान कर सही डैशबोर्ड प्रदर्शित करेगा।
          </p>

          <form onSubmit={handleLogin}>
            <label>
              8-अंकीय व्यवस्थापक PIN
              <input
                type="password"
                inputMode="numeric"
                maxLength={16}
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value
                  setPinInput(val)
                  if (val.trim().length >= 8 && !busyLogin) {
                    attemptAutoLogin(val.trim())
                  }
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData?.getData('text') || ''
                  if (pasted.trim().length >= 4) {
                    setPinInput(pasted.trim())
                    setTimeout(() => attemptAutoLogin(pasted.trim()), 50)
                  }
                }}
                placeholder="उदा. 12345678 (लिखते या पेस्ट करते ही स्वतः खुलेगा)"
                autoComplete="current-password"
                required
              />
            </label>
            <button
              className="admin-button admin-button-primary"
              type="submit"
              disabled={busyLogin || !pinInput.trim()}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <KeyRound size={16} /> {busyLogin ? 'सत्यापित हो रहा है…' : 'डैशबोर्ड में प्रवेश करें'}
            </button>
          </form>

          {loginError && (
            <div
              className="admin-notice"
              style={{ borderColor: '#c84444', color: '#901212', background: '#fdf2f2' }}
            >
              {loginError}
            </div>
          )}

          <div
            style={{
              marginTop: 24,
              padding: 14,
              background: '#fdf6ed',
              borderRadius: 8,
              border: '1px solid #ebd7af',
              fontSize: 12,
              color: '#7a4e1d',
            }}
          >
            <strong>सुरक्षा सूचना:</strong>
            <p style={{ margin: '4px 0 0' }}>
              प्रत्येक विवाह का PIN गोपनीय और स्वतंत्र है। सही PIN दर्ज करने पर केवल उसी विवाह के मेहमान और विवरण खुलेंगे।
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated Wedding Dashboard
  const wedding = dashboard?.wedding
  const stats = dashboard?.stats
  const publicUrl = wedding?.slug ? `${window.location.origin}/w/${wedding.slug}` : ''

  return (
    <div className="admin-shell" style={{ minHeight: '100vh', background: '#fbf7f0' }}>
      {/* Top Header */}
      <header className="admin-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="admin-brand">
          <span className="brand-mark">
            <span>श्री</span>
            <i />
          </span>
          <span>
            <strong>{wedding?.groomName} weds {wedding?.brideName}</strong>
            <small>विवाह व्यवस्थापक डैशबोर्ड</small>
          </span>
        </div>

        <div className="admin-header-actions">
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="admin-button admin-button-quiet"
            >
              <Eye size={15} /> आमंत्रण देखें
            </a>
          )}
          <button className="admin-button admin-button-quiet" type="button" onClick={handleLogout}>
            <LogOut size={16} /> बाहर जाएँ
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 80px' }}>
        {notice && (
          <div className="admin-notice" role="status" style={{ marginBottom: 24 }}>
            <Check size={16} />
            <span>{notice}</span>
            <button onClick={() => setNotice('')} aria-label="बंद करें" type="button">
              <X size={15} />
            </button>
          </div>
        )}

        {/* Wedding Identity & Invitation Share Bar */}
        <section className="wadmin-hero-bar">
          <div className="wadmin-hero-info">
            <p className="admin-eyebrow" style={{ color: '#8c2d19', letterSpacing: '.18em' }}>
              ✦ शाही राजस्थानी आमंत्रण ✦
            </p>
            <h1 style={{ fontFamily: 'Cinzel, serif', color: '#2a0d15', margin: '4px 0 8px' }}>
              {wedding?.groomName} <span style={{ color: '#b8860b', fontSize: '0.8em' }}>♥</span> {wedding?.brideName}
            </h1>
            <p style={{ margin: 0, color: '#684534', fontSize: 13, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span><Calendar size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> {wedding?.weddingDateLabel || 'तिथि निर्धारित नहीं'}</span>
              <span><MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> {wedding?.venue?.city || 'स्थल निर्धारित नहीं'}</span>
            </p>
          </div>

          <div className="wadmin-hero-actions">
            <div className="wadmin-link-card">
              <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#8a5c38', letterSpacing: '.1em', fontWeight: 600 }}>
                सार्वजनिक आमंत्रण लिंक:
              </span>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <code style={{ background: '#fff', padding: '6px 10px', borderRadius: 6, border: '1px solid #ebd7af', fontSize: 13, color: '#3d1622' }}>
                  {publicUrl}
                </code>
                <button
                  type="button"
                  className="admin-button admin-button-primary"
                  onClick={copyPublicUrl}
                  title="लिंक कॉपी करें"
                >
                  {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                  {copiedUrl ? 'कॉपी हुआ' : 'कॉपी'}
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`सादर आमंत्रण: ${wedding?.groomName} एवं ${wedding?.brideName} का शुभ विवाह। कृपया इस लिंक पर पधारें:\n${publicUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-button admin-button-quiet"
                  style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}
                  title="WhatsApp पर भेजें"
                >
                  <Share2 size={14} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Stats Cards */}
        <section className="photo-stats-grid" style={{ margin: '28px 0 36px' }}>
          <div className="photo-stat-card">
            <p className="photo-stat-label">कुल RSVP उत्तर</p>
            <h3 className="photo-stat-value">{stats?.totalSubmissions || 0}</h3>
            <span className="photo-stat-meta">फॉर्म भरने वाले परिवारों की संख्या</span>
          </div>

          <div className="photo-stat-card">
            <p className="photo-stat-label">पुष्ट उपस्थित मेहमान</p>
            <h3 className="photo-stat-value" style={{ color: '#2d7a46' }}>
              {stats?.confirmedAttendees || 0}
            </h3>
            <span className="photo-stat-meta">{stats?.confirmedSubmissions || 0} उपस्थित परिवारों से कुल व्यक्ति</span>
          </div>

          <div className="photo-stat-card">
            <p className="photo-stat-label">अस्वीकृत उत्तर</p>
            <h3 className="photo-stat-value" style={{ color: '#8c2d19' }}>
              {stats?.declinedResponses || 0}
            </h3>
            <span className="photo-stat-meta">जो उपस्थित नहीं हो पा रहे</span>
          </div>

          <div className="photo-stat-card">
            <p className="photo-stat-label">आमंत्रण स्थिति</p>
            <h3 className="photo-stat-value" style={{ fontSize: 20, color: wedding?.published ? '#2d7a46' : '#b8860b' }}>
              {wedding?.published ? '🟢 प्रकाशित' : '🟡 ड्राफ्ट'}
            </h3>
            <span className="photo-stat-meta">
              {wedding?.published ? 'मेहमान ऑनलाइन देख सकते हैं' : 'फोटोग्राफर समीक्षाधीन'}
            </span>
          </div>
        </section>

        {/* Dashboard Navigation Tabs */}
        <div className="wadmin-tabs-row">
          <button
            type="button"
            className={`wadmin-tab-btn ${activeTab === 'rsvp' ? 'active' : ''}`}
            onClick={() => setActiveTab('rsvp')}
          >
            <Users size={16} /> अतिथि सूची व उत्तर ({rsvps.length})
          </button>
          <button
            type="button"
            className={`wadmin-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <Sparkles size={16} /> विवाह विवरण व फ़ोटो
          </button>
          <button
            type="button"
            className={`wadmin-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            <ImageIcon size={16} /> तस्वीरें व वीडियो (४ फ़ोटो • १ वीडियो)
          </button>
        </div>

        {/* TAB 1: RSVP List */}
        {activeTab === 'rsvp' && (
          <section className="admin-panel" style={{ marginTop: 20 }}>
            {/* Filter & Search Bar */}
            <div className="wadmin-table-controls">
              <div className="photo-search-input" style={{ flex: 1, maxWidth: 360 }}>
                <Search size={16} color="#8a5c38" />
                <input
                  type="text"
                  placeholder="मेहमान के नाम या फ़ोन से खोजें…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="wadmin-filter-pill-group">
                  <button
                    type="button"
                    className={filterAttendance === 'all' ? 'active' : ''}
                    onClick={() => setFilterAttendance('all')}
                  >
                    सभी ({rsvps.length})
                  </button>
                  <button
                    type="button"
                    className={filterAttendance === 'yes' ? 'active' : ''}
                    onClick={() => setFilterAttendance('yes')}
                  >
                    आएँगे ({stats?.confirmedSubmissions || 0})
                  </button>
                  <button
                    type="button"
                    className={filterAttendance === 'no' ? 'active' : ''}
                    onClick={() => setFilterAttendance('no')}
                  >
                    नहीं आएँगे ({stats?.declinedResponses || 0})
                  </button>
                </div>

                <a
                  href={getWeddingAdminExportUrl()}
                  download
                  className="admin-button admin-button-quiet"
                  title="CSV में डाउनलोड करें"
                >
                  <Download size={14} /> CSV एक्सपोर्ट
                </a>

                <button
                  type="button"
                  className="admin-button admin-button-quiet"
                  onClick={loadDashboard}
                  title="रीफ़्रेश करें"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Guest Submissions Table */}
            {filteredRsvps.length === 0 ? (
              <div className="admin-empty" style={{ padding: '60px 20px' }}>
                <Users size={32} color="#b8860b" />
                <strong>कोई RSVP रिकॉर्ड नहीं मिला</strong>
                <p>
                  {searchQuery || filterAttendance !== 'all'
                    ? 'फ़िल्टर या खोज शब्द बदलकर पुनः प्रयास करें।'
                    : 'मेहमानों द्वारा आमंत्रण पर उत्तर देने पर वे यहाँ तुरंत दिखाई देंगे।'}
                </p>
              </div>
            ) : (
              <div className="admin-rsvp-table" style={{ marginTop: 16 }}>
                <div className="admin-rsvp-row admin-rsvp-head">
                  <span>मेहमान का नाम / संपर्क</span>
                  <span>स्थिति</span>
                  <span>कुल व्यक्ति</span>
                  <span>समारोह (Events)</span>
                  <span>शुभकामना संदेश</span>
                  <span>दिनांक</span>
                </div>

                {filteredRsvps.map((rsvp) => (
                  <div className="admin-rsvp-row" key={rsvp.id}>
                    <span>
                      <strong style={{ color: '#2a0d15', fontSize: 14 }}>{rsvp.name}</strong>
                      <small style={{ color: '#7a5240', fontSize: 12 }}>
                        {rsvp.phone || 'फ़ोन साझा नहीं किया'}
                      </small>
                    </span>

                    <span>
                      {rsvp.attendance === 'yes' ? (
                        <span className="wadmin-status-pill pill-yes">
                          <UserCheck size={12} /> आएँगे
                        </span>
                      ) : (
                        <span className="wadmin-status-pill pill-no">
                          <UserX size={12} /> नहीं आ पाएँगे
                        </span>
                      )}
                    </span>

                    <span>
                      {rsvp.attendance === 'yes' ? (
                        <strong style={{ color: '#2d7a46', fontSize: 15 }}>
                          {rsvp.guests || 1} व्यक्ति
                        </strong>
                      ) : (
                        <span style={{ color: '#888' }}>—</span>
                      )}
                    </span>

                    <span>
                      {Array.isArray(rsvp.selectedEvents) && rsvp.selectedEvents.length > 0 ? (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {rsvp.selectedEvents.map((ev) => (
                            <span key={ev} className="wadmin-event-tag">
                              {ev}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#888', fontSize: 12 }}>समस्त कार्यक्रम</span>
                      )}
                    </span>

                    <span style={{ fontStyle: rsvp.message ? 'normal' : 'italic', color: rsvp.message ? '#3d1622' : '#888' }}>
                      {rsvp.message || 'कोई संदेश नहीं'}
                    </span>

                    <span style={{ fontSize: 11, color: '#7a5240' }}>
                      {rsvp.submittedAt
                        ? new Date(rsvp.submittedAt).toLocaleDateString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: Wedding Details & Photos */}
        {activeTab === 'details' && settingsDraft && (
          <form className="admin-panel" onSubmit={handleSaveSettings} style={{ marginTop: 20 }}>
            <div className="admin-section-title">
              <span>०१</span>
              <div>
                <h2>दूल्हा और दुल्हन की पारंपरिक तस्वीरें</h2>
                <p>यहाँ जोड़ी गई तस्वीरें आमंत्रण में पारंपरिक राजस्थानी मेहराब (झरोखा) फ़्रेम में दिखाई देंगी।</p>
              </div>
            </div>

            {/* Couple Photos */}
            {/* Preview Mode Selector */}
            <div className="admin-preview-mode-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fdf6ed', padding: '8px 14px', borderRadius: 6, margin: '14px 0' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#682536' }}>तस्वीर पूर्वावलोकन मोड (Preview Frame):</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className={`admin-button ${portraitPreviewMode === 'mobile' ? 'admin-button-primary' : 'admin-button-quiet'}`}
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={() => setPortraitPreviewMode('mobile')}
                >
                  📱 मोबाइल (390px)
                </button>
                <button
                  type="button"
                  className={`admin-button ${portraitPreviewMode === 'desktop' ? 'admin-button-primary' : 'admin-button-quiet'}`}
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={() => setPortraitPreviewMode('desktop')}
                >
                  💻 डेस्कटॉप
                </button>
              </div>
            </div>

            {/* Couple Photos with Focal Point Selectors */}
            <div className="admin-two-cols" style={{ margin: '20px 0' }}>
              <div className="photo-upload-cell">
                <strong>दुल्हन की तस्वीर (Bride Portrait)</strong>
                <div style={{ margin: '12px 0', maxWidth: portraitPreviewMode === 'mobile' ? 200 : 260, marginInline: 'auto' }}>
                  <RajPortrait
                    src={settingsDraft.bridePhoto}
                    alt={settingsDraft.brideName}
                    placeholder="दुल्हन"
                    focalPosition={settingsDraft.bridePhotoFocalMobile || '50% 18%'}
                  />
                </div>
                <div style={{ margin: '8px 0' }}>
                  <label className="admin-field" style={{ fontSize: 12, marginBottom: 6 }}>
                    मोबाइल फ़ोकस बिंदु (चेहरे की सुरक्षा):
                    <select
                      value={settingsDraft.bridePhotoFocalMobile || '50% 18%'}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({
                          ...s,
                          bridePhotoFocalMobile: e.target.value,
                          bridePhotoFocalDesktop: e.target.value,
                        }))
                      }
                      style={{ fontSize: 12, padding: '4px 8px' }}
                    >
                      <option value="50% 18%">चेहरा व सिर (शीर्ष 18% - अनुशंसित)</option>
                      <option value="50% 30%">ऊपरी शरीर / बस्ट शॉट (30%)</option>
                      <option value="50% 50%">मध्य भाग (Center 50%)</option>
                      <option value="50% 70%">निचला हिस्सा (70%)</option>
                    </select>
                  </label>
                </div>
                <label className="admin-button admin-button-quiet" style={{ display: 'inline-flex' }}>
                  <Upload size={14} /> {busyUpload ? 'अपलोड हो रहा है…' : 'फ़ोटो चुनें'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload('bridePhoto', e.target.files?.[0])}
                  />
                </label>
                {settingsDraft.bridePhoto && (
                  <button
                    type="button"
                    className="admin-text-danger"
                    style={{ marginLeft: 10 }}
                    onClick={() => setSettingsDraft((s) => ({ ...s, bridePhoto: '' }))}
                  >
                    हटाएँ
                  </button>
                )}
              </div>

              <div className="photo-upload-cell">
                <strong>दूल्हे की तस्वीर (Groom Portrait)</strong>
                <div style={{ margin: '12px 0', maxWidth: portraitPreviewMode === 'mobile' ? 200 : 260, marginInline: 'auto' }}>
                  <RajPortrait
                    src={settingsDraft.groomPhoto}
                    alt={settingsDraft.groomName}
                    placeholder="दूल्हा"
                    focalPosition={settingsDraft.groomPhotoFocalMobile || '50% 16%'}
                  />
                </div>
                <div style={{ margin: '8px 0' }}>
                  <label className="admin-field" style={{ fontSize: 12, marginBottom: 6 }}>
                    मोबाइल फ़ोकस बिंदु (चेहरे की सुरक्षा):
                    <select
                      value={settingsDraft.groomPhotoFocalMobile || '50% 16%'}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({
                          ...s,
                          groomPhotoFocalMobile: e.target.value,
                          groomPhotoFocalDesktop: e.target.value,
                        }))
                      }
                      style={{ fontSize: 12, padding: '4px 8px' }}
                    >
                      <option value="50% 16%">चेहरा व पगड़ी (शीर्ष 16% - अनुशंसित)</option>
                      <option value="50% 30%">ऊपरी शरीर / बस्ट शॉट (30%)</option>
                      <option value="50% 50%">मध्य भाग (Center 50%)</option>
                      <option value="50% 70%">निचला हिस्सा (70%)</option>
                    </select>
                  </label>
                </div>
                <label className="admin-button admin-button-quiet" style={{ display: 'inline-flex' }}>
                  <Upload size={14} /> {busyUpload ? 'अपलोड हो रहा है…' : 'फ़ोटो चुनें'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload('groomPhoto', e.target.files?.[0])}
                  />
                </label>
                {settingsDraft.groomPhoto && (
                  <button
                    type="button"
                    className="admin-text-danger"
                    style={{ marginLeft: 10 }}
                    onClick={() => setSettingsDraft((s) => ({ ...s, groomPhoto: '' }))}
                  >
                    हटाएँ
                  </button>
                )}
              </div>
            </div>

            <div className="admin-section-title" style={{ marginTop: 32 }}>
              <span>०२</span>
              <div>
                <h2>विवाह स्थल व पारिवारिक संदेश</h2>
                <p>स्थल का पता और मेहमानों के लिए आशीर्वाद श्लोक</p>
              </div>
            </div>

            <div className="admin-two-cols">
              <label className="admin-field">
                विवाह तिथि (कैलेंडर से चयन करें)
                <div className="calendar-picker-input-wrap">
                  <input
                    id="admin-wedding-date-picker"
                    type="date"
                    className="native-calendar-input"
                    value={extractDateInputVal(settingsDraft.weddingDate) || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      const hindi = formatCalendarDateToHindi(val, true)
                      setSettingsDraft((s) => ({
                        ...s,
                        weddingDate: val ? `${val}T18:30:00+05:30` : s.weddingDate,
                        weddingDateLabel: hindi || s.weddingDateLabel,
                      }))
                    }}
                  />
                  <button
                    type="button"
                    className="calendar-open-trigger-btn"
                    onClick={() => {
                      const el = document.getElementById('admin-wedding-date-picker')
                      if (el) {
                        if (typeof el.showPicker === 'function') el.showPicker()
                        else el.focus()
                      }
                    }}
                  >
                    <Calendar size={15} /> कैलेंडर खोलें
                  </button>
                  <input
                    type="text"
                    className="date-display-preview-input"
                    value={settingsDraft.weddingDateLabel || ''}
                    placeholder="कैलेंडर से चुनें या लिखें"
                    onClick={() => {
                      const el = document.getElementById('admin-wedding-date-picker')
                      if (el && typeof el.showPicker === 'function') el.showPicker()
                    }}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({ ...s, weddingDateLabel: e.target.value }))
                    }
                  />
                </div>
              </label>

              <label className="admin-field">
                शुभ मुहूर्त / समय (घड़ी से चयन करें)
                <div className="calendar-picker-input-wrap">
                  <input
                    id="admin-wedding-time-picker"
                    type="time"
                    className="native-calendar-input"
                    value={extractTimeInputVal(settingsDraft.weddingTimeLabel) || '19:00'}
                    onChange={(e) => {
                      const val = e.target.value
                      const hindi = formatTimeToHindi(val)
                      setSettingsDraft((s) => ({
                        ...s,
                        weddingTimeLabel: hindi || s.weddingTimeLabel,
                      }))
                    }}
                  />
                  <button
                    type="button"
                    className="calendar-open-trigger-btn"
                    onClick={() => {
                      const el = document.getElementById('admin-wedding-time-picker')
                      if (el) {
                        if (typeof el.showPicker === 'function') el.showPicker()
                        else el.focus()
                      }
                    }}
                  >
                    <Clock size={15} /> समय चुनें
                  </button>
                  <input
                    type="text"
                    className="date-display-preview-input"
                    value={settingsDraft.weddingTimeLabel || ''}
                    placeholder="घड़ी से चुनें या लिखें"
                    onClick={() => {
                      const el = document.getElementById('admin-wedding-time-picker')
                      if (el && typeof el.showPicker === 'function') el.showPicker()
                    }}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({ ...s, weddingTimeLabel: e.target.value }))
                    }
                  />
                </div>
                <div className="quick-time-chips">
                  <span style={{ fontSize: 10, color: '#8a5c38', alignSelf: 'center', marginRight: 2 }}>
                    त्वरित:
                  </span>
                  {[
                    { label: '१०:०० AM', val: '10:00' },
                    { label: '१२:३० PM', val: '12:30' },
                    { label: '०५:०० PM', val: '17:00' },
                    { label: '०७:०० PM', val: '19:00' },
                    { label: '०८:३० PM', val: '20:30' },
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      className="time-chip-btn"
                      onClick={() => {
                        const hindi = formatTimeToHindi(chip.val)
                        setSettingsDraft((s) => ({ ...s, weddingTimeLabel: hindi }))
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            {/* Palace & Google Maps Section */}
            <div className="venue-preset-selector-box" style={{ marginTop: 8 }}>
              <span className="venue-preset-selector-label">
                <MapPin size={13} style={{ display: 'inline', verticalAlign: '-2px', color: '#b8860b' }} />{' '}
                शाही महल / वेन्यू विकल्प से चुनें (Quick Palace & City Selection):
              </span>
              <select
                className="venue-preset-dropdown"
                defaultValue=""
                onChange={(e) => {
                  const palace = FAMOUS_ROYAL_PALACES.find((p) => p.id === e.target.value)
                  if (palace) {
                    setSettingsDraft((s) => ({
                      ...s,
                      venue: {
                        ...(s.venue || {}),
                        name: palace.name,
                        city: palace.city,
                        address: palace.address,
                        googleMapsQuery: palace.googleMapsQuery,
                      },
                    }))
                    setNotice(`"${palace.name}" (${palace.city}) का वेन्यू व मैप लिंक सेट हो गया।`)
                  }
                }}
              >
                <option value="">-- राजस्थान व भारत के प्रसिद्ध शाही महल चुनें --</option>
                {VENUE_REGIONS.map((region) => (
                  <optgroup key={region} label={region}>
                    {FAMOUS_ROYAL_PALACES.filter((p) => p.region === region).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.city}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <label className="admin-field">
              Google Maps सटीक लोकेशन लिंक (Direct Maps Link)
              <div className="map-link-input-group">
                <input
                  value={settingsDraft.venue?.googleMapsQuery || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    const parsed = extractPalaceAndCityFromMapUrl(val)
                    setSettingsDraft((s) => ({
                      ...s,
                      venue: {
                        ...(s.venue || {}),
                        googleMapsQuery: val,
                        ...(parsed.hasDetails
                          ? {
                              name: parsed.name || s.venue?.name || '',
                              city: parsed.city || s.venue?.city || '',
                              address: parsed.address || s.venue?.address || '',
                            }
                          : {}),
                      },
                    }))
                    if (parsed.hasDetails && parsed.name && parsed.city) {
                      setNotice(`मैप लिंक से "${parsed.name}, ${parsed.city}" स्वतः पहचान लिया गया!`)
                    }
                  }}
                  placeholder="https://maps.app.goo.gl/... या Google Maps लिंक पेस्ट करें"
                />
                {(settingsDraft.venue?.googleMapsQuery || settingsDraft.venue?.name) && (
                  <a
                    href={getGoogleMapsDestinationUrl(settingsDraft.venue)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-action-btn"
                    title="Google Maps पर खोलकर जांचें"
                  >
                    <ExternalLink size={13} /> मैप जांचें
                  </a>
                )}
              </div>
              <small style={{ color: '#8a5c38', fontSize: 11, marginTop: 4, display: 'block' }}>
                💡 Google Maps ऐप अथवा ब्राउज़र से 'Share Link' (उदा. maps.app.goo.gl या google.com/maps) यहाँ पेस्ट करें।
              </small>
            </label>

            <div className="admin-two-cols">
              <label className="admin-field">
                विवाह स्थल / पैलेस का नाम (Palace / Venue)
                <input
                  value={settingsDraft.venue?.name || ''}
                  onChange={(e) =>
                    setSettingsDraft((s) => ({
                      ...s,
                      venue: { ...(s.venue || {}), name: e.target.value },
                    }))
                  }
                  placeholder="जैसे, रामबाग पैलेस / सिटी पैलेस"
                />
              </label>
              <label className="admin-field">
                शहर (City)
                <input
                  value={settingsDraft.venue?.city || ''}
                  onChange={(e) =>
                    setSettingsDraft((s) => ({
                      ...s,
                      venue: { ...(s.venue || {}), city: e.target.value },
                    }))
                  }
                  placeholder="जैसे, जयपुर, राजस्थान"
                />
              </label>
            </div>

            <label className="admin-field">
              पूरा पता (Full Address)
              <input
                value={settingsDraft.venue?.address || ''}
                onChange={(e) =>
                  setSettingsDraft((s) => ({
                    ...s,
                    venue: { ...(s.venue || {}), address: e.target.value },
                  }))
                }
                placeholder="जैसे, भवानी सिंह रोड, जयपुर, राजस्थान ३०२००५"
              />
            </label>

            <label className="admin-field">
              परिवार का संदेश
              <input
                value={settingsDraft.familyLine || ''}
                onChange={(e) =>
                  setSettingsDraft((s) => ({ ...s, familyLine: e.target.value }))
                }
              />
            </label>

            <label className="admin-field">
              शुभाशीष श्लोक
              <textarea
                rows={2}
                value={settingsDraft.blessing || ''}
                onChange={(e) =>
                  setSettingsDraft((s) => ({ ...s, blessing: e.target.value }))
                }
              />
            </label>

            <div className="admin-form-actions" style={{ marginTop: 28 }}>
              <button
                type="submit"
                disabled={busySaveSettings || busyUpload}
                className="admin-button admin-button-primary"
              >
                <Save size={16} /> {busySaveSettings ? 'सुरक्षित हो रहा है…' : 'बदलाव सुरक्षित करें'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Photos and Video (Max 4 Photos • 1 Video) */}
        {activeTab === 'media' && settingsDraft && (
          <form onSubmit={handleSaveSettings} className="admin-panel" style={{ marginTop: 20, padding: 24 }}>
            {/* Photo Gallery Box: Max 4 photos */}
            <div className="media-manager-card">
              <div className="media-manager-card-head">
                <div>
                  <strong style={{ fontSize: 16, color: '#3d1622', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ImageIcon size={18} color="#8c2d19" /> मांगलिक चित्र दीर्घा (अधिकतम ४ तस्वीरें)
                  </strong>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7a5240' }}>
                    अधिकतम ४ तस्वीरें जोड़ सकते हैं। आमंत्रण पर चित्रों पर कोई शीर्षक नहीं दिखेगा।
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#3d1622', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(settingsDraft.hideGallery)}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({ ...s, hideGallery: e.target.checked }))
                      }
                    />
                    गैलरी छुपाएँ (Hide Gallery)
                  </label>
                  <button
                    type="button"
                    className="admin-button admin-button-quiet"
                    style={{ fontSize: 11, padding: '4px 8px' }}
                    onClick={handleSetDemoGallery}
                  >
                    ४ डेमो फ़ोटो का उपयोग करें
                  </button>
                </div>
              </div>

              {/* 4 Photo Slots */}
              <div className="media-grid-4">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const curPhoto = (settingsDraft.gallery || [])[slotIdx]
                  return (
                    <div
                      key={slotIdx}
                      className={`media-slot-cell ${curPhoto ? 'has-media' : ''}`}
                    >
                      <span className="media-slot-badge">{slotIdx + 1}</span>
                      {curPhoto?.url ? (
                        <>
                          <img
                            src={curPhoto.url}
                            alt={`तस्वीर ${slotIdx + 1}`}
                            className="media-slot-thumb"
                          />
                          <div className="media-slot-actions">
                            <label
                              className="admin-button admin-button-quiet"
                              style={{ fontSize: 11, padding: '3px 8px', cursor: 'pointer' }}
                            >
                              बदलें
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) =>
                                  handleGalleryPhotoUpload(slotIdx, e.target.files?.[0])
                                }
                              />
                            </label>
                            <button
                              type="button"
                              className="admin-text-danger"
                              style={{ fontSize: 11 }}
                              onClick={() => handleRemoveGalleryPhoto(slotIdx)}
                            >
                              हटाएँ
                            </button>
                          </div>
                        </>
                      ) : (
                        <div>
                          <ImagePlus size={24} color="#b8860b" style={{ margin: '0 auto 6px' }} />
                          <p style={{ margin: '0 0 6px', fontSize: 11, color: '#8a5c38' }}>
                            स्लॉट {slotIdx + 1} खाली
                          </p>
                          <label
                            className="admin-button admin-button-primary"
                            style={{ fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}
                          >
                            + तस्वीर जोड़ें
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) =>
                                handleGalleryPhotoUpload(slotIdx, e.target.files?.[0])
                              }
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Single Video Box: Exactly 1 Video */}
            <div className="media-manager-card">
              <div className="media-manager-card-head">
                <div>
                  <strong style={{ fontSize: 16, color: '#3d1622', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Film size={18} color="#8c2d19" /> सिनेमैटिक विवाह वीडियो / रील्स (१ वीडियो)
                  </strong>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7a5240' }}>
                    १ मुख्य वीडियो अपलोड या लिंक कर सकते हैं (9:16 रील्स अथवा 16:9 सिनेमैटिक फ़िल्म)।
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#3d1622', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(settingsDraft.hideVideo)}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({ ...s, hideVideo: e.target.checked }))
                      }
                    />
                    वीडियो छुपाएँ (Hide Video)
                  </label>
                  <button
                    type="button"
                    className="admin-button admin-button-quiet"
                    style={{ fontSize: 11, padding: '4px 8px' }}
                    onClick={handleSetDemoVideo}
                  >
                    डेमो वीडियो का उपयोग करें
                  </button>
                </div>
              </div>

              {(() => {
                const curVideo = (settingsDraft.videos || [])[0] || {}
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                    <div>
                      <label className="admin-field">
                        वीडियो फ़ॉर्मेट / अनुपात
                        <select
                          value={curVideo.aspect || '9:16'}
                          onChange={(e) => {
                            const aspect = e.target.value
                            setSettingsDraft((s) => ({
                              ...s,
                              videos: [{ ...(s.videos?.[0] || {}), id: 'primary-video', aspect }],
                            }))
                          }}
                        >
                          <option value="9:16">📱 9:16 पोर्ट्रेट (मोबाइल रील्स - अनुशंसित)</option>
                          <option value="16:9">💻 16:9 वाइडस्क्रीन (सिनेमैटिक फ़िल्म)</option>
                        </select>
                      </label>

                      <label className="admin-field">
                        वीडियो URL (MP4 / WebM / वीडियो लिंक)
                        <input
                          value={curVideo.videoUrl || ''}
                          onChange={(e) => {
                            const videoUrl = e.target.value
                            setSettingsDraft((s) => ({
                              ...s,
                              videos: [{ ...(s.videos?.[0] || {}), id: 'primary-video', videoUrl }],
                            }))
                          }}
                          placeholder="https://example.com/wedding-reel.mp4"
                        />
                      </label>

                      <div style={{ marginTop: 10 }}>
                        <label className="admin-field" style={{ marginBottom: 4 }}>
                          वीडियो पोस्टर / कवर चित्र
                        </label>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <label className="admin-button admin-button-quiet" style={{ cursor: 'pointer' }}>
                            <Upload size={14} /> पोस्टर अपलोड करें
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleVideoPosterUpload(e.target.files?.[0])}
                            />
                          </label>
                          {curVideo.poster && (
                            <button
                              type="button"
                              className="admin-text-danger"
                              style={{ fontSize: 12 }}
                              onClick={() => {
                                setSettingsDraft((s) => ({
                                  ...s,
                                  videos: [{ ...(s.videos?.[0] || {}), poster: '' }],
                                }))
                              }}
                            >
                              पोस्टर हटाएँ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', background: '#faf4e8', padding: 12, borderRadius: 8, border: '1px solid #ebd7af' }}>
                      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#682536' }}>
                        वीडियो पोस्टर पूर्वावलोकन (Preview)
                      </p>
                      {curVideo.poster ? (
                        <img
                          src={curVideo.poster}
                          alt="वीडियो पोस्टर"
                          style={{
                            maxHeight: 180,
                            maxWidth: '100%',
                            aspectRatio: curVideo.aspect === '16:9' ? '16/9' : '9/16',
                            objectFit: 'cover',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            margin: '0 auto',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div style={{ padding: 30, color: '#8a5c38', fontSize: 12 }}>
                          कोई पोस्टर अपलोड नहीं है। (डेमो पोस्टर दिखेगा)
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="admin-form-actions" style={{ marginTop: 28 }}>
              <button
                type="submit"
                disabled={busySaveSettings || busyUpload}
                className="admin-button admin-button-primary"
              >
                <Save size={16} /> {busySaveSettings ? 'सुरक्षित हो रहा है…' : 'बदलाव सुरक्षित करें'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
