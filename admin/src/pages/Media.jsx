// admin/src/pages/Media.jsx
import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/services/api'
import { PageHeader, Btn, Spinner } from '@/components/ui/index'

const FOLDERS = ['visitbenin/places', 'visitbenin/restaurants', 'visitbenin/schools', 'visitbenin/covers']

export default function Media() {
  const [folder, setFolder]   = useState('visitbenin/places')
  const [uploads, setUploads] = useState([]) // { url, name, bytes }
  const [copied,  setCopied]  = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const uploadMut = useMutation({
    mutationFn: async (file) => {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('folder', folder)
      const res = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
    onSuccess: (data) => {
      setUploads(prev => [{ ...data, name: data.cloudinary_id?.split('/').pop() }, ...prev])
    },
  })

  function handleFiles(files) {
    Array.from(files).forEach(f => {
      if (f.type.startsWith('image/')) uploadMut.mutate(f)
    })
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bibliothèque Médias"
        subtitle="Upload vers Cloudinary · CDN optimisé automatiquement"
      />

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--amber)' : 'var(--border)'}`,
          background: dragging ? '#1f1200' : 'var(--surface)',
          padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
          marginBottom: 20, transition: 'all .15s',
        }}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
        <div style={{ fontSize: 32, marginBottom: 10, opacity: .5 }}>⊞</div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: 1 }}>
          GLISSER-DÉPOSER OU CLIQUER · JPG · PNG · WEBP · MAX 5MB
        </p>
        {uploadMut.isPending && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)', marginTop: 8, animation: 'pulse 1s infinite' }}>
            UPLOAD EN COURS...
          </p>
        )}
      </div>

      {/* Folder selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>DOSSIER :</span>
        {FOLDERS.map(f => (
          <Btn key={f} size="sm" variant={folder === f ? 'primary' : 'ghost'} onClick={() => setFolder(f)}>
            {f.split('/')[1]}
          </Btn>
        ))}
      </div>

      {/* Uploaded images */}
      {uploads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1 }}>
          AUCUNE IMAGE UPLOADÉE DANS CETTE SESSION
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {uploads.map((img, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <img src={img.thumbnail || img.url} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '8px 10px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>
                  {img.name}
                </p>
                {img.bytes && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', marginBottom: 8 }}>
                    {img.width}×{img.height} · {(img.bytes/1024).toFixed(0)}ko
                  </p>
                )}
                <button
                  onClick={() => copyUrl(img.url)}
                  style={{
                    width: '100%', background: copied === img.url ? '#052210' : 'var(--surface2)',
                    border: `1px solid ${copied === img.url ? 'var(--green)' : 'var(--border)'}`,
                    color: copied === img.url ? 'var(--green)' : 'var(--muted)',
                    padding: '5px', fontFamily: 'var(--font-mono)', fontSize: 9,
                    cursor: 'pointer', letterSpacing: 1, transition: 'all .15s',
                  }}
                >
                  {copied === img.url ? '✓ COPIÉ !' : 'COPIER URL'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infos Cloudinary */}
      <div style={{ marginTop: 32, padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 20 }}>☁</span>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', marginBottom: 3 }}>CLOUDINARY CDN</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', lineHeight: 1.6 }}>
            Les images sont optimisées automatiquement (WebP, compression auto) et servies depuis le CDN Cloudinary.<br />
            Configurez vos clés dans <code style={{ color: 'var(--amber)' }}>backend/.env</code> : CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
          </p>
        </div>
      </div>
    </div>
  )
}
