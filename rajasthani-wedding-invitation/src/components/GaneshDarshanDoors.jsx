import { useEffect, useRef, useState } from 'react'
import { Bell, Play, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'

// Synthesize a sacred temple bell chime using Web Audio API
function playTempleBellChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    const now = ctx.currentTime
    const fundamental = 587.33 // D5 bell tone
    const partials = [
      { freq: fundamental * 1.0, gain: 0.6, decay: 2.8 },
      { freq: fundamental * 1.5, gain: 0.35, decay: 2.2 },
      { freq: fundamental * 2.0, gain: 0.25, decay: 1.8 },
      { freq: fundamental * 2.76, gain: 0.18, decay: 1.4 },
      { freq: fundamental * 4.07, gain: 0.12, decay: 1.0 },
    ]

    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(gain, now + 0.015)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay)

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + decay)
    })
  } catch (e) {
    // Graceful fallback if audio context blocked
  }
}

// Particle Canvas: Golden sparklets & falling marigold / rose petals (optimized for mobile)
function DivineEffectsCanvas({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', handleResize)

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Petals & sparkles - reduced count on mobile devices for battery and smooth 60fps
    const count = prefersReducedMotion ? 6 : (isMobile ? 16 : 35)
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: (Math.random() * (isMobile ? 6 : 8)) + 3,
      speedY: prefersReducedMotion ? 0.3 : (Math.random() * 1.1 + 0.5),
      speedX: Math.sin(Math.random() * Math.PI) * 0.6,
      rotation: Math.random() * 360,
      rotSpeed: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 1.6,
      type: Math.random() > 0.4 ? 'marigold' : 'sparkle',
      color: Math.random() > 0.5 ? '#f4a32e' : '#f5c345',
      opacity: Math.random() * 0.65 + 0.35,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      particles.forEach((p) => {
        p.y += p.speedY
        p.x += Math.sin(p.y * 0.02) * 0.5
        p.rotation += p.rotSpeed

        if (p.y > height + 20) {
          p.y = -20
          p.x = Math.random() * width
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity

        if (p.type === 'marigold') {
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.shadowColor = '#e68a00'
          ctx.shadowBlur = 3
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2)
          ctx.fillStyle = '#fff4cc'
          ctx.shadowColor = '#ffd700'
          ctx.shadowBlur = 6
          ctx.fill()
        }

        ctx.restore()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [active])

  return <canvas ref={canvasRef} className="divine-canvas-overlay" />
}

export default function GaneshDarshanDoors({
  customGaneshPhoto = '',
  ganeshGardenPhoto = '',
  ganeshPhotoFocal = '50% 25%',
  audioUrl = '/music/ganesh-mantra.mp3',
  autoOpenDelay = 1400,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [imageError, setImageError] = useState(false)
  const audioRef = useRef(null)

  // Auto-open doors smoothly on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      handleOpenDoors()
    }, autoOpenDelay)
    return () => clearTimeout(timer)
  }, [autoOpenDelay])

  const handleOpenDoors = () => {
    if (isOpen) return
    setIsOpen(true)
    setHasOpenedOnce(true)
    playTempleBellChime()
  }

  const handleCloseDoors = () => {
    setIsOpen(false)
  }

  const handleToggle = () => {
    if (isOpen) {
      handleCloseDoors()
    } else {
      handleOpenDoors()
    }
  }

  const handleReplay = () => {
    setIsOpen(false)
    setTimeout(() => {
      setIsOpen(true)
      playTempleBellChime()
    }, 450)
  }

  const toggleDevotionalMusic = () => {
    if (!audioRef.current) return
    if (isPlayingAudio) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => {})
    }
  }

  const ganeshImageSrc = customGaneshPhoto || '/images/lord-ganesh-darshan.jpg'

  return (
    <div className="ganesh-darshan-wrapper">
      {/* Devotional Mantra Audio */}
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        onEnded={() => setIsPlayingAudio(false)}
      />

      {/* Top Auspicious Inscription */}
      <div className="darshan-header-seal">
        <span className="seal-sloka">॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ॥</span>
        <h3 className="darshan-title">श्री गणेश शुभ दर्शन</h3>
        <p className="darshan-subtitle">
          {isOpen
            ? 'कपाट खुले — विघ्नहर्ता का पावन आशीर्वाद आप पर सदैव बना रहे'
            : 'शाही मंदिर के कपाट खोलकर प्रथम पूज्य श्री गणेश जी के दर्शन करें'}
        </p>
      </div>

      {/* Grand Royal Temple Arch & Sanctum */}
      <div className="temple-arch-frame">
        {/* Ornate Toran with bells at top */}
        <div className="temple-toran" aria-hidden="true">
          <div className="toran-garland">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="toran-leaf" />
            ))}
          </div>
          <div className="toran-bells">
            <span className={`hanging-bell ${isOpen ? 'ringing' : ''}`}>
              <Bell size={18} />
            </span>
            <span className={`hanging-bell center-bell ${isOpen ? 'ringing' : ''}`}>
              <Bell size={24} />
            </span>
            <span className={`hanging-bell ${isOpen ? 'ringing' : ''}`}>
              <Bell size={18} />
            </span>
          </div>
        </div>

        {/* 3D Perspective Sanctum Box */}
        <div className={`sanctum-perspective-box ${isOpen ? 'doors-open' : 'doors-closed'}`}>
          {/* ── SANCTUM BACKGROUND: Divine Lord Ganesh Image & Aura ── */}
          <div className="sanctum-interior">
            {/* Radiant Sunburst God-Rays */}
            <div className={`divine-god-rays ${isOpen ? 'active-rays' : ''}`} />
            <div className="divine-aura-glow" />

            {/* Lord Ganesha Image with Divine Floating Animation */}
            <div className={`ganesh-divine-figure ${isOpen ? 'figure-visible' : ''}`}>
              {imageError ? (
                <div className="ganesh-fallback-card">
                  <span className="ganesh-fallback-om">ॐ</span>
                  <p>॥ श्री गणेशाय नमः ॥</p>
                  <small>विघ्नहर्ता सुखकर्ता सदा सहाय</small>
                </div>
              ) : (
                <img
                  src={ganeshImageSrc}
                  alt="भगवान श्री गणेश जी"
                  className="ganesh-sacred-img"
                  style={{ objectPosition: ganeshPhotoFocal }}
                  onError={() => setImageError(true)}
                  loading="eager"
                />
              )}
              <div className="ganesh-frame-shimmer" />
            </div>

            {/* Left & Right Glowing Brass Diyas */}
            <div className="sanctum-diya diya-left">
              <div className="diya-flame" />
              <div className="diya-glow" />
            </div>
            <div className="sanctum-diya diya-right">
              <div className="diya-flame" />
              <div className="diya-glow" />
            </div>

            {/* Falling Flower Petals & Divine Sparkles */}
            {isOpen && <DivineEffectsCanvas active={isOpen} />}

            {/* Sacred Shloka Ribbon at bottom of sanctum */}
            <div className="sanctum-bottom-shloka">
              <span>निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा</span>
            </div>
          </div>

          {/* ── 3D TEMPLE DOORS ── */}
          <div className="temple-doors-container" onClick={handleToggle}>
            {/* Left Door */}
            <div className={`temple-door door-left ${isOpen ? 'door-left-open' : ''}`}>
              <div className="door-panel">
                <img
                  src="/images/temple-door-left.jpg"
                  alt="बायाँ कपाट"
                  className="door-texture"
                />
                <div className="door-ornaments">
                  <div className="door-handle door-handle-left" />
                  <div className="door-brass-studs" />
                </div>
                <div className="door-light-reflection" />
              </div>
            </div>

            {/* Right Door */}
            <div className={`temple-door door-right ${isOpen ? 'door-right-open' : ''}`}>
              <div className="door-panel">
                <img
                  src="/images/temple-door-right.jpg"
                  alt="दायाँ कपाट"
                  className="door-texture"
                />
                <div className="door-ornaments">
                  <div className="door-handle door-handle-right" />
                  <div className="door-brass-studs" />
                </div>
                <div className="door-light-reflection" />
              </div>
            </div>

            {/* Center Royal Brass Lock/Seal when doors are closed */}
            <div className={`door-center-seal ${isOpen ? 'seal-hidden' : 'seal-visible'}`}>
              <div className="seal-disc">
                <span>श्री</span>
                <small>शुभ लाभ</small>
              </div>
              <p className="seal-prompt">द्वार खोलने हेतु स्पर्श करें</p>
            </div>
          </div>
        </div>

        {/* Temple Base & Steps */}
        <div className="temple-pedestal">
          <div className="pedestal-top" />
          <div className="pedestal-steps">
            <span />
            <span />
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="darshan-controls-bar">
        <button
          type="button"
          className="darshan-btn darshan-btn-gold"
          onClick={handleToggle}
        >
          <Sparkles size={16} />
          {isOpen ? 'कपाट बंद करें' : 'कपाट खोलें (Open Doors)'}
        </button>

        {hasOpenedOnce && (
          <button
            type="button"
            className="darshan-btn darshan-btn-quiet"
            onClick={handleReplay}
            title="पुनः कपाट खोलकर दर्शन करें"
          >
            <RotateCcw size={15} /> पुनः दर्शन करें
          </button>
        )}

        <button
          type="button"
          className={`darshan-btn darshan-btn-quiet ${isPlayingAudio ? 'is-playing' : ''}`}
          onClick={toggleDevotionalMusic}
        >
          {isPlayingAudio ? <Volume2 size={16} color="#2d7a46" /> : <VolumeX size={16} />}
          {isPlayingAudio ? 'मंत्र वंदना बज रही है' : 'गणेश मंत्र सुनें'}
        </button>
      </div>
    </div>
  )
}
