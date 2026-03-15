// admin/src/pages/Places.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { placesAPI } from '@/services/api'
import { PageHeader, Badge, Btn, Confirm, Spinner, Empty, Toggle } from '@/components/ui/index'

const TYPE_OPTS = [
  { value: '', label: 'Tous les types' },
  { value: 'culture',       label: 'Culture' },
  { value: 'nature',        label: 'Nature' },
  { value: 'plage',         label: 'Plage' },
  { value: 'safari',        label: 'Safari' },
  { value: 'religieux',     label: 'Religieux' },
  { value: 'divertissement',label: 'Divertissement' },
]

export default function Places() {
  const qc = useQueryClient()
  const [page,    setPage]    = useState(1)
  const [type,    setType]    = useState('')
  const [search,  setSearch]  = useState('')
  const [confirm, setConfirm] = useState(null) // { id, name }

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'places', { page, type, search }],
    queryFn: () => placesAPI.list({ page, type: type || undefined, search: search || undefined }),
  })

  const publishMut = useMutation({
    mutationFn: placesAPI.publish,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'places'] }),
  })
  const deleteMut = useMutation({
    mutationFn: placesAPI.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'places'] }); setConfirm(null) },
  })

  const places     = data?.data        || []
  const pagination = data?.pagination

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Destinations"
        subtitle={`${pagination?.total || 0} lieux · page ${page}/${pagination?.pages || 1}`}
        actions={
          <Link to="/places/new">
            <Btn>+ Nouveau lieu</Btn>
          </Link>
        }
      />

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          type="text" placeholder="Rechercher un lieu..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text)', padding: '7px 12px', fontSize: 12,
            fontFamily: 'var(--font-body)', outline: 'none', width: 260,
          }}
        />
        <select
          value={type} onChange={e => { setType(e.target.value); setPage(1) }}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text)', padding: '7px 12px', fontSize: 12,
            fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer',
          }}
        >
          {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? <Spinner /> : places.length === 0 ? (
          <Empty icon="⬡" message="AUCUN LIEU TROUVÉ" />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Lieu</th>
                <th>Ville</th>
                <th>Type</th>
                <th>Note</th>
                <th>Statut</th>
                <th>Publié</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {places.map(place => (
                <tr key={place.id}>
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {place.cover_image && (
                        <img src={place.cover_image} alt="" style={{ width: 36, height: 28, objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div>
                        <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, lineHeight: 1.3 }}>{place.name}</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>/{place.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
                    {place.city?.name || '—'}
                  </td>
                  <td>
                    <Badge type="draft" custom={place.type} />
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--amber)' }}>
                      ★ {Number(place.rating).toFixed(1)}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', marginLeft: 4 }}>
                      ({place.review_count})
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {place.is_featured && <Badge type="featured" />}
                      {place.is_unesco   && <Badge type="unesco" />}
                    </div>
                  </td>
                  <td>
                    <Toggle
                      checked={place.is_published}
                      onChange={() => publishMut.mutate(place.id)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <a href={`http://localhost:5173/destinations/${place.slug}`} target="_blank" rel="noopener noreferrer">
                        <Btn variant="ghost" size="sm">↗</Btn>
                      </a>
                      <Link to={`/places/${place.id}/edit`}>
                        <Btn variant="secondary" size="sm">Éditer</Btn>
                      </Link>
                      <Btn variant="danger" size="sm" onClick={() => setConfirm({ id: place.id, name: place.name })}>
                        ✕
                      </Btn>
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
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page - 2 + i
            if (p < 1 || p > pagination.pages) return null
            return (
              <Btn key={p} size="sm" variant={p === page ? 'primary' : 'ghost'} onClick={() => setPage(p)}>{p}</Btn>
            )
          })}
          <Btn variant="ghost" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Suiv. →</Btn>
        </div>
      )}

      {/* Confirm delete */}
      {confirm && (
        <Confirm
          message={`Supprimer définitivement "${confirm.name}" ? Cette action est irréversible.`}
          onConfirm={() => deleteMut.mutate(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
