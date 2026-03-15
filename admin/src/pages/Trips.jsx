// admin/src/pages/Trips.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { PageHeader, Badge, Spinner, Empty } from '@/components/ui/index'

const MODE_LABELS = { solo: '👤 Solo', agency: '🏢 Agence', group: '👥 Groupe' }
const STATUS_COLORS = {
  draft:     '#6b7280',
  planned:   '#3b82f6',
  ongoing:   '#22c55e',
  completed: 'var(--amber)',
  cancelled: '#ef4444',
}
const STATUS_LABELS = {
  draft: 'Brouillon', planned: 'Planifié', ongoing: 'En cours',
  completed: 'Terminé', cancelled: 'Annulé',
}

export default function Trips() {
  const [page,   setPage]   = useState(1)
  const [search, setSearch] = useState('')
  const [mode,   setMode]   = useState('')
  const [status, setStatus] = useState('')

  // Endpoint admin : tous les voyages de tous les utilisateurs
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'trips', { page, search, mode, status }],
    queryFn: () => api.get('/trips/admin/all', {
      params: { page, limit: 20, search: search || undefined, mode: mode || undefined, status: status || undefined },
    }).then(r => r.data),
  })

  const trips      = data?.data        || []
  const pagination = data?.pagination
  const stats      = data?.stats

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Voyages planifiés"
        subtitle={`${pagination?.total || 0} voyages créés par les utilisateurs`}
      />

      {/* KPIs */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total',      value: stats.total,     color: 'var(--amber)' },
            { label: 'Planifiés',  value: stats.planned,   color: '#3b82f6' },
            { label: 'En cours',   value: stats.ongoing,   color: '#22c55e' },
            { label: 'Solo',       value: stats.solo,      color: 'var(--muted)' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '14px 16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: k.color }}>{k.value ?? '—'}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginTop: 4 }}>{k.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input type="text" placeholder="Rechercher un voyage ou utilisateur…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 12px', fontSize: 12, fontFamily: 'var(--font-body)', outline: 'none', flex: 1, minWidth: 220 }} />
        <select value={mode} onChange={e => { setMode(e.target.value); setPage(1) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 10px', fontSize: 12, fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous les modes</option>
          <option value="solo">👤 Solo</option>
          <option value="agency">🏢 Agence</option>
          <option value="group">👥 Groupe</option>
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 10px', fontSize: 12, fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {isLoading ? <Spinner /> : trips.length === 0 ? <Empty icon="🗺️" message="AUCUN VOYAGE" /> : (
          <table>
            <thead>
              <tr>
                <th>Voyage</th>
                <th>Utilisateur</th>
                <th>Mode</th>
                <th>Dates</th>
                <th>Étapes</th>
                <th>Budget</th>
                <th>Statut</th>
                <th>Créé le</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => (
                <tr key={trip.id}>
                  <td>
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{trip.title}</p>
                      {trip.cities?.length > 0 && (
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>
                          📍 {trip.cities.join(', ')}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)' }}>
                      {trip.user?.name || '—'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)' }}>
                      {trip.user?.email}
                    </p>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}>
                      {MODE_LABELS[trip.mode] || trip.mode}
                    </span>
                    {trip.nb_persons > 1 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', marginLeft: 4 }}>
                        ×{trip.nb_persons}
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
                      {trip.date_start ? new Date(trip.date_start).toLocaleDateString('fr-FR') : '—'}
                      {trip.date_end && ` → ${new Date(trip.date_end).toLocaleDateString('fr-FR')}`}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--amber)' }}>
                      {trip._count?.steps ?? trip.steps?.length ?? 0}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}>
                      {trip.budget ? `${Number(trip.budget).toLocaleString()} F` : '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                      color: STATUS_COLORS[trip.status], textTransform: 'uppercase', letterSpacing: 1,
                    }}>
                      ● {STATUS_LABELS[trip.status] || trip.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
                      {new Date(trip.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination?.pages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: page === 1 ? 'var(--muted)' : 'var(--text)', padding: '5px 12px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            ← Préc.
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', padding: '5px 10px' }}>
            {page} / {pagination.pages}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: page === pagination.pages ? 'var(--muted)' : 'var(--text)', padding: '5px 12px', cursor: page === pagination.pages ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            Suiv. →
          </button>
        </div>
      )}
    </div>
  )
}
