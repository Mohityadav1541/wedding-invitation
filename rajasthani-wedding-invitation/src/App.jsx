import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Camera,
  ExternalLink,
  Heart,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Users,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import PhotographerPortal from './pages/PhotographerPortal.jsx'
import WeddingAdminPortal from './pages/WeddingAdminPortal.jsx'
import PublicInvitation from './pages/PublicInvitation.jsx'
import { weddingAdminLogin } from './lib/api.js'

/**
 * Royal Landing Portal for `/`
 * Exclusive gateway to Photographer Portal and Secure PIN-Based Wedding Admin Access.
 * All public wedding pages are strictly private and accessible only via direct link or PIN.
 */
function PlatformHome() {
  const navigate = useNavigate()
  const [pinInput, setPinInput] = useState('')
  const [busyVerifying, setBusyVerifying] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(false)

  const attemptAutoPinLogin = async (pinToTry) => {
    const trimmed = (pinToTry || '').trim()
    if (!trimmed || busyVerifying) return
    setLoginError('')
    setBusyVerifying(true)
    try {
      await weddingAdminLogin(trimmed)
      setLoginSuccess(true)
      setTimeout(() => {
        navigate('/wedding-admin')
      }, 350)
    } catch (err) {
      setLoginError(err.message || 'अमान्य PIN दर्ज किया गया। कृपया पुनः प्रयास करें।')
      setBusyVerifying(false)
    }
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    attemptAutoPinLogin(pinInput)
  }

  return (
    <div className="platform-landing-shell">
      {/* Royal Header */}
      <header className="admin-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="admin-brand">
          <span className="brand-mark">
            <span>श्री</span>
            <i />
          </span>
          <span>
            <strong>राजसी विवाह आमंत्रण मंच</strong>
            <small>मल्टी-वेडिंग फोटोग्राफर प्लेटफॉर्म</small>
          </span>
        </div>
        <div className="admin-header-actions">
          <Link to="/photographer" className="admin-button admin-button-primary">
            <Camera size={15} /> फोटोग्राफर पोर्टल
          </Link>
          <Link to="/wedding-admin" className="admin-button admin-button-quiet">
            <KeyRound size={15} /> परिवार एडमिन PIN
          </Link>
        </div>
      </header>

      {/* Hero Welcome & Instant PIN Gateway */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '50px 20px 90px', textAlign: 'center' }}>
        <div className="admin-login-seal" style={{ margin: '0 auto 16px' }}>श्री</div>
        <p className="admin-eyebrow" style={{ color: '#8c2d19', letterSpacing: '.2em' }}>
          ✦ रॉयल राजस्थानी हिंदू विवाह आमंत्रण ✦
        </p>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(30px, 4.5vw, 50px)', color: '#2a0d15', margin: '8px 0 16px' }}>
          शाही विवाह आमंत्रण मंच
        </h1>
        <p style={{ maxWidth: 660, margin: '0 auto 36px', fontSize: 16, color: '#684534', lineHeight: 1.7 }}>
          प्रत्येक विवाह का अपना सुरक्षित व स्वतंत्र व्यवस्थापक PIN होता है। गोपनीयता बनाए रखने हेतु केवल अधिकृत परिवार ही अपना विशिष्ट PIN दर्ज करके अपने विवाह का डैशबोर्ड खोल सकते हैं।
        </p>

        {/* ── Instant PIN Access Box ── */}
        <section
          style={{
            maxWidth: 580,
            margin: '0 auto 50px',
            background: 'linear-gradient(145deg, #fffcf5 0%, #fdf6ea 100%)',
            border: '2px solid #deb867',
            borderRadius: 18,
            padding: '30px 26px',
            boxShadow: '0 12px 40px rgba(140,45,25,0.09)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #e6b800, #a87d00)',
              color: '#2a0d15',
              display: 'grid',
              placeContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 4px 14px rgba(168,125,0,0.3)',
            }}
          >
            <KeyRound size={26} />
          </div>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#2a0d15', margin: '0 0 8px' }}>
            विवाह व्यवस्थापक प्रवेश (Direct PIN Access)
          </h2>
          <p style={{ fontSize: 13, color: '#7a5240', margin: '0 0 20px', lineHeight: 1.6 }}>
            फोटोग्राफर द्वारा दिया गया अपना व्यवस्थापक PIN यहाँ पेस्ट करें या लिखें — <strong>सही PIN दर्ज होते ही आपका विवाह पेज स्वतः खुल जाएगा:</strong>
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: 440, margin: '0 auto' }}>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <input
                id="home-admin-pin-input"
                name="adminPin"
                type="password"
                inputMode="numeric"
                maxLength={16}
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value
                  setPinInput(val)
                  if (loginError) setLoginError('')
                  // Automatically trigger login as soon as 8 digits are reached
                  if (val.trim().length >= 8 && !busyVerifying) {
                    attemptAutoPinLogin(val.trim())
                  }
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData?.getData('text') || ''
                  if (pasted.trim().length >= 4) {
                    setPinInput(pasted.trim())
                    setTimeout(() => attemptAutoPinLogin(pasted.trim()), 50)
                  }
                }}
                placeholder="उदा. 12345678 (PIN पेस्ट करते ही स्वतः खुलेगा)"
                autoComplete="current-password"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: 18,
                  fontFamily: 'monospace, serif',
                  letterSpacing: '3px',
                  textAlign: 'center',
                  borderRadius: 10,
                  border: '1.5px solid #c9a76d',
                  background: '#fff',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
                  outline: 'none',
                }}
              />
            </div>

            <button
              className="admin-button admin-button-primary"
              type="submit"
              disabled={busyVerifying || !pinInput.trim()}
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: 15,
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(140,45,25,0.2)',
              }}
            >
              {busyVerifying ? (
                <span>सत्यापित हो रहा है…</span>
              ) : loginSuccess ? (
                <>
                  <CheckCircle2 size={16} /> सत्यापित! डैशबोर्ड खुल रहा है…
                </>
              ) : (
                <>
                  <KeyRound size={16} /> डैशबोर्ड में प्रवेश करें <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {loginError && (
            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                borderRadius: 8,
                background: '#fdf2f2',
                border: '1px solid #f2bcbc',
                color: '#901212',
                fontSize: 13,
              }}
            >
              {loginError}
            </div>
          )}

          <small style={{ display: 'block', marginTop: 14, color: '#8a5c38', fontSize: 12 }}>
            🔒 किसी अन्य विवाह का विवरण देखने की अनुमति नहीं है। केवल सही PIN द्वारा अधिकृत पेज खुलता है।
          </small>
        </section>

        {/* 2 Primary Secure Portals */}
        <div className="platform-gateways-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {/* Gateway 1: Photographer Portal */}
          <div className="platform-gateway-card">
            <div className="platform-gateway-icon">
              <Camera size={28} />
            </div>
            <h3>फोटोग्राफर पोर्टल</h3>
            <code>/photographer</code>
            <p>
              सभी विवाह प्रोजेक्ट्स का मास्टर नियंत्रण, नए आमंत्रण बनाना, फोटो-वीडियो अपलोड, स्थायी व्यवस्थापक PIN व कस्टम PIN जनरेशन, और समग्र RSVP प्रबंधन।
            </p>
            <Link to="/photographer" className="admin-button admin-button-primary" style={{ justifyContent: 'center' }}>
              फोटोग्राफर लॉगिन <ExternalLink size={14} />
            </Link>
          </div>

          {/* Gateway 2: Wedding Admin Portal */}
          <div className="platform-gateway-card">
            <div className="platform-gateway-icon" style={{ background: 'radial-gradient(circle, #e6b800, #a87d00)' }}>
              <KeyRound size={28} />
            </div>
            <h3>साझा विवाह व्यवस्थापक</h3>
            <code>/wedding-admin</code>
            <p>
              परिवार केवल अपना विशिष्ट PIN दर्ज करता है। सर्वर सुरक्षित रूप से सही विवाह की पहचान कर उसी विवाह का डैशबोर्ड खोलता है।
            </p>
            <Link to="/wedding-admin" className="admin-button admin-button-quiet" style={{ justifyContent: 'center' }}>
              व्यवस्थापक PIN पोर्टल <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Architecture & Privacy Highlights */}
        <section style={{ marginTop: 44, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, textAlign: 'left' }}>
          <div style={{ background: '#fdf8ef', padding: 20, borderRadius: 12, border: '1px solid #ebd7af' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8c2d19', marginBottom: 8, fontWeight: 600 }}>
              <ShieldCheck size={20} /> क्रिप्टोग्राफिक सुरक्षा
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#684534', lineHeight: 1.6 }}>
              Salted Scrypt हैशिंग और Timing-Safe तुलना। प्रत्येक विवाह का PIN गोपनीय रहता है।
            </p>
          </div>

          <div style={{ background: '#fdf8ef', padding: 20, borderRadius: 12, border: '1px solid #ebd7af' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8c2d19', marginBottom: 8, fontWeight: 600 }}>
              <Users size={20} /> पूर्ण डेटा पृथक्करण
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#684534', lineHeight: 1.6 }}>
              विवाह A का व्यवस्थापक कभी भी विवाह B के मेहमान या आंकड़े नहीं देख सकता। सार्वजनिक सूची मंच पर उपलब्ध नहीं है।
            </p>
          </div>

          <div style={{ background: '#fdf8ef', padding: 20, borderRadius: 12, border: '1px solid #ebd7af' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8c2d19', marginBottom: 8, fontWeight: 600 }}>
              <KeyRound size={20} /> स्थायी फोटोग्राफर नियंत्रण
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#684534', lineHeight: 1.6 }}>
              फोटोग्राफर पोर्टल में सभी विवाह PIN हमेशा उपलब्ध रहते हैं। फोटोग्राफर अपनी सुविधानुसार कभी भी कस्टम PIN सेट अथवा प्रोजेक्ट हटा सकते हैं।
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
      {/* 1. Main Platform Landing Portal */}
      <Route path="/" element={<PlatformHome />} />

      {/* 2. Photographer Portal Entry Point */}
      <Route path="/photographer" element={<PhotographerPortal />} />

      {/* 3. Shared Wedding Admin Portal Entry Point */}
      <Route path="/wedding-admin" element={<WeddingAdminPortal />} />
      {/* Legacy /admin redirect */}
      <Route path="/admin" element={<Navigate to="/wedding-admin" replace />} />

      {/* 4. Public Wedding Invitation Entry Points */}
      <Route path="/w/:weddingSlug" element={<PublicInvitation />} />
      <Route path="/w/:weddingSlug/ganesh" element={<PublicInvitation subView="ganesh" />} />
      <Route path="/w/:weddingSlug/story" element={<PublicInvitation subView="story" />} />
      <Route path="/w/:weddingSlug/events" element={<PublicInvitation subView="events" />} />
      <Route path="/w/:weddingSlug/venue" element={<PublicInvitation subView="venue" />} />
      <Route path="/w/:weddingSlug/gallery" element={<PublicInvitation subView="gallery" />} />
      <Route path="/w/:weddingSlug/rsvp" element={<PublicInvitation subView="rsvp" />} />
      <Route path="/w/:weddingSlug/:subSlug" element={<PublicInvitation subView="custom" />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
