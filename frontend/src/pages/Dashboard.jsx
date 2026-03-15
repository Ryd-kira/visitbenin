// frontend/src/pages/Dashboard.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from '@/services/api.js'
import { useAuthStore } from '@/store/useAuthStore'

// ── API helpers ──
const api = {
  me:           () => axios.get('/api/v1/users/me').then(r => r.data.data),
  saved:        () => axios.get('/api/v1/users/me/saved').then(r => r.data.data),
  reviews:      () => axios.get('/api/v1/users/me/reviews').then(r => r.data.data),
  trips:        () => axios.get('/api/v1/users/me/trips').then(r => r.data.data),
  updateMe:     (d) => axios.patch('/api/v1/users/me', d).then(r => r.data.data),
  updatePwd:    (d) => axios.patch('/api/v1/users/me/password', d),
  removeSaved:  (id) => axios.delete(`/api/v1/users/me/saved/${id}`),
}

// ── Helpers UI ──
const ENTITY_ROUTES = { place: '/destinations', restaurant: '/gastronomie', school: '/ecoles' }
const ENTITY_LABELS = { place: '📍 Site', restaurant: '🍽 Restaurant', school: '🏫 École' }
const TRIP_STATUS   = { draft: ['⏳','Brouillon','#6b7280'], active: ['🚀','En cours','#3b82f6'], completed: ['✅','Terminé','#22c55e'], cancelled: ['❌','Annulé','#ef4444'] }
const TRIP_MODES    = { solo: '🧍 Solo', couple: '💑 Couple', famille: '👨‍👩‍👧 Famille', groupe: '👥 Groupe', affaires: '💼 Affaires' }

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: 'white', border: '1px solid #f3f4f6', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 26, fontWeight: 700, color: '#111827', fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{label}</p>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 20px', fontSize: 13, cursor: 'pointer', border: 'none', transition: 'all .15s',
      background: active ? '#0E0A06' : 'transparent',
      color: active ? '#F5EDD6' : '#6b7280',
      fontWeight: active ? 700 : 400,
      borderBottom: active ? '2px solid #C8922A' : '2px solid transparent',
    }}>
      {children}
    </button>
  )
}

// ══════════════════════════════════════════
export default function Dashboard() {
  const { user: authUser } = useAuthStore()
  const { t } = useTranslation()
  const qc = useQueryClient()

  const [tab, setTab]         = useState('overview')
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', avatar_url: '' })
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)

  // Redirect si non connecté
  if (!authUser) return <Navigate to="/connexion" replace />

  const { data: me }      = useQuery({ queryKey: ['me'], queryFn: api.me })
  const { data: saved }   = useQuery({ queryKey: ['my-saved'], queryFn: api.saved, enabled: tab === 'favoris' || tab === 'overview' })
  const { data: reviews } = useQuery({ queryKey: ['my-reviews'], queryFn: api.reviews, enabled: tab === 'avis' })
  const { data: trips }   = useQuery({ queryKey: ['my-trips'], queryFn: api.trips, enabled: tab === 'voyages' || tab === 'overview' })
  const { data: bookings } = useQuery({ queryKey: ['my-bookings'], queryFn: () => axios.get('/api/v1/bookings/me').then(r => r.data.data), enabled: tab === 'reservations' || tab === 'overview' })
  const { data: orders }   = useQuery({ queryKey: ['my-orders'],   queryFn: () => axios.get('/api/v1/marketplace/orders/me').then(r => r.data.data), enabled: tab === 'commandes' })

  const updateMe = useMutation({
    mutationFn: api.updateMe,
    onSuccess: (data) => {
      qc.invalidateQueries(['me'])
      setEditProfile(false)
    },
  })

  const updatePwd = useMutation({
    mutationFn: api.updatePwd,
    onSuccess: () => { setPwdSuccess(true); setPwdForm({ current_password: '', new_password: '', confirm: '' }) },
    onError: (err) => setPwdError(err.response?.data?.error || 'Erreur'),
  })

  const removeSaved = useMutation({
    mutationFn: api.removeSaved,
    onSuccess: () => qc.invalidateQueries(['my-saved']),
  })

  const stats = me?.stats || {}
  const initials = (me?.name || authUser?.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* ── HEADER PROFIL ── */}
      <div style={{ background: '#0E0A06', padding: '40px 24px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', paddingBottom: 24 }}>
            {/* Avatar */}
            <div style={{ width: 72, height: 72, background: '#C8922A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#0E0A06', flexShrink: 0, position: 'relative' }}>
              {me?.avatar_url
                ? <img src={me.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>

            {/* Infos */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#F5EDD6', fontWeight: 700, margin: 0 }}>
                  {me?.name || authUser?.name}
                </h1>
                {me?.role === 'admin' && (
                  <span style={{ background: '#f59e0b', color: '#0a0a0a', fontSize: 10, padding: '3px 10px', fontWeight: 700, letterSpacing: 1 }}>ADMIN</span>
                )}
                {me?.is_verified && (
                  <span style={{ background: '#065f46', color: '#6ee7b7', fontSize: 10, padding: '3px 10px', fontWeight: 600 }}>✓ Vérifié</span>
                )}
              </div>
              <p style={{ color: 'rgba(245,237,214,0.4)', fontSize: 13, marginTop: 4 }}>
                {me?.email} · Membre depuis {me ? new Date(me.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '…'}
              </p>
            </div>

            <Link to="/planifier"
              style={{ background: '#C8922A', color: '#0E0A06', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700, flexShrink: 0, alignSelf: 'center' }}>
              🗺️ Planifier un voyage
            </Link>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {[
              ['overview',      t('dashboard.tab_overview')],
              ['favoris',       t('dashboard.tab_favorites')],
              ['voyages',       t('dashboard.tab_trips')],
              ['reservations',  t('dashboard.tab_bookings')],
              ['commandes',     t('dashboard.tab_orders')],
              ['avis',          t('dashboard.tab_reviews')],
              ['profil',        t('dashboard.tab_profile')],
            ].map(([id, label]) => (
              <TabBtn key={id} active={tab === id} onClick={() => setTab(id)}>{label}</TabBtn>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
              <StatCard icon="❤️" label={t('dashboard.stat_favorites')} value={stats.saved   ?? '—'} color="#ef4444" />
              <StatCard icon="🗺️" label={t('dashboard.stat_trips')}     value={stats.trips   ?? '—'} color="#3b82f6" />
              <StatCard icon="📅" label={t('dashboard.stat_bookings')}  value={bookings?.length ?? '—'} color="#C8922A" />
              <StatCard icon="⭐" label={t('dashboard.stat_reviews')}   value={stats.reviews ?? '—'} color="#f59e0b" />
            </div>

            {/* Derniers favoris */}
            {saved && saved.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>❤️ Derniers favoris</h2>
                  <button onClick={() => setTab('favoris')} style={{ fontSize: 12, color: '#C8922A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Voir tout →</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {saved.slice(0, 4).map(item => {
                    const entity = item.place || item.restaurant || item.school
                    if (!entity) return null
                    return (
                      <Link key={item.id} to={`${ENTITY_ROUTES[item.entity_type]}/${entity.slug}`}
                        style={{ textDecoration: 'none', background: 'white', border: '1px solid #f3f4f6', overflow: 'hidden', display: 'block', transition: 'box-shadow .15s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                        <div style={{ height: 90, overflow: 'hidden', background: '#f3f4f6' }}>
                          {entity.cover_image
                            ? <img src={entity.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🏛</div>
                          }
                        </div>
                        <div style={{ padding: '10px 12px' }}>
                          <p style={{ fontSize: 11, color: '#C8922A', fontWeight: 600, marginBottom: 3 }}>{ENTITY_LABELS[item.entity_type]}</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{entity.name}</p>
                          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>📍 {entity.city}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Derniers voyages */}
            {trips && trips.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>🗺️ Mes voyages</h2>
                  <button onClick={() => setTab('voyages')} style={{ fontSize: 12, color: '#C8922A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Voir tout →</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {trips.slice(0, 3).map(trip => {
                    const [ico, label, color] = TRIP_STATUS[trip.status] || ['📝','Inconnu','#6b7280']
                    return (
                      <Link key={trip.id} to="/planifier"
                        style={{ textDecoration: 'none', background: 'white', border: '1px solid #f3f4f6', padding: '18px 20px', display: 'block' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{trip.title}</h3>
                          <span style={{ fontSize: 11, background: color + '20', color, padding: '3px 8px', fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{ico} {label}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
                          {TRIP_MODES[trip.mode]} · {trip.nb_persons} pers. · {trip.steps?.length || 0} étapes
                        </p>
                        {trip.date_start && (
                          <p style={{ fontSize: 11, color: '#6b7280' }}>
                            📅 {new Date(trip.date_start).toLocaleDateString('fr-FR')}
                            {trip.date_end && ` → ${new Date(trip.date_end).toLocaleDateString('fr-FR')}`}
                          </p>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {(!saved || saved.length === 0) && (!trips || trips.length === 0) && (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', border: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 48 }}>🌍</p>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8, fontFamily: 'Playfair Display, serif' }}>
                  Commencez votre aventure béninoise
                </h3>
                <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>Sauvegardez des lieux, planifiez vos voyages et laissez des avis</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/destinations" style={{ background: '#C8922A', color: 'white', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Explorer les destinations</Link>
                  <Link to="/planifier"    style={{ background: '#0E0A06', color: '#F5EDD6', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Créer un voyage</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ FAVORIS ══ */}
        {tab === 'favoris' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>❤️ Mes favoris</h2>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>
              {saved?.length || 0} lieu{(saved?.length || 0) > 1 ? 'x' : ''} sauvegardé{(saved?.length || 0) > 1 ? 's' : ''}
            </p>

            {!saved || saved.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', border: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 36 }}>💔</p>
                <p style={{ color: '#9ca3af', marginTop: 8 }}>Aucun favori pour l'instant</p>
                <Link to="/destinations" style={{ display: 'inline-block', marginTop: 16, background: '#C8922A', color: 'white', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                  Découvrir les destinations
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {saved.map(item => {
                  const entity = item.place || item.restaurant || item.school
                  if (!entity) return null
                  return (
                    <div key={item.id} style={{ background: 'white', border: '1px solid #f3f4f6', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: 140, overflow: 'hidden', background: '#f3f4f6', position: 'relative' }}>
                        {entity.cover_image
                          ? <img src={entity.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🏛</div>
                        }
                        <button
                          onClick={() => removeSaved.mutate(item.id)}
                          style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Retirer des favoris">
                          ✕
                        </button>
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <p style={{ fontSize: 11, color: '#C8922A', fontWeight: 600, marginBottom: 3 }}>{ENTITY_LABELS[item.entity_type]}</p>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1.3 }}>{entity.name}</h3>
                        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>📍 {entity.city}</p>
                        <Link to={`${ENTITY_ROUTES[item.entity_type]}/${entity.slug}`}
                          style={{ fontSize: 12, color: '#C8922A', fontWeight: 600, textDecoration: 'none' }}>
                          Voir la fiche →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ VOYAGES ══ */}
        {tab === 'voyages' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>🗺️ Mes voyages</h2>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>{trips?.length || 0} voyage{(trips?.length || 0) > 1 ? 's' : ''} créé{(trips?.length || 0) > 1 ? 's' : ''}</p>
              </div>
              <Link to="/planifier" style={{ background: '#0E0A06', color: '#F5EDD6', padding: '10px 18px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                + Nouveau voyage
              </Link>
            </div>

            {!trips || trips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', border: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 36 }}>🧳</p>
                <p style={{ color: '#9ca3af', marginTop: 8 }}>Aucun voyage planifié</p>
                <Link to="/planifier" style={{ display: 'inline-block', marginTop: 16, background: '#0E0A06', color: '#F5EDD6', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                  Planifier mon premier voyage
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {trips.map(trip => {
                  const [ico, label, color] = TRIP_STATUS[trip.status] || ['📝','Inconnu','#6b7280']
                  return (
                    <div key={trip.id} style={{ background: 'white', border: '1px solid #f3f4f6', padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{trip.title}</h3>
                          {trip.description && <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{trip.description}</p>}
                        </div>
                        <span style={{ fontSize: 12, background: color + '15', color, padding: '5px 12px', fontWeight: 600, flexShrink: 0, border: `1px solid ${color}30` }}>
                          {ico} {label}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>
                        <span>{TRIP_MODES[trip.mode]}</span>
                        <span>👥 {trip.nb_persons} personne{trip.nb_persons > 1 ? 's' : ''}</span>
                        <span>📌 {trip.steps?.length || 0} étape{(trip.steps?.length || 0) > 1 ? 's' : ''}</span>
                        {trip.budget && <span>💰 {trip.budget.toLocaleString()} FCFA</span>}
                        {trip.date_start && (
                          <span>📅 {new Date(trip.date_start).toLocaleDateString('fr-FR')}
                            {trip.date_end && ` → ${new Date(trip.date_end).toLocaleDateString('fr-FR')}`}
                          </span>
                        )}
                      </div>

                      {/* Aperçu étapes */}
                      {trip.steps && trip.steps.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                          {trip.steps.map((s, i) => (
                            <span key={s.id} style={{ fontSize: 11, background: '#f3f4f6', color: '#4b5563', padding: '3px 10px' }}>
                              {i + 1}. {s.title}
                            </span>
                          ))}
                          {(trip._count?.steps || 0) > 3 && (
                            <span style={{ fontSize: 11, color: '#C8922A', padding: '3px 6px' }}>
                              +{trip._count.steps - 3} autres
                            </span>
                          )}
                        </div>
                      )}

                      <Link to="/planifier" style={{ fontSize: 13, color: '#C8922A', fontWeight: 700, textDecoration: 'none' }}>
                        Ouvrir dans le planificateur →
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ RÉSERVATIONS ══ */}
        {tab === 'reservations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>📅 Mes réservations</h2>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>{bookings?.length || 0} réservation{(bookings?.length || 0) > 1 ? 's' : ''}</p>
              </div>
              <Link to="/destinations" style={{ background: '#C8922A', color: 'white', padding: '10px 18px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                + Nouvelle réservation
              </Link>
            </div>

            {!bookings || bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', border: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 36 }}>📭</p>
                <p style={{ color: '#9ca3af', marginTop: 8 }}>Aucune réservation pour l'instant</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                  <Link to="/destinations" style={{ background: '#C8922A', color: 'white', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Réserver une visite</Link>
                  <Link to="/gastronomie" style={{ background: '#0E0A06', color: '#F5EDD6', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Réserver une table</Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bookings.map(b => {
                  const STATUS = {
                    pending:   { label: 'En attente',  color: '#f59e0b', bg: '#fffbeb' },
                    confirmed: { label: 'Confirmée',   color: '#22c55e', bg: '#f0fdf4' },
                    cancelled: { label: 'Annulée',     color: '#ef4444', bg: '#fef2f2' },
                    completed: { label: 'Terminée',    color: '#6b7280', bg: '#f9fafb' },
                  }
                  const PAYMENT = {
                    unpaid:   { label: '⏳ Non payé',   color: '#f59e0b' },
                    paid:     { label: '✅ Payé',       color: '#22c55e' },
                    refunded: { label: '↩️ Remboursé', color: '#6b7280' },
                  }
                  const TYPE_ICONS = { hotel: '🏨', restaurant: '🍽', activity: '🎯', guide: '🧑‍🦯' }
                  const s = STATUS[b.status] || STATUS.pending
                  const p = PAYMENT[b.payment_status] || PAYMENT.unpaid

                  return (
                    <div key={b.id} style={{ background: 'white', border: '1px solid #f3f4f6', padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 28 }}>{TYPE_ICONS[b.booking_type] || '📅'}</span>
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{b.entity_name}</h3>
                            <p style={{ fontSize: 12, color: '#9ca3af' }}>
                              📅 {new Date(b.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              {b.time_slot && ` à ${b.time_slot}`}
                              {' · '}{b.nb_persons} pers.
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, background: s.bg, color: s.color, padding: '4px 10px', fontWeight: 700, border: `1px solid ${s.color}30` }}>
                            {s.label}
                          </span>
                          <span style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.label}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9ca3af', flexWrap: 'wrap', marginBottom: b.status === 'pending' ? 14 : 0 }}>
                        {b.total_price > 0 && <span>💰 {b.total_price.toLocaleString()} FCFA</span>}
                        {b.payment_method && <span>💳 {b.payment_method.replace('_', ' ')}</span>}
                        <span>🆔 {b.id.slice(0, 8).toUpperCase()}</span>
                        <span>Créée le {new Date(b.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>

                      {b.notes && (
                        <p style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 8 }}>💬 {b.notes}</p>
                      )}

                      {b.status === 'pending' && (
                        <button
                          onClick={async () => {
                            if (!confirm('Annuler cette réservation ?')) return
                            await axios.patch(`/api/v1/bookings/${b.id}/cancel`)
                            qc.invalidateQueries(['my-bookings'])
                          }}
                          style={{ marginTop: 12, background: 'none', border: '1px solid #fca5a5', color: '#ef4444', padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                          Annuler la réservation
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ COMMANDES MARKETPLACE ══ */}
        {tab === 'commandes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>🛒 Mes commandes</h2>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>{orders?.length || 0} commande{(orders?.length || 0) > 1 ? 's' : ''}</p>
              </div>
              <Link to="/marketplace" style={{ background: '#C8922A', color: 'white', padding: '10px 18px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                🛍️ MissèBo Market
              </Link>
            </div>

            {!orders || orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', border: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 36 }}>🛍️</p>
                <p style={{ color: '#9ca3af', marginTop: 8 }}>Aucune commande pour l'instant</p>
                <Link to="/marketplace" style={{ display: 'inline-block', marginTop: 16, background: '#C8922A', color: 'white', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                  Découvrir le marché
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orders.map(order => {
                  const STATUS = {
                    pending:   { label: 'En attente',  color: '#f59e0b', bg: '#fffbeb' },
                    confirmed: { label: 'Confirmée',   color: '#3b82f6', bg: '#eff6ff' },
                    shipped:   { label: 'Expédiée',    color: '#8b5cf6', bg: '#f5f3ff' },
                    delivered: { label: 'Livrée',      color: '#22c55e', bg: '#f0fdf4' },
                    cancelled: { label: 'Annulée',     color: '#ef4444', bg: '#fef2f2' },
                  }
                  const s = STATUS[order.status] || STATUS.pending

                  return (
                    <div key={order.id} style={{ background: 'white', border: '1px solid #f3f4f6', padding: '18px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, background: s.bg, color: s.color, padding: '3px 10px', fontWeight: 700, border: `1px solid ${s.color}30` }}>
                              {s.label}
                            </span>
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>#{order.id.slice(0,8).toUpperCase()}</span>
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <p style={{ fontSize: 13, color: '#6b7280' }}>
                            📍 {order.delivery_address}, {order.delivery_city}
                          </p>
                        </div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#C8922A' }}>
                          {order.total_price?.toLocaleString()} FCFA
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {order.items?.map(item => (
                          <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#f9fafb', padding: '6px 10px', fontSize: 12 }}>
                            {item.product?.images?.[0]
                              ? <img src={item.product.images[0]} alt="" style={{ width: 32, height: 32, objectFit: 'cover' }} />
                              : <span>📦</span>
                            }
                            <span style={{ color: '#374151' }}>{item.product?.name} <span style={{ color: '#9ca3af' }}>×{item.quantity}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ AVIS ══ */}
        {tab === 'avis' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>⭐ Mes avis</h2>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>
              {reviews?.length || 0} avis publié{(reviews?.length || 0) > 1 ? 's' : ''}
            </p>

            {!reviews || reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', border: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 36 }}>✍️</p>
                <p style={{ color: '#9ca3af', marginTop: 8 }}>Vous n'avez pas encore laissé d'avis</p>
                <Link to="/destinations" style={{ display: 'inline-block', marginTop: 16, background: '#C8922A', color: 'white', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                  Visiter un lieu et laisser un avis
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ background: 'white', border: '1px solid #f3f4f6', padding: '18px 22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                          {[1,2,3,4,5].map(n => (
                            <span key={n} style={{ color: n <= review.rating ? '#f59e0b' : '#e5e7eb', fontSize: 16 }}>★</span>
                          ))}
                        </div>
                        {review.title && <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{review.title}</h4>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, background: '#f3f4f6', color: '#6b7280', padding: '3px 8px' }}>
                          {ENTITY_LABELS[review.entity_type]}
                        </span>
                        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>{review.content}</p>
                    {review.is_verified && (
                      <p style={{ fontSize: 11, color: '#22c55e', marginTop: 8 }}>✓ Séjour vérifié</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ PROFIL ══ */}
        {tab === 'profil' && (
          <div style={{ maxWidth: 600 }}>
            {/* Infos personnelles */}
            <div style={{ background: 'white', border: '1px solid #f3f4f6', padding: '24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>👤 Informations personnelles</h2>
                <button onClick={() => { setEditProfile(!editProfile); setProfileForm({ name: me?.name || '', avatar_url: me?.avatar_url || '' }) }}
                  style={{ background: 'none', border: '1px solid #e5e7eb', color: '#374151', padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                  {editProfile ? 'Annuler' : '✏️ Modifier'}
                </button>
              </div>

              {editProfile ? (
                <div>
                  {[['name', 'Nom complet', 'text'], ['avatar_url', 'URL de photo de profil', 'url']].map(([key, label, type]) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>{label}</label>
                      <input type={type} value={profileForm[key]}
                        onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                        style={{ width: '100%', border: '1px solid #e5e7eb', padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateMe.mutate(profileForm)}
                    disabled={updateMe.isPending}
                    style={{ background: '#0E0A06', color: '#F5EDD6', border: 'none', padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    {updateMe.isPending ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Nom', me?.name],
                    ['Email', me?.email],
                    ['Rôle', me?.role === 'admin' ? 'Administrateur' : 'Utilisateur'],
                    ['Compte', me?.is_verified ? '✓ Vérifié' : '⚠️ Non vérifié'],
                    ['Membre depuis', me ? new Date(me.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>{label}</span>
                      <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{value || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Changer mot de passe */}
            <div style={{ background: 'white', border: '1px solid #f3f4f6', padding: '24px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>🔒 Changer le mot de passe</h2>

              {pwdSuccess && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
                  ✅ Mot de passe mis à jour avec succès
                </div>
              )}
              {pwdError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
                  ❌ {pwdError}
                </div>
              )}

              {[
                ['current_password', 'Mot de passe actuel'],
                ['new_password', 'Nouveau mot de passe (8 caractères min.)'],
                ['confirm', 'Confirmer le nouveau mot de passe'],
              ].map(([key, label]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>{label}</label>
                  <input type="password" value={pwdForm[key]}
                    onChange={e => { setPwdError(''); setPwdSuccess(false); setPwdForm(f => ({ ...f, [key]: e.target.value })) }}
                    style={{ width: '100%', border: '1px solid #e5e7eb', padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              ))}

              <button
                onClick={() => {
                  setPwdError('')
                  if (pwdForm.new_password !== pwdForm.confirm) return setPwdError('Les mots de passe ne correspondent pas')
                  if (pwdForm.new_password.length < 8) return setPwdError('Nouveau mot de passe trop court')
                  updatePwd.mutate({ current_password: pwdForm.current_password, new_password: pwdForm.new_password })
                }}
                disabled={updatePwd.isPending}
                style={{ background: '#0E0A06', color: '#F5EDD6', border: 'none', padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {updatePwd.isPending ? 'Mise à jour…' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
