// frontend/src/components/Translator.jsx
import { useState, useRef } from 'react'
import { useLang } from '@/hooks/useLang'

const LANG_OPTS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'fon', label: 'Fon' },
  { code: 'yo', label: 'Yoruba' },
]

// LibreTranslate public instance (gratuit, open-source)
const API = 'https://libretranslate.de/translate'

export default function Translator() {
  const { t } = useLang()
  const [open,    setOpen]    = useState(false)
  const [input,   setInput]   = useState('')
  const [output,  setOutput]  = useState('')
  const [from,    setFrom]    = useState('fr')
  const [to,      setTo]      = useState('en')
  const [loading, setLoading] = useState(false)
  const [copied,  setCopied]  = useState(false)
  const [error,   setError]   = useState('')

  async function translate() {
    if (!input.trim()) return
    setLoading(true); setError(''); setOutput('')
    try {
      // Utilise MyMemory API — gratuit, pas de clé requise
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=${from}|${to}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.responseStatus === 200) {
        setOutput(data.responseData.translatedText)
      } else {
        setError('Traduction indisponible, réessayez.')
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function swap() {
    setFrom(to); setTo(from)
    setInput(output); setOutput(input)
  }

  const selectStyle = {
    background: 'rgba(14,10,6,0.8)', border: '1px solid rgba(200,146,42,0.3)',
    color: '#F5EDD6', padding: '5px 8px', fontSize: 12,
    fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', outline: 'none', flex: 1,
  }
  const textareaStyle = {
    width: '100%', boxSizing: 'border-box', resize: 'none',
    background: 'rgba(14,10,6,0.6)', border: '1px solid rgba(200,146,42,0.2)',
    color: '#F5EDD6', caretColor: '#C8922A',
    padding: '10px 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', lineHeight: 1.6,
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Traducteur"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 900,
          width: 52, height: 52, borderRadius: '50%',
          background: open ? '#C8922A' : '#0E0A06',
          border: '2px solid #C8922A',
          color: open ? '#0E0A06' : '#C8922A',
          fontSize: 22, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(200,146,42,0.4)',
          transition: 'all .2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {open ? '✕' : '🌐'}
      </button>

      {/* Panneau traducteur */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 900,
          width: 340, background: '#0E0A06',
          border: '1px solid rgba(200,146,42,0.35)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          animation: 'fadeUp .2s ease',
        }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(200,146,42,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🌐</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: '#C8922A', fontWeight: 700 }}>
              {t('translator.title')}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(245,237,214,0.3)', fontFamily: 'DM Sans' }}>
              MyMemory API
            </span>
          </div>

          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Sélecteurs de langue */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <select value={from} onChange={e => setFrom(e.target.value)} style={selectStyle}>
                {LANG_OPTS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <button onClick={swap} style={{
                background: 'none', border: '1px solid rgba(200,146,42,0.3)',
                color: '#C8922A', padding: '5px 8px', cursor: 'pointer', fontSize: 14,
                flexShrink: 0, transition: 'background .15s',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(200,146,42,0.1)'}
              onMouseLeave={e => e.target.style.background = 'none'}
              >⇄</button>
              <select value={to} onChange={e => setTo(e.target.value)} style={selectStyle}>
                {LANG_OPTS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>

            {/* Input */}
            <textarea
              rows={3} value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('translator.placeholder')}
              style={textareaStyle}
              onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') translate() }}
            />

            {/* Boutons */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={translate} disabled={loading || !input.trim()} style={{
                flex: 1, background: '#C8922A', color: '#0E0A06', border: 'none',
                padding: '8px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'DM Sans', opacity: loading || !input.trim() ? .5 : 1,
              }}>
                {loading ? '⏳ …' : `${t('translator.translate')} (Ctrl+↵)`}
              </button>
              <button onClick={() => { setInput(''); setOutput(''); setError('') }} style={{
                background: 'none', border: '1px solid rgba(200,146,42,0.2)',
                color: 'rgba(245,237,214,0.4)', padding: '8px 12px', cursor: 'pointer', fontSize: 12,
              }}>
                {t('translator.clear')}
              </button>
            </div>

            {/* Erreur */}
            {error && (
              <p style={{ color: '#E87050', fontSize: 11, fontFamily: 'DM Sans', margin: 0 }}>{error}</p>
            )}

            {/* Output */}
            {output && (
              <div style={{ position: 'relative' }}>
                <textarea
                  rows={3} readOnly value={output}
                  style={{ ...textareaStyle, background: 'rgba(200,146,42,0.05)', border: '1px solid rgba(200,146,42,0.3)', cursor: 'text' }}
                />
                <button onClick={copyOutput} style={{
                  position: 'absolute', top: 6, right: 6,
                  background: copied ? '#3A6B47' : 'rgba(14,10,6,0.8)',
                  border: '1px solid rgba(200,146,42,0.3)',
                  color: copied ? '#fff' : '#C8922A',
                  padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: 'DM Sans',
                  transition: 'all .2s',
                }}>
                  {copied ? '✓ Copié' : t('translator.copy')}
                </button>
              </div>
            )}

            <p style={{ fontSize: 9, color: 'rgba(245,237,214,0.2)', fontFamily: 'DM Sans', textAlign: 'center', margin: 0 }}>
              Propulsé par MyMemory · Gratuit · 10 000 mots/jour
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </>
  )
}
