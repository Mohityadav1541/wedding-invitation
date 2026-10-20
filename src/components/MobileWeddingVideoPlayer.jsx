import { useEffect, useRef, useState } from 'react'
import { Maximize2, Pause, Play, Sparkles, Volume2, VolumeX } from 'lucide-react'

export default function MobileWeddingVideoPlayer({
  video,
  className = '',
}) {
  const {
    title = 'शाही विवाह वीडियो',
    aspect = '16:9',
    poster = '/images/wedding-reel-mobile.jpg',
    videoUrl = '',
    description = '',
  } = video || {}

  const isPortrait = aspect === '9:16'
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [isInView, setIsInView] = useState(false)
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

  // Simulated progress when playing preview without local mp4
  useEffect(() => {
    let interval
    if (isPlaying && !videoUrl) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0
          return prev + 1.2
        })
      }, 250)
    }
    return () => clearInterval(interval)
  }, [isPlaying, videoUrl])

  const handlePlayToggle = () => {
    if (!hasStarted) setHasStarted(true)
    if (videoElementRef.current && videoUrl) {
      if (isPlaying) {
        videoElementRef.current.pause()
        setIsPlaying(false)
      } else {
        videoElementRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {})
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

  return (
    <div
      ref={containerRef}
      className={`mobile-video-card ${isPortrait ? 'video-reel-portrait' : 'video-cinema-landscape'} ${className}`}
    >
      <div className="mobile-video-aspect-box">
        {/* Poster / Background Visual */}
        <img
          src={poster}
          alt={title}
          className={`mobile-video-poster ${isPlaying ? 'poster-faded' : ''}`}
          loading="lazy"
        />

        {/* Real video tag if valid URL is present and user requested playback */}
        {hasStarted && videoUrl && isInView && (
          <video
            ref={videoElementRef}
            src={videoUrl}
            poster={poster}
            playsInline
            muted={isMuted}
            loop
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

        {/* Ambient Gradient Overlays */}
        <div className="mobile-video-gradient" />

        {/* Top Badges */}
        <div className="mobile-video-top-bar">
          <span className="mobile-video-badge">
            <Sparkles size={12} /> {isPortrait ? '9:16 रील्स' : '16:9 सिनेमैटिक'}
          </span>
          {hasStarted && (
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
        </div>

        {/* Center Big Play / Pause Button */}
        <button
          type="button"
          onClick={handlePlayToggle}
          className={`mobile-video-play-btn ${isPlaying ? 'is-playing' : ''}`}
          aria-label={isPlaying ? 'रोकें' : 'चलाएँ'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={28} className="translate-x-0.5" />}
        </button>

        {/* Bottom Controls */}
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
      </div>
    </div>
  )
}
