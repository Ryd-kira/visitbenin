// admin/src/components/ui/MediaUploader.jsx
import { useState, useRef } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api/v1'

// ── Upload via l'API backend ──
async function uploadFile(file) {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await axios.post(`${API}/upload`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true,
  })
  return data.url
}

// ── Composant principal ──
export default function MediaUploader({
  label = 'Médias',
  images = [],
  videos = [],
  coverImage = '',
  onImagesChange,
  onVideosChange,
  onCoverChange,
  maxImages = 12,
  maxVideos = 4,
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')
  const [tab, setTab]             = useState('images') // images | videos | url
  const [urlInput, setUrlInput]   = useState('')
  const imgRef = useRef()
  const vidRef = useRef()

  const mono = { fontFamily: '"IBM Plex Mono", monospace' }

  async function handleImageFiles(files) {
    setError('')
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images`)
      return
    }
    setUploading(true)
    try {
      const urls = await Promise.all([...files].map(uploadFile))
      onImagesChange?.([...images, ...urls])
      if (!coverImage && urls[0]) onCoverChange?.(urls[0])
    } catch {
      setError('Erreur upload — vérifier Cloudinary dans le backend')
    } finally { setUploading(false) }
  }

  async function handleVideoFiles(files) {
    setError('')
    if (videos.length + files.length > maxVideos) {
      setError(`Maximum ${maxVideos} vidéos`)
      return
    }
    setUploading(true)
    try {
      const urls = await Promise.all([...files].map(uploadFile))
      onVideosChange?.([...videos, ...urls])
    } catch {
      setError('Erreur upload vidéo')
    } finally { setUploading(false) }
  }

  function addUrl() {
    const url = urlInput.trim()
    if (!url) return
    const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo')
    if (isVideo) {
      if (videos.length >= maxVideos) { setError(`Maximum ${maxVideos} vidéos`); return }
      onVideosChange?.([...videos, url])
    } else {
      if (images.length >= maxImages) { setError(`Maximum ${maxImages} images`); return }
      onImagesChange?.([...images, url])
      if (!coverImage) onCoverChange?.(url)
    }
    setUrlInput('')
  }

  function removeImage(i) {
    const next = images.filter((_, idx) => idx !== i)
    onImagesChange?.(next)
    if (coverImage === images[i]) onCoverChange?.(next[0] || '')
  }

  function removeVideo(i) { onVideosChange?.(videos.filter((_, idx) => idx !== i)) }
  function setCover(url)   { onCoverChange?.(url) }

  function isYoutube(url) { return url.includes('youtube') || url.includes('youtu.be') }
  function ytEmbed(url) {
    const id = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1]
    return id ? `https://www.youtube.com/embed/${id}` : url
  }

  const tabStyle = (active) => ({
    padding: '7px 16px', fontSize: 12, cursor: 'pointer', border: 'none',
    background: active ? 'rgba(200,146,42,0.15)' : 'none',
    color: active ? '#C8922A' : 'rgba(245,237,214,0.4)',
    borderBottom: `2px solid ${active ? '#C8922A' : 'transparent'}`,
    fontFamily: '"IBM Plex Mono", monospace',
    transition: 'all .15s',
  })

  return (
    <div style={{ ...mono }}>
      <p style={{ fontSize: 12, color: '#C8922A', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{label}</p>

      {/* Photo de couverture */}
      {coverImage && (
        <div style={{ marginBottom: 14, position: 'relative' }}>
          <p style={{ fontSize: 10, color: 'rgba(245,237,214,0.4)', marginBottom: 5 }}>PHOTO DE COUVERTURE</p>
          <div style={{ height: 140, overflow: 'hidden', position: 'relative' }}>
            <img src={coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{ position: 'absolute', top: 6, left: 6, background: '#C8922A', color: '#0E0A06', fontSize: 10, padding: '2px 8px', fontWeight: 700 }}>COUVERTURE</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(200,146,42,0.1)', marginBottom: 14 }}>
        <button style={tabStyle(tab === 'images')} onClick={() => setTab('images')}>
          Photos ({images.length}/{maxImages})
        </button>
        <button style={tabStyle(tab === 'videos')} onClick={() => setTab('videos')}>
          Vidéos ({videos.length}/{maxVideos})
        </button>
        <button style={tabStyle(tab === 'url')} onClick={() => setTab('url')}>
          + URL externe
        </button>
      </div>

      {error && <p style={{ fontSize: 11, color: '#f87171', marginBottom: 10 }}>⚠ {error}</p>}

      {/* Tab Images */}
      {tab === 'images' && (
        <div>
          {/* Zone drop */}
          <div
            onClick={() => imgRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleImageFiles(e.dataTransfer.files) }}
            style={{ border: '2px dashed rgba(200,146,42,0.25)', padding: '20px', textAlign: 'center', cursor: 'pointer', marginBottom: 12, transition: 'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#C8922A'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,146,42,0.25)'}>
            <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => handleImageFiles(e.target.files)} />
            {uploading
              ? <p style={{ fontSize: 12, color: '#C8922A' }}>⏳ Upload en cours...</p>
              : <><p style={{ fontSize: 13, color: 'rgba(245,237,214,0.6)' }}>Glisser des images ici ou cliquer</p>
                 <p style={{ fontSize: 11, color: 'rgba(245,237,214,0.3)', marginTop: 4 }}>JPG, PNG, WebP — max 10MB chacune</p></>
            }
          </div>

          {/* Grille images */}
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#1a1a1a' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {coverImage === url && (
                    <span style={{ position: 'absolute', top: 3, left: 3, background: '#C8922A', color: '#0E0A06', fontSize: 8, padding: '1px 5px', fontWeight: 700 }}>★</span>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 4, gap: 3, transition: 'background .2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                    <button onClick={() => setCover(url)}
                      style={{ fontSize: 9, background: 'rgba(200,146,42,0.9)', color: '#0E0A06', border: 'none', padding: '2px 5px', cursor: 'pointer', ...mono }}>
                      Couverture
                    </button>
                    <button onClick={() => removeImage(i)}
                      style={{ fontSize: 9, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', padding: '2px 5px', cursor: 'pointer', ...mono }}>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Vidéos */}
      {tab === 'videos' && (
        <div>
          <div
            onClick={() => vidRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleVideoFiles(e.dataTransfer.files) }}
            style={{ border: '2px dashed rgba(200,146,42,0.25)', padding: '20px', textAlign: 'center', cursor: 'pointer', marginBottom: 12 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#C8922A'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,146,42,0.25)'}>
            <input ref={vidRef} type="file" accept="video/*" multiple style={{ display: 'none' }}
              onChange={e => handleVideoFiles(e.target.files)} />
            {uploading
              ? <p style={{ fontSize: 12, color: '#C8922A' }}>⏳ Upload en cours...</p>
              : <><p style={{ fontSize: 13, color: 'rgba(245,237,214,0.6)' }}>Glisser des vidéos ici ou cliquer</p>
                 <p style={{ fontSize: 11, color: 'rgba(245,237,214,0.3)', marginTop: 4 }}>MP4, WebM — ou coller un lien YouTube dans l'onglet URL</p></>
            }
          </div>

          {videos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {videos.map((url, i) => (
                <div key={i} style={{ background: '#1a1a1a', border: '1px solid #222', padding: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                  {isYoutube(url)
                    ? <img src={`https://img.youtube.com/vi/${url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1]}/default.jpg`} alt="" style={{ width: 60, height: 45, objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 60, height: 45, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>▶</div>
                  }
                  <p style={{ fontSize: 11, color: 'rgba(245,237,214,0.5)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</p>
                  <button onClick={() => removeVideo(i)}
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'none', padding: '3px 8px', fontSize: 11, cursor: 'pointer', ...mono, flexShrink: 0 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab URL */}
      {tab === 'url' && (
        <div>
          <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.45)', marginBottom: 10, lineHeight: 1.6 }}>
            Coller une URL d'image ou de vidéo. Les liens YouTube/Vimeo sont automatiquement reconnus.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addUrl()}
              placeholder="https://..."
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,146,42,0.2)', color: '#F5EDD6', padding: '8px 12px', fontSize: 12, outline: 'none', ...mono }}
            />
            <button onClick={addUrl}
              style={{ background: '#C8922A', color: '#0E0A06', border: 'none', padding: '8px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 700, ...mono }}>
              Ajouter
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(245,237,214,0.25)', marginTop: 8 }}>
            Exemples : https://youtube.com/watch?v=... · https://images.unsplash.com/...
          </p>
        </div>
      )}
    </div>
  )
}
