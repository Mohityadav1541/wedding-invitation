import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ExternalLink, Maximize2, Pause, Play, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { parseVideoUrl } from '../lib/weddingVideoOptions.js'

export default function MobileWeddingVideoPlayer({
  video,
  className = '',
}) {
  const {
    title = 'शाही विवाह वीडियो',
    aspect = '16:9',
    poster = '',
    videoUrl = '',
    description = '',
  } = video || {}

  const parsed = parseVideoUrl(videoUrl)
  const isEmbed = parsed.isEmbed
  const isPortrait = aspect === '9:16' || parsed.isShorts
  const effectivePoster = poster || parsed.defaultPoster || '/images/wedding-reel-mobile.jpg'

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const containerRef = useRef(null)
  const videoElementRef = useRef(null)

  // IntersectionObserver for lazy loading video elements
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Simulated progress when playing preview without local mp4 or when embed is playing
  useEffect(() => {
    let interval
    if (isPlaying && (!videoUrl || isEmbed)) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0
          return prev + 1.2
        })
      }, 250)
    }
    return () => clearInterval(interval)
  }, [isPlaying, videoUrl, isEmbed])

  const handlePlayToggle = () => {
    if (!hasStarted) setHasStarted(true)
    if (isEmbed) {
      setIsPlaying(true)
      return
    }
    if (videoElementRef.current && videoUrl) {
      if (isPlaying) {
        videoElementRef.current.pause()
        setIsPlaying(false)
      } else {
        videoElementRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setVideoError(true)
          })
      }
    } else {
      setIsPlaying((prev) => !prev)
    }
  }

  const handleMuteToggle = (e) => {
    e.stopPropagation()
    const next = !isMuted
    setIsMuted(next)
    if (videoElementRef.current) {
      videoElementRef.current.muted = next
    }
  }

  const handleFullscreen = (e) => {
    e.stopPropagation()
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    } else {
      el.requestFullscreen?.().catch(() => {})
    }
  }

  const showEmbedIframe = hasStarted && isEmbed && isInView

  return (
    <div
      ref={containerRef}
      className={`mobile-video-card ${isPortrait ? 'video-reel-portrait' : 'video-cinema-landscape'} ${showEmbedIframe ? 'is-embed-active' : ''} ${className}`}
    >
      <div className="mobile-video-aspect-box">
        {/* Poster / Background Visual */}
        <img
          src={effectivePoster}
          alt={title}
          className={`mobile-video-poster ${isPlaying ? 'poster-faded' : ''}`}
          loading="lazy"
        />

        {/* Embedded Video (YouTube, Google Drive, Vimeo, Instagram) */}
        {showEmbedIframe && (
          <iframe
            src={parsed.embedUrl}
            title={title}
            className="mobile-video-element mobile-video-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        )}

        {/* Direct Video Tag if MP4/WebM URL */}
        {hasStarted && !isEmbed && parsed.cleanUrl && isInView && (
          <video
            ref={videoElementRef}
            src={parsed.cleanUrl}
            poster={effectivePoster}
            playsInline
            muted={isMuted}
            loop
            onError={() => setVideoError(true)}
            onTimeUpdate={() => {
              if (videoElementRef.current) {
                const current = videoElementRef.current.currentTime
                const total = videoElementRef.current.duration || 1
                setProgress((current / total) * 100)
              }
            }}
            className="mobile-video-element"
          />
        )}

        {/* Video Load Failure Fallback */}
        {videoError && (
          <div
            className="video-error-fallback"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              background: 'rgba(20,5,10,0.88)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              textAlign: 'center',
            }}
          >
            <AlertCircle size={30} style={{ color: '#ffd700', marginBottom: 8 }} />
            <p style={{ color: '#fff', fontSize: 13, margin: '0 0 10px' }}>
              यह वीडियो सीधे इस ब्राउज़र में लोड नहीं हो सका।
            </p>
            {parsed.cleanUrl && (
              <a
                href={parsed.cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-gold"
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                <ExternalLink size={13} /> नए टैब में वीडियो देखें
              </a>
            )}
          </div>
        )}

        {/* Ambient Gradient Overlays */}
        <div className="mobile-video-gradient" />

        {/* Top Badges & External Link */}
        <div className="mobile-video-top-bar">
          <span className="mobile-video-badge">
            <Sparkles size={12} /> {isPortrait ? '9:16 रील्स' : '16:9 सिनेमैटिक'}
            {parsed.platformLabel ? ` • ${parsed.platformLabel}` : ''}
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {hasStarted && !isEmbed && (
              <button
                type="button"
                className="mobile-video-tool-btn"
                onClick={handleMuteToggle}
                title={isMuted ? 'ध्वनि चालू करें' : 'ध्वनि बंद करें'}
                aria-label="ध्वनि नियंत्रण"
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            )}
            {parsed.cleanUrl && (
              <a
                href={parsed.cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-video-tool-btn"
                title={`${parsed.platformLabel || 'वीडियो'} सीधे नए टैब में खोलें`}
                onClick={(e) => e.stopPropagation()}
                aria-label="वीडियो नए टैब में देखें"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Center Big Play / Pause Button (Hidden when embed is active) */}
        {!showEmbedIframe && (
          <button
            type="button"
            onClick={handlePlayToggle}
            className={`mobile-video-play-btn ${isPlaying ? 'is-playing' : ''}`}
            aria-label={isPlaying ? 'रोकें' : 'चलाएँ'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={28} className="translate-x-0.5" />}
          </button>
        )}

        {/* Bottom Controls (Hidden when embed is active) */}
        {!showEmbedIframe && (
          <div className="mobile-video-bottom-bar">
            <div className="mobile-video-controls-row">
              {/* Playback progress bar */}
              <div className="mobile-video-progress-track" onClick={(e) => e.stopPropagation()}>
                <div
                  className="mobile-video-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <button
                type="button"
                className="mobile-video-tool-btn"
                onClick={handleFullscreen}
                title="पूर्ण स्क्रीन"
                aria-label="पूर्ण स्क्रीन"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
