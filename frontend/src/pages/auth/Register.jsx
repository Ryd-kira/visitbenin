import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/index'
import { useAuthStore } from '@/store/useAuthStore'

// Règles de validation côté client — identiques au schéma Joi backend
const RULES = {
  name:     v => v.length < 2   ? 'Minimum 2 caractères' : v.length > 100 ? 'Maximum 100 caractères' : '',
  email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Adresse email invalide',
  password: v => v.length < 8   ? '8 caractères minimum'
               : !/[A-Z]/.test(v) ? 'Ajoutez au moins une majuscule'
               : !/[0-9]/.test(v) ? 'Ajoutez au moins un chiffre'
               : '',
}

function Field({ label, type, value, onChange, placeholder, error, children }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, color: 'rgba(245,237,214,0.5)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type} value={value} required
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#1C1208',
            border: `1px solid ${error ? 'rgba(196,80,30,0.7)' : focused ? '#C8922A' : 'rgba(200,146,42,0.3)'}`,
            color: '#F5EDD6', caretColor: '#C8922A',
            padding: '11px 14px', fontSize: 15,
            fontFamily: 'DM Sans, sans-serif', outline: 'none',
            transition: 'border-color .15s',
          }}
        />
        {children}
      </div>
      {error && (
        <span style={{ fontSize: 11, color: '#E87050', fontFamily: 'DM Sans', marginTop: -2 }}>
          ↑ {error}
        </span>
      )}
    </div>
  )
}

function StrengthBar({ password }) {
  if (!password.length) return null
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
    password.length >= 12,
  ]
  const score = checks.filter(Boolean).length
  const colors = ['#ef4444','#ef4444','#f59e0b','#22c55e','#22c55e']
  const labels = ['Très faible','Faible','Correct','Fort','Très fort']
  const color = colors[score - 1] || '#ef4444'
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: 'flex', gap: 3, height: 3, marginBottom: 4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex: 1, background: i <= score ? color : '#2a1a0a', transition: 'background .3s', borderRadius: 2 }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color, fontFamily: 'DM Sans', letterSpacing: 1 }}>{labels[score - 1] || 'Trop court'}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['Maj', /[A-Z]/.test(password)], ['123', /[0-9]/.test(password)], ['#!@', /[^A-Za-z0-9]/.test(password)]].map(([lbl, ok]) => (
            <span key={lbl} style={{ fontSize: 10, color: ok ? '#22c55e' : 'rgba(245,237,214,0.2)', fontFamily: 'DM Sans' }}>
              {ok ? '✓' : '○'} {lbl}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  const [form, setForm]         = useState({ name: '', email: '', password: '' })
  const [showPwd, setShowPwd]   = useState(false)
  const [touched, setTouched]   = useState({})          // champs modifiés
  const [apiError, setApiError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})    // erreurs champ par champ retournées par l'API
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const { login } = useAuthStore()
  const navigate  = useNavigate()

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setTouched(t => ({ ...t, [key]: true }))
    if (fieldErrors[key]) setFieldErrors(fe => ({ ...fe, [key]: '' }))
    if (apiError) setApiError('')
  }

  // Erreur visible : seulement si le champ a été touché
  function err(key) {
    if (fieldErrors[key]) return fieldErrors[key]
    if (!touched[key]) return ''
    return RULES[key](form[key])
  }

  const isValid = Object.keys(RULES).every(k => !RULES[k](form[k]))

  async function handleSubmit(e) {
    e.preventDefault()
    // Marquer tous les champs comme touchés pour afficher les erreurs
    setTouched({ name: true, email: true, password: true })
    if (!isValid) return

    setLoading(true); setApiError(''); setFieldErrors({})
    try {
      const data = await authService.register(form)
      setSuccess(true)
      setTimeout(() => {
        login(data.user, data.access_token)
        navigate('/')
      }, 800)
    } catch (err) {
      const status = err.response?.status
      const body   = err.response?.data || {}

      if (status === 422 && body.errors?.length) {
        // Erreurs de validation champ par champ retournées par Joi
        const fe = {}
        body.errors.forEach(e => { fe[e.field] = e.message })
        setFieldErrors(fe)
        setApiError('Veuillez corriger les champs indiqués.')
      } else if (status === 409) {
        setFieldErrors({ email: 'Cette adresse email est déjà utilisée.' })
        setApiError('')
      } else if (status === 429) {
        setApiError('Trop d\'inscriptions depuis votre adresse. Réessayez dans 1 heure.')
      } else {
        setApiError(body.error || 'Une erreur est survenue. Réessayez.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0806', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: 6, color: '#C8922A', textDecoration: 'none' }}>
            VISIT<span style={{ color: '#F5EDD6' }}>BÉNIN</span>
          </Link>
          <p style={{ color: 'rgba(245,237,214,0.35)', fontSize: 13, marginTop: 8 }}>Créez votre compte gratuit</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '32px 24px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>✅</p>
            <p style={{ color: '#22c55e', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Compte créé avec succès !</p>
            <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: 13 }}>Redirection en cours…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <Field label="Votre nom" type="text" value={form.name}
              onChange={v => set('name', v)} placeholder="Jean Dupont"
              error={err('name')} />

            <Field label="Email" type="email" value={form.email}
              onChange={v => set('email', v)} placeholder="votre@email.com"
              error={err('email')} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 11, color: 'rgba(245,237,214,0.5)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
                  Mot de passe
                </label>
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: showPwd ? '#C8922A' : 'rgba(245,237,214,0.25)', fontSize: 11, fontFamily: 'DM Sans', letterSpacing: 1, padding: 0 }}>
                  {showPwd ? '🙈 MASQUER' : '👁 AFFICHER'}
                </button>
              </div>
              <Field label="" type={showPwd ? 'text' : 'password'} value={form.password}
                onChange={v => set('password', v)}
                placeholder={showPwd ? 'Votre mot de passe' : '8 caractères min, 1 majuscule, 1 chiffre'}
                error={err('password')} />
              <StrengthBar password={form.password} />
            </div>

            {apiError && (
              <p style={{ background: 'rgba(196,80,30,0.12)', border: '1px solid rgba(196,80,30,0.4)', color: '#E87050', padding: '10px 14px', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                ❌ {apiError}
              </p>
            )}

            <button type="submit" disabled={loading} style={{
              background: '#C8922A', color: '#0A0806', border: 'none',
              padding: 13, fontSize: 14, fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? .7 : 1, marginTop: 4, transition: 'opacity .15s',
            }}>
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>

            <p style={{ fontSize: 11, color: 'rgba(245,237,214,0.25)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
              En créant un compte vous acceptez nos{' '}
              <span style={{ color: 'rgba(200,146,42,0.5)' }}>Conditions d'utilisation</span>
            </p>
          </form>
        )}

        <p style={{ textAlign: 'center', color: 'rgba(245,237,214,0.3)', fontSize: 13, marginTop: 24 }}>
          Déjà inscrit ?{' '}
          <Link to="/connexion" style={{ color: '#C8922A', textDecoration: 'none' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
