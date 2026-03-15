// frontend/src/components/LangSwitcher.jsx
import { useState } from 'react'
import { useLang } from '@/hooks/useLang'

export default function LangSwitcher() {
  const { lang, changeLang, LANGUAGES } = useLang()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find(l => l.code === lang)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: '1px solid rgba(200,146,42,0.25)',
          color: '#F5EDD6', padding: '5px 10px', cursor: 'pointer',
          fontSize: 12, fontFamily: 'DM Sans, sans-serif',
          transition: 'border-color .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#C8922A'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,146,42,0.25)'}
      >
        <span style={{ fontSize: 16 }}>{current?.flag}</span>
        <span style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>{lang.toUpperCase()}</span>
        <span style={{ fontSize: 9, color: 'rgba(245,237,214,0.4)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#0E0A06', border: '1px solid rgba(200,146,42,0.3)',
          minWidth: 140, zIndex: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          animation: 'fadeIn .15s ease',
        }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { changeLang(l.code); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                color: l.code === lang ? '#C8922A' : '#F5EDD6',
                cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                textAlign: 'left', borderLeft: `2px solid ${l.code === lang ? '#C8922A' : 'transparent'}`,
                transition: 'background .1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,146,42,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}

      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}
