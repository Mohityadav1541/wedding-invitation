import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import {
  ArrowDown,
  ArrowLeft,
  Calendar,
  CalendarDays,
  Check,
  Clock,
  Clock3,
  Film,
  Heart,
  Image as ImageIcon,
  MapPin,
  MapPinned,
  Menu,
  Music,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import GaneshDarshanDoors from '../components/GaneshDarshanDoors.jsx'
import GaneshMantraPlayer from '../components/GaneshMantraPlayer.jsx'
import RajPortrait from '../components/RajPortrait.jsx'
import MobileWeddingVideoPlayer from '../components/MobileWeddingVideoPlayer.jsx'
import { fetchPublicWedding, submitRsvp } from '../lib/api.js'
import { getGoogleMapsDestinationUrl } from '../lib/weddingVenueOptions.js'

function formatCountdown(targetDate) {
  if (!targetDate) return null
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds, isPast: false }
}

function Ornament({ className = '' }) {
  return (
    <div className={`ornament ${className}`} aria-hidden="true">
      <span />
      <b>✦</b>
      <span />
    </div>
  )
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` }}>
      {children}
    </div>
  )
}

export default function PublicInvitation({ subView = 'home' }) {
  const { weddingSlug, subSlug } = useParams()
  const [searchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [wedding, setWedding] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Mobile navigation drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Lightbox modal for gallery photo inspection
  const [activePhotoModal, setActivePhotoModal] = useState(null)

  // Ambient site background audio
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef(null)

  // Countdown timer
  const [countdown, setCountdown] = useState(null)

  // RSVP Form State
  const [rsvpDraft, setRsvpDraft] = useState({
    name: '',
    phone: '',
    attendance: 'yes',
    guests: 2,
    selectedEvents: [],
    message: '',
  })
  const [busyRsvp, setBusyRsvp] = useState(false)
  const [rsvpSuccess, setRsvpSuccess] = useState(null)
  const [rsvpError, setRsvpError] = useState('')

  // Load public wedding by slug
  useEffect(() => {
    if (!weddingSlug) return
    setLoading(true)
    setNotFound(false)
    setErrorMessage('')

    fetchPublicWedding(weddingSlug)
      .then((data) => {
        setWedding(data.wedding)
      })
      .catch((err) => {
        setNotFound(true)
        setErrorMessage(err.message || 'शुभ विवाह आमंत्रण उपलब्ध नहीं है।')
      })
      .finally(() => setLoading(false))
  }, [weddingSlug])

  // Countdown interval
  useEffect(() => {
    if (!wedding?.weddingDate) return
    setCountdown(formatCountdown(wedding.weddingDate))
    const timer = setInterval(() => {
      setCountdown(formatCountdown(wedding.weddingDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [wedding?.weddingDate])

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
      setMusicPlaying(false)
    } else {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {})
    }
  }

  const handleRsvpSubmit = async (e) => {
    e.preventDefault()
    setRsvpError('')
    setBusyRsvp(true)
    try {
      const res = await submitRsvp(weddingSlug, rsvpDraft)
      setRsvpSuccess(res.message || 'आपका उत्तर सफलतापूर्वक दर्ज कर लिया गया है।')
      setRsvpDraft({
        name: '',
        phone: '',
        attendance: 'yes',
        guests: 2,
        selectedEvents: [],
        message: '',
      })
    } catch (err) {
      setRsvpError(err.message || 'उत्तर दर्ज नहीं हो सका। कृपया पुनः प्रयास करें।')
    } finally {
      setBusyRsvp(false)
    }
  }

  // 404 / Loading Screens
  if (loading) {
    return (
      <div className="admin-login-shell">
        <div className="admin-login-card" style={{ textAlign: 'center', padding: '60px 30px' }}>
          <div className="admin-login-seal">श्री</div>
          <p className="admin-eyebrow">शुभ विवाह आमंत्रण</p>
          <h2>शाही आमंत्रण लोड हो रहा है…</h2>
          <div className="pulse-loader" style={{ margin: '20px auto 0' }} />
        </div>
      </div>
    )
  }

  if (notFound || !wedding) {
    return (
      <div className="admin-login-shell">
        <div className="admin-login-card" style={{ textAlign: 'center', maxWidth: 480 }}>
          <div className="admin-login-seal">श्री</div>
          <p className="admin-eyebrow">शाही आमंत्रण</p>
          <h1 style={{ fontSize: 28, margin: '8px 0 14px' }}>आमंत्रण उपलब्ध नहीं है</h1>
          <p style={{ color: '#7a5240', marginBottom: 24 }}>
            {errorMessage || 'यह विवाह आमंत्रण उपलब्ध नहीं है अथवा अभी ड्राफ्ट स्थिति में है।'}
          </p>
          <Link to="/" className="admin-button admin-button-primary" style={{ justifyContent: 'center' }}>
            <ArrowLeft size={16} /> मुख्य पृष्ठ पर लौटें
          </Link>
        </div>
      </div>
    )
  }

  const isCustomPage = subView === 'custom' && subSlug
  const matchedCustomPage = isCustomPage
    ? (wedding.customPages || []).find((p) => p.slug === subSlug)
    : null

  const shareText = `सादर आमंत्रण: ${wedding.groomName} एवं ${wedding.brideName} का शुभ विवाह। कृपया इस लिंक पर पधारें:\n${window.location.href}`

  // Default demo photos (exactly 4 royal Rajasthani photos)
  const defaultDemoGallery = [
    { id: 'demo-g-1', url: '/images/gallery-haldi.jpg', aspect: '4:3' },
    { id: 'demo-g-2', url: '/images/gallery-sangeet.jpg', aspect: '4:3' },
    { id: 'demo-g-3', url: wedding.bridePhoto || '/images/bride-priya.jpg', aspect: '3:4' },
    { id: 'demo-g-4', url: wedding.groomPhoto || '/images/groom-rahul.jpg', aspect: '3:4' },
  ]

  // Default demo video (exactly 1 featured royal reel)
  const defaultDemoVideos = [
    {
      id: 'demo-v-1',
      aspect: '9:16',
      poster: '/images/wedding-reel-mobile.jpg',
      videoUrl: '',
    },
  ]

  // Gallery resolution:
  // - If custom uploaded photos exist, take up to 4 maximum.
  // - If not uploaded (null / empty) and not explicitly hidden, fallback to the 4 demo photos!
  // - If explicitly hidden (hideGallery === true), hide gallery.
  const hasUploadedGallery = Array.isArray(wedding.gallery) && wedding.gallery.length > 0
  const weddingGallery = wedding.hideGallery
    ? []
    : (hasUploadedGallery ? wedding.gallery.slice(0, 4) : defaultDemoGallery.slice(0, 4))

  // Video resolution:
  // - If custom uploaded video exists, take exactly 1 maximum.
  // - If not uploaded (null / empty) and not explicitly hidden, fallback to the demo video!
  // - If explicitly hidden (hideVideo === true), hide video.
  const hasUploadedVideos = Array.isArray(wedding.videos) && wedding.videos.length > 0
  const weddingVideos = wedding.hideVideo
    ? []
    : (hasUploadedVideos ? wedding.videos.slice(0, 1) : defaultDemoVideos.slice(0, 1))

  const showMediaSection = weddingGallery.length > 0 || weddingVideos.length > 0

  return (
    <div className="site-shell">
      {/* Background ambient music */}
      <audio ref={audioRef} src="/music/ambient-drone.wav" loop />

      {/* Preview mode banner if photographer is viewing draft */}
      {wedding.isPreview && (
        <aside className="preview-top-banner">
          <span>⚠️ <strong>फोटोग्राफर पूर्वावलोकन मोड:</strong> यह आमंत्रण अभी अप्रकाशित (ड्राफ्ट) है। मेहमान इसे तब तक नहीं देख सकते जब तक आप इसे प्रकाशित नहीं करते।</span>
        </aside>
      )}

      {/* Floating Audio & Share Controls */}
      <div className="floating-tools">
        <button
          type="button"
          className="floating-tool-btn"
          onClick={toggleMusic}
          title={musicPlaying ? 'संगीत बंद करें' : 'संगीत शुरू करें'}
          aria-label="संगीत नियंत्रण"
        >
          {musicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noreferrer"
          className="floating-tool-btn whatsapp-share"
          title="WhatsApp पर साझा करें"
          aria-label="WhatsApp पर साझा करें"
        >
          <Share2 size={18} />
        </a>
      </div>

      {/* Top Auspicious Ribbon */}
      <div className="top-ribbon">
        <span>॥ श्री गणेशाय नमः ॥</span>
        <span className="top-ribbon-center">शाही राजस्थानी विवाह आमंत्रण</span>
        <span>शुभ विवाह</span>
      </div>

      {/* Royal Header Navigation with Mobile Hamburger Menu */}
      <header className="site-header">
        <Link to={`/w/${wedding.slug}`} className="brand">
          <span className="brand-mark">
            <span>श्री</span>
            <i />
          </span>
          <span className="brand-words">
            <strong>{wedding.groomName} <span>♥</span> {wedding.brideName}</strong>
            <small>शुभ विवाह आमंत्रण</small>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <a href="#ganesh-blessing">गणेश आशीर्वाद</a>
          <a href="#ganesh-darshan">मंदिर कपाट</a>
          <a href="#couple">वर-वधू</a>
          <a href="#countdown">शुभ मुहूर्त</a>
          <a href="#events">शुभ रस्में</a>
          <a href="#venue">विवाह स्थल</a>
          <a href="#gallery-videos">गैलरी व वीडियो</a>
          <a href="#mantra">मंत्र वंदना</a>
          {(wedding.customPages || []).slice(0, 2).map((cp) => (
            <Link key={cp.id} to={`/w/${wedding.slug}/${cp.slug}`}>
              {cp.title}
            </Link>
          ))}
          <a href="#rsvp" className="nav-rsvp">
            <Sparkles size={14} /> RSVP
          </a>
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'मेनू बंद करें' : 'मेनू खोलें'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-nav-drawer-inner" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="brand-words">
                <strong>{wedding.groomName} <span>♥</span> {wedding.brideName}</strong>
                <small>शाही आमंत्रण सूची</small>
              </span>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="मेनू बंद करें"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="mobile-drawer-links">
              <a href="#ganesh-blessing" onClick={() => setMobileMenuOpen(false)}>
                १. श्री गणेश आशीर्वाद
              </a>
              <a href="#ganesh-darshan" onClick={() => setMobileMenuOpen(false)}>
                २. मंदिर कपाट दर्शन
              </a>
              <a href="#couple" onClick={() => setMobileMenuOpen(false)}>
                ३. वर एवं वधू परिचय
              </a>
              <a href="#countdown" onClick={() => setMobileMenuOpen(false)}>
                ४. विवाह तिथि एवं काउंटडाउन
              </a>
              <a href="#family-blessing" onClick={() => setMobileMenuOpen(false)}>
                ५. परिवार स्नेह संदेश
              </a>
              <a href="#events" onClick={() => setMobileMenuOpen(false)}>
                ६. मांगलिक उत्सव व रस्में
              </a>
              <a href="#venue" onClick={() => setMobileMenuOpen(false)}>
                ७. विवाह स्थल एवं मार्ग
              </a>
              <a href="#gallery-videos" onClick={() => setMobileMenuOpen(false)}>
                ८. शाही गैलरी एवं वीडियो रील्स
              </a>
              <a href="#mantra" onClick={() => setMobileMenuOpen(false)}>
                ९. गणेश मंत्र वंदना एवं बोल
              </a>
              <a href="#rsvp" className="mobile-drawer-rsvp" onClick={() => setMobileMenuOpen(false)}>
                <Sparkles size={16} /> १०. उपस्थिति दर्ज करें (RSVP)
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* If viewing a dedicated custom ceremony page */}
      {isCustomPage && matchedCustomPage ? (
        <main className="section-pad" style={{ maxWidth: 840, margin: '40px auto', padding: '40px 20px 80px' }}>
          <Link to={`/w/${wedding.slug}`} className="admin-back-link" style={{ marginBottom: 24, display: 'inline-flex' }}>
            <ArrowLeft size={16} /> मुख्य आमंत्रण पर लौटें
          </Link>
          <p className="section-kicker">{matchedCustomPage.eyebrow || 'शुभ विवाह'}</p>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(28px, 5vw, 44px)', color: '#2a0d15', margin: '8px 0 14px' }}>
            {matchedCustomPage.title}
          </h1>
          {matchedCustomPage.subtitle && (
            <p style={{ color: '#8c5936', fontSize: 16, marginBottom: 24 }}>{matchedCustomPage.subtitle}</p>
          )}
          {matchedCustomPage.image && (
            <div className="custom-page-cover" style={{ marginBottom: 28, borderRadius: 12, overflow: 'hidden' }}>
              <img src={matchedCustomPage.image} alt={matchedCustomPage.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ fontSize: 16, lineHeight: 1.8, color: '#3d1622', whiteSpace: 'pre-line' }}>
            {matchedCustomPage.content}
          </div>
          {(matchedCustomPage.eventDate || matchedCustomPage.eventTime) && (
            <div className="route-event-meta" style={{ marginTop: 24 }}>
              <span><CalendarDays size={16} /> {matchedCustomPage.eventDate}</span>
              <span><Clock3 size={16} /> {matchedCustomPage.eventTime}</span>
            </div>
          )}
          {matchedCustomPage.mapUrl && (
            <div style={{ marginTop: 24 }}>
              <a href={matchedCustomPage.mapUrl} target="_blank" rel="noreferrer" className="button button-gold">
                स्थान देखें <MapPin size={16} />
              </a>
            </div>
          )}
        </main>
      ) : (
        /* Grand Main Royal Invitation View - Following Strict Mobile-First Vertical Hierarchy */
        <main>
          {/* ══════════════════════════════════════════════════════════════
              HIERARCHY ITEM 1: SHRI GANESH JI ARTWORK & AUSPICIOUS BLESSING
              ══════════════════════════════════════════════════════════════ */}
          <section id="ganesh-blessing" className="mobile-ganesh-opening-section" aria-labelledby="ganesh-opening-title">
            <div className="ganesh-opening-inner">
              <div className="ganesh-opening-badge" aria-hidden="true">
                <span>ॐ</span>
                <small>श्री गणेशाय नमः</small>
              </div>

              <p className="section-kicker">॥ प्रथम निमंत्रण विघ्नहर्ता को ॥</p>
              <h1 id="ganesh-opening-title" className="ganesh-opening-headline">
                श्री गणेश <em>शुभ आशीष</em>
              </h1>

              {/* Portrait Mobile Garden Art Frame */}
              <div className="ganesh-portrait-frame-wrap">
                <div className="ganesh-portrait-aura" />
                <div className="ganesh-portrait-container">
                  <img
                    src={wedding.ganeshGardenPhoto || wedding.ganeshPhoto || '/images/ganesh-garden-hero.jpg'}
                    alt="प्रथम पूज्य श्री गणेश जी"
                    className="ganesh-portrait-img"
                    style={{
                      objectPosition: wedding.ganeshPhotoFocal || '50% 25%',
                    }}
                    loading="eager"
                  />
                  <div className="ganesh-portrait-border-overlay" />
                  <div className="ganesh-portrait-marigold-strip">✿ ✦ ✿ ✦ ✿</div>
                </div>
              </div>

              {/* Sacred Sanskrit Inscription */}
              <div className="ganesh-opening-shloka">
                <p className="shloka-main">
                  वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।<br />
                  निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
                </p>
                <p className="shloka-sub">
                  हे विघ्नविनाशक, सूर्य के समान तेजस्वी प्रभु! हमारे इस मांगलिक विवाह कार्य को निर्विघ्न संपन्न करें।
                </p>
              </div>

              <div className="opening-thumb-action">
                <a href="#ganesh-darshan" className="button button-gold mobile-thumb-btn">
                  <Sparkles size={16} /> शाही मंदिर के कपाट खोलें (Enter Darshan)
                </a>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              HIERARCHY ITEM 2: OPENING INVITATION INTERACTION (3D DOORS)
              ══════════════════════════════════════════════════════════════ */}
          <section
            id="ganesh-darshan"
            className="section-pad ganesh-darshan-section"
            style={{
              background: 'radial-gradient(ellipse at 50% 40%, #3d0e1b 0%, #20060e 70%, #120307 100%)',
              padding: 'clamp(40px, 7vw, 90px) 16px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <GaneshDarshanDoors
              customGaneshPhoto={wedding.ganeshPhoto}
              ganeshGardenPhoto={wedding.ganeshGardenPhoto}
              ganeshPhotoFocal={wedding.ganeshPhotoFocal}
              audioUrl="/music/ganesh-mantra.mp3"
              autoOpenDelay={1200}
            />
          </section>

          {/* ══════════════════════════════════════════════════════════════
              HIERARCHY ITEM 3: COUPLE'S NAMES AND PHOTOGRAPHS
              ══════════════════════════════════════════════════════════════ */}
          <section id="couple" className="couple-showcase" aria-labelledby="couple-title">
            <p className="couple-showcase-kicker">✦ दो आत्माओं का पावन संगम ✦</p>
            <h2 id="couple-title" className="couple-showcase-title">
              दूल्हा एवं <em>दुल्हन</em>
            </h2>
            <p className="couple-showcase-divider">❦　❀　❦</p>

            <div className="couple-portraits-row">
              {/* Bride Portrait with focal position protection */}
              <div className="couple-portrait-unit">
                <RajPortrait
                  src={wedding.bridePhoto || '/images/bride-priya.jpg'}
                  alt={wedding.brideName}
                  placeholder="दुल्हन का चित्र"
                  focalPosition={wedding.bridePhotoFocalMobile || '50% 18%'}
                />
                <p className="couple-portrait-label">{wedding.brideName || 'दुल्हन'}</p>
                <p className="couple-portrait-role">दुल्हन (Bride)</p>
              </div>

              {/* Royal Rajasthani Connector */}
              <div className="couple-showcase-connector" aria-hidden="true">
                <span className="connector-heart">♥</span>
                <span className="connector-text">संग परिणय</span>
              </div>

              {/* Groom Portrait with focal position protection */}
              <div className="couple-portrait-unit">
                <RajPortrait
                  src={wedding.groomPhoto || '/images/groom-rahul.jpg'}
                  alt={wedding.groomName}
                  placeholder="दूल्हे का चित्र"
                  focalPosition={wedding.groomPhotoFocalMobile || '50% 16%'}
                />
                <p className="couple-portrait-label">{wedding.groomName || 'दूल्हा'}</p>
                <p className="couple-portrait-role">दूल्हा (Groom)</p>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              HIERARCHY ITEM 4: WEDDING DATE AND COUNTDOWN
              ══════════════════════════════════════════════════════════════ */}
          <section id="countdown" className="countdown-section section-pad">
            <Reveal className="countdown-inner">
              <p className="section-kicker">शुभ घड़ी का इंतज़ार</p>
              <h2 className="section-title">विवाह के पावन क्षण</h2>
              <div className="countdown-date-badge">
                <Calendar size={18} />
                <span>{wedding.weddingDateLabel || 'विवाह तिथि'}</span>
                {wedding.weddingTimeLabel && (
                  <>
                    <span className="date-dot">•</span>
                    <span>{wedding.weddingTimeLabel}</span>
                  </>
                )}
                {wedding.venue?.city && (
                  <>
                    <span className="date-dot">•</span>
                    <span>{wedding.venue.city}</span>
                  </>
                )}
              </div>
              <Ornament />

              {countdown && countdown.isPast ? (
                <div className="countdown-past">शुभ विवाह संपन्न हुआ। आपका बहुत-बहुत धन्यवाद!</div>
              ) : countdown ? (
                <div className="countdown-grid">
                  <div className="countdown-card">
                    <span className="countdown-number">{countdown.days}</span>
                    <span className="countdown-unit">दिन (Days)</span>
                  </div>
                  <div className="countdown-card">
                    <span className="countdown-number">{countdown.hours}</span>
                    <span className="countdown-unit">घंटे (Hours)</span>
                  </div>
                  <div className="countdown-card">
                    <span className="countdown-number">{countdown.minutes}</span>
                    <span className="countdown-unit">मिनट (Mins)</span>
                  </div>
                  <div className="countdown-card">
                    <span className="countdown-number">{countdown.seconds}</span>
                    <span className="countdown-unit">सेकंड (Secs)</span>
                  </div>
                </div>
              ) : null}
            </Reveal>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              HIERARCHY ITEM 5: FAMILY INVITATION MESSAGE & 3D PALACE
              ══════════════════════════════════════════════════════════════ */}
          <section id="family-blessing" className="blessing-section section-pad" aria-labelledby="blessing-title">
            <Reveal className="blessing-inner">
              <div className="blessing-emblem">
                <span>ॐ</span>
                <i />
              </div>
              <p className="section-kicker">मंगलम भगवान विष्णुः</p>
              <h2 id="blessing-title">शुभारंभ शुभ आशीषों के साथ</h2>

              <div className="sanskrit-blessing">
                {(wedding.blessing || '').split('\n').map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </div>

              <div className="family-invitation-box">
                <h3 className="family-invitation-heading">स्नेह आमंत्रण</h3>
                <p className="family-line">{wedding.familyLine}</p>
                <p className="blessing-note">
                  आपकी गरिमामयी उपस्थिति इस पावन अवसर को और भी मंगलमय बनाएगी। हमारे इस हर्षोल्लास में सम्मिलित होकर नवयुगल को अपना शुभाशीष प्रदान करें।
                </p>
              </div>

              {/* ✦ Shahi Saptapadi (पावन सात फेरे व सात वचन) - Royal Rajasthani Sacred Vows ✦ */}
              <div className="shahi-saptapadi-card" aria-labelledby="saptapadi-card-title">
                <div className="saptapadi-card-header">
                  <div className="saptapadi-sacred-flame" aria-hidden="true">
                    <span>🔥</span>
                  </div>
                  <p className="saptapadi-subheading">॥ अग्नि-साक्षी पावन संकल्प ॥</p>
                  <h3 id="saptapadi-card-title" className="saptapadi-heading">
                    सप्तपदी — <em>पावन सात फेरे व वचन</em>
                  </h3>
                  <div className="saptapadi-motif-divider">✦ ❦ ✦</div>
                </div>

                <div className="saptapadi-vows-grid">
                  <div className="saptapadi-vow-item">
                    <div className="vow-badge">१</div>
                    <div className="vow-content">
                      <strong className="vow-title">प्रथम वचन — पोषण व अन्न समृद्धि</strong>
                      <p className="vow-sanskrit">ॐ प्रथमं इषे विष्णुस्त्वान्वेतु</p>
                      <p className="vow-meaning">पारिवारिक जीवन में शुद्ध पोषण, आरोग्य, अन्न और ऐश्वर्य का संवर्धन करेंगे।</p>
                    </div>
                  </div>

                  <div className="saptapadi-vow-item">
                    <div className="vow-badge">२</div>
                    <div className="vow-content">
                      <strong className="vow-title">द्वितीय वचन — शक्ति व संबल</strong>
                      <p className="vow-sanskrit">ॐ द्वितीयं ऊर्जे विष्णुस्त्वान्वेतु</p>
                      <p className="vow-meaning">सुख-दुःख में एक-दूसरे को शारीरिक, मानसिक और आत्मिक बल प्रदान करेंगे।</p>
                    </div>
                  </div>

                  <div className="saptapadi-vow-item">
                    <div className="vow-badge">३</div>
                    <div className="vow-content">
                      <strong className="vow-title">तृतीय वचन — धर्मानुकूल ऐश्वर्य</strong>
                      <p className="vow-sanskrit">ॐ तृतीयं रायस्पोषाय विष्णुस्त्वान्वेतु</p>
                      <p className="vow-meaning">धर्म, नीति और निष्ठा के मार्ग पर चलकर घर में धन और यश की वृद्धि करेंगे।</p>
                    </div>
                  </div>

                  <div className="saptapadi-vow-item">
                    <div className="vow-badge">४</div>
                    <div className="vow-content">
                      <strong className="vow-title">चतुर्थ वचन — प्रेम व सद्भाव</strong>
                      <p className="vow-sanskrit">ॐ चतुर्थं मायोभवाय विष्णुस्त्वान्वेतु</p>
                      <p className="vow-meaning">गृहस्थ जीवन को परस्पर सम्मान, स्नेह, शांति और माधुर्य से आलोकित रखेंगे।</p>
                    </div>
                  </div>

                  <div className="saptapadi-vow-item">
                    <div className="vow-badge">५</div>
                    <div className="vow-content">
                      <strong className="vow-title">पंचम वचन — कुल-गौरव व संस्कार</strong>
                      <p className="vow-sanskrit">ॐ पञ्चमं प्रजाभ्यः विष्णुस्त्वान्वेतु</p>
                      <p className="vow-meaning">दोनों कुलों की प्रतिष्ठा, अतिथि सत्कार और सनातन संस्कारों का निर्वहन करेंगे।</p>
                    </div>
                  </div>

                  <div className="saptapadi-vow-item">
                    <div className="vow-badge">६</div>
                    <div className="vow-content">
                      <strong className="vow-title">षष्ठ वचन — आरोग्य व सहयोग</strong>
                      <p className="vow-sanskrit">ॐ षष्ठं ऋतुभ्यः विष्णुस्त्वान्वेतु</p>
                      <p className="vow-meaning">सभी ऋतुओं और परिस्थितियों में एक-दूसरे के स्वास्थ्य और प्रसन्नता का ध्यान रखेंगे।</p>
                    </div>
                  </div>

                  <div className="saptapadi-vow-item vow-item-highlight">
                    <div className="vow-badge">७</div>
                    <div className="vow-content">
                      <strong className="vow-title">सप्तम वचन — अटूट सखा भाव व निष्ठा</strong>
                      <p className="vow-sanskrit">ॐ सप्तमं सखेभ्यो विष्णुस्त्वान्वेतु</p>
                      <p className="vow-meaning">जीवन-पर्यंत सच्चे मित्र, निष्ठावान साथी बनकर दाम्पत्य के हर कर्तव्य को निभाएंगे।</p>
                    </div>
                  </div>
                </div>

                <div className="saptapadi-footer-blessing">
                  <span className="saptapadi-seal">॥ मंगलम् भगवान विष्णुः मंगलम् गरुड़ध्वजः ॥</span>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              HIERARCHY ITEM 6: WEDDING EVENT CARDS (TIMELINE)
              ══════════════════════════════════════════════════════════════ */}
          {Array.isArray(wedding.events) && wedding.events.length > 0 && (
            <section id="events" className="events-section section-pad" aria-labelledby="events-title">
              <div className="events-inner">
                <p className="section-kicker">मांगलिक समारोह एवं रस्में</p>
                <h2 id="events-title" className="section-title">
                  मांगलिक उत्सव की श्रृंखला
                </h2>
                <Ornament />

                <div className="events-timeline">
                  {wedding.events.map((ev, index) => (
                    <Reveal key={ev.id || index} className="event-item" delay={index * 80}>
                      <div className="event-step-badge">{index + 1}</div>
                      <div className="event-card">
                        <div className="event-header">
                          <div>
                            <h3 className="event-title">{ev.title}</h3>
                            <p className="event-subtitle">{ev.subtitle}</p>
                          </div>
                          {ev.attire && <span className="event-attire-pill">{ev.attire}</span>}
                        </div>
                        <p className="event-description">{ev.description}</p>
                        <div className="event-meta">
                          {ev.date && (
                            <span>
                              <Calendar size={14} /> {ev.date}
                            </span>
                          )}
                          {ev.time && (
                            <span>
                              <Clock size={14} /> {ev.time}
                            </span>
                          )}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════
              HIERARCHY ITEM 7: VENUE AND DIRECTIONS
              ══════════════════════════════════════════════════════════════ */}
          {wedding.venue && (
            <section id="venue" className="venue-section section-pad" aria-labelledby="venue-title">
              <Reveal className="venue-inner">
                <p className="section-kicker">स्थान एवं दिशा-निर्देश</p>
                <h2 id="venue-title" className="section-title">
                  विवाह स्थल (Wedding Venue)
                </h2>
                <Ornament />

                <div className="venue-card">
                  <div className="venue-seal">
                    <MapPinned size={32} />
                  </div>
                  <h3 className="venue-name">{wedding.venue.name || 'विवाह स्थल'}</h3>
                  <p className="venue-address">{wedding.venue.address}</p>
                  <p className="venue-city">{wedding.venue.city}</p>

                  {(wedding.venue.googleMapsQuery || wedding.venue.name || wedding.venue.address) && (
                    <a
                      href={getGoogleMapsDestinationUrl(wedding.venue)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-gold venue-map-btn"
                    >
                      <MapPin size={16} /> Google Maps में रास्ता देखें (Open Maps)
                    </a>
                  )}
                </div>
              </Reveal>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════
              HIERARCHY ITEM 8: GALLERY AND VIDEOS (MAX 4 PHOTOS • 1 VIDEO)
              ══════════════════════════════════════════════════════════════ */}
          {showMediaSection && (
            <section id="gallery-videos" className="gallery-video-section section-pad" aria-labelledby="gallery-video-title">
              <Reveal className="gallery-video-inner">
                <p className="section-kicker">शाही झलकियाँ एवं स्मृतियाँ</p>
                <h2 id="gallery-video-title" className="section-title">
                  फ़िल्म, रील्स एवं चित्र दीर्घा
                </h2>
                <Ornament />

                {/* Video Player Section (Max 1 Video - Clean without title text) */}
                {weddingVideos.length > 0 && (
                  <div className="wedding-videos-container">
                    <div className="media-section-subhead">
                      <Film size={18} />
                      <span>सिनेमैटिक वीडियो एवं मोबाइल रील्स</span>
                    </div>
                    <div className="videos-responsive-grid single-video-grid">
                      {weddingVideos.map((vid) => (
                        <MobileWeddingVideoPlayer key={vid.id || 'single-wedding-vid'} video={vid} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Gallery Grid (Max 4 Photos - Clean without title overlays) */}
                {weddingGallery.length > 0 && (
                  <div className="wedding-photos-container">
                    <div className="media-section-subhead">
                      <ImageIcon size={18} />
                      <span>मांगलिक उत्सव की तसवीरें</span>
                    </div>
                    <div className="photos-responsive-grid">
                      {weddingGallery.map((item) => (
                        <div
                          key={item.id}
                          className="photo-grid-card"
                          onClick={() => setActivePhotoModal(item)}
                          title="बड़ा चित्र देखें"
                        >
                          <div className="photo-grid-card-aspect">
                            <img
                              src={item.url}
                              alt="विवाह चित्र"
                              loading="lazy"
                              className="photo-grid-img"
                              style={{ objectPosition: item.focalMobile || '50% 30%' }}
                            />
                            <div className="photo-grid-hover-overlay">
                              <span className="photo-zoom-icon">
                                <Sparkles size={16} />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Reveal>
            </section>
          )}

          {/* Photo Lightbox Modal - Pure visual, no titles */}
          {activePhotoModal && (
            <div className="photo-lightbox-backdrop" onClick={() => setActivePhotoModal(null)}>
              <div className="photo-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="photo-lightbox-close"
                  onClick={() => setActivePhotoModal(null)}
                  aria-label="चित्र बंद करें"
                >
                  <X size={22} />
                </button>
                <img
                  src={activePhotoModal.url}
                  alt="शाही विवाह चित्र"
                  className="photo-lightbox-img"
                />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              HIERARCHY ITEM 9: MANTRA AUDIO AND COMPLETE LYRICS
              ══════════════════════════════════════════════════════════════ */}
          <section id="mantra" className="ganesh-section section-pad" aria-labelledby="ganesh-mantra-title">
            <Reveal className="ganesh-inner">
              <div className="ganesh-emblem">
                <span>ॐ</span>
                <i />
              </div>
              <p className="section-kicker">॥ पवित्र मंत्रोच्चार एवं स्तुति ॥</p>
              <h2 id="ganesh-mantra-title" className="section-title">
                विघ्नहर्ता का पावन आशीर्वाद एवं बोल
              </h2>
              <Ornament />

              <div style={{ margin: '30px auto', maxWidth: 740 }}>
                <GaneshMantraPlayer />
              </div>
            </Reveal>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              HIERARCHY ITEM 10: FUNCTIONING RSVP FORM
              ══════════════════════════════════════════════════════════════ */}
          <section id="rsvp" className="rsvp-section section-pad" aria-labelledby="rsvp-title">
            <Reveal className="rsvp-inner">
              <p className="section-kicker">उपस्थिति की सूचना (RSVP)</p>
              <h2 id="rsvp-title" className="section-title">
                कृपया अपनी उपस्थिति दर्ज कराएँ
              </h2>
              <p className="rsvp-desc">
                आपकी उपस्थिति हमारे लिए अत्यंत मूल्यवान है। कृपया व्यवस्था के सुचारू संचालन हेतु अपना उत्तर साझा करें।
              </p>
              <Ornament />

              {rsvpSuccess ? (
                <div className="rsvp-success-card">
                  <div className="rsvp-success-seal">
                    <Check size={36} />
                  </div>
                  <h3>बहुत-बहुत धन्यवाद!</h3>
                  <p>{rsvpSuccess}</p>
                  <p className="rsvp-success-note">
                    {wedding.groomName} एवं {wedding.brideName} परिवार आपकी अगवानी के लिए उत्सुक है।
                  </p>
                  <button
                    type="button"
                    className="button button-quiet"
                    onClick={() => setRsvpSuccess(null)}
                    style={{ marginTop: 16 }}
                  >
                    दूसरा उत्तर दर्ज करें
                  </button>
                </div>
              ) : (
                <form className="rsvp-form" onSubmit={handleRsvpSubmit}>
                  {rsvpError && <div className="rsvp-error-banner">{rsvpError}</div>}

                  <div className="admin-two-cols">
                    <label className="admin-field">
                      आपका पूरा नाम *
                      <input
                        required
                        value={rsvpDraft.name}
                        onChange={(e) => setRsvpDraft((d) => ({ ...d, name: e.target.value }))}
                        placeholder="उदा. श्री रमेश जी शर्मा"
                      />
                    </label>
                    <label className="admin-field">
                      फ़ोन / WhatsApp नंबर *
                      <input
                        required
                        type="tel"
                        value={rsvpDraft.phone}
                        onChange={(e) => setRsvpDraft((d) => ({ ...d, phone: e.target.value }))}
                        placeholder="+91 98290 12345"
                      />
                    </label>
                  </div>

                  {/* Attendance Selector */}
                  <label className="admin-field">
                    क्या आप विवाह में पधार रहे हैं? *
                    <div className="rsvp-attendance-toggle">
                      <button
                        type="button"
                        className={rsvpDraft.attendance === 'yes' ? 'active' : ''}
                        onClick={() => setRsvpDraft((d) => ({ ...d, attendance: 'yes' }))}
                      >
                        ✓ हाँ, हम सपरिवार अवश्य आएँगे
                      </button>
                      <button
                        type="button"
                        className={rsvpDraft.attendance === 'no' ? 'active' : ''}
                        onClick={() => setRsvpDraft((d) => ({ ...d, attendance: 'no', guests: 0 }))}
                      >
                        ✗ क्षमा करें, उपस्थित नहीं हो पाएँगे
                      </button>
                    </div>
                  </label>

                  {rsvpDraft.attendance === 'yes' && (
                    <label className="admin-field">
                      साथ में कुल आने वाले अतिथियों की संख्या (आप सहित) *
                      <input
                        type="number"
                        min={1}
                        max={15}
                        required
                        value={rsvpDraft.guests}
                        onChange={(e) =>
                          setRsvpDraft((d) => ({ ...d, guests: parseInt(e.target.value, 10) || 1 }))
                        }
                      />
                    </label>
                  )}

                  {/* Ceremony Multi-select */}
                  {rsvpDraft.attendance === 'yes' && Array.isArray(wedding.events) && wedding.events.length > 0 && (
                    <label className="admin-field">
                      किन कार्यक्रमों में सम्मिलित होंगे?
                      <div className="rsvp-events-checkboxes">
                        {wedding.events.map((ev) => {
                          const checked = rsvpDraft.selectedEvents.includes(ev.id)
                          return (
                            <label key={ev.id} className="rsvp-check-item">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRsvpDraft((d) => ({
                                      ...d,
                                      selectedEvents: [...d.selectedEvents, ev.id],
                                    }))
                                  } else {
                                    setRsvpDraft((d) => ({
                                      ...d,
                                      selectedEvents: d.selectedEvents.filter((id) => id !== ev.id),
                                    }))
                                  }
                                }}
                              />
                              <span>{ev.title}</span>
                            </label>
                          )
                        })}
                      </div>
                    </label>
                  )}

                  <label className="admin-field">
                    नवयुगल के लिए शुभकामना संदेश (वैकल्पिक)
                    <textarea
                      rows={3}
                      value={rsvpDraft.message}
                      onChange={(e) => setRsvpDraft((d) => ({ ...d, message: e.target.value }))}
                      placeholder="वर-वधू को अपना शुभाशीष व संदेश लिखें…"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={busyRsvp}
                    className="button button-gold rsvp-submit-btn"
                  >
                    <Sparkles size={16} /> {busyRsvp ? 'दर्ज हो रहा है…' : 'उत्तर सबमिट करें (Confirm RSVP)'}
                  </button>
                </form>
              )}
            </Reveal>
          </section>

          {/* ── FOOTER ── */}
          <footer className="site-footer">
            <div className="footer-seal">श्री</div>
            <p className="footer-title">
              {wedding.groomName} <span>♥</span> {wedding.brideName}
            </p>
            <p className="footer-sub">{wedding.familyLine}</p>
            <div className="footer-divider">✦ ✿ ✦</div>
            <p className="footer-copy">
              शाही राजस्थानी आमंत्रण · सभी अधिकार सुरक्षित
            </p>
          </footer>
        </main>
      )}
    </div>
  )
}
