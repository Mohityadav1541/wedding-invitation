import { useState } from 'react'

export function RajPortrait({
  src,
  alt,
  placeholder = 'चित्र जोड़ें',
  focalPosition = '50% 18%',
  loading = 'lazy',
  className = '',
}) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`raj-portrait ${className}`}>
      <div className="raj-portrait-rings" aria-hidden="true" />
      <div className="raj-portrait-arch">
        <div className="raj-portrait-jewel" aria-hidden="true" />
        <div className="raj-portrait-img-wrap">
          {src && !hasError ? (
            <img
              src={src}
              alt={alt || placeholder}
              loading={loading}
              style={{ objectPosition: focalPosition }}
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="raj-portrait-placeholder">
              <span>✿</span>
              <small>{placeholder}</small>
            </div>
          )}
        </div>
        <div className="raj-portrait-motifs" aria-hidden="true" />
      </div>
      <div className="raj-portrait-marigold" aria-hidden="true">✿ ✦ ✿</div>
    </div>
  )
}

export default RajPortrait
