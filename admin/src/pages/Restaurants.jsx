// admin/src/pages/Restaurants.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantsAPI } from '@/services/api'
import { PageHeader, Badge, Btn, Confirm, Spinner, Empty, Toggle } from '@/components/ui/index'

export default function Restaurants() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'restaurants', { page, search }],
    queryFn: () => restaurantsAPI.list({ page, search: search || undefined }),
  })

  const publishMut = useMutation({ mutationFn: restaurantsAPI.publish, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] }) })
  const deleteMut  = useMutation({ mutationFn: restaurantsAPI.delete,  onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] }); setConfirm(null) } })

  const restos = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Restaurants"
        subtitle={`${pagination?.total || 0} établissements`}
        actions={<Link to="/restaurants/new"><Btn>+ Nouveau restaurant</Btn></Link>}
      />
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 12px', fontSize: 12, fontFamily: 'var(--font-body)', outline: 'none', width: 260 }} />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {isLoading ? <Spinner /> : restos.length === 0 ? <Empty icon="⊕" message="AUCUN RESTAURANT" /> : (
          <table>
            <thead><tr>
              <th>Restaurant</th><th>Cuisine</th><th>Budget</th><th>Note</th><th>Publié</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr></thead>
            <tbody>
              {restos.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {r.cover_image && <img src={r.cover_image} alt="" style={{ width: 36, height: 28, objectFit: 'cover', flexShrink: 0 }} />}
                      <div>
                        <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{r.name}</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{r.city?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{r.cuisine_type}</td>
                  <td><Badge type={r.price_range} /></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--amber)' }}>★ {Number(r.rating).toFixed(1)}</span></td>
                  <td><Toggle checked={r.is_published} onChange={() => publishMut.mutate(r.id)} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Link to={`/restaurants/${r.id}/edit`}><Btn variant="secondary" size="sm">Éditer</Btn></Link>
                      <Btn variant="danger" size="sm" onClick={() => setConfirm({ id: r.id, name: r.name })}>✕</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {confirm && <Confirm message={`Supprimer "${confirm.name}" ?`} onConfirm={() => deleteMut.mutate(confirm.id)} onCancel={() => setConfirm(null)} />}
    </div>
  )
}
