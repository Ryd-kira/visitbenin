// admin/src/pages/Users.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '@/services/api'
import { PageHeader, Badge, Btn, Select, Spinner, Empty } from '@/components/ui/index'
import { useAdminStore } from '@/store/useAdminStore'

export default function Users() {
  const qc = useQueryClient()
  const { user: me } = useAdminStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { page, search }],
    queryFn: () => usersAPI.list({ page, search: search || undefined }),
  })

  const roleMut = useMutation({
    mutationFn: ({ id, role }) => usersAPI.setRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const users = data?.data || []
  const pagination = data?.pagination

  const ROLE_OPTS = [
    { value: 'user',   label: 'User' },
    { value: 'editor', label: 'Éditeur' },
    { value: 'admin',  label: 'Admin' },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Utilisateurs"
        subtitle={`${pagination?.total || 0} comptes enregistrés`}
      />
      <div style={{ marginBottom: 16 }}>
        <input type="text" placeholder="Rechercher un utilisateur..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 12px', fontSize: 12, fontFamily: 'var(--font-body)', outline: 'none', width: 300 }}
        />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {isLoading ? <Spinner /> : users.length === 0 ? <Empty icon="○" message="AUCUN UTILISATEUR" /> : (
          <table>
            <thead><tr><th>Utilisateur</th><th>Rôle</th><th>Avis</th><th>Vérifié</th><th>Inscrit</th><th style={{ textAlign: 'right' }}>Changer rôle</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, background: '#1f1200', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--amber)', flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{u.name}</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><Badge type={u.role} /></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{u._count?.reviews || 0}</span></td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: u.is_verified ? 'var(--green)' : 'var(--muted)' }}>
                      {u.is_verified ? '✓ OUI' : '— NON'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)' }}>
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    {u.id !== me?.id ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <select
                          value={u.role}
                          onChange={e => roleMut.mutate({ id: u.id, role: e.target.value })}
                          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 8px', fontSize: 11, fontFamily: 'var(--font-mono)', outline: 'none', cursor: 'pointer' }}
                        >
                          {ROLE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', textAlign: 'right', display: 'block' }}>vous</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination?.pages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
          <Btn variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p-1)}>← Préc.</Btn>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', padding: '4px 8px' }}>
            {page} / {pagination.pages}
          </span>
          <Btn variant="ghost" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => p+1)}>Suiv. →</Btn>
        </div>
      )}
    </div>
  )
}
