import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/services/index'
import { useAuthStore } from '@/store/useAuthStore'

// Compte à rebours live
function Countdown({ until, onExpire }) {
  const [secs, setSecs] = useState(Math.max(0, Math.ceil((until - Date.now()) / 1000)))
  useEffect(() => {
    if (secs <= 0) { onExpire(); return }
    const t = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000))
      setSecs(remaining)
      if (remaining <= 0) { clearInterval(t); onExpire() }
    }, 1000)
    return () => clearInterval(t)
  }, [until])
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return <strong style={{ color: '#E87050' }}>{m > 0 ? `${m}m ${s.toString().padStart(2,'0')}s` : `${s}s`}</strong>
}

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState('')
  const [warning,  setWarning]  = useState('')
  const [attempts, setAttempts] = useState(0)      // compteur local tentatives
  const [locked,   setLocked]   = useState(null)   // null | { until: timestamp }
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = location.state?.from || '/'

  const isLocked = locked && Date.now() < locked.until

  async function handleSubmit(e) {
    e.preventDefault()
    if (isLocked) return
    setLoading(true); setError(''); setWarning('')

    try {
      const data = await authService.login({ email, password })
      login(data.user, data.access_token)
      navigate(from, { replace: true })
    } catch (err) {
      const status = err.response?.status
      const body   = err.response?.data || {}

      if (status === 429) {
        // Blocage temporaire côté serveur — durée exacte retournée par l'API
        const retryAfter = body.retry_after || Date.now() + 15 * 60 * 1000
        setLocked({ until: retryAfter })
        setError(null) // le bloc locked s'affiche à la place
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        setError(body.error || 'Identifiants incorrects')
        // Avertissement préventif à partir du 6e essai
        if (newAttempts >= 6) {
          setWarning(`Attention : encore quelques tentatives avant blocage temporaire (15 min).`)
        }
        if (body.warning) setWarning(body.warning)
      }
    } finally {
      setLoading(false)
    }
  }

  const field = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: 6 },
    label:   { fontSize: 11, color: 'rgba(245,237,214,0.5)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' },
    input:   {
      width: '100%', boxSizing: 'border-box',
      background: '#1C1208',
      border: '1px solid rgba(200,146,42,0.3)',
      color: '#F5EDD6',
      caretColor: '#C8922A',
      padding: '11px 14px',
      fontSize: 15,
      fontFamily: 'DM Sans, sans-serif',
      outline: 'none',
    },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0806', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: 6, color: '#C8922A', textDecoration: 'none' }}>
            VISIT<span style={{ color: '#F5EDD6' }}>BÉNIN</span>
          </Link>
          <p style={{ color: 'rgba(245,237,214,0.35)', fontSize: 13, marginTop: 8 }}>Connectez-vous à votre compte</p>
        </div>

        {/* Bloc blocage temporaire */}
        {isLocked && (
          <div style={{ background: 'rgba(196,80,30,0.12)', border: '1px solid rgba(196,80,30,0.5)', padding: '16px 18px', marginBottom: 20, lineHeight: 1.6 }}>
            <p style={{ color: '#E87050', fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>
              🔒 Connexion temporairement bloquée
            </p>
            <p style={{ color: 'rgba(245,237,214,0.7)', fontSize: 13, margin: '0 0 10px' }}>
              Trop de tentatives échouées. Déblocage automatique dans :{' '}
              <Countdown until={locked.until} onExpire={() => { setLocked(null); setAttempts(0) }} />
            </p>
            <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: 12, margin: 0 }}>
              Pas encore de compte ?{' '}
              <Link to="/inscription" style={{ color: '#C8922A', fontWeight: 700, textDecoration: 'none' }}>
                Créer un compte →
              </Link>
              {' '}(l'inscription reste disponible)
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={field.wrapper}>
            <label style={field.label}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com" style={field.input} disabled={isLocked}
              onFocus={e => e.target.style.borderColor = '#C8922A'}
              onBlur={e  => e.target.style.borderColor = 'rgba(200,146,42,0.3)'}
            />
          </div>

          <div style={field.wrapper}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={field.label}>Mot de passe</label>
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: showPwd ? '#C8922A' : 'rgba(245,237,214,0.3)', fontSize: 11, fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, padding: 0, transition: 'color .15s' }}>
                {showPwd ? '🙈 MASQUER' : '👁 AFFICHER'}
              </button>
            </div>
            <input type={showPwd ? 'text' : 'password'} required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={showPwd ? 'Votre mot de passe' : '••••••••'}
              style={field.input} disabled={isLocked}
              onFocus={e => e.target.style.borderColor = '#C8922A'}
              onBlur={e  => e.target.style.borderColor = 'rgba(200,146,42,0.3)'}
            />
          </div>

          {/* Avertissement avant blocage */}
          {warning && !isLocked && (
            <p style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B', padding: '9px 12px', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              ⚠️ {warning}
            </p>
          )}

          {/* Erreur classique */}
          {error && !isLocked && (
            <p style={{ background: 'rgba(196,80,30,0.12)', border: '1px solid rgba(196,80,30,0.35)', color: '#E87050', padding: '9px 12px', fontSize: 13, margin: 0 }}>
              ❌ {error}
            </p>
          )}

          <button type="submit" disabled={loading || isLocked} style={{
            background: isLocked ? '#2a1a06' : '#C8922A',
            color: isLocked ? 'rgba(245,237,214,0.3)' : '#0A0806',
            border: 'none', padding: 13, fontSize: 14, fontWeight: 700,
            fontFamily: 'DM Sans, sans-serif',
            cursor: (loading || isLocked) ? 'not-allowed' : 'pointer',
            opacity: loading ? .7 : 1, marginTop: 4, transition: 'all .2s',
          }}>
            {loading ? 'Connexion…' : isLocked ? '🔒 Connexion bloquée temporairement' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(245,237,214,0.3)', fontSize: 13, marginTop: 22 }}>
          Pas encore de compte ?{' '}
          <Link to="/inscription" style={{ color: '#C8922A', textDecoration: 'none' }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}
