import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { authService } from '@/services/api'

const NAV_GROUPS = [
  {
    label: 'GÉNÉRAL',
    items: [
      { to: '/dashboard',   icon: '◈', label: 'Dashboard' },
    ],
  },
  {
    label: 'CONTENU',
    items: [
      { to: '/places',      icon: '⬡', label: 'Destinations' },
      { to: '/restaurants', icon: '⊕', label: 'Restaurants' },
      { to: '/schools',     icon: '◻', label: 'Écoles' },
    ],
  },
  {
    label: 'PARTENAIRES',
    items: [
      { to: '/partners',    icon: '🏢', label: 'Partenaires & Agences' },
    ],
  },
  {
    label: 'PLANIFICATEUR',
    items: [
      { to: '/trips',       icon: '🗺️', label: 'Voyages planifiés' },
      { to: '/activities',  icon: '🎯', label: 'Activités & Événements' },
      { to: '/rentals',     icon: '🚗', label: 'Locations' },
    ],
  },
  {
    label: 'COMMUNAUTÉ',
    items: [
      { to: '/reviews',     icon: '◇', label: 'Avis' },
      { to: '/users',       icon: '○', label: 'Utilisateurs' },
      { to: '/media',       icon: '⊞', label: 'Médias' },
    ],
  },
  {
    label: 'RÉSERVATIONS & EVENTS',
    items: [
      { to: '/bookings',    icon: '📅', label: 'Réservations' },
      { to: '/events',      icon: '🎉', label: 'Calendrier & Fêtes' },
    ],
  },
  {
    label: 'MARKETPLACE',
    items: [
      { to: '/marketplace', icon: '🛒', label: 'Boutiques & Commandes' },
    ],
  },
]

export default function AdminLayout() {
  const { user, logout } = useAdminStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    await authService.logout().catch(() => {})
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: collapsed ? 52 : 220, flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width .2s ease', overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          height: 52, display: 'flex', alignItems: 'center',
          padding: collapsed ? '0 14px' : '0 18px',
          borderBottom: '1px solid var(--border)', gap: 10, flexShrink: 0,
        }}>
          <span style={{ color: 'var(--amber)', fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: 2, whiteSpace: 'nowrap' }}>
            {collapsed ? 'VB' : 'VISIT·BJ'}
          </span>
          {!collapsed && (
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', background: '#1f1200', color: 'var(--amber-dim)', padding: '1px 5px', letterSpacing: 1 }}>
              ADMIN
            </span>
          )}
        </div>

        {/* Nav groupée */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {/* Séparateur de groupe */}
              {!collapsed && (
                <div style={{ padding: '10px 18px 4px', fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--border)', letterSpacing: 3 }}>
                  {group.label}
                </div>
              )}
              {collapsed && <div style={{ height: 8 }} />}

              {group.items.map(item => (
                <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center',
                  gap: 10, padding: collapsed ? '9px 14px' : '9px 18px',
                  color: isActive ? 'var(--amber)' : 'var(--muted)',
                  background: isActive ? '#1f1200' : 'transparent',
                  borderLeft: `2px solid ${isActive ? 'var(--amber)' : 'transparent'}`,
                  textDecoration: 'none', fontSize: 12,
                  fontFamily: 'var(--font-body)',
                  transition: 'all .15s ease', whiteSpace: 'nowrap',
                })}>
                  <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bas de sidebar */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px', flexShrink: 0 }}>
          {!collapsed && user && (
            <div style={{ marginBottom: 8, padding: '8px', background: 'var(--surface2)' }}>
              <p style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <p style={{ fontSize: 9, color: 'var(--amber)', fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: 1 }}>● {user.role.toUpperCase()}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setCollapsed(!collapsed)}
              style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '6px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              {collapsed ? '→' : '←'}
            </button>
            {!collapsed && (
              <button onClick={handleLogout}
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '6px', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                exit
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 52, display: 'flex', alignItems: 'center',
          padding: '0 24px', borderBottom: '1px solid var(--border)',
          background: 'var(--surface)', flexShrink: 0, justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 2 }}>VISITBENIN ·</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: 1 }}>BACK-OFFICE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>LIVE</span>
            </div>
            <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textDecoration: 'none', border: '1px solid var(--border)', padding: '3px 8px', letterSpacing: 1 }}>
              SITE PUBLIC ↗
            </a>
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
