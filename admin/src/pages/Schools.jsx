// admin/src/pages/Schools.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { schoolsAPI } from '@/services/api'
import { PageHeader, Badge, Btn, Spinner, Empty } from '@/components/ui/index'

export default function Schools() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'schools', { page, search }],
    queryFn: () => schoolsAPI.list({ page, search: search || undefined }),
  })
  const schools = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Écoles & Universités"
        subtitle={`${pagination?.total || 0} établissements`}
        actions={<Link to="/schools/new"><Btn>+ Nouvelle école</Btn></Link>}
      />
      <div style={{ marginBottom: 16 }}>
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 12px', fontSize: 12, fontFamily: 'var(--font-body)', outline: 'none', width: 260 }} />
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {isLoading ? <Spinner /> : schools.length === 0 ? <Empty icon="◻" message="AUCUNE ÉCOLE" /> : (
          <table>
            <thead><tr><th>École</th><th>Type</th><th>Programme</th><th>Frais/an</th><th>BAC %</th><th>AEFE</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {schools.map(s => (
                <tr key={s.id}>
                  <td>
                    <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{s.name}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{s.city?.name}</p>
                  </td>
                  <td><Badge type="draft" custom={s.school_type} /></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>{s.program}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)' }}>
                    {s.fees_range_min ? `${(s.fees_range_min/1000).toFixed(0)}k–${(s.fees_range_max/1000).toFixed(0)}k F` : '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: s.bac_rate >= 90 ? 'var(--green)' : 'var(--text)' }}>
                    {s.bac_rate ? `${s.bac_rate}%` : '—'}
                  </td>
                  <td>{s.is_aefe ? <Badge type="featured" custom="AEFE" /> : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Link to={`/schools/${s.id}/edit`}><Btn variant="secondary" size="sm">Éditer</Btn></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
