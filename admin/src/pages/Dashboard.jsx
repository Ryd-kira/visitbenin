// admin/src/pages/Dashboard.jsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { statsAPI, placesAPI, reviewsAPI } from '@/services/api'
import { StatCard, Badge, Spinner, PageHeader } from '@/components/ui/index'
import { useAdminStore } from '@/store/useAdminStore'

// Données de graphique simulées (en prod : endpoint /stats/history)
const TRAFFIC = [
  { day: 'Lun', views: 1240, visitors: 880 },
  { day: 'Mar', views: 1820, visitors: 1200 },
  { day: 'Mer', views: 1560, visitors: 1050 },
  { day: 'Jeu', views: 2100, visitors: 1480 },
  { day: 'Ven', views: 2640, visitors: 1820 },
  { day: 'Sam', views: 3200, visitors: 2100 },
  { day: 'Dim', views: 2800, visitors: 1960 },
]

const TOP_PLACES = [
  { name: 'Parc de la Pendjari',    views: 3842, pct: 92 },
  { name: 'Ganvié',                 views: 3201, pct: 76 },
  { name: "Palais d'Abomey",        views: 2988, pct: 71 },
  { name: 'Route des Esclaves',     views: 2540, pct: 61 },
  { name: 'Plage de Grand-Popo',    views: 1920, pct: 46 },
]

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px 14px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAdminStore()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: statsAPI.overview,
  })

  const { data: recentPlaces } = useQuery({
    queryKey: ['admin', 'places', 'recent'],
    queryFn: () => placesAPI.list({ sort: 'recent', limit: 5 }),
  })

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 4 }}>
          {now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
        </div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>
          {greeting}, <span style={{ color: 'var(--amber)' }}>{user?.name?.split(' ')[0]}</span>
        </h1>
      </div>

      {/* ── STAT CARDS ROW 1 : contenu ── */}
      {statsLoading ? <Spinner /> : (
        <>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
            <StatCard label="Destinations" value={stats?.places      || 0} delta={8}  icon="⬡" color="var(--amber)" />
            <StatCard label="Restaurants"  value={stats?.restaurants || 0} delta={12} icon="⊕" color="#22c55e" />
            <StatCard label="Écoles"       value={stats?.schools     || 0} delta={3}  icon="◻" color="#3b82f6" />
            <StatCard label="Utilisateurs" value={stats?.users       || 0} delta={24} icon="○" color="#a855f7" />
          </div>
          {/* ROW 2 : nouvelles fonctionnalités */}
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            <StatCard label="Partenaires"  value={stats?.partners   || 0} delta={null} icon="🏢" color="#f97316" />
            <StatCard label="Voyages"      value={stats?.trips      || 0} delta={null} icon="🗺️" color="#06b6d4" />
            <StatCard label="Activités"    value={stats?.activities || 0} delta={null} icon="🎯" color="#8b5cf6" />
            <StatCard label="Locations"    value={stats?.rentals    || 0} delta={null} icon="🚗" color="#ec4899" />
          </div>
        </>
      )}

      {/* ── GRAPHIQUES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Traffic area chart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Trafic — 7 derniers jours</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>VUES · VISITEURS UNIQUES</p>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--amber)' }}>
              {TRAFFIC.reduce((a, d) => a + d.views, 0).toLocaleString()}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={TRAFFIC} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Area type="monotone" dataKey="views"    stroke="#f59e0b" strokeWidth={1.5} fill="url(#gViews)"    dot={false} />
              <Area type="monotone" dataKey="visitors" stroke="#22c55e" strokeWidth={1.5} fill="url(#gVisitors)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top places bar chart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px 24px' }}>
          <p style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Top destinations</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginBottom: 20 }}>VUES CETTE SEMAINE</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {TOP_PLACES.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{p.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)' }}>{p.views.toLocaleString()}</span>
                </div>
                <div style={{ height: 3, background: 'var(--border)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${p.pct}%`, background: i === 0 ? 'var(--amber)' : 'var(--amber-dim)', transition: 'width .8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ACTIVITÉ RÉCENTE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Lieux récents */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', letterSpacing: 1 }}>LIEUX RÉCENTS</span>
            <Link to="/places" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', textDecoration: 'none', letterSpacing: 1 }}>VOIR TOUT →</Link>
          </div>
          <table>
            <tbody>
              {(recentPlaces?.data || []).slice(0, 5).map(place => (
                <tr key={place.id}>
                  <td>
                    <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{place.name}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{place.city?.name} · {place.type}</p>
                  </td>
                  <td style={{ width: 80, textAlign: 'right' }}>
                    <Badge type={place.is_published ? 'published' : 'draft'} />
                  </td>
                  <td style={{ width: 60, textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)' }}>★{Number(place.rating).toFixed(1)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions rapides */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', letterSpacing: 1 }}>ACTIONS RAPIDES</span>
          </div>
          <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { to: '/places/new',      icon: '⬡', label: 'Ajouter un lieu',        color: 'var(--amber)' },
              { to: '/restaurants/new', icon: '⊕', label: 'Ajouter un restaurant',  color: '#22c55e' },
              { to: '/schools/new',     icon: '◻', label: 'Ajouter une école',      color: '#3b82f6' },
              { to: '/reviews',         icon: '◇', label: 'Modérer les avis',       color: '#a855f7' },
              { to: '/users',           icon: '○', label: 'Gérer utilisateurs',     color: '#ec4899' },
              { to: '/media',           icon: '⊞', label: 'Bibliothèque médias',    color: '#f97316' },
            ].map(a => (
              <Link key={a.to} to={a.to} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', background: 'var(--surface2)',
                border: '1px solid var(--border)', textDecoration: 'none',
                transition: 'border-color .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontSize: 18, color: a.color }}>{a.icon}</span>
                <span style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.3 }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
