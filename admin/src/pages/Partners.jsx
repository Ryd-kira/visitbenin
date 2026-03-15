// admin/src/pages/Partners.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { PageHeader, Badge, Btn, Confirm, Spinner, Empty, Toggle } from '@/components/ui/index'

const TYPE_LABELS = {
  agence_tourisme: '🏢 Agence',
  hebergement:     '🏨 Hébergement',
  transport:       '🚗 Transport',
  excursion:       '🗺️ Excursion',
  restaurant:      '🍽️ Restaurant',
  autre:           '📌 Autre',
}

export default function Partners() {
  const qc = useQueryClient()
  const [page,    setPage]    = useState(1)
  const [type,    setType]    = useState('')
  const [search,  setSearch]  = useState('')
  const [confirm, setConfirm] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'partners', { page, type, search }],
    queryFn: () => api.get('/partners', {
      params: { page, type: type || undefined, search: search || undefined, limit: 20 },
    }).then(r => r.data),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/partners/${id}`, payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'partners'] }),
  })
  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/partners/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'partners'] }); setConfirm(null) },
  })

  const partners   = data?.data        || []
  const pagination = data?.pagination

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Partenaires & Agences"
        subtitle={`${pagination?.total || 0} partenaires enregistrés`}
        actions={<Link to="/partners/new"><Btn>+ Nouveau partenaire</Btn></Link>}
      />

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input type="text" placeholder="Rechercher…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 12px', fontSize: 12, fontFamily: 'var(--font-body)', outline: 'none', width: 240 }} />
        <select value={type} onChange={e => { setType(e.target.value); setPage(1) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 12px', fontSize: 12, fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? <Spinner /> : partners.length === 0 ? <Empty icon="🏢" message="AUCUN PARTENAIRE" /> : (
          <table>
            <thead>
              <tr>
                <th>Partenaire</th>
                <th>Type</th>
                <th>Ville</th>
                <th>Note</th>
                <th>Certifié</th>
                <th>Publié</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p.logo
                        ? <img src={p.logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain', background: '#fff', flexShrink: 0 }} />
                        : <div style={{ width: 32, height: 32, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                            {TYPE_LABELS[p.type]?.split(' ')[0]}
                          </div>
                      }
                      <div>
                        <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{p.name}</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)' }}>/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge type="draft" custom={TYPE_LABELS[p.type]?.split(' ').slice(1).join(' ') || p.type} />
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
                    {p.city?.name || '—'}
                  </td>
                  <td>
                    {p.rating > 0
                      ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--amber)' }}>★ {Number(p.rating).toFixed(1)}</span>
                      : <span style={{ color: 'var(--muted)', fontSize: 11 }}>—</span>
                    }
                  </td>
                  <td>
                    <Toggle
                      checked={p.is_certified}
                      onChange={() => updateMut.mutate({ id: p.id, payload: { is_certified: !p.is_certified } })}
                      label=""
                    />
                  </td>
                  <td>
                    <Toggle
                      checked={p.is_published}
                      onChange={() => updateMut.mutate({ id: p.id, payload: { is_published: !p.is_published } })}
                      label=""
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {p.website && (
                        <a href={p.website} target="_blank" rel="noopener noreferrer">
                          <Btn variant="ghost" size="sm">↗</Btn>
                        </a>
                      )}
                      <Link to={`/partners/${p.id}/edit`}>
                        <Btn variant="secondary" size="sm">Éditer</Btn>
                      </Link>
                      <Btn variant="danger" size="sm" onClick={() => setConfirm({ id: p.id, name: p.name })}>✕</Btn>
                    </div>
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
          <Btn variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Préc.</Btn>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', padding: '4px 8px' }}>{page} / {pagination.pages}</span>
          <Btn variant="ghost" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Suiv. →</Btn>
        </div>
      )}

      {confirm && (
        <Confirm
          message={`Supprimer le partenaire "${confirm.name}" ? Cette action est irréversible.`}
          onConfirm={() => deleteMut.mutate(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
