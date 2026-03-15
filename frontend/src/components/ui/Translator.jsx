// frontend/src/components/ui/Translator.jsx
import { useState, useRef, useEffect } from 'react'

const LANGS = [
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'en', label: 'Anglais',    flag: '🇬🇧' },
  { code: 'es', label: 'Espagnol',   flag: '🇪🇸' },
  { code: 'pt', label: 'Portugais',  flag: '🇧🇷' },
]

const SERVERS = [
  'https://translate.terraprint.co',
  'https://lt.vern.cc',
  'https://libretranslate.de',
]

async function callLibre(endpoint, body) {
  for (const srv of SERVERS) {
    try {
      const r = await fetch(`${srv}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      })
      if (!r.ok) continue
      return await r.json()
    } catch (_) { continue }
  }
  throw new Error('Service indisponible')
}

// Détecte la langue automatiquement
async function detectLang(text) {
  const data = await callLibre('/detect', { q: text })
  if (Array.isArray(data) && data.length > 0) return data[0].language
  throw new Error('Détection impossible')
}

async function translateText(text, source, target) {
  const data = await callLibre('/translate', { q: text, source, target, format: 'text' })
  if (data.translatedText) return data.translatedText
  throw new Error('Traduction impossible')
}

const PHRASES = [
  { fr: 'Bonjour, comment allez-vous ?', emoji: '👋' },
  { fr: 'Combien ça coûte ?',            emoji: '💰' },
  { fr: 'Où est l\'hôtel ?',             emoji: '🏨' },
  { fr: 'Je voudrais réserver',          emoji: '📅' },
  { fr: 'Aidez-moi s\'il vous plaît',    emoji: '🙏' },
  { fr: 'Où sont les toilettes ?',       emoji: '🚻' },
  { fr: 'L\'addition s\'il vous plaît',  emoji: '🧾' },
  { fr: 'Y a-t-il un guide disponible ?',emoji: '🗺️' },
]

export default function Translator() {
  const [open,        setOpen]        = useState(false)
  const [input,       setInput]       = useState('')
  const [output,      setOutput]      = useState('')
  const [sourceLang,  setSourceLang]  = useState('auto')
  const [detectedLang,setDetectedLang]= useState(null)
  const [targetLang,  setTargetLang]  = useState('en')
  const [loading,     setLoading]     = useState(false)
  const [detecting,   setDetecting]   = useState(false)
  const [error,       setError]       = useState('')
  const [copied,      setCopied]      = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (!input.trim() || input.trim().length < 3) { setOutput(''); setDetectedLang(null); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setLoading(true); setError('')
      try {
        let src = sourceLang
        if (sourceLang === 'auto') {
          setDetecting(true)
          src = await detectLang(input.trim()).catch(() => 'fr')
          setDetectedLang(src)
          setDetecting(false)
        }
        if (src === targetLang) { setOutput(input); setLoading(false); return }
        const result = await translateText(input.trim(), src, targetLang)
        setOutput(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false); setDetecting(false)
      }
    }, 700)
    return () => clearTimeout(timer.current)
  }, [input, sourceLang, targetLang])

  function swap() {
    if (sourceLang === 'auto') return
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setInput(output)
    setOutput(input)
  }

  const detectedInfo = LANGS.find(l => l.code === detectedLang)
  const targetInfo   = LANGS.find(l => l.code === targetLang)

  return (
    <>
      {/* Bouton flottant */}
      <button onClick={() => setOpen(v => !v)} title="Traducteur"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 52, height: 52, borderRadius: '50%',
          background: open ? '#0E0A06' : '#C8922A',
          border: `2px solid ${open ? '#C8922A' : 'transparent'}`,
          color: 'white', fontSize: 22, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, transition: 'all .2s',
        }}>
        {open ? '✕' : '🌍'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 86, right: 24, width: 350,
          background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          border: '1px solid rgba(200,146,42,0.2)', zIndex: 200,
          animation: 'fadeUp .2s ease',
        }}>
          {/* Header */}
          <div style={{ background: '#0E0A06', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#C8922A', fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>🌍 TRADUCTEUR</span>
            <span style={{ color: 'rgba(245,237,214,0.3)', fontSize: 9, letterSpacing: 1 }}>LibreTranslate · GRATUIT</span>
          </div>

          {/* Sélecteurs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderBottom: '1px solid #f0f0f0' }}>
            <select value={sourceLang} onChange={e => { setSourceLang(e.target.value); setDetectedLang(null) }}
              style={{ flex: 1, border: '1px solid #e5e7eb', padding: '7px 6px', fontSize: 12, color: '#1a0a00', outline: 'none', background: '#fafafa', cursor: 'pointer' }}>
              <option value="auto">🔍 Détection auto</option>
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>

            <button onClick={swap} disabled={sourceLang === 'auto'} title="Inverser"
              style={{ background: sourceLang === 'auto' ? '#f5f5f5' : '#F5EDD6', border: '1px solid #D4B483', padding: '7px 10px', cursor: sourceLang === 'auto' ? 'not-allowed' : 'pointer', fontSize: 15, color: '#C8922A', opacity: sourceLang === 'auto' ? .4 : 1 }}>
              ⇄
            </button>

            <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
              style={{ flex: 1, border: '1px solid #e5e7eb', padding: '7px 6px', fontSize: 12, color: '#1a0a00', outline: 'none', background: '#fafafa', cursor: 'pointer' }}>
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>

          {/* Input */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' }}>
                {detecting ? '🔍 Détection…' : detectedInfo ? `${detectedInfo.flag} ${detectedInfo.label} (détecté)` : sourceLang === 'auto' ? '🔍 Détection automatique' : LANGS.find(l=>l.code===sourceLang)?.flag + ' ' + LANGS.find(l=>l.code===sourceLang)?.label}
              </span>
              {input && <button onClick={() => { setInput(''); setOutput(''); setDetectedLang(null) }}
                style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: 11 }}>✕ Effacer</button>}
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder="Saisissez du texte — la langue est détectée automatiquement…"
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', fontSize: 14, color: '#1a0a00', resize: 'none', lineHeight: 1.6, background: 'transparent' }} />
          </div>

          {/* Output */}
          <div style={{ padding: '10px 14px', background: '#fafaf9', minHeight: 76 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' }}>
                {targetInfo?.flag} {targetInfo?.label}
              </span>
              {output && <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
                style={{ fontSize: 10, color: copied ? '#22c55e' : '#C8922A', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: 1 }}>
                {copied ? '✓ COPIÉ' : 'COPIER'}
              </button>}
            </div>
            {loading
              ? <div style={{ display: 'flex', gap: 4 }}>{[0,1,2].map(i=><div key={i} style={{ width:6, height:6, background:'#C8922A', borderRadius:'50%', animation:'bounce 1s infinite', animationDelay:`${i*150}ms` }}/>)}</div>
              : error ? <p style={{ fontSize:12, color:'#ef4444' }}>{error}</p>
              : output ? <p style={{ fontSize:14, color:'#374151', lineHeight:1.7, margin:0 }}>{output}</p>
              : <p style={{ fontSize:13, color:'#d1d5db', fontStyle:'italic' }}>La traduction apparaît ici…</p>
            }
          </div>

          {/* Phrases utiles */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>Phrases utiles (cliquer pour traduire)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {PHRASES.map(p => (
                <button key={p.fr} onClick={() => { setInput(p.fr); setSourceLang('fr') }}
                  style={{ fontSize: 10, padding: '3px 7px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#C8922A'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'}>
                  {p.emoji} {p.fr.length > 22 ? p.fr.slice(0,22)+'…' : p.fr}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  )
}
