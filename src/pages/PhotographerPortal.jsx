import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FilePlus2,
  Film,
  Image as ImageIcon,
  ImagePlus,
  KeyRound,
  Lock,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Share2,
  Trash2,
  Upload,
  Users,
  X,
  Sparkles,
} from 'lucide-react'
import {
  checkSession,
  photographerLogin,
  logout,
  fetchPhotographerWeddings,
  fetchPhotographerStats,
  createWedding,
  fetchPhotographerWedding,
  updatePhotographerWedding,
  togglePublishWedding,
  resetWeddingAdminPin,
  deleteWedding,
} from '../lib/api.js'
import { compressImageFile } from '../lib/weddingSettings.js'
import { RajPortrait } from '../components/RajPortrait.jsx'
import {
  STANDARD_WEDDING_EVENTS,
  EVENT_CATEGORIES,
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

export default function PhotographerPortal() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [busyLogin, setBusyLogin] = useState(false)

  // Data states
  const [weddings, setWeddings] = useState([])
  const [stats, setStats] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [notice, setNotice] = useState('')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWeddingDraft, setNewWeddingDraft] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    weddingDateLabel: '',
    weddingTimeLabel: '',
    venueName: '',
    venueCity: 'जयपुर, राजस्थान',
    venueAddress: '',
    googleMapsQuery: '',
    customSlug: '',
    customPin: '',
  })
  const [busyCreate, setBusyCreate] = useState(false)

  // PIN visibility and customization states
  const [visiblePins, setVisiblePins] = useState({}) // { [weddingId]: boolean }
  const [customPinModal, setCustomPinModal] = useState(null) // wedding obj
  const [customPinDraft, setCustomPinDraft] = useState('')
  const [busyCustomPin, setBusyCustomPin] = useState(false)
  const [currentCopiedPinId, setCurrentCopiedPinId] = useState(null)

  // Newly generated PIN display confirmation modal
  const [singlePinDisplay, setSinglePinDisplay] = useState(null) // { pin, weddingTitle, slug, type: 'created' | 'reset' }
  const [copiedPin, setCopiedPin] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState('')

  // Edit Wedding Modal
  const [editingWedding, setEditingWedding] = useState(null)
  const [editTab, setEditTab] = useState('details') // 'details' | 'events' | 'pages'
  const [busySaveEdit, setBusySaveEdit] = useState(false)
  const [busyUpload, setBusyUpload] = useState(false)
  const [portraitPreviewMode, setPortraitPreviewMode] = useState('mobile')

  // Initial session check
  useEffect(() => {
    checkSession()
      .then((res) => {
        if (res.authenticated && res.role === 'photographer') {
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
      const [wRes, sRes] = await Promise.all([
        fetchPhotographerWeddings(),
        fetchPhotographerStats(),
      ])
      setWeddings(wRes.weddings || [])
      setStats(sRes || null)
    } catch (err) {
      showNotice(err.message || 'डैशबोर्ड लोड नहीं हुआ।')
    }
  }

  const showNotice = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice((cur) => (cur === msg ? '' : cur)), 6000)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setBusyLogin(true)
    try {
      await photographerLogin(pinInput.trim())
      setAuthenticated(true)
      setPinInput('')
      await loadDashboard()
    } catch (err) {
      setLoginError(err.message || 'अमान्य पिन दर्ज किया गया।')
    } finally {
      setBusyLogin(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setAuthenticated(false)
    setWeddings([])
    setStats(null)
  }

  const handleCreateWedding = async (e) => {
    e.preventDefault()
    setBusyCreate(true)
    try {
      const res = await createWedding({
        brideName: newWeddingDraft.brideName,
        groomName: newWeddingDraft.groomName,
        weddingDate: newWeddingDraft.weddingDate ? `${newWeddingDraft.weddingDate}:00+05:30` : '',
        weddingDateLabel: newWeddingDraft.weddingDateLabel,
        weddingTimeLabel: newWeddingDraft.weddingTimeLabel,
        venue: {
          name: newWeddingDraft.venueName,
          city: newWeddingDraft.venueCity,
          address: newWeddingDraft.venueAddress || '',
          googleMapsQuery: newWeddingDraft.googleMapsQuery || '',
        },
        customSlug: newWeddingDraft.customSlug,
        customPin: newWeddingDraft.customPin,
      })

      setShowCreateModal(false)
      setNewWeddingDraft({
        brideName: '',
        groomName: '',
        weddingDate: '',
        weddingDateLabel: '',
        weddingTimeLabel: '',
        venueName: '',
        venueCity: 'जयपुर, राजस्थान',
        venueAddress: '',
        googleMapsQuery: '',
        customSlug: '',
        customPin: '',
      })

      // Show generated PIN confirmation
      setSinglePinDisplay({
        pin: res.adminPin,
        weddingTitle: `${res.wedding.groomName} एवं ${res.wedding.brideName}`,
        slug: res.wedding.slug,
        type: 'created',
      })

      await loadDashboard()
    } catch (err) {
      alert(err.message || 'प्रोजेक्ट नहीं बन सका।')
    } finally {
      setBusyCreate(false)
    }
  }

  const handleTogglePublish = async (wedding) => {
    try {
      const res = await togglePublishWedding(wedding.id)
      setWeddings((prev) =>
        prev.map((w) => (w.id === wedding.id ? { ...w, published: res.published } : w))
      )
      showNotice(
        res.published
          ? `“${wedding.groomName} weds ${wedding.brideName}” प्रकाशित कर दिया गया है।`
          : `“${wedding.groomName} weds ${wedding.brideName}” अप्रकाशित (ड्राफ्ट) कर दिया गया है।`
      )
      loadDashboard()
    } catch (err) {
      showNotice(err.message || 'स्थिति नहीं बदली जा सकी।')
    }
  }

  const handleResetPin = async (wedding) => {
    const confirmReset = window.confirm(
      `क्या आप “${wedding.groomName} एवं ${wedding.brideName}” का व्यवस्थापक PIN नया जनरेट करना चाहते हैं?\n\nनया 8-अंकीय PIN स्वतः सेट हो जाएगा और यहाँ दिखाई देगा।`
    )
    if (!confirmReset) return

    try {
      const res = await resetWeddingAdminPin(wedding.id)
      setWeddings((prev) =>
        prev.map((w) => (w.id === wedding.id ? { ...w, adminPin: res.adminPin } : w))
      )
      setSinglePinDisplay({
        pin: res.adminPin,
        weddingTitle: `${wedding.groomName} एवं ${wedding.brideName}`,
        slug: wedding.slug,
        type: 'reset',
      })
      showNotice('नया पिन सफलतापूर्वक जनरेट व सहेज लिया गया है।')
    } catch (err) {
      showNotice(err.message || 'पिन रीसेट नहीं हुआ।')
    }
  }

  const openCustomPinModal = (wedding) => {
    setCustomPinModal(wedding)
    setCustomPinDraft(wedding.adminPin || '')
  }

  const handleSaveCustomPin = async (e) => {
    e.preventDefault()
    if (!customPinModal || !customPinDraft.trim()) return
    setBusyCustomPin(true)
    try {
      const res = await resetWeddingAdminPin(customPinModal.id, customPinDraft.trim())
      setWeddings((prev) =>
        prev.map((w) => (w.id === customPinModal.id ? { ...w, adminPin: res.adminPin } : w))
      )
      showNotice(`“${customPinModal.groomName} एवं ${customPinModal.brideName}” का नया PIN (${res.adminPin}) सेट हो गया!`)
      setCustomPinModal(null)
    } catch (err) {
      alert(err.message || 'कस्टम PIN सेट नहीं हो सका।')
    } finally {
      setBusyCustomPin(false)
    }
  }

  const togglePinVisibility = (weddingId) => {
    setVisiblePins((prev) => ({
      ...prev,
      [weddingId]: prev[weddingId] === false ? true : false,
    }))
  }

  const handleDeleteWedding = async (wedding) => {
    const confirmDel = window.confirm(
      `क्या आप निश्चित रूप से “${wedding.groomName} एवं ${wedding.brideName}” प्रोजेक्ट को हटाना/आर्काइव करना चाहते हैं?\n\nयह आमंत्रण अप्रकाशित हो जाएगा और इसके व्यवस्थापक सत्र समाप्त हो जाएँगे।`
    )
    if (!confirmDel) return

    try {
      await deleteWedding(wedding.id)
      showNotice('प्रोजेक्ट हटा दिया गया।')
      await loadDashboard()
    } catch (err) {
      showNotice(err.message || 'प्रोजेक्ट नहीं हटाया जा सका।')
    }
  }

  const openEditModal = async (weddingSummary) => {
    try {
      const full = await fetchPhotographerWedding(weddingSummary.id)
      setEditingWedding(full.wedding)
      setEditTab('details')
    } catch (err) {
      showNotice(err.message || 'विवरण लोड नहीं हो सका।')
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingWedding) return
    setBusySaveEdit(true)
    try {
      await updatePhotographerWedding(editingWedding.id, editingWedding)
      showNotice('विवाह विवरण सफलतापूर्वक सुरक्षित हुए।')
      setEditingWedding(null)
      await loadDashboard()
    } catch (err) {
      showNotice(err.message || 'सेव नहीं हो सका।')
    } finally {
      setBusySaveEdit(false)
    }
  }

  const handleImageUpload = async (field, file) => {
    if (!file || !editingWedding) return
    setBusyUpload(true)
    try {
      const compressed = await compressImageFile(file, 1400, 0.82)
      setEditingWedding((prev) => ({ ...prev, [field]: compressed }))
      showNotice('चित्र प्रोसेस हो गया। बदलाव सुरक्षित करने के लिए सेव बटन दबाएँ।')
    } catch (err) {
      showNotice(err.message || 'चित्र अपलोड नहीं हो सका।')
    } finally {
      setBusyUpload(false)
    }
  }

  const handleGalleryPhotoUpload = async (index, file) => {
    if (!file || !editingWedding) return
    setBusyUpload(true)
    try {
      const compressed = await compressImageFile(file, 1400, 0.82)
      setEditingWedding((prev) => {
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
      showNotice('गैलरी तस्वीर प्रोसेस हो गई।')
    } catch (err) {
      showNotice(err.message || 'तस्वीर अपलोड नहीं हो सकी।')
    } finally {
      setBusyUpload(false)
    }
  }

  const handleRemoveGalleryPhoto = (index) => {
    setEditingWedding((prev) => {
      const cur = Array.isArray(prev.gallery) ? [...prev.gallery] : []
      cur.splice(index, 1)
      return { ...prev, gallery: cur }
    })
    showNotice('तस्वीर हटा दी गई।')
  }

  const handleSetDemoGallery = () => {
    setEditingWedding((prev) => ({
      ...prev,
      hideGallery: false,
      gallery: [
        { id: 'demo-g-1', url: '/images/gallery-haldi.jpg', aspect: '4:3' },
        { id: 'demo-g-2', url: '/images/gallery-sangeet.jpg', aspect: '4:3' },
        { id: 'demo-g-3', url: prev.bridePhoto || '/images/bride-priya.jpg', aspect: '3:4' },
        { id: 'demo-g-4', url: prev.groomPhoto || '/images/groom-rahul.jpg', aspect: '3:4' },
      ],
    }))
    showNotice('४ डेमो तस्वीरें सेट कर दी गईं।')
  }

  const handleSetDemoVideo = () => {
    setEditingWedding((prev) => ({
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
    showNotice('डेमो वीडियो सेट कर दिया गया।')
  }

  const handleVideoPosterUpload = async (file) => {
    if (!file || !editingWedding) return
    setBusyUpload(true)
    try {
      const compressed = await compressImageFile(file, 1200, 0.82)
      setEditingWedding((prev) => {
        const cur = Array.isArray(prev.videos) && prev.videos.length > 0
          ? { ...prev.videos[0], poster: compressed }
          : { id: `vid-${Date.now()}`, aspect: '9:16', poster: compressed, videoUrl: '' }
        return { ...prev, videos: [cur] }
      })
      showNotice('वीडियो पोस्टर प्रोसेस हो गया।')
    } catch (err) {
      showNotice(err.message || 'पोस्टर अपलोड नहीं हो सका।')
    } finally {
      setBusyUpload(false)
    }
  }

  const EVENT_CATEGORIES = [
    'मांगलिक शुभारंभ (Pre-Wedding Rituals)',
    'उत्सव व रस्में (Celebrations)',
    'शाही विवाह मुख्य रस्में (Wedding Main Rituals)',
    'विवाहोपरांत रस्में (Post-Wedding Rituals)',
    'अन्य कार्यक्रम (Custom)',
  ]

  const handleApplyEventPreset = (idx, presetId) => {
    const preset = STANDARD_WEDDING_EVENTS.find((p) => p.id === presetId)
    if (!preset) return
    setEditingWedding((w) => ({
      ...w,
      events: (w.events || []).map((it, i) => {
        if (i !== idx) return it
        const rawTime = it.rawTime || preset.defaultTime || '19:00'
        const time = it.time || formatTimeToHindi(rawTime)
        return {
          ...it,
          presetId: preset.id,
          title: preset.title,
          subtitle: preset.subtitle,
          description: preset.description,
          attire: preset.attire,
          icon: preset.icon,
          rawTime,
          time,
        }
      }),
    }))
    showNotice(`"${preset.title}" के विवरण लागू हो गए।`)
  }

  const handleAddEventFromPreset = (presetId) => {
    const preset = STANDARD_WEDDING_EVENTS.find((p) => p.id === presetId)
    if (!preset) return
    const rawTime = preset.defaultTime || '19:00'
    const newEv = {
      id: `${preset.id}-${Date.now()}`,
      presetId: preset.id,
      title: preset.title,
      subtitle: preset.subtitle,
      description: preset.description,
      attire: preset.attire,
      icon: preset.icon,
      date: editingWedding?.weddingDateLabel || '',
      rawDate: extractDateInputVal(editingWedding?.weddingDate) || '',
      rawTime,
      time: formatTimeToHindi(rawTime),
    }
    setEditingWedding((w) => ({
      ...w,
      events: [...(w.events || []), newEv],
    }))
    showNotice(`"${preset.title}" कार्यक्रम सूची में जोड़ दिया गया।`)
  }

  const handleEventDateChange = (idx, val) => {
    const hindi = formatCalendarDateToHindi(val, true)
    setEditingWedding((w) => ({
      ...w,
      events: (w.events || []).map((it, i) => {
        if (i !== idx) return it
        return {
          ...it,
          rawDate: val,
          date: hindi || it.date,
        }
      }),
    }))
  }

  const handleEventTimeChange = (idx, val) => {
    const hindi = formatTimeToHindi(val)
    setEditingWedding((w) => ({
      ...w,
      events: (w.events || []).map((it, i) => {
        if (i !== idx) return it
        return {
          ...it,
          rawTime: val,
          time: hindi || it.time,
        }
      }),
    }))
  }

  const handleSelectPalaceForDraft = (palaceId) => {
    const palace = FAMOUS_ROYAL_PALACES.find((p) => p.id === palaceId)
    if (!palace) return
    setNewWeddingDraft((v) => ({
      ...v,
      venueName: palace.name,
      venueCity: palace.city,
      venueAddress: palace.address,
      googleMapsQuery: palace.googleMapsQuery,
    }))
    showNotice(`"${palace.name}" (${palace.city}) का वेन्यू व मैप लिंक सेट हो गया।`)
  }

  const handleMapUrlForDraft = (val) => {
    const parsed = extractPalaceAndCityFromMapUrl(val)
    setNewWeddingDraft((v) => ({
      ...v,
      googleMapsQuery: val,
      ...(parsed.hasDetails
        ? {
            venueName: parsed.name || v.venueName,
            venueCity: parsed.city || v.venueCity,
            venueAddress: parsed.address || v.venueAddress,
          }
        : {}),
    }))
    if (parsed.hasDetails && parsed.name && parsed.city) {
      showNotice(`मैप लिंक से "${parsed.name}, ${parsed.city}" स्वतः भर दिया गया!`)
    }
  }

  const handleSelectPalaceForEditing = (palaceId) => {
    const palace = FAMOUS_ROYAL_PALACES.find((p) => p.id === palaceId)
    if (!palace) return
    setEditingWedding((w) => ({
      ...w,
      venue: {
        ...(w.venue || {}),
        name: palace.name,
        city: palace.city,
        address: palace.address,
        googleMapsQuery: palace.googleMapsQuery,
      },
    }))
    showNotice(`"${palace.name}" (${palace.city}) का वेन्यू व मैप लिंक सेट हो गया।`)
  }

  const handleMapUrlForEditing = (val) => {
    const parsed = extractPalaceAndCityFromMapUrl(val)
    setEditingWedding((w) => ({
      ...w,
      venue: {
        ...(w.venue || {}),
        googleMapsQuery: val,
        ...(parsed.hasDetails
          ? {
              name: parsed.name || w.venue?.name || '',
              city: parsed.city || w.venue?.city || '',
              address: parsed.address || w.venue?.address || '',
            }
          : {}),
      },
    }))
    if (parsed.hasDetails && parsed.name && parsed.city) {
      showNotice(`मैप लिंक से "${parsed.name}, ${parsed.city}" स्वतः पहचान लिया गया!`)
    }
  }

  const copyToClipboard = (text, type = 'pin', id = null) => {
    navigator.clipboard.writeText(text)
    if (type === 'pin') {
      setCopiedPin(true)
      if (id) setCurrentCopiedPinId(id)
      setTimeout(() => {
        setCopiedPin(false)
        setCurrentCopiedPinId(null)
      }, 2500)
    } else {
      setCopiedUrl(text)
      setTimeout(() => setCopiedUrl(''), 2500)
    }
  }

  const filteredWeddings = weddings.filter((w) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      w.brideName.toLowerCase().includes(q) ||
      w.groomName.toLowerCase().includes(q) ||
      w.slug.toLowerCase().includes(q) ||
      (w.venueCity || '').toLowerCase().includes(q)
    )
  })

  // Loading indicator
  if (loading) {
    return (
      <div className="admin-login-shell">
        <div className="admin-login-card" style={{ textAlign: 'center', padding: '60px 30px' }}>
          <div className="admin-login-seal">श्री</div>
          <p className="admin-eyebrow">शाही विवाह आमंत्रण</p>
          <h2>पोर्टल लोड हो रहा है…</h2>
        </div>
      </div>
    )
  }

  // Login Screen if not authenticated
  if (!authenticated) {
    return (
      <div className="admin-login-shell">
        <div className="admin-login-card">
          <Link to="/" className="admin-back-link">
            <ArrowLeft size={15} /> मुख्य पृष्ठ
          </Link>
          <div className="admin-login-seal">श्री</div>
          <p className="admin-eyebrow">फोटोग्राफर प्रबंधन केंद्र</p>
          <h1>फोटोग्राफर प्रवेश</h1>
          <p>
            सभी विवाह आमंत्रणों, व्यवस्थापक PINs, और मेहमानों के उत्तरों का सुरक्षित प्रबंधन यहाँ से करें।
          </p>

          <form onSubmit={handleLogin}>
            <label>
              फोटोग्राफर सुरक्षा PIN
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="फोटोग्राफर PIN दर्ज करें"
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
              <Lock size={16} /> {busyLogin ? 'सत्यापित हो रहा है…' : 'पोर्टल में प्रवेश करें'}
            </button>
          </form>

          {loginError && <div className="admin-notice" style={{ borderColor: '#c84444', color: '#901212', background: '#fdf2f2' }}>{loginError}</div>}

          <div style={{ marginTop: 24, padding: 14, background: '#fdf6ed', borderRadius: 8, border: '1px solid #ebd7af', fontSize: 12, color: '#7a4e1d' }}>
            <strong>प्रशासनिक सहायता:</strong>
            <p style={{ margin: '4px 0 0' }}>
              फोटोग्राफर मास्टर पिन एनवायरनमेंट वेरिएबल <code>PHOTOGRAPHER_PIN</code> से नियंत्रित होता है।
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated Photographer Dashboard
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
            <strong>फोटोग्राफर पोर्टल</strong>
            <small>मल्टी-वेडिंग मैनेजमेंट सिस्टम</small>
          </span>
        </div>

        <div className="admin-header-actions">
          <button
            className="admin-button admin-button-primary"
            type="button"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} /> नया विवाह जोड़ें
          </button>
          <Link to="/wedding-admin" target="_blank" className="admin-button admin-button-quiet">
            <ExternalLink size={15} /> साझा एडमिन लॉगिन
          </Link>
          <button className="admin-button admin-button-quiet" type="button" onClick={handleLogout}>
            <LogOut size={16} /> बाहर जाएँ
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px 80px' }}>
        {notice && (
          <div className="admin-notice" role="status" style={{ marginBottom: 24 }}>
            <Check size={16} />
            <span>{notice}</span>
            <button onClick={() => setNotice('')} aria-label="बंद करें" type="button">
              <X size={15} />
            </button>
          </div>
        )}

        {/* Aggregate KPI Stats Banner */}
        {stats && (
          <section className="photo-stats-grid" style={{ marginBottom: 36 }}>
            <div className="photo-stat-card">
              <p className="photo-stat-label">कुल विवाह प्रोजेक्ट्स</p>
              <h3 className="photo-stat-value">{stats.totalWeddings}</h3>
              <span className="photo-stat-meta">{stats.publishedWeddings} लाइव · {stats.draftWeddings} ड्राफ्ट</span>
            </div>
            <div className="photo-stat-card">
              <p className="photo-stat-label">लाइव आमंत्रण</p>
              <h3 className="photo-stat-value" style={{ color: '#2d7a46' }}>{stats.publishedWeddings}</h3>
              <span className="photo-stat-meta">मेहमानों के लिए उपलब्ध</span>
            </div>
            <div className="photo-stat-card">
              <p className="photo-stat-label">पुष्ट उपस्थित मेहमान</p>
              <h3 className="photo-stat-value" style={{ color: '#8c2d19' }}>{stats.totalConfirmedAttendees}</h3>
              <span className="photo-stat-meta">कुल आने वाले अतिथि</span>
            </div>
            <div className="photo-stat-card">
              <p className="photo-stat-label">कुल RSVP उत्तर</p>
              <h3 className="photo-stat-value">{stats.totalRsvps}</h3>
              <span className="photo-stat-meta">{stats.totalDeclined} अनुपस्थित उत्तर</span>
            </div>
          </section>
        )}

        {/* Projects Control Bar */}
        <div className="photo-projects-bar">
          <div>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 24, color: '#3d121e', margin: 0 }}>
              विवाह प्रोजेक्ट्स की सूची
            </h2>
            <p style={{ margin: '4px 0 0', color: '#7a5240', fontSize: 13 }}>
              प्रत्येक विवाह का अपना सुरक्षित URL और अद्वितीय 8-अंकीय व्यवस्थापक PIN है।
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="photo-search-input">
              <Search size={16} color="#8a5c38" />
              <input
                type="text"
                placeholder="नाम या स्लग से खोजें…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} aria-label="साफ़ करें">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              className="admin-button admin-button-quiet"
              type="button"
              onClick={loadDashboard}
              title="रीफ़्रेश करें"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Wedding Cards Grid */}
        {filteredWeddings.length === 0 ? (
          <div className="admin-empty" style={{ margin: '40px 0', background: '#fff', border: '1px dashed #d5be9b', borderRadius: 12 }}>
            <FilePlus2 size={36} color="#b8860b" />
            <strong style={{ fontSize: 18 }}>कोई विवाह प्रोजेक्ट नहीं मिला</strong>
            <p>नया प्रोजेक्ट बनाने के लिए ऊपर “नया विवाह जोड़ें” बटन पर क्लिक करें।</p>
            <button
              className="admin-button admin-button-primary"
              type="button"
              onClick={() => setShowCreateModal(true)}
              style={{ marginTop: 12 }}
            >
              <Plus size={16} /> पहला विवाह प्रोजेक्ट बनाएँ
            </button>
          </div>
        ) : (
          <div className="photo-wedding-grid">
            {filteredWeddings.map((w) => {
              const publicUrl = `${window.location.origin}/w/${w.slug}`
              return (
                <article key={w.id} className="photo-wedding-card">
                  {/* Card Header & Badges */}
                  <div className="photo-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`photo-badge ${w.published ? 'photo-badge-live' : 'photo-badge-draft'}`}>
                        {w.published ? '🟢 लाइव प्रकाशित' : '🟡 ड्राफ्ट / अप्रकाशित'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="photo-toggle-btn"
                      onClick={() => handleTogglePublish(w)}
                      title={w.published ? 'अप्रकाशित करें' : 'प्रकाशित करें'}
                    >
                      {w.published ? 'ड्राफ्ट करें' : 'प्रकाशित करें'}
                    </button>
                  </div>

                  {/* Couple Names & Date */}
                  <div className="photo-card-body">
                    <h3 className="photo-card-couple">
                      {w.groomName} <span>♥</span> {w.brideName}
                    </h3>
                    <p className="photo-card-date">
                      <Calendar size={14} /> {w.weddingDateLabel || 'विवाह तिथि शीघ्र घोषित होगी'}
                    </p>
                    {w.venueCity && (
                      <p className="photo-card-venue">
                        <MapPin size={14} /> {w.venueCity}
                      </p>
                    )}

                    {/* URL link & copy */}
                    <div className="photo-card-url-box">
                      <code>/w/{w.slug}</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(publicUrl, 'url')}
                        title="लिंक कॉपी करें"
                      >
                        {copiedUrl === publicUrl ? <Check size={14} color="#2d7a46" /> : <Copy size={14} />}
                      </button>
                      <a
                        href={`/w/${w.slug}${!w.published ? '?preview=true' : ''}`}
                        target="_blank"
                        rel="noreferrer"
                        title="आमंत्रण खोलें"
                      >
                        <Eye size={14} />
                      </a>
                    </div>

                    {/* Admin PIN Bar - Always visible to photographer */}
                    <div
                      style={{
                        margin: '10px 0',
                        padding: '8px 12px',
                        background: '#fcf8ee',
                        border: '1.5px solid #d4af37',
                        borderRadius: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <KeyRound size={14} color="#8c2d19" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#8a5c38', textTransform: 'uppercase' }}>
                          व्यवस्थापक PIN:
                        </span>
                        <code
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            fontFamily: 'monospace, serif',
                            color: '#2a0d15',
                            letterSpacing: '1px',
                            background: '#fff',
                            padding: '2px 8px',
                            borderRadius: 4,
                            border: '1px solid #e2cb9c',
                          }}
                        >
                          {visiblePins[w.id] !== false ? (w.adminPin || 'अनिर्धारित') : '••••••••'}
                        </code>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(w.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#7a5240',
                            padding: 4,
                            display: 'grid',
                            placeContent: 'center',
                          }}
                          title={visiblePins[w.id] !== false ? 'PIN छिपाएँ' : 'PIN देखें'}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(w.adminPin, 'pin', w.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#7a5240',
                            padding: 4,
                            display: 'grid',
                            placeContent: 'center',
                          }}
                          title="PIN कॉपी करें"
                        >
                          {copiedPin && currentCopiedPinId === w.id ? (
                            <Check size={14} color="#2d7a46" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openCustomPinModal(w)}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '3px 8px',
                            background: '#fff',
                            border: '1px solid #c8a356',
                            color: '#8c2d19',
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                          title="कस्टम PIN सेट करें"
                        >
                          कस्टम PIN
                        </button>
                      </div>
                    </div>

                    {/* RSVP summary pills */}
                    <div className="photo-card-rsvp-row">
                      <div className="photo-rsvp-pill">
                        <strong>{w.stats?.totalAttendees || 0}</strong>
                        <span>पुष्ट मेहमान</span>
                      </div>
                      <div className="photo-rsvp-pill">
                        <strong>{w.stats?.totalRsvps || 0}</strong>
                        <span>RSVP उत्तर</span>
                      </div>
                      <div className="photo-rsvp-pill">
                        <strong>{w.stats?.declinedRsvps || 0}</strong>
                        <span>अस्वीकृत</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="photo-card-actions">
                    <button
                      className="admin-button admin-button-primary photo-btn-sm"
                      type="button"
                      onClick={() => openEditModal(w)}
                    >
                      विवरण व फ़ोटो संपादित करें
                    </button>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="admin-button admin-button-quiet photo-btn-sm"
                        type="button"
                        onClick={() => openCustomPinModal(w)}
                        title="व्यवस्थापक PIN बदलें या कस्टम PIN सेट करें"
                      >
                        <KeyRound size={14} /> कस्टम PIN
                      </button>
                      <button
                        className="admin-button admin-button-quiet photo-btn-sm danger"
                        type="button"
                        onClick={() => handleDeleteWedding(w)}
                        title="प्रोजेक्ट हटाएँ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      {/* ── MODAL 1: Create Wedding ── */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <h2>नया विवाह प्रोजेक्ट बनाएँ</h2>
                <p>प्रोजेक्ट बनने पर इसका अद्वितीय 8-अंकीय व्यवस्थापक PIN स्क्रीन पर दिखेगा।</p>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWedding} style={{ padding: '24px 20px' }}>
              <div className="admin-two-cols">
                <label className="admin-field">
                  दुल्हन का नाम *
                  <input
                    required
                    value={newWeddingDraft.brideName}
                    onChange={(e) => setNewWeddingDraft((v) => ({ ...v, brideName: e.target.value }))}
                    placeholder="जैसे, प्रिया शर्मा"
                  />
                </label>
                <label className="admin-field">
                  दूल्हे का नाम *
                  <input
                    required
                    value={newWeddingDraft.groomName}
                    onChange={(e) => setNewWeddingDraft((v) => ({ ...v, groomName: e.target.value }))}
                    placeholder="जैसे, राहुल वर्मा"
                  />
                </label>
              </div>

              <div className="admin-two-cols">
                <div className="admin-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>विवाह तिथि (Date)</span>
                    <span className="cal-helper-text">📅 कैलेंडर से चुनें</span>
                  </div>
                  <div className="calendar-picker-input-wrap">
                    <input
                      type="date"
                      className="native-calendar-input"
                      value={extractDateInputVal(newWeddingDraft.weddingDate)}
                      onChange={(e) => {
                        const val = e.target.value
                        const hindi = formatCalendarDateToHindi(val, true)
                        setNewWeddingDraft((v) => ({
                          ...v,
                          weddingDate: val,
                          weddingDateLabel: hindi || v.weddingDateLabel,
                        }))
                      }}
                    />
                    <button
                      type="button"
                      className="calendar-open-trigger-btn"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input[type="date"]')
                        input?.showPicker?.() || input?.focus()
                      }}
                      title="कैलेंडर खोलें"
                    >
                      <Calendar size={15} /> कैलेंडर खोलें
                    </button>
                  </div>
                  <input
                    className="date-display-preview-input"
                    value={newWeddingDraft.weddingDateLabel}
                    onChange={(e) => setNewWeddingDraft((v) => ({ ...v, weddingDateLabel: e.target.value }))}
                    placeholder="जैसे, रविवार, १४ फ़रवरी २०२७"
                  />
                </div>

                <div className="admin-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>शुभ मुहूर्त / समय (Time)</span>
                    <span className="cal-helper-text">⏰ समय चुनें</span>
                  </div>
                  <div className="calendar-picker-input-wrap">
                    <input
                      type="time"
                      className="native-calendar-input"
                      value={extractTimeInputVal(newWeddingDraft.weddingTimeLabel)}
                      onChange={(e) => {
                        const val = e.target.value
                        const hindi = formatTimeToHindi(val)
                        setNewWeddingDraft((v) => ({
                          ...v,
                          weddingTimeLabel: hindi || v.weddingTimeLabel,
                        }))
                      }}
                    />
                    <button
                      type="button"
                      className="calendar-open-trigger-btn"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input[type="time"]')
                        input?.showPicker?.() || input?.focus()
                      }}
                      title="समय चुनें"
                    >
                      <Clock size={15} /> समय चुनें
                    </button>
                  </div>
                  <input
                    className="date-display-preview-input"
                    value={newWeddingDraft.weddingTimeLabel}
                    onChange={(e) => setNewWeddingDraft((v) => ({ ...v, weddingTimeLabel: e.target.value }))}
                    placeholder="जैसे, सायं ६:३० बजे"
                  />
                  <div className="quick-time-chips">
                    {['18:30', '19:00', '20:00', '21:30'].map((qt) => (
                      <button
                        key={qt}
                        type="button"
                        className="quick-time-chip-btn"
                        onClick={() => {
                          const hindi = formatTimeToHindi(qt)
                          setNewWeddingDraft((v) => ({ ...v, weddingTimeLabel: hindi }))
                        }}
                      >
                        {formatTimeToHindi(qt)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Palace & Google Maps Location Selector */}
              <div className="venue-preset-selector-box" style={{ marginTop: 8 }}>
                <span className="venue-preset-selector-label">
                  <MapPin size={13} style={{ display: 'inline', verticalAlign: '-2px', color: '#b8860b' }} />{' '}
                  शाही महल / वेन्यू विकल्प से चुनें (Quick Palace & City Selection):
                </span>
                <select
                  className="venue-preset-dropdown"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) handleSelectPalaceForDraft(e.target.value)
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
                    value={newWeddingDraft.googleMapsQuery || ''}
                    onChange={(e) => handleMapUrlForDraft(e.target.value)}
                    placeholder="https://maps.app.goo.gl/... या Google Maps लिंक पेस्ट करें"
                  />
                  {newWeddingDraft.googleMapsQuery && (
                    <a
                      href={getGoogleMapsDestinationUrl({
                        googleMapsQuery: newWeddingDraft.googleMapsQuery,
                        name: newWeddingDraft.venueName,
                        city: newWeddingDraft.venueCity,
                        address: newWeddingDraft.venueAddress,
                      })}
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
                  💡 Google Maps लिंक पेस्ट करते ही महल का नाम व शहर स्वतः भर जाते हैं।
                </small>
              </label>

              <div className="admin-two-cols">
                <label className="admin-field">
                  विवाह स्थल / पैलेस का नाम (Palace / Venue)
                  <input
                    value={newWeddingDraft.venueName}
                    onChange={(e) => setNewWeddingDraft((v) => ({ ...v, venueName: e.target.value }))}
                    placeholder="जैसे, रामबाग पैलेस / सिटी पैलेस"
                  />
                </label>
                <label className="admin-field">
                  शहर (City)
                  <input
                    value={newWeddingDraft.venueCity}
                    onChange={(e) => setNewWeddingDraft((v) => ({ ...v, venueCity: e.target.value }))}
                    placeholder="जयपुर, राजस्थान"
                  />
                </label>
              </div>

              <label className="admin-field">
                पूरा पता (Full Address)
                <input
                  value={newWeddingDraft.venueAddress || ''}
                  onChange={(e) => setNewWeddingDraft((v) => ({ ...v, venueAddress: e.target.value }))}
                  placeholder="जैसे, भवानी सिंह रोड, जयपुर, राजस्थान"
                />
              </label>

              <label className="admin-field">
                व्यवस्थापक PIN (वैकल्पिक कस्टम PIN अथवा खाली छोड़ें)
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={newWeddingDraft.customPin || ''}
                    onChange={(e) => setNewWeddingDraft((v) => ({ ...v, customPin: e.target.value }))}
                    placeholder="उदा. 12345678 (खाली छोड़ने पर रैंडम 8-अंकीय PIN बनेगा)"
                  />
                  <button
                    type="button"
                    className="admin-button admin-button-quiet"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() =>
                      setNewWeddingDraft((v) => ({
                        ...v,
                        customPin: Math.floor(10000000 + Math.random() * 90000000).toString(),
                      }))
                    }
                  >
                    रैंडम PIN
                  </button>
                </div>
                <small style={{ color: '#8a5c38', fontSize: 11 }}>
                  फोटोग्राफर कभी भी पोर्टल पर सभी विवाह PIN देख सकते हैं और बदल सकते हैं।
                </small>
              </label>

              <label className="admin-field">
                कस्टम URL स्लग (वैकल्पिक)
                <div className="admin-slug-input">
                  <span>/w/</span>
                  <input
                    value={newWeddingDraft.customSlug}
                    onChange={(e) => setNewWeddingDraft((v) => ({ ...v, customSlug: e.target.value }))}
                    placeholder="rahul-weds-priya"
                  />
                </div>
                <small style={{ color: '#8a5c38', fontSize: 11 }}>
                  खाली छोड़ने पर दूल्हे व दुल्हन के नाम से स्वचालित URL बनेगा।
                </small>
              </label>

              <div className="admin-form-actions" style={{ marginTop: 24 }}>
                <button
                  type="submit"
                  disabled={busyCreate}
                  className="admin-button admin-button-primary"
                >
                  <Sparkles size={16} /> {busyCreate ? 'प्रोजेक्ट बन रहा है…' : 'प्रोजेक्ट और PIN जनरेट करें'}
                </button>
                <button
                  type="button"
                  className="admin-button admin-button-quiet"
                  onClick={() => setShowCreateModal(false)}
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: PIN Confirmation Callout ── */}
      {singlePinDisplay && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box photo-pin-modal">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div className="photo-pin-icon-wrap">
                <KeyRound size={28} />
              </div>
              <p className="admin-eyebrow" style={{ color: '#8c2d19', letterSpacing: '.18em' }}>
                {singlePinDisplay.type === 'created' ? 'नया विवाह व्यवस्थापक PIN' : 'अपडेट किया गया व्यवस्थापक PIN'}
              </p>
              <h2 style={{ margin: '4px 0 6px', fontFamily: 'Cinzel, serif', color: '#2a0d15' }}>
                {singlePinDisplay.weddingTitle}
              </h2>
              <p style={{ fontSize: 13, color: '#7a5240', maxWidth: 420, margin: '0 auto' }}>
                यह PIN परिवार को दें ताकि वे <strong>/wedding-admin</strong> पर जाकर अपना डैशबोर्ड खोल सकें।
              </p>
            </div>

            {/* Prominent Gold PIN Box */}
            <div className="photo-pin-box">
              <span className="photo-pin-label">व्यवस्थापक PIN (पोर्टल में हमेशा दृश्यमान):</span>
              <div className="photo-pin-value-row">
                <span className="photo-pin-digits">{singlePinDisplay.pin}</span>
                <button
                  type="button"
                  className="admin-button admin-button-primary"
                  onClick={() => copyToClipboard(singlePinDisplay.pin, 'pin')}
                >
                  {copiedPin ? <Check size={16} /> : <Copy size={16} />}
                  {copiedPin ? 'कॉपी हो गया!' : 'PIN कॉपी करें'}
                </button>
              </div>
              <p style={{ color: '#236d39', fontSize: 13, margin: '8px 0 0', fontWeight: 600 }}>
                ✓ यह PIN फोटोग्राफर पोर्टल पर हमेशा उपलब्ध रहेगा। फोटोग्राफर इसे कभी भी देख सकते हैं अथवा नया कस्टम PIN सेट कर सकते हैं।
              </p>
            </div>

            {/* Sharing link */}
            <div style={{ background: '#fdf8ef', padding: 14, borderRadius: 8, border: '1px solid #ebd7af', marginBottom: 20 }}>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#8a5c38', fontWeight: 600 }}>
                परिवार के साथ साझा करने का प्रारूप:
              </p>
              <code style={{ display: 'block', fontSize: 12, padding: 8, background: '#fff', borderRadius: 6, border: '1px solid #ded0b5', color: '#3d1622', wordBreak: 'break-all' }}>
                विवाह व्यवस्थापक पोर्टल: {window.location.origin}/wedding-admin<br />
                एडमिन PIN: {singlePinDisplay.pin}<br />
                सार्वजनिक आमंत्रण लिंक: {window.location.origin}/w/{singlePinDisplay.slug}
              </code>
              <button
                type="button"
                className="admin-button admin-button-quiet"
                style={{ marginTop: 10, fontSize: 12 }}
                onClick={() =>
                  copyToClipboard(
                    `विवाह व्यवस्थापक पोर्टल: ${window.location.origin}/wedding-admin\nएडमिन PIN: ${singlePinDisplay.pin}\nसार्वजनिक आमंत्रण लिंक: ${window.location.origin}/w/${singlePinDisplay.slug}`,
                    'url'
                  )
                }
              >
                <Share2 size={13} /> पूरा संदेश कॉपी करें
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                className="admin-button admin-button-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setSinglePinDisplay(null)}
              >
                विंडो बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Custom PIN Modal ── */}
      {customPinModal && (
        <div className="admin-modal-overlay" onClick={() => setCustomPinModal(null)}>
          <div className="admin-modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <h2>कस्टम व्यवस्थापक PIN सेट करें</h2>
                <p>{customPinModal.groomName} एवं {customPinModal.brideName}</p>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setCustomPinModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomPin} style={{ padding: 24 }}>
              <p style={{ fontSize: 13, color: '#7a5240', marginBottom: 16 }}>
                परिवार के लिए कोई भी कस्टम PIN सेट करें (जैसे उनकी जन्मतिथि, शादी की तारीख, या आसान नंबर)। यह PIN हमेशा इस पोर्टल पर दिखाई देगा।
              </p>

              <label className="admin-field">
                नया कस्टम PIN (New Custom PIN)
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={customPinDraft}
                    onChange={(e) => setCustomPinDraft(e.target.value)}
                    placeholder="उदा. 12345678 या 20272027"
                    required
                    style={{
                      fontFamily: 'monospace, serif',
                      fontSize: 18,
                      letterSpacing: 2,
                    }}
                  />
                  <button
                    type="button"
                    className="admin-button admin-button-quiet"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() =>
                      setCustomPinDraft(Math.floor(10000000 + Math.random() * 90000000).toString())
                    }
                  >
                    रैंडम जनरेट
                  </button>
                </div>
              </label>

              <div className="admin-form-actions" style={{ marginTop: 20 }}>
                <button
                  type="submit"
                  disabled={busyCustomPin || !customPinDraft.trim()}
                  className="admin-button admin-button-primary"
                >
                  <KeyRound size={15} /> {busyCustomPin ? 'सहेज रहे हैं…' : 'नया PIN सहेजें'}
                </button>
                <button
                  type="button"
                  className="admin-button admin-button-quiet"
                  onClick={() => setCustomPinModal(null)}
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Edit Wedding Drawer / Modal ── */}
      {editingWedding && (
        <div className="admin-modal-overlay" onClick={() => setEditingWedding(null)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: 900, maxHeight: '92vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-head">
              <div>
                <h2>{editingWedding.groomName} एवं {editingWedding.brideName} — विवरण संपादन</h2>
                <p>URL: /w/{editingWedding.slug}</p>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setEditingWedding(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="admin-modal-tabs">
              <button
                type="button"
                className={editTab === 'details' ? 'active' : ''}
                onClick={() => setEditTab('details')}
              >
                मुख्य विवरण व फ़ोटो
              </button>
              <button
                type="button"
                className={editTab === 'media' ? 'active' : ''}
                onClick={() => setEditTab('media')}
              >
                फ़ोटो व वीडियो (४ फ़ोटो • १ वीडियो)
              </button>
              <button
                type="button"
                className={editTab === 'events' ? 'active' : ''}
                onClick={() => setEditTab('events')}
              >
                रस्में व कार्यक्रम ({editingWedding.events?.length || 0})
              </button>
              <button
                type="button"
                className={editTab === 'pages' ? 'active' : ''}
                onClick={() => setEditTab('pages')}
              >
                कस्टम पृष्ठ ({editingWedding.customPages?.length || 0})
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '24px 20px' }}>
              {editTab === 'details' && (
                <>
                  <div className="admin-two-cols">
                    <label className="admin-field">
                      दुल्हन का नाम
                      <input
                        value={editingWedding.brideName || ''}
                        onChange={(e) =>
                          setEditingWedding((w) => ({ ...w, brideName: e.target.value }))
                        }
                      />
                    </label>
                    <label className="admin-field">
                      दूल्हे का नाम
                      <input
                        value={editingWedding.groomName || ''}
                        onChange={(e) =>
                          setEditingWedding((w) => ({ ...w, groomName: e.target.value }))
                        }
                      />
                    </label>
                  </div>

                  {/* Preview Mode Selector */}
                  <div className="admin-preview-mode-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fdf6ed', padding: '8px 14px', borderRadius: 6, margin: '12px 0' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#682536' }}>चित्र पूर्वावलोकन मोड (Preview Frame):</span>
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

                  {/* Photo Uploads with RajPortrait preview & Focal Controls */}
                  <div className="admin-two-cols" style={{ margin: '14px 0' }}>
                    <div className="photo-upload-cell">
                      <strong>दुल्हन की तस्वीर (Bride Portrait)</strong>
                      <div style={{ margin: '10px 0', maxWidth: portraitPreviewMode === 'mobile' ? 200 : 260, marginInline: 'auto' }}>
                        <RajPortrait
                          src={editingWedding.bridePhoto}
                          alt={editingWedding.brideName}
                          placeholder="दुल्हन"
                          focalPosition={editingWedding.bridePhotoFocalMobile || '50% 18%'}
                        />
                      </div>
                      <div style={{ margin: '8px 0' }}>
                        <label className="admin-field" style={{ fontSize: 12, marginBottom: 6 }}>
                          मोबाइल फ़ोकस बिंदु (चेहरे की सुरक्षा):
                          <select
                            value={editingWedding.bridePhotoFocalMobile || '50% 18%'}
                            onChange={(e) =>
                              setEditingWedding((w) => ({
                                ...w,
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
                        <Upload size={14} /> {busyUpload ? 'अपलोड हो रहा है…' : 'फ़ोटो बदलें'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload('bridePhoto', e.target.files?.[0])}
                        />
                      </label>
                      {editingWedding.bridePhoto && (
                        <button
                          type="button"
                          className="admin-text-danger"
                          style={{ marginLeft: 10 }}
                          onClick={() => setEditingWedding((w) => ({ ...w, bridePhoto: '' }))}
                        >
                          हटाएँ
                        </button>
                      )}
                    </div>

                    <div className="photo-upload-cell">
                      <strong>दूल्हे की तस्वीर (Groom Portrait)</strong>
                      <div style={{ margin: '10px 0', maxWidth: portraitPreviewMode === 'mobile' ? 200 : 260, marginInline: 'auto' }}>
                        <RajPortrait
                          src={editingWedding.groomPhoto}
                          alt={editingWedding.groomName}
                          placeholder="दूल्हा"
                          focalPosition={editingWedding.groomPhotoFocalMobile || '50% 16%'}
                        />
                      </div>
                      <div style={{ margin: '8px 0' }}>
                        <label className="admin-field" style={{ fontSize: 12, marginBottom: 6 }}>
                          मोबाइल फ़ोकस बिंदु (चेहरे की सुरक्षा):
                          <select
                            value={editingWedding.groomPhotoFocalMobile || '50% 16%'}
                            onChange={(e) =>
                              setEditingWedding((w) => ({
                                ...w,
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
                        <Upload size={14} /> {busyUpload ? 'अपलोड हो रहा है…' : 'फ़ोटो बदलें'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload('groomPhoto', e.target.files?.[0])}
                        />
                      </label>
                      {editingWedding.groomPhoto && (
                        <button
                          type="button"
                          className="admin-text-danger"
                          style={{ marginLeft: 10 }}
                          onClick={() => setEditingWedding((w) => ({ ...w, groomPhoto: '' }))}
                        >
                          हटाएँ
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="admin-two-cols">
                    <div className="admin-field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>विवाह तिथि (Date)</span>
                        <span className="cal-helper-text">📅 कैलेंडर से चुनें</span>
                      </div>
                      <div className="calendar-picker-input-wrap">
                        <input
                          type="date"
                          className="native-calendar-input"
                          value={extractDateInputVal(editingWedding.weddingDate)}
                          onChange={(e) => {
                            const val = e.target.value
                            const hindi = formatCalendarDateToHindi(val, true)
                            setEditingWedding((w) => ({
                              ...w,
                              weddingDate: val ? `${val}T18:30:00+05:30` : '',
                              weddingDateLabel: hindi || w.weddingDateLabel,
                            }))
                          }}
                        />
                        <button
                          type="button"
                          className="calendar-open-trigger-btn"
                          onClick={(e) => {
                            const input = e.currentTarget.parentElement?.querySelector('input[type="date"]')
                            input?.showPicker?.() || input?.focus()
                          }}
                          title="कैलेंडर खोलें"
                        >
                          <Calendar size={15} /> कैलेंडर खोलें
                        </button>
                      </div>
                      <input
                        className="date-display-preview-input"
                        value={editingWedding.weddingDateLabel || ''}
                        onChange={(e) =>
                          setEditingWedding((w) => ({ ...w, weddingDateLabel: e.target.value }))
                        }
                        placeholder="जैसे, रविवार, १४ फ़रवरी २०२७"
                      />
                    </div>

                    <div className="admin-field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>शुभ मुहूर्त / समय (Time)</span>
                        <span className="cal-helper-text">⏰ समय चुनें</span>
                      </div>
                      <div className="calendar-picker-input-wrap">
                        <input
                          type="time"
                          className="native-calendar-input"
                          value={extractTimeInputVal(editingWedding.weddingTimeLabel)}
                          onChange={(e) => {
                            const val = e.target.value
                            const hindi = formatTimeToHindi(val)
                            setEditingWedding((w) => ({
                              ...w,
                              weddingTimeLabel: hindi || w.weddingTimeLabel,
                            }))
                          }}
                        />
                        <button
                          type="button"
                          className="calendar-open-trigger-btn"
                          onClick={(e) => {
                            const input = e.currentTarget.parentElement?.querySelector('input[type="time"]')
                            input?.showPicker?.() || input?.focus()
                          }}
                          title="समय चुनें"
                        >
                          <Clock size={15} /> समय चुनें
                        </button>
                      </div>
                      <input
                        className="date-display-preview-input"
                        value={editingWedding.weddingTimeLabel || ''}
                        onChange={(e) =>
                          setEditingWedding((w) => ({ ...w, weddingTimeLabel: e.target.value }))
                        }
                        placeholder="जैसे, सायं ६:३० बजे"
                      />
                      <div className="quick-time-chips">
                        {['18:30', '19:00', '20:00', '21:30'].map((qt) => (
                          <button
                            key={qt}
                            type="button"
                            className="quick-time-chip-btn"
                            onClick={() => {
                              const hindi = formatTimeToHindi(qt)
                              setEditingWedding((w) => ({ ...w, weddingTimeLabel: hindi }))
                            }}
                          >
                            {formatTimeToHindi(qt)}
                          </button>
                        ))}
                      </div>
                    </div>
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
                        if (e.target.value) handleSelectPalaceForEditing(e.target.value)
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
                        value={editingWedding.venue?.googleMapsQuery || ''}
                        onChange={(e) => handleMapUrlForEditing(e.target.value)}
                        placeholder="https://maps.app.goo.gl/... या Google Maps लिंक पेस्ट करें"
                      />
                      {editingWedding.venue?.googleMapsQuery && (
                        <a
                          href={getGoogleMapsDestinationUrl(editingWedding.venue)}
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
                      💡 Google Maps लिंक पेस्ट करते ही महल का नाम व शहर स्वतः अपडेट हो जाते हैं। मेहमानों के लिए आमंत्रण में यह सटीक लिंक खुलेगा।
                    </small>
                  </label>

                  <div className="admin-two-cols">
                    <label className="admin-field">
                      विवाह स्थल / पैलेस का नाम (Palace / Venue)
                      <input
                        value={editingWedding.venue?.name || ''}
                        onChange={(e) =>
                          setEditingWedding((w) => ({
                            ...w,
                            venue: { ...(w.venue || {}), name: e.target.value },
                          }))
                        }
                        placeholder="जैसे, रामबाग पैलेस / सिटी पैलेस"
                      />
                    </label>
                    <label className="admin-field">
                      शहर (City)
                      <input
                        value={editingWedding.venue?.city || ''}
                        onChange={(e) =>
                          setEditingWedding((w) => ({
                            ...w,
                            venue: { ...(w.venue || {}), city: e.target.value },
                          }))
                        }
                        placeholder="जैसे, जयपुर, राजस्थान"
                      />
                    </label>
                  </div>

                  <label className="admin-field">
                    पूरा पता (Full Address)
                    <input
                      value={editingWedding.venue?.address || ''}
                      onChange={(e) =>
                        setEditingWedding((w) => ({
                          ...w,
                          venue: { ...(w.venue || {}), address: e.target.value },
                        }))
                      }
                      placeholder="जैसे, भवानी सिंह रोड, जयपुर, राजस्थान ३०२००५"
                    />
                  </label>

                  <label className="admin-field">
                    पारिवारिक स्नेह संदेश
                    <input
                      value={editingWedding.familyLine || ''}
                      onChange={(e) =>
                        setEditingWedding((w) => ({ ...w, familyLine: e.target.value }))
                      }
                    />
                  </label>

                  <label className="admin-field">
                    शुभाशीष श्लोक
                    <textarea
                      rows={2}
                      value={editingWedding.blessing || ''}
                      onChange={(e) =>
                        setEditingWedding((w) => ({ ...w, blessing: e.target.value }))
                      }
                    />
                  </label>
                </>
              )}

              {editTab === 'media' && (
                <div>
                  {/* Photo Gallery Box: Max 4 photos */}
                  <div className="media-manager-card">
                    <div className="media-manager-card-head">
                      <div>
                        <strong style={{ fontSize: 16, color: '#3d1622', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ImageIcon size={18} color="#8c2d19" /> मांगलिक चित्र दीर्घा (अधिकतम ४ तस्वीरें)
                        </strong>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7a5240' }}>
                          फ़ोटोग्राफ़र अधिकतम ४ तस्वीरें अपलोड कर सकते हैं। आमंत्रण पर चित्रों से शीर्षक हटा दिए गए हैं।
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#3d1622', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(editingWedding.hideGallery)}
                            onChange={(e) =>
                              setEditingWedding((w) => ({ ...w, hideGallery: e.target.checked }))
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
                        const curPhoto = (editingWedding.gallery || [])[slotIdx]
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
                          फ़ोटोग्राफ़र १ मुख्य वीडियो अपलोड या लिंक कर सकते हैं (9:16 रील्स अथवा 16:9 सिनेमैटिक)।
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#3d1622', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(editingWedding.hideVideo)}
                            onChange={(e) =>
                              setEditingWedding((w) => ({ ...w, hideVideo: e.target.checked }))
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

                    {/* Single Video Details */}
                    {(() => {
                      const curVideo = (editingWedding.videos || [])[0] || {}
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                          <div>
                            <label className="admin-field">
                              वीडियो फ़ॉर्मेट / अनुपात
                              <select
                                value={curVideo.aspect || '9:16'}
                                onChange={(e) => {
                                  const aspect = e.target.value
                                  setEditingWedding((w) => ({
                                    ...w,
                                    videos: [{ ...(w.videos?.[0] || {}), id: 'primary-video', aspect }],
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
                                  setEditingWedding((w) => ({
                                    ...w,
                                    videos: [{ ...(w.videos?.[0] || {}), id: 'primary-video', videoUrl }],
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
                                      setEditingWedding((w) => ({
                                        ...w,
                                        videos: [{ ...(w.videos?.[0] || {}), poster: '' }],
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
                </div>
              )}

              {editTab === 'events' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottom: '1px dashed rgba(212, 160, 23, 0.35)',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#3a2010' }}>
                        शादी के समस्त मांगलिक कार्यक्रम एवं रस्में ({(editingWedding.events || []).length})
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#7a5240' }}>
                        फोटोग्राफर आसानी से ड्रॉपडाउन से रस्म चुन सकते हैं और कैलेंडर/समय पिकर से समय तय कर सकते हैं।
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        aria-label="विकल्प से नया कार्यक्रम जोड़ें"
                        style={{
                          fontSize: 12,
                          padding: '7px 12px',
                          borderRadius: 6,
                          border: '1px solid #d4a017',
                          background: '#fffdf9',
                          color: '#5c1d1d',
                          fontWeight: 500,
                        }}
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddEventFromPreset(e.target.value)
                            e.target.value = ''
                          }
                        }}
                      >
                        <option value="" disabled>
                          + विकल्प से नया कार्यक्रम जोड़ें...
                        </option>
                        {EVENT_CATEGORIES.map((cat) => (
                          <optgroup key={cat} label={cat}>
                            {STANDARD_WEDDING_EVENTS.filter((p) => p.category === cat).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title} ({p.subtitle})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="admin-button admin-button-quiet"
                        onClick={() => {
                          const newEv = {
                            id: `ev-${Date.now()}`,
                            title: 'नया मांगलिक कार्यक्रम',
                            subtitle: 'रस्म',
                            date: editingWedding.weddingDateLabel || '',
                            rawDate: extractDateInputVal(editingWedding.weddingDate) || '',
                            time: 'सायं ७:०० बजे',
                            rawTime: '19:00',
                            attire: 'पारंपरिक परिधान',
                            description: 'कार्यक्रम का विवरण',
                          }
                          setEditingWedding((w) => ({ ...w, events: [...(w.events || []), newEv] }))
                        }}
                      >
                        <Plus size={14} /> खाली कार्यक्रम जोड़ें
                      </button>
                    </div>
                  </div>

                  {(editingWedding.events || []).length === 0 && (
                    <div
                      style={{
                        padding: '30px 20px',
                        textAlign: 'center',
                        background: 'rgba(212, 160, 23, 0.06)',
                        borderRadius: 8,
                        border: '1px dashed #d4a017',
                        color: '#7a5240',
                      }}
                    >
                      <Sparkles size={24} style={{ color: '#b8860b', margin: '0 auto 8px' }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>अभी कोई कार्यक्रम जोड़ा नहीं गया है।</p>
                      <p style={{ margin: '4px 0 14px', fontSize: 12 }}>
                        ऊपर दिए गए ड्रॉपडाउन से हल्दी, मेहंदी, संगीत, फेरे आदि रस्में आसानी से जोड़ें।
                      </p>
                      <button
                        type="button"
                        className="admin-button admin-button-primary"
                        onClick={() => handleAddEventFromPreset('saat-phere-vivah')}
                      >
                        <Plus size={14} /> मुख्य पाणिग्रहण (फेरे) जोड़ें
                      </button>
                    </div>
                  )}

                  {(editingWedding.events || []).map((ev, idx) => {
                    const dateInputId = `edit-ev-date-${idx}`
                    const timeInputId = `edit-ev-time-${idx}`
                    const currentRawDate = ev.rawDate || extractDateInputVal(ev.date)
                    const currentRawTime = ev.rawTime || extractTimeInputVal(ev.time)

                    return (
                      <div key={ev.id || idx} className="photo-event-edit-row">
                        {/* Event Preset Selector */}
                        <div className="event-preset-selector-box">
                          <span className="event-preset-selector-label">
                            <Sparkles size={13} style={{ display: 'inline', verticalAlign: '-2px', color: '#b8860b' }} />{' '}
                            रस्म का विकल्प चुनें (सभी विकल्प उपलब्ध):
                          </span>
                          <select
                            className="event-preset-dropdown"
                            value={ev.presetId || ''}
                            onChange={(e) => handleApplyEventPreset(idx, e.target.value)}
                          >
                            <option value="">-- किसी पारंपरिक रस्म से ऑटो-फिल करें --</option>
                            {EVENT_CATEGORIES.map((cat) => (
                              <optgroup key={cat} label={cat}>
                                {STANDARD_WEDDING_EVENTS.filter((p) => p.category === cat).map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.title} — {p.subtitle}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        {/* Event Title & Subtitle */}
                        <div className="admin-two-cols">
                          <label className="admin-field">
                            कार्यक्रम का नाम
                            <input
                              value={ev.title || ''}
                              placeholder="जैसे: हल्दी व कुमकुम रस्म"
                              onChange={(e) => {
                                const title = e.target.value
                                setEditingWedding((w) => ({
                                  ...w,
                                  events: w.events.map((it, i) => (i === idx ? { ...it, title } : it)),
                                }))
                              }}
                            />
                          </label>
                          <label className="admin-field">
                            उपशीर्षक / प्रकार
                            <input
                              value={ev.subtitle || ''}
                              placeholder="जैसे: शुभ मंगल स्नान"
                              onChange={(e) => {
                                const subtitle = e.target.value
                                setEditingWedding((w) => ({
                                  ...w,
                                  events: w.events.map((it, i) => (i === idx ? { ...it, subtitle } : it)),
                                }))
                              }}
                            />
                          </label>
                        </div>

                        {/* Calendar Date Picker & Clock Time Picker */}
                        <div className="admin-two-cols">
                          <label className="admin-field">
                            दिनांक (कैलेंडर से चयन करें)
                            <div className="calendar-picker-input-wrap">
                              <input
                                id={dateInputId}
                                type="date"
                                className="native-calendar-input"
                                value={currentRawDate || ''}
                                onChange={(e) => handleEventDateChange(idx, e.target.value)}
                              />
                              <button
                                type="button"
                                className="calendar-open-trigger-btn"
                                onClick={() => {
                                  const el = document.getElementById(dateInputId)
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
                                value={ev.date || ''}
                                placeholder="कैलेंडर से चुनें या लिखें"
                                onClick={() => {
                                  const el = document.getElementById(dateInputId)
                                  if (el && typeof el.showPicker === 'function') el.showPicker()
                                }}
                                onChange={(e) => {
                                  const dateVal = e.target.value
                                  setEditingWedding((w) => ({
                                    ...w,
                                    events: w.events.map((it, i) => (i === idx ? { ...it, date: dateVal } : it)),
                                  }))
                                }}
                              />
                            </div>
                          </label>

                          <label className="admin-field">
                            समय (घड़ी से चयन करें)
                            <div className="calendar-picker-input-wrap">
                              <input
                                id={timeInputId}
                                type="time"
                                className="native-calendar-input"
                                value={currentRawTime || ''}
                                onChange={(e) => handleEventTimeChange(idx, e.target.value)}
                              />
                              <button
                                type="button"
                                className="calendar-open-trigger-btn"
                                onClick={() => {
                                  const el = document.getElementById(timeInputId)
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
                                value={ev.time || ''}
                                placeholder="घड़ी से चुनें या लिखें"
                                onClick={() => {
                                  const el = document.getElementById(timeInputId)
                                  if (el && typeof el.showPicker === 'function') el.showPicker()
                                }}
                                onChange={(e) => {
                                  const timeVal = e.target.value
                                  setEditingWedding((w) => ({
                                    ...w,
                                    events: w.events.map((it, i) => (i === idx ? { ...it, time: timeVal } : it)),
                                  }))
                                }}
                              />
                            </div>
                            <div className="quick-time-chips">
                              <span style={{ fontSize: 10, color: '#8a5c38', alignSelf: 'center', marginRight: 2 }}>
                                त्वरित:
                              </span>
                              {[
                                { label: '१०:०० AM', val: '10:00' },
                                { label: '१२:३० PM', val: '12:30' },
                                { label: '०४:०० PM', val: '16:00' },
                                { label: '०७:०० PM', val: '19:00' },
                                { label: '०८:३० PM', val: '20:30' },
                              ].map((chip) => (
                                <button
                                  key={chip.val}
                                  type="button"
                                  className="time-chip-btn"
                                  onClick={() => handleEventTimeChange(idx, chip.val)}
                                >
                                  {chip.label}
                                </button>
                              ))}
                            </div>
                          </label>
                        </div>

                        {/* Attire & Description */}
                        <div className="admin-two-cols" style={{ marginTop: 6 }}>
                          <label className="admin-field">
                            सुझाया गया परिधान (Attire)
                            <input
                              value={ev.attire || ''}
                              placeholder="जैसे: पारंपरिक लाल व पीला परिधान"
                              onChange={(e) => {
                                const attire = e.target.value
                                setEditingWedding((w) => ({
                                  ...w,
                                  events: w.events.map((it, i) => (i === idx ? { ...it, attire } : it)),
                                }))
                              }}
                            />
                          </label>
                          <label className="admin-field">
                            कार्यक्रम का संक्षिप्त विवरण
                            <input
                              value={ev.description || ''}
                              placeholder="जैसे: ढोल-नगाड़ों एवं मंगल गीतों के साथ..."
                              onChange={(e) => {
                                const description = e.target.value
                                setEditingWedding((w) => ({
                                  ...w,
                                  events: w.events.map((it, i) => (i === idx ? { ...it, description } : it)),
                                }))
                              }}
                            />
                          </label>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                          <button
                            type="button"
                            className="admin-text-danger"
                            onClick={() => {
                              setEditingWedding((w) => ({
                                ...w,
                                events: w.events.filter((_, i) => i !== idx),
                              }))
                            }}
                          >
                            <Trash2 size={13} /> यह कार्यक्रम हटाएँ
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {editTab === 'pages' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#7a5240' }}>
                      कस्टम पृष्ठ (जैसे /sangeet, /haldi-special)
                    </p>
                    <button
                      type="button"
                      className="admin-button admin-button-quiet"
                      onClick={() => {
                        const newPg = {
                          id: `cp-${Date.now()}`,
                          title: 'नया विशेष पृष्ठ',
                          slug: `page-${(editingWedding.customPages?.length || 0) + 1}`,
                          subtitle: 'विवरण',
                          content: 'पृष्ठ की सामग्री यहाँ लिखें।',
                          showInNav: true,
                        }
                        setEditingWedding((w) => ({
                          ...w,
                          customPages: [...(w.customPages || []), newPg],
                        }))
                      }}
                    >
                      <Plus size={14} /> पृष्ठ जोड़ें
                    </button>
                  </div>

                  {(editingWedding.customPages || []).length === 0 ? (
                    <p style={{ color: '#8a5c38', fontStyle: 'italic', padding: '16px 0' }}>
                      अभी कोई कस्टम पृष्ठ नहीं है।
                    </p>
                  ) : (
                    (editingWedding.customPages || []).map((page, idx) => (
                      <div key={page.id || idx} className="photo-event-edit-row">
                        <div className="admin-two-cols">
                          <label className="admin-field">
                            पृष्ठ शीर्षक
                            <input
                              value={page.title}
                              onChange={(e) => {
                                const title = e.target.value
                                setEditingWedding((w) => ({
                                  ...w,
                                  customPages: w.customPages.map((it, i) =>
                                    i === idx ? { ...it, title } : it
                                  ),
                                }))
                              }}
                            />
                          </label>
                          <label className="admin-field">
                            स्लग (URL)
                            <input
                              value={page.slug}
                              onChange={(e) => {
                                const slug = e.target.value
                                setEditingWedding((w) => ({
                                  ...w,
                                  customPages: w.customPages.map((it, i) =>
                                    i === idx ? { ...it, slug } : it
                                  ),
                                }))
                              }}
                            />
                          </label>
                        </div>
                        <label className="admin-field">
                          विवरण
                          <textarea
                            rows={3}
                            value={page.content}
                            onChange={(e) => {
                              const content = e.target.value
                              setEditingWedding((w) => ({
                                ...w,
                                customPages: w.customPages.map((it, i) =>
                                  i === idx ? { ...it, content } : it
                                ),
                              }))
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          className="admin-text-danger"
                          style={{ marginTop: 8 }}
                          onClick={() => {
                            setEditingWedding((w) => ({
                              ...w,
                              customPages: w.customPages.filter((_, i) => i !== idx),
                            }))
                          }}
                        >
                          <Trash2 size={13} /> पृष्ठ हटाएँ
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="admin-form-actions" style={{ marginTop: 28 }}>
                <button
                  type="submit"
                  disabled={busySaveEdit || busyUpload}
                  className="admin-button admin-button-primary"
                >
                  <Save size={16} /> {busySaveEdit ? 'सुरक्षित हो रहा है…' : 'बदलाव सुरक्षित करें'}
                </button>
                <button
                  type="button"
                  className="admin-button admin-button-quiet"
                  onClick={() => setEditingWedding(null)}
                >
                  बंद करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
