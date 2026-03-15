import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { authService } from '@/services/index'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

const NAV_LINKS = [
  { to: '/destinations', label: 'Destinations' },
  { to: '/gastronomie',  label: 'Gastronomie' },
  { to: '/ecoles',       label: 'Écoles' },
  { to: '/carte',        label: 'Carte' },
]

// Liens du menu déroulant "Explorer"
const EXPLORE_LINKS = [
  { to: '/itineraires',     icon: '🗺️', label: 'Itinéraires sur mesure',    desc: 'Aventure, culture, famille, éco' },
  { to: '/calendrier',      icon: '📅', label: 'Calendrier des fêtes',       desc: 'Vodun, Gani, Gaani, festivals' },
  { to: '/marketplace',     icon: '🛒', label: 'MissèBo Market',             desc: 'Artisanat, épices, pagnes, poteries' },
  { to: '/ecotourisme',     icon: '🌿', label: 'Éco-tourisme',               desc: 'Forêts sacrées, communautés, nature' },
  { to: '/infos-pratiques', icon: '📋', label: 'Infos pratiques',            desc: 'e-Visa, FAQ, guides PDF' },
  { to: '/partenaires',     icon: '🏢', label: 'Partenaires & agences',      desc: 'Agences locales certifiées' },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [exploreOpen, setExploreOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropRef = useRef(null)

  async function handleLogout() {
    await authService.logout().catch(() => {})
    logout()
    navigate('/')
  }

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    function onOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setExploreOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const linkStyle = (isActive) => ({
    color: isActive ? '#C8922A' : 'rgba(245,237,214,0.75)',
    textDecoration: 'none', fontSize: 13, fontWeight: 400,
    borderBottom: isActive ? '2px solid #C8922A' : '2px solid transparent',
    paddingBottom: 2, transition: 'color .15s',
    whiteSpace: 'nowrap',
  })

  return (
    <nav style={{ background: '#0E0A06', borderBottom: '1px solid rgba(200,146,42,0.15)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 28 }}>

        {/* Logo */}
        <Link to="/" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 4, color: '#C8922A', textDecoration: 'none', flexShrink: 0 }}>
          VISIT<span style={{ color: '#F5EDD6' }}>BÉNIN</span>
        </Link>

        {/* Liens desktop */}
        <div style={{ display: 'flex', gap: 22, alignItems: 'center', flex: 1 }}>
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to}
              style={({ isActive }) => linkStyle(isActive)}>
              {link.label}
            </NavLink>
          ))}

          {/* Dropdown Explorer */}
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setExploreOpen(o => !o)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: exploreOpen ? '#C8922A' : 'rgba(245,237,214,0.75)',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 4,
                borderBottom: exploreOpen ? '2px solid #C8922A' : '2px solid transparent',
                paddingBottom: 2, transition: 'color .15s', whiteSpace: 'nowrap',
              }}>
              Explorer
              <span style={{ fontSize: 9, transition: 'transform .2s', transform: exploreOpen ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▼</span>
            </button>

            {exploreOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 16px)', left: 0,
                background: '#111009', border: '1px solid rgba(200,146,42,0.2)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                width: 300, zIndex: 200,
              }}>
                <div style={{ padding: '6px 0' }}>
                  {EXPLORE_LINKS.map(link => (
                    <NavLink key={link.to} to={link.to}
                      onClick={() => setExploreOpen(false)}
                      style={({ isActive }) => ({
                        display: 'flex', gap: 12, padding: '12px 18px', textDecoration: 'none',
                        background: isActive ? 'rgba(200,146,42,0.08)' : 'transparent',
                        transition: 'background .15s',
                        borderLeft: isActive ? '3px solid #C8922A' : '3px solid transparent',
                      })}
                      onMouseEnter={e => { if (!e.currentTarget.style.borderLeftColor.includes('C89')) e.currentTarget.style.background = 'rgba(200,146,42,0.05)' }}
                      onMouseLeave={e => { if (!e.currentTarget.style.borderLeftColor.includes('C89')) e.currentTarget.style.background = 'transparent' }}>
                      <span style={{ fontSize: 18 }}>{link.icon}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#F5EDD6', marginBottom: 2 }}>{link.label}</p>
                        <p style={{ fontSize: 11, color: 'rgba(245,237,214,0.4)' }}>{link.desc}</p>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Planifier — CTA toujours visible */}
          <NavLink to="/planifier"
            style={({ isActive }) => ({
              color: '#C8922A', textDecoration: 'none', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.05em', background: 'rgba(200,146,42,0.12)',
              padding: '5px 12px', border: '1px solid rgba(200,146,42,0.25)',
              transition: 'all .15s', whiteSpace: 'nowrap',
              ...(isActive ? { background: 'rgba(200,146,42,0.2)' } : {}),
            })}>
            🗺️ Planifier
          </NavLink>
        </div>

        {/* Droite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <LanguageSwitcher variant="navbar" />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <NavLink to="/dashboard"
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: isActive ? '#C8922A' : 'rgba(245,237,214,0.65)',
                  textDecoration: 'none', fontSize: 12, padding: '5px 10px',
                  border: `1px solid ${isActive ? '#C8922A' : 'rgba(200,146,42,0.2)'}`,
                  transition: 'all .15s',
                })}>
                <span style={{ width: 20, height: 20, background: '#C8922A', color: '#0E0A06', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {user.name?.[0]?.toUpperCase() || '?'}
                </span>
                {user.name?.split(' ')[0]}
              </NavLink>
              <button onClick={handleLogout}
                style={{ background: 'none', border: '1px solid rgba(200,146,42,0.3)', color: 'rgba(245,237,214,0.5)', padding: '5px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all .15s' }}
                onMouseEnter={e => { e.target.style.borderColor = '#C8922A'; e.target.style.color = '#C8922A' }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(200,146,42,0.3)'; e.target.style.color = 'rgba(245,237,214,0.5)' }}>
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/connexion"
                style={{ color: 'rgba(245,237,214,0.6)', textDecoration: 'none', fontSize: 12, padding: '5px 12px', border: '1px solid rgba(200,146,42,0.2)', transition: 'all .15s' }}
                onMouseEnter={e => { e.target.style.borderColor = '#C8922A'; e.target.style.color = '#C8922A' }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(200,146,42,0.2)'; e.target.style.color = 'rgba(245,237,214,0.6)' }}>
                {t('nav.login')}
              </Link>
              <Link to="/inscription"
                style={{ background: '#C8922A', color: '#0E0A06', textDecoration: 'none', fontSize: 12, fontWeight: 700, padding: '5px 14px', transition: 'background .15s' }}
                onMouseEnter={e => e.target.style.background = '#b07d20'}
                onMouseLeave={e => e.target.style.background = '#C8922A'}>
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
