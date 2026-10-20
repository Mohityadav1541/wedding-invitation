import { useEffect, useMemo, useRef, useState } from 'react'
import { AudioLines, BookOpenText, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react'

// Cue points are relative to the bundled, trimmed devotional recording.
// If you swap the recording, adjust these starts to match that version.
const LYRICS = [
  { start: 1, end: 14, text: 'वक्रतुण्ड महाकाय', transliteration: 'Vakratunda Mahakaya', meaning: 'घुमावदार सूंड और विशाल शरीर वाले प्रभु' },
  { start: 14, end: 27, text: 'सूर्यकोटि समप्रभ ।', transliteration: 'Suryakoti Samaprabha', meaning: 'करोड़ों सूर्यों के समान तेजस्वी' },
  { start: 27, end: 40, text: 'निर्विघ्नं कुरु मे देव', transliteration: 'Nirvighnam Kuru Me Deva', meaning: 'हे प्रभु, मेरे कार्यों को विघ्नों से मुक्त करें' },
  { start: 40, end: 55, text: 'सर्वकार्येषु सर्वदा ॥', transliteration: 'Sarvakaryeshu Sarvada', meaning: 'सभी कार्यों में, हमेशा और सदैव' },
]

const WORD_MEANINGS = [
  ['वक्रतुण्ड', 'घुमावदार सूंड वाले'],
  ['महाकाय', 'विशाल शरीर वाले'],
  ['सूर्यकोटि', 'करोड़ों सूर्यों के समान'],
  ['समप्रभ', 'समान तेज और प्रकाश वाले'],
  ['निर्विघ्नं', 'बिना विघ्न के'],
  ['कुरु', 'कर दीजिए'],
  ['मे', 'मेरे लिए / मेरे'],
  ['देव', 'हे प्रभु'],
  ['सर्वकार्येषु', 'सभी कार्यों में'],
  ['सर्वदा', 'हमेशा, सदैव'],
]

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return '0:00'
  const seconds = Math.floor(value)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export default function GaneshMantraPlayer({ audioSrc = '/music/ganesh-mantra.mp3' }) {
  const audioRef = useRef(null)
  const lyricsViewportRef = useRef(null)
  const lineRefs = useRef([])
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.85)
  const [followLyrics, setFollowLyrics] = useState(true)
  const [showMeanings, setShowMeanings] = useState(true)
  const [audioError, setAudioError] = useState('')

  const activeIndex = useMemo(
    () => LYRICS.findIndex((line) => currentTime >= line.start && currentTime < line.end),
    [currentTime],
  )
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (!followLyrics || activeIndex < 0) return
    const viewport = lyricsViewportRef.current
    const activeLine = lineRefs.current[activeIndex]
    if (!viewport || !activeLine) return
    const targetTop = activeLine.offsetTop - (viewport.clientHeight / 2) + (activeLine.clientHeight / 2)
    viewport.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
  }, [activeIndex, followLyrics])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    setAudioError('')
    try {
      await audio.play()
    } catch {
      setAudioError('ऑडियो शुरू नहीं हो पाया। कृपया दोबारा चलाएँ।')
    }
  }

  const seekBy = (seconds) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + seconds))
    setCurrentTime(audio.currentTime)
  }

  const seekTo = (value) => {
    const audio = audioRef.current
    if (!audio) return
    const next = Number(value)
    audio.currentTime = next
    setCurrentTime(next)
  }

  const selectLyric = async (line) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = line.start
    setCurrentTime(line.start)
    setFollowLyrics(true)
    if (audio.paused) {
      try {
        setAudioError('')
        await audio.play()
      } catch {
        setAudioError('इस पंक्ति से ऑडियो शुरू नहीं हो पाया।')
      }
    }
  }

  return (
    <section className="mantra-player-section" aria-labelledby="mantra-player-title">
      <div className="mantra-player-intro">
        <span className="mantra-section-kicker"><span>✦</span> श्रवण एवं स्मरण <span>✦</span></span>
        <h2 id="mantra-player-title">श्री गणेश वंदना</h2>
        <p>मंत्र सुनें, साथ-साथ पाठ पढ़ें और हर पंक्ति का भाव समझें।</p>
      </div>

      <div className="mantra-player-card">
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setAudioError('ऑडियो फ़ाइल उपलब्ध नहीं है। public/music/ganesh-mantra.mp3 की जाँच करें।')}
        />
        <div className="mantra-player-topline">
          <div className="mantra-album-art" aria-hidden="true"><div className="mantra-art-aura"/><span>श्री</span><small>गणेशाय नमः</small><i>✦</i></div>
          <div className="mantra-track-info">
            <span className="mantra-track-label"><AudioLines size={14}/> मंगल पाठ</span>
            <h3>वक्रतुण्ड महाकाय</h3>
            <p>श्री गणेश मंत्र · भक्तिमय धुन</p>
            <div className="mantra-now-playing" aria-live="polite">
              <span className={playing ? 'mantra-live-dot is-playing' : 'mantra-live-dot'}/>
              {playing ? (activeIndex >= 0 ? `अभी पाठ: ${LYRICS[activeIndex].text}` : 'मंगल धुन चल रही है') : 'सुनने के लिए चलाएँ'}
            </div>
          </div>
        </div>

        <div className="mantra-timeline">
          <input aria-label="ऑडियो समय चुनें" type="range" min="0" max={duration || 1} step="0.1" value={Math.min(currentTime, duration || 1)} onChange={(event) => seekTo(event.target.value)} style={{ '--audio-progress': `${progress}%` }} />
          <div className="mantra-time-labels"><span>{formatTime(currentTime)}</span><span>{duration ? formatTime(duration) : '—:—'}</span></div>
        </div>

        <div className="mantra-controls">
          <button type="button" className="mantra-skip-button" onClick={() => seekBy(-10)} aria-label="10 सेकंड पीछे जाएँ"><RotateCcw size={19}/><small>10</small></button>
          <button type="button" className="mantra-play-button" onClick={togglePlayback} aria-label={playing ? 'पाठ रोकें' : 'पाठ चलाएँ'}>{playing ? <Pause size={22} fill="currentColor"/> : <Play size={22} fill="currentColor"/>}</button>
          <button type="button" className="mantra-skip-button" onClick={() => seekBy(10)} aria-label="10 सेकंड आगे जाएँ"><RotateCw size={19}/><small>10</small></button>
          <div className="mantra-volume-control">
            <button type="button" onClick={() => setVolume((value) => value > 0 ? 0 : 0.85)} aria-label={volume > 0 ? 'आवाज़ बंद करें' : 'आवाज़ चालू करें'}>{volume > 0 ? <Volume2 size={17}/> : <VolumeX size={17}/>}</button>
            <input aria-label="आवाज़ का स्तर" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))}/>
          </div>
        </div>
        {audioError && <p className="mantra-audio-error" role="status">{audioError}</p>}

        <div className="mantra-lyrics-heading">
          <div><BookOpenText size={18}/><span>लाइव लिरिक्स</span><small>चलते ऑडियो के साथ</small></div>
          <button type="button" onClick={() => setFollowLyrics((value) => !value)} aria-pressed={followLyrics} className={followLyrics ? 'lyrics-follow-toggle is-on' : 'lyrics-follow-toggle'}>{followLyrics ? 'लाइव स्क्रॉल चालू' : 'लाइव स्क्रॉल बंद'}</button>
        </div>

        <div className="mantra-lyrics-viewport" ref={lyricsViewportRef} aria-label="मंत्र के बोल और अर्थ">
          <div className="mantra-verse-label">॥ श्री गणेशाय नमः ॥</div>
          <div className="mantra-lyrics-list">
            {LYRICS.map((line, index) => (
              <button
                key={line.text}
                type="button"
                ref={(element) => { lineRefs.current[index] = element }}
                className={`mantra-lyric-line ${index === activeIndex ? 'is-active' : ''} ${currentTime >= line.end ? 'is-past' : ''}`}
                onClick={() => selectLyric(line)}
                aria-current={index === activeIndex ? 'true' : undefined}
              >
                <span className="mantra-lyric-index">०{index + 1}</span>
                <span className="mantra-lyric-copy"><strong>{line.text}</strong><small>{line.transliteration}</small><em>{line.meaning}</em></span>
                {index === activeIndex && playing && <span className="mantra-playing-bars" aria-label="वर्तमान पंक्ति"><i/><i/><i/></span>}
              </button>
            ))}
          </div>
          <div className="mantra-meaning-block">
            <h4>भावार्थ</h4>
            <p>हे घुमावदार सूंड और विशाल शरीर वाले, करोड़ों सूर्यों के समान तेजस्वी प्रभु! कृपा करके मेरे सभी कार्यों को हमेशा विघ्नों से मुक्त करें।</p>
            <button type="button" className="mantra-meaning-toggle" onClick={() => setShowMeanings((value) => !value)} aria-expanded={showMeanings}>{showMeanings ? 'शब्दार्थ छिपाएँ' : 'सभी शब्दों के अर्थ देखें'} <span>{showMeanings ? '−' : '+'}</span></button>
            {showMeanings && <dl className="mantra-word-grid">{WORD_MEANINGS.map(([word, meaning]) => <div key={word}><dt>{word}</dt><dd>{meaning}</dd></div>)}</dl>}
          </div>
        </div>
        <p className="mantra-player-hint">किसी पंक्ति पर स्पर्श करें और पाठ उसी हिस्से से सुनें। पूरे बोल और शब्दार्थ देखने के लिए इस पैनल में नीचे स्क्रॉल करें।</p>
      </div>
    </section>
  )
}
