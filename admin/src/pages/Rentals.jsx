// admin/src/pages/Rentals.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { PageHeader, Btn, Spinner, Empty, Toggle, Confirm } from '@/components/ui/index'

const RENTAL_TYPES = [
  { value: 'Voiture', label: '🚗 Voiture' },
  { value: 'Moto',    label: '🛵 Moto / Zémidjan' },
  { value: 'Appart',  label: '🏠 Appartement' },
]

const EMPTY = { icon: '🚗', title: '', type: 'Voiture', price_day: 0, features: '', ideal: '', is_published: true, order: 0 }

function RentalModal({ rental, onClose, onSaved }) {
  const [form, setForm] = useState(
    rental
      ? { ...rental, features: (rental.features || []).join(', ') }
      : EMPTY
  )
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const isEdit = Boolean(rental?.id)

  const mutation = useMutation({
    mutationFn: payload => isEdit
      ? api.put(`/rentals/${rental.id}`, payload).then(r => r.data)
      : api.post('/rentals', payload).then(r => r.data),
    onSuccess: () => { onSaved(); onClose() },
  })

  function submit() {
    mutation.mutate({
      ...form,
      price_day: Number(form.price_day),
      order:     Number(form.order),
      features:  form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
    })
  }

  const Label = ({ children }) => (
    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 5 }}>{children}</label>
  )
  const InputStyle = {
    width: '100%', boxSizing: 'border-box', background: 'var(--surface2)',
    border: '1px solid var(--border)', color: 'var(--text)',
    padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font-body)', outline: 'none',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', width: '100%', maxWidth: 480, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)', letterSpacing: 2 }}>
            {isEdit ? '✏ MODIFIER LA LOCATION' : '+ NOUVELLE LOCATION'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <Label>ICÔNE EMOJI</Label>
            <input value={form.icon} onChange={e => set('icon', e.target.value)}
              style={{ ...InputStyle, fontSize: 22, textAlign: 'center', width: 60 }} />
          </div>
          <div>
            <Label>TYPE</Label>
            <select value={form.type} onChange={e => set('type', e.target.value)} style={{ ...InputStyle, cursor: 'pointer' }}>
              {RENTAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <Label>TITRE *</Label>
            <input value={form.title} onChange={e => set('title', e.target.value)} style={InputStyle}
              placeholder="ex : SUV 4x4 Toyota Hilux" />
          </div>

          <div>
            <Label>PRIX PAR JOUR (FCFA)</Label>
            <input type="number" min="0" value={form.price_day} onChange={e => set('price_day', e.target.value)} style={InputStyle} />
          </div>
          <div>
            <Label>ORDRE D'AFFICHAGE</Label>
            <input type="number" min="0" value={form.order} onChange={e => set('order', e.target.value)} style={InputStyle} />
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <Label>CARACTÉRISTIQUES (séparées par des virgules)</Label>
            <input value={form.features} onChange={e => set('features', e.target.value)} style={InputStyle}
              placeholder="ex : 4x4, Climatisé, GPS, Assurance incluse" />
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <Label>IDÉAL POUR</Label>
            <input value={form.ideal} onChange={e => set('ideal', e.target.value)} style={InputStyle}
              placeholder="ex : Nord-Bénin, Pendjari, longues distances" />
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <Toggle checked={form.is_published} onChange={v => set('is_published', v)} label="Publié (visible dans le planificateur)" />
          </div>
        </div>

        {mutation.isError && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', marginTop: 12 }}>
            ⚠ {mutation.error?.response?.data?.error || 'Erreur'}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn onClick={submit} disabled={!form.title || mutation.isPending}>
            {mutation.isPending ? 'Sauvegarde…' : isEdit ? 'Mettre à jour' : 'Créer'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

export default function Rentals() {
  const qc = useQueryClient()
  const [modal,   setModal]   = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [typeFilter, setTypeFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'rentals'],
    queryFn: () => api.get('/rentals/all').then(r => r.data),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, is_published }) => api.put(`/rentals/${id}`, { is_published }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'rentals'] }),
  })
  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/rentals/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'rentals'] }); setConfirm(null) },
  })

  const all     = data?.data || []
  const rentals = typeFilter ? all.filter(r => r.type === typeFilter) : all

  const TYPE_COLORS = { Voiture: '#8b5cf6', Moto: '#f59e0b', Appart: '#3b82f6' }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Locations Voitures & Apparts"
        subtitle={`${all.length} options disponibles dans le planificateur`}
        actions={<Btn onClick={() => setModal({})}>+ Nouvelle location</Btn>}
      />

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ value: '', label: 'Tous' }, ...RENTAL_TYPES].map(t => (
          <button key={t.value} onClick={() => setTypeFilter(t.value)}
            style={{
              padding: '6px 14px', fontSize: 11, cursor: 'pointer',
              background: typeFilter === t.value ? 'var(--amber)' : 'var(--surface)',
              border: `1px solid ${typeFilter === t.value ? 'var(--amber)' : 'var(--border)'}`,
              color: typeFilter === t.value ? '#0a0a0a' : 'var(--muted)',
              fontFamily: 'var(--font-mono)', letterSpacing: 1,
            }}>
            {t.label || 'TOUS'}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {isLoading ? <Spinner /> : rentals.length === 0 ? <Empty icon="🚗" message="AUCUNE LOCATION" /> : (
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Type</th>
                <th>Prix / jour</th>
                <th>Caractéristiques</th>
                <th>Idéal pour</th>
                <th>Ordre</th>
                <th>Publié</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{r.icon}</span>
                      <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{r.title}</p>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                      color: TYPE_COLORS[r.type], textTransform: 'uppercase', letterSpacing: 1,
                    }}>
                      {r.type}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>
                      {r.price_day.toLocaleString()} F
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {(r.features || []).slice(0, 4).map(f => (
                        <span key={f} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, background: 'var(--surface2)', color: 'var(--muted)', padding: '1px 5px', border: '1px solid var(--border)' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>{r.ideal || '—'}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{r.order}</span>
                  </td>
                  <td>
                    <Toggle checked={r.is_published} onChange={v => toggleMut.mutate({ id: r.id, is_published: v })} label="" />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Btn variant="secondary" size="sm" onClick={() => setModal(r)}>Éditer</Btn>
                      <Btn variant="danger"    size="sm" onClick={() => setConfirm({ id: r.id, name: r.title })}>✕</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <RentalModal
          rental={modal?.id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ['admin', 'rentals'] })}
        />
      )}

      {confirm && (
        <Confirm
          message={`Supprimer la location "${confirm.name}" ?`}
          onConfirm={() => deleteMut.mutate(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
