import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/api'
import { useAdminStore } from '@/store/useAdminStore'

export default function Login() {
  const [email,   setEmail]   = useState('')
  const [password,setPassword]= useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAdminStore()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await authService.login({ email, password })
      if (data.user.role !== 'admin' && data.user.role !== 'editor') {
        setError('Accès réservé aux administrateurs')
        return
      }
      setUser(data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grille de fond */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px', opacity: .15,
      }} />
      {/* Halo amber */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 500, height: 500, background: 'var(--amber)',
        borderRadius: '50%', opacity: .03, filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 380, margin: '0 16px', position: 'relative' }}>

        {/* En-tête */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--amber)', letterSpacing: 6, marginBottom: 8 }}>
            VISIT·BJ
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 4 }}>
            BACK-OFFICE ADMINISTRATION
          </div>
          <div style={{ width: 40, height: 1, background: 'var(--amber)', margin: '16px auto 0', opacity: .4 }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden' }}>

            {/* Email */}
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ padding: '6px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2 }}>EMAIL</span>
              </div>
              <input type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@domaine.bj"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'transparent', border: 'none',
                  color: 'var(--text)',       /* texte saisi visible */
                  caretColor: 'var(--amber)',
                  padding: '14px 16px', fontSize: 14,
                  fontFamily: 'var(--font-body)', outline: 'none',
                }}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <div style={{ padding: '6px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2 }}>PASSWORD</span>
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1,
                    color: showPwd ? 'var(--amber)' : 'var(--muted)',
                    padding: 0, transition: 'color .15s',
                  }}>
                  {showPwd ? '🙈 MASQUER' : '👁 AFFICHER'}
                </button>
              </div>
              <input type={showPwd ? 'text' : 'password'} required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={showPwd ? 'Votre mot de passe' : '••••••••'}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'transparent', border: 'none',
                  color: 'var(--text)',       /* texte saisi visible */
                  caretColor: 'var(--amber)',
                  padding: '14px 16px', fontSize: 14,
                  fontFamily: 'var(--font-body)', outline: 'none',
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)',
              background: '#1f0505', border: '1px solid #3f0a0a',
              borderTop: 'none', padding: '8px 14px',
            }}>
              ⚠ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 12, background: 'var(--amber)', color: '#000',
            border: 'none', padding: 14, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3,
            fontWeight: 600, opacity: loading ? .7 : 1, transition: 'opacity .15s',
          }}>
            {loading ? 'CONNEXION…' : 'ACCÉDER AU BACK-OFFICE →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', marginTop: 20, letterSpacing: 1 }}>
          ACCÈS RESTREINT · ADMINISTRATEURS UNIQUEMENT
        </p>
      </div>
    </div>
  )
}
