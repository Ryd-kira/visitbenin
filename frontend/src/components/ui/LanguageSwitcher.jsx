// frontend/src/components/ui/LanguageSwitcher.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'fr', label: 'Français',    flag: '🇫🇷', short: 'FR' },
  { code: 'en', label: 'English',     flag: '🇬🇧', short: 'EN' },
  { code: 'es', label: 'Español',     flag: '🇪🇸', short: 'ES' },
  { code: 'pt', label: 'Português',   flag: '🇧🇷', short: 'PT' },
]

export default function LanguageSwitcher({ variant = 'floating' }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]

  function switchLang(code) {
    i18n.changeLanguage(code)
    localStorage.setItem('visitbenin_lang', code)
    setOpen(false)
  }

  // ── Variant "floating" (bouton fixe en bas à gauche) ──
  if (variant === 'floating') {
    return (
      <div style={{ position: 'fixed', bottom: 96, left: 20, zIndex: 800 }}>
        {open && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, marginBottom: 8,
            background: '#0E0A06', border: '1px solid rgba(200,146,42,0.25)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            minWidth: 160,
            animation: 'langPop .2s ease',
          }}>
            <style>{`@keyframes langPop { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => switchLang(lang.code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 14px',
                  background: lang.code === current.code ? 'rgba(200,146,42,0.15)' : 'none',
                  border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  color: lang.code === current.code ? '#C8922A' : '#F5EDD6',
                  fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  fontWeight: lang.code === current.code ? 700 : 400,
                  transition: 'background .1s',
                }}
                onMouseEnter={e => { if (lang.code !== current.code) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (lang.code !== current.code) e.currentTarget.style.background = 'none' }}>
                <span style={{ fontSize: 20 }}>{lang.flag}</span>
                <span>{lang.label}</span>
                {lang.code === current.code && <span style={{ marginLeft: 'auto', color: '#C8922A' }}>✓</span>}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          title="Changer de langue"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#0E0A06',
            border: '1px solid rgba(200,146,42,0.3)',
            color: '#C8922A',
            padding: '8px 12px',
            fontSize: 12, fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            transition: 'border-color .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#C8922A'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,146,42,0.3)'}>
          <span style={{ fontSize: 16 }}>{current.flag}</span>
          <span>{current.short}</span>
          <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: -1 }}
            onClick={() => setOpen(false)}
          />
        )}
      </div>
    )
  }

  // ── Variant "navbar" (intégré dans la navbar) ──
  if (variant === 'navbar') {
    return (
      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: '1px solid rgba(200,146,42,0.2)',
            color: 'rgba(245,237,214,0.7)',
            padding: '5px 10px', fontSize: 12, cursor: 'pointer',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8922A'; e.currentTarget.style.color = '#C8922A' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,146,42,0.2)'; e.currentTarget.style.color = 'rgba(245,237,214,0.7)' }}>
          <span style={{ fontSize: 14 }}>{current.flag}</span>
          <span style={{ fontWeight: 700 }}>{current.short}</span>
          <span style={{ fontSize: 9 }}>{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setOpen(false)} />
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 6,
              background: '#0E0A06', border: '1px solid rgba(200,146,42,0.2)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)', minWidth: 150,
              zIndex: 99,
            }}>
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => switchLang(lang.code)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 14px',
                    background: lang.code === current.code ? 'rgba(200,146,42,0.12)' : 'none',
                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: lang.code === current.code ? '#C8922A' : 'rgba(245,237,214,0.7)',
                    fontSize: 12, cursor: 'pointer', textAlign: 'left',
                    fontWeight: lang.code === current.code ? 700 : 400,
                  }}>
                  <span style={{ fontSize: 16 }}>{lang.flag}</span>
                  {lang.label}
                  {lang.code === current.code && <span style={{ marginLeft: 'auto' }}>✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Variant "select" (simple select HTML pour les settings) ──
  return (
    <select
      value={current.code}
      onChange={e => switchLang(e.target.value)}
      style={{ padding: '8px 12px', fontSize: 13, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,146,42,0.2)', color: '#F5EDD6', cursor: 'pointer', outline: 'none' }}>
      {LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
      ))}
    </select>
  )
}
