import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const [exploreOpen, setExploreOpen] = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [mobileExplore, setMobileExplore] = useState(false)
  const dropRef = useRef(null)

  // Fermer le menu mobile à chaque changement de route
  useEffect(() => { setMobileOpen(false); setExploreOpen(false) }, [location.pathname])

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    function onOut(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setExploreOpen(false)
    }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [])

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  async function handleLogout() {
    await authService.logout().catch(() => {})
    logout()
    navigate('/')
  }

  const lk = (isActive) => ({
    color: isActive ? '#C8922A' : 'rgba(245,237,214,0.75)',
    textDecoration: 'none', fontSize: 13, fontWeight: 400,
    borderBottom: isActive ? '2px solid #C8922A' : '2px solid transparent',
    paddingBottom: 2, transition: 'color .15s', whiteSpace: 'nowrap',
  })

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-right-desktop { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hamburger-btn { display: none !important; }
          .mobile-overlay { display: none !important; }
        }
      `}</style>

      <nav style={{ background: '#0E0A06', borderBottom: '1px solid rgba(200,146,42,0.15)', position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <Link to="/" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 4, color: '#C8922A', textDecoration: 'none', flexShrink: 0 }}>
            VISIT<span style={{ color: '#F5EDD6' }}>BÉNIN</span>
          </Link>

          {/* Liens desktop */}
          <div className="nav-desktop" style={{ display: 'flex', gap: 22, alignItems: 'center', flex: 1 }}>
            {NAV_LINKS.map(link => (
              <NavLink key={link.to} to={link.to} style={({ isActive }) => lk(isActive)}>{link.label}</NavLink>
            ))}

            {/* Dropdown Explorer */}
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button onClick={() => setExploreOpen(o => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: exploreOpen ? '#C8922A' : 'rgba(245,237,214,0.75)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, borderBottom: exploreOpen ? '2px solid #C8922A' : '2px solid transparent', paddingBottom: 2, transition: 'color .15s', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
                Explorer
                <span style={{ fontSize: 9, transition: 'transform .2s', transform: exploreOpen ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▼</span>
              </button>
              {exploreOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 16px)', left: 0, background: '#111009', border: '1px solid rgba(200,146,42,0.2)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', width: 300, zIndex: 300 }}>
                  {EXPLORE_LINKS.map(link => (
                    <NavLink key={link.to} to={link.to} onClick={() => setExploreOpen(false)}
                      style={({ isActive }) => ({ display: 'flex', gap: 12, padding: '12px 18px', textDecoration: 'none', background: isActive ? 'rgba(200,146,42,0.08)' : 'transparent', transition: 'background .15s', borderLeft: isActive ? '3px solid #C8922A' : '3px solid transparent' })}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,146,42,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 18 }}>{link.icon}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#F5EDD6', marginBottom: 2 }}>{link.label}</p>
                        <p style={{ fontSize: 11, color: 'rgba(245,237,214,0.4)' }}>{link.desc}</p>
                      </div>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/planifier"
              style={({ isActive }) => ({ color: '#C8922A', textDecoration: 'none', fontSize: 13, fontWeight: 700, background: 'rgba(200,146,42,0.12)', padding: '5px 12px', border: '1px solid rgba(200,146,42,0.25)', transition: 'all .15s', whiteSpace: 'nowrap', ...(isActive ? { background: 'rgba(200,146,42,0.2)' } : {}) })}>
              🗺️ Planifier
            </NavLink>
          </div>

          {/* Droite desktop */}
          <div className="nav-right-desktop" style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <LanguageSwitcher variant="navbar" />
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <NavLink to="/dashboard"
                  style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 6, color: isActive ? '#C8922A' : 'rgba(245,237,214,0.65)', textDecoration: 'none', fontSize: 12, padding: '5px 10px', border: `1px solid ${isActive ? '#C8922A' : 'rgba(200,146,42,0.2)'}`, transition: 'all .15s' })}>
                  <span style={{ width: 20, height: 20, background: '#C8922A', color: '#0E0A06', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </span>
                  {user.name?.split(' ')[0]}
                </NavLink>
                <button onClick={handleLogout}
                  style={{ background: 'none', border: '1px solid rgba(200,146,42,0.3)', color: 'rgba(245,237,214,0.5)', padding: '5px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all .15s' }}>
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/connexion" style={{ color: 'rgba(245,237,214,0.6)', textDecoration: 'none', fontSize: 12, padding: '5px 12px', border: '1px solid rgba(200,146,42,0.2)', transition: 'all .15s' }}>
                  {t('nav.login')}
                </Link>
                <Link to="/inscription" style={{ background: '#C8922A', color: '#0E0A06', textDecoration: 'none', fontSize: 12, fontWeight: 700, padding: '5px 14px' }}>
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Bouton hamburger mobile */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 8, zIndex: 300, flexShrink: 0 }}
            aria-label="Menu">
            <span style={{ display: 'block', width: 24, height: 2, background: mobileOpen ? '#C8922A' : '#F5EDD6', borderRadius: 2, transition: 'all .25s', transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ display: 'block', width: 24, height: 2, background: mobileOpen ? '#C8922A' : '#F5EDD6', borderRadius: 2, transition: 'all .25s', opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 24, height: 2, background: mobileOpen ? '#C8922A' : '#F5EDD6', borderRadius: 2, transition: 'all .25s', transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Menu mobile plein écran */}
      <div className="mobile-overlay" style={{
        position: 'fixed', inset: 0, zIndex: 190,
        background: '#0E0A06',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
        overflowY: 'auto',
        paddingTop: 60,
      }}>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 'calc(100vh - 60px)' }}>

          {/* Liens principaux */}
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to}
              style={({ isActive }) => ({
                color: isActive ? '#C8922A' : '#F5EDD6',
                textDecoration: 'none', fontSize: 20, fontWeight: isActive ? 700 : 400,
                padding: '14px 0', borderBottom: '1px solid rgba(200,146,42,0.08)',
                display: 'block', fontFamily: 'Playfair Display, serif',
              })}>
              {link.label}
            </NavLink>
          ))}

          {/* Planifier */}
          <NavLink to="/planifier"
            style={{ color: '#C8922A', textDecoration: 'none', fontSize: 20, fontWeight: 700, padding: '14px 0', borderBottom: '1px solid rgba(200,146,42,0.08)', fontFamily: 'Playfair Display, serif' }}>
            🗺️ Planifier
          </NavLink>

          {/* Explorer accordion */}
          <div>
            <button onClick={() => setMobileExplore(o => !o)}
              style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(200,146,42,0.08)' }}>
              <span style={{ color: '#F5EDD6', fontSize: 20, fontFamily: 'Playfair Display, serif' }}>Explorer</span>
              <span style={{ color: '#C8922A', fontSize: 16, transition: 'transform .2s', transform: mobileExplore ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▼</span>
            </button>
            {mobileExplore && (
              <div style={{ paddingLeft: 16, paddingBottom: 8 }}>
                {EXPLORE_LINKS.map(link => (
                  <NavLink key={link.to} to={link.to}
                    style={({ isActive }) => ({
                      display: 'flex', gap: 12, padding: '12px 0', textDecoration: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      color: isActive ? '#C8922A' : '#F5EDD6',
                    })}>
                    <span style={{ fontSize: 18 }}>{link.icon}</span>
                    <span style={{ fontSize: 15 }}>{link.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div style={{ flex: 1 }} />

          {/* Auth mobile */}
          <div style={{ paddingTop: 20, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {user ? (
              <>
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#F5EDD6', textDecoration: 'none', fontSize: 15, padding: '12px 16px', background: 'rgba(200,146,42,0.08)', border: '1px solid rgba(200,146,42,0.2)' }}>
                  <span style={{ width: 28, height: 28, background: '#C8922A', color: '#0E0A06', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, borderRadius: '50%' }}>
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </span>
                  Mon espace — {user.name?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout}
                  style={{ background: 'none', border: '1px solid rgba(200,146,42,0.3)', color: 'rgba(245,237,214,0.6)', padding: '12px', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" style={{ display: 'block', textAlign: 'center', color: '#F5EDD6', textDecoration: 'none', fontSize: 15, padding: '12px', border: '1px solid rgba(200,146,42,0.3)' }}>
                  Se connecter
                </Link>
                <Link to="/inscription" style={{ display: 'block', textAlign: 'center', background: '#C8922A', color: '#0E0A06', textDecoration: 'none', fontSize: 15, fontWeight: 700, padding: '12px' }}>
                  Créer un compte
                </Link>
              </>
            )}
            <div style={{ marginTop: 8 }}>
              <LanguageSwitcher variant="select" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
