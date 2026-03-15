// admin/src/pages/Bookings.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const STATUS_CONFIG = {
  pending:   { label: 'En attente',  color: '#f59e0b', bg: '#78350f' },
  confirmed: { label: 'Confirmée',   color: '#4ade80', bg: '#14532d' },
  cancelled: { label: 'Annulée',     color: '#f87171', bg: '#7f1d1d' },
  completed: { label: 'Terminée',    color: '#94a3b8', bg: '#1e293b' },
}
const PAYMENT_CONFIG = {
  unpaid:   { label: 'Non payé',    color: '#f59e0b' },
  paid:     { label: 'Payé',        color: '#4ade80' },
  refunded: { label: 'Remboursé',   color: '#94a3b8' },
}
const TYPE_ICONS = { hotel: '🏨', restaurant: '🍽', activity: '🎯', guide: '🧑‍🦯' }

export default function Bookings() {
  const qc = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType]     = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', filterStatus, filterType],
    queryFn: () => {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      if (filterType)   params.set('type', filterType)
      return axios.get(`/api/v1/bookings?${params}`).then(r => r.data)
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status, payment_status }) =>
      axios.patch(`/api/v1/bookings/${id}`, { status, payment_status }),
    onSuccess: () => qc.invalidateQueries(['admin-bookings']),
  })

  const bookings = data?.data || []
  const total    = data?.total || 0

  // KPIs
  const pending   = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const revenue   = bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.total_price, 0)

  return (
    <div style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#F5EDD6', minHeight: '100vh', padding: '24px 0' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b', margin: 0 }}>📅 Réservations</h1>
        <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.4)', marginTop: 4 }}>{total} réservations au total</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginBottom: 24 }}>
        {[
          ['En attente', pending, '#f59e0b'],
          ['Confirmées', confirmed, '#4ade80'],
          ['Total', total, '#60a5fa'],
          ['Revenus payés', `${revenue.toLocaleString()} F`, '#a78bfa'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: '#111', border: `1px solid ${color}20`, padding: '14px 16px' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color, margin: 0 }}>{val}</p>
            <p style={{ fontSize: 11, color: 'rgba(245,237,214,0.4)', marginTop: 4 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ background: '#1a1a1a', border: '1px solid #333', color: '#F5EDD6', padding: '8px 12px', fontSize: 12 }}>
          <option value="">Tous statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ background: '#1a1a1a', border: '1px solid #333', color: '#F5EDD6', padding: '8px 12px', fontSize: 12 }}>
          <option value="">Tous types</option>
          {Object.entries(TYPE_ICONS).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
        </select>
        {(filterStatus || filterType) && (
          <button onClick={() => { setFilterStatus(''); setFilterType('') }}
            style={{ background: 'none', border: '1px solid #555', color: '#aaa', padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}>
            ✕ Réinitialiser
          </button>
        )}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(245,237,214,0.3)' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bookings.map(b => {
            const sc = STATUS_CONFIG[b.status]  || STATUS_CONFIG.pending
            const pc = PAYMENT_CONFIG[b.payment_status] || PAYMENT_CONFIG.unpaid

            return (
              <div key={b.id} style={{ background: '#111', border: '1px solid #222', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

                  {/* Infos principale */}
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>{TYPE_ICONS[b.booking_type] || '📅'}</span>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#F5EDD6', margin: 0 }}>{b.entity_name}</p>
                      <span style={{ fontSize: 10, background: sc.bg, color: sc.color, padding: '2px 8px', fontWeight: 700 }}>{sc.label}</span>
                      <span style={{ fontSize: 10, color: pc.color, fontWeight: 600 }}>{pc.label}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.4)', marginBottom: 4 }}>
                      👤 {b.user?.name || b.contact_name} · {b.contact_phone} · {b.contact_email}
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.4)' }}>
                      📅 {new Date(b.date).toLocaleDateString('fr-FR')}
                      {b.time_slot && ` à ${b.time_slot}`}
                      {' · '}{b.nb_persons} pers.
                      {b.total_price > 0 && ` · 💰 ${b.total_price.toLocaleString()} FCFA`}
                    </p>
                    {b.notes && <p style={{ fontSize: 11, color: '#888', fontStyle: 'italic', marginTop: 4 }}>💬 {b.notes}</p>}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'confirmed' })}
                          style={{ background: '#14532d', color: '#4ade80', border: '1px solid #4ade8030', padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                          ✓ Confirmer
                        </button>
                        <button
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'cancelled' })}
                          style={{ background: '#7f1d1d', color: '#f87171', border: '1px solid #f8717130', padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                          ✕ Annuler
                        </button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'completed' })}
                          style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #94a3b830', padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                          ✓ Terminer
                        </button>
                        {b.payment_status === 'unpaid' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: b.id, payment_status: 'paid' })}
                            style={{ background: '#14532d', color: '#4ade80', border: '1px solid #4ade8030', padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                            💳 Marquer payé
                          </button>
                        )}
                      </>
                    )}
                    <span style={{ fontSize: 10, color: '#555', padding: '6px 4px' }}>#{b.id.slice(0,8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            )
          })}

          {bookings.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'rgba(245,237,214,0.3)', fontSize: 13 }}>
              Aucune réservation trouvée
            </div>
          )}
        </div>
      )}
    </div>
  )
}
