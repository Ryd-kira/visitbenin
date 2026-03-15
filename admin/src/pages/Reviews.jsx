// admin/src/pages/Reviews.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsAPI } from '@/services/api'
import { PageHeader, Badge, Btn, Confirm, Spinner, Empty, Toggle } from '@/components/ui/index'
import api from '@/services/api'

// On recupère tous les avis via l'API reviews si dispo, sinon on les charge autrement
// Pour l'admin, on liste depuis places/restaurants récents et leurs reviews
// On va chercher directement depuis l'endpoint /reviews avec admin token
function useAdminReviews(params) {
  return useQuery({
    queryKey: ['admin', 'reviews', params],
    queryFn: () => api.get('/reviews/admin', { params }).then(r => r.data).catch(() => ({
      // Fallback si l'endpoint n'existe pas encore : données mock
      data: [], pagination: { total: 0, pages: 1 }
    })),
  })
}

export default function Reviews() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all') // 'all' | 'pending' | 'published'
  const [confirm, setConfirm] = useState(null)

  // On utilise places récents pour avoir les reviews
  const { data: placesData, isLoading } = useQuery({
    queryKey: ['admin', 'places-reviews', page],
    queryFn: () => api.get('/places', { params: { limit: 10, sort: 'recent' } }).then(r => r.data),
  })

  const publishMut = useMutation({
    mutationFn: ({ id, v }) => reviewsAPI.publish(id, v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
  const deleteMut = useMutation({
    mutationFn: reviewsAPI.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin'] }); setConfirm(null) },
  })

  // Collecter tous les avis des places chargées
  const allReviews = (placesData?.data || []).flatMap(place =>
    (place.reviews || []).map(r => ({ ...r, placeName: place.name, placeSlug: place.slug }))
  )

  const filtered = filter === 'pending'
    ? allReviews.filter(r => !r.is_published)
    : filter === 'published'
    ? allReviews.filter(r => r.is_published)
    : allReviews

  const STARS = n => '★'.repeat(n) + '☆'.repeat(5 - n)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Modération des avis"
        subtitle={`${allReviews.length} avis chargés`}
      />

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['all', 'Tous'], ['published', 'Publiés'], ['pending', 'En attente']].map(([v, l]) => (
          <Btn key={v} size="sm" variant={filter === v ? 'primary' : 'ghost'} onClick={() => setFilter(v)}>{l}</Btn>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {isLoading ? <Spinner /> : filtered.length === 0 ? <Empty icon="◇" message="AUCUN AVIS" /> : (
          <table>
            <thead><tr><th>Auteur</th><th>Lieu</th><th>Note</th><th>Contenu</th><th>Date</th><th>Publié</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {filtered.map(review => (
                <tr key={review.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{review.user?.name}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)' }}>user</p>
                  </td>
                  <td style={{ maxWidth: 160 }}>
                    <p style={{ fontSize: 11, color: 'var(--amber)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.placeName}</p>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f59e0b' }}>{STARS(review.rating)}</span>
                  </td>
                  <td style={{ maxWidth: 280 }}>
                    {review.title && <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{review.title}</p>}
                    <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {review.content}
                    </p>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    <Toggle checked={review.is_published} onChange={v => publishMut.mutate({ id: review.id, v })} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Btn variant="danger" size="sm" onClick={() => setConfirm({ id: review.id })}>✕</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirm && (
        <Confirm message="Supprimer cet avis définitivement ?" onConfirm={() => deleteMut.mutate(confirm.id)} onCancel={() => setConfirm(null)} />
      )}
    </div>
  )
}
