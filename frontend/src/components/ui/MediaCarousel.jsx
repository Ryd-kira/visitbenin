// frontend/src/components/ui/MediaCarousel.jsx
import { useState, useEffect, useCallback } from 'react'

function isYoutube(url) { return url?.includes('youtube') || url?.includes('youtu.be') }
function isVimeo(url)   { return url?.includes('vimeo') }
function isVideo(url)   { return url?.match(/\.(mp4|webm|ogg|mov)$/i) || isYoutube(url) || isVimeo(url) }

function youtubeThumb(url) {
  const id = url?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1]
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
function youtubeEmbed(url) {
  const id = url?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1]
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url
}

export default function MediaCarousel({ images = [], videos = [], cover = '', name = '' }) {
  const allMedia = [
    ...(cover && !images.includes(cover) ? [cover] : []),
    ...images,
    ...videos,
  ].filter(Boolean)

  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lbIndex, setLbIndex]   = useState(0)

  const total = allMedia.length

  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total])
  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total])

  // Navigation clavier lightbox
  useEffect(() => {
    if (!lightbox) return
    function onKey(e) {
      if (e.key === 'ArrowLeft')  setLbIndex(i => (i - 1 + total) % total)
      if (e.key === 'ArrowRight') setLbIndex(i => (i + 1) % total)
      if (e.key === 'Escape')     setLightbox(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, total])

  if (total === 0) return (
    <div style={{ height: '60vh', background: 'linear-gradient(135deg, #1a1208, #0E0A06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(245,237,214,0.2)', fontSize: 14 }}>Aucune photo disponible</p>
    </div>
  )

  const current_url = allMedia[current]
  const currentIsVideo = isVideo(current_url)

  return (
    <>
      {/* ── CARROUSEL PRINCIPAL ── */}
      <div style={{ position: 'relative', height: 'clamp(280px, 60vh, 600px)', overflow: 'hidden', background: '#0E0A06', cursor: total > 1 ? 'pointer' : 'default' }}
        onClick={() => { setLbIndex(current); setLightbox(true) }}>

        {/* Media courant */}
        {currentIsVideo ? (
          isYoutube(current_url) ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={youtubeThumb(current_url)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} />
              <div style={{ position: 'absolute', width: 64, height: 64, background: 'rgba(200,146,42,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>▶</div>
            </div>
          ) : (
            <video src={current_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls preload="metadata" />
          )
        ) : (
          <img src={current_url} alt={`${name} — photo ${current + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity .3s' }} />
        )}

        {/* Overlay gradient bas */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,10,6,0.7) 0%, transparent 40%)', pointerEvents: 'none' }} />

        {/* Boutons nav */}
        {total > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev() }}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, background: 'rgba(14,10,6,0.7)', border: '1px solid rgba(200,146,42,0.3)', color: '#C8922A', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,146,42,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(14,10,6,0.7)'}>‹</button>
            <button onClick={e => { e.stopPropagation(); next() }}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, background: 'rgba(14,10,6,0.7)', border: '1px solid rgba(200,146,42,0.3)', color: '#C8922A', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,146,42,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(14,10,6,0.7)'}>›</button>
          </>
        )}

        {/* Compteur + expand */}
        <div style={{ position: 'absolute', bottom: 14, right: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          {currentIsVideo && (
            <span style={{ fontSize: 10, background: 'rgba(200,146,42,0.9)', color: '#0E0A06', padding: '2px 8px', fontWeight: 700 }}>▶ VIDÉO</span>
          )}
          {total > 1 && (
            <span style={{ fontSize: 11, background: 'rgba(0,0,0,0.6)', color: 'rgba(245,237,214,0.7)', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {current + 1} / {total}
            </span>
          )}
          <button onClick={e => { e.stopPropagation(); setLbIndex(current); setLightbox(true) }}
            style={{ fontSize: 11, background: 'rgba(0,0,0,0.6)', color: 'rgba(245,237,214,0.7)', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
            ⤢ Agrandir
          </button>
        </div>

        {/* Indicateurs dots */}
        {total > 1 && total <= 10 && (
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
            {allMedia.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i) }}
                style={{ width: i === current ? 20 : 6, height: 6, background: i === current ? '#C8922A' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all .2s', borderRadius: 3 }} />
            ))}
          </div>
        )}
      </div>

      {/* ── THUMBNAILS ── */}
      {total > 1 && (
        <div style={{ display: 'flex', gap: 4, padding: '4px 0', overflowX: 'auto', background: '#0E0A06' }}>
          {allMedia.map((url, i) => {
            const isVid = isVideo(url)
            const thumb = isVid && isYoutube(url) ? youtubeThumb(url) : (isVid ? null : url)
            return (
              <button key={i} onClick={() => setCurrent(i)}
                style={{ flexShrink: 0, width: 72, height: 48, border: `2px solid ${i === current ? '#C8922A' : 'transparent'}`, padding: 0, cursor: 'pointer', background: '#111', overflow: 'hidden', position: 'relative', transition: 'border-color .15s' }}>
                {thumb
                  ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: '#C8922A', fontSize: 16 }}>▶</div>
                }
                {isVid && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                    <span style={{ fontSize: 14, color: 'white' }}>▶</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(false)}>

          {/* Fermer */}
          <button onClick={() => setLightbox(false)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 40, height: 40, fontSize: 20, cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

          {/* Compteur */}
          <p style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            {lbIndex + 1} / {total}
          </p>

          {/* Media */}
          <div style={{ maxWidth: '90vw', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => e.stopPropagation()}>
            {isVideo(allMedia[lbIndex]) ? (
              isYoutube(allMedia[lbIndex]) ? (
                <iframe src={youtubeEmbed(allMedia[lbIndex])} style={{ width: 'min(900px, 90vw)', height: 'min(506px, 50.625vw)', border: 'none' }} allow="autoplay" allowFullScreen />
              ) : (
                <video src={allMedia[lbIndex]} controls autoPlay style={{ maxWidth: '90vw', maxHeight: '80vh' }} />
              )
            ) : (
              <img src={allMedia[lbIndex]} alt={name} style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }} />
            )}
          </div>

          {/* Nav lightbox */}
          {total > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLbIndex(i => (i - 1 + total) % total) }}
                style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 48, height: 48, fontSize: 24, cursor: 'pointer', borderRadius: '50%' }}>‹</button>
              <button onClick={e => { e.stopPropagation(); setLbIndex(i => (i + 1) % total) }}
                style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 48, height: 48, fontSize: 24, cursor: 'pointer', borderRadius: '50%' }}>›</button>
            </>
          )}

          {/* Thumbnails lightbox */}
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, maxWidth: '90vw', overflowX: 'auto', padding: '4px 0' }}>
            {allMedia.map((url, i) => {
              const thumb = isYoutube(url) ? youtubeThumb(url) : (isVideo(url) ? null : url)
              return (
                <button key={i} onClick={e => { e.stopPropagation(); setLbIndex(i) }}
                  style={{ flexShrink: 0, width: 56, height: 40, border: `2px solid ${i === lbIndex ? '#C8922A' : 'transparent'}`, padding: 0, cursor: 'pointer', background: '#111', overflow: 'hidden' }}>
                  {thumb
                    ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8922A' }}>▶</div>
                  }
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
