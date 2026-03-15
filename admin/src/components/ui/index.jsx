// admin/src/components/ui/index.jsx

// ── STAT CARD ──────────────────────────────────
export function StatCard({ label, value, delta, icon, color = 'var(--amber)' }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      padding: '20px 24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* BG accent */}
      <div style={{
        position: 'absolute', right: -10, top: -10,
        width: 80, height: 80, borderRadius: '50%',
        background: color, opacity: .05,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        {delta !== undefined && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: delta >= 0 ? 'var(--green)' : 'var(--red)',
            background: delta >= 0 ? '#052210' : '#1f0505',
            padding: '2px 6px',
          }}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}

// ── BADGE ──────────────────────────────────────
const BADGE_STYLES = {
  published: { bg: '#052210', color: '#22c55e', text: 'PUBLIÉ' },
  draft:     { bg: '#1a1a1a', color: '#71717a', text: 'BROUILLON' },
  featured:  { bg: '#1f1200', color: '#f59e0b', text: 'TOP' },
  unesco:    { bg: '#0a0a1f', color: '#3b82f6', text: 'UNESCO' },
  admin:     { bg: '#1f0505', color: '#ef4444', text: 'ADMIN' },
  editor:    { bg: '#1a1200', color: '#f59e0b', text: 'ÉDITEUR' },
  user:      { bg: '#0a1a0a', color: '#6b7280', text: 'USER' },
  low:       { bg: '#052210', color: '#22c55e', text: '€' },
  medium:    { bg: '#1f1200', color: '#f59e0b', text: '€€' },
  high:      { bg: '#1a0505', color: '#ef4444', text: '€€€' },
}
export function Badge({ type, custom }) {
  const s = BADGE_STYLES[type] || { bg: '#111', color: '#aaa', text: type }
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9,
      letterSpacing: '.1em', padding: '2px 7px',
      background: s.bg, color: s.color,
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {custom || s.text}
    </span>
  )
}

// ── BUTTON ─────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style: extra, type = 'button' }) {
  const variants = {
    primary:   { background: 'var(--amber)', color: '#000', border: 'none' },
    secondary: { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger:    { background: '#1f0505', color: 'var(--red)', border: '1px solid #3f0a0a' },
    ghost:     { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' },
  }
  const sizes = {
    sm: { padding: '4px 12px', fontSize: 11 },
    md: { padding: '7px 16px', fontSize: 12 },
    lg: { padding: '10px 24px', fontSize: 13 },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant], ...sizes[size],
        fontFamily: 'var(--font-mono)', letterSpacing: '.05em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .5 : 1,
        transition: 'opacity .15s',
        whiteSpace: 'nowrap',
        ...extra,
      }}
    >
      {children}
    </button>
  )
}

// ── INPUT ──────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          background: 'var(--surface2)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          color: 'var(--text)', padding: '8px 12px', fontSize: 13,
          fontFamily: 'var(--font-body)', outline: 'none', width: '100%',
          transition: 'border-color .15s',
          ...props.style,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--amber)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{error}</span>}
    </div>
  )
}

// ── SELECT ─────────────────────────────────────
export function Select({ label, options, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <select
        {...props}
        style={{
          background: 'var(--surface2)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          color: 'var(--text)', padding: '8px 12px', fontSize: 13,
          fontFamily: 'var(--font-body)', outline: 'none', width: '100%', cursor: 'pointer',
          ...props.style,
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── TEXTAREA ───────────────────────────────────
export function Textarea({ label, error, rows = 4, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        {...props}
        style={{
          background: 'var(--surface2)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          color: 'var(--text)', padding: '8px 12px', fontSize: 13,
          fontFamily: 'var(--font-body)', outline: 'none', width: '100%',
          resize: 'vertical', lineHeight: 1.6,
          ...props.style,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--amber)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
      />
    </div>
  )
}

// ── PAGE HEADER ────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 6, letterSpacing: '.05em' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  )
}

// ── CONFIRM DIALOG ─────────────────────────────
export function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, animation: 'fadeIn .15s ease',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        padding: 28, maxWidth: 380, width: '100%', margin: 16,
      }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 6, letterSpacing: 1 }}>CONFIRMATION</p>
        <p style={{ color: 'var(--text)', lineHeight: 1.5, marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
          <Btn variant="danger" onClick={onConfirm}>Confirmer</Btn>
        </div>
      </div>
    </div>
  )
}

// ── EMPTY STATE ────────────────────────────────
export function Empty({ icon = '◈', message }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 36, marginBottom: 12, opacity: .3 }}>{icon}</div>
      <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12, letterSpacing: 1 }}>{message}</p>
    </div>
  )
}

// ── SPINNER ────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
    </div>
  )
}

// ── TOGGLE ─────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, background: checked ? 'var(--amber)' : 'var(--border)',
          borderRadius: 10, position: 'relative', transition: 'background .2s', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, background: checked ? '#000' : 'var(--muted)',
          borderRadius: '50%', transition: 'left .2s',
        }} />
      </div>
      {label && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>}
    </label>
  )
}
