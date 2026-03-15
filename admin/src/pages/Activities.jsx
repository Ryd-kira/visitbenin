// admin/src/pages/Activities.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { PageHeader, Btn, Spinner, Empty, Toggle, Confirm } from '@/components/ui/index'

const STEP_TYPES = [
  { value: 'activite',   label: 'Activité',   icon: '🎯' },
  { value: 'excursion',  label: 'Excursion',  icon: '🗺️' },
  { value: 'decouverte', label: 'Découverte', icon: '🏛️' },
  { value: 'autre',      label: 'Autre',       icon: '📌' },
]

const CITIES = ['Cotonou', 'Porto-Novo', 'Ouidah', 'Abomey', 'Grand-Popo', 'Natitingou', 'Tanguiéta', 'Abomey-Calavi', 'Tout Bénin']

const EMPTY = { icon: '🎯', title: '', description: '', type: 'activite', city: 'Cotonou', price: 0, duration: 120, tags: '', is_published: true, order: 0 }

function ActivityModal({ activity, onClose, onSaved }) {
  const [form, setForm] = useState(
    activity
      ? { ...activity, tags: (activity.tags || []).join(', ') }
      : EMPTY
  )
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const isEdit = Boolean(activity?.id)

  const mutation = useMutation({
    mutationFn: payload => isEdit
      ? api.put(`/activities/${activity.id}`, payload).then(r => r.data)
      : api.post('/activities', payload).then(r => r.data),
    onSuccess: () => { onSaved(); onClose() },
  })

  function submit() {
    mutation.mutate({
      ...form,
      price:    Number(form.price),
      duration: Number(form.duration),
      order:    Number(form.order),
      tags:     form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    })
  }

  const Label = ({ children }) => (
    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 5 }}>
      {children}
    </label>
  )
  const InputStyle = {
    width: '100%', boxSizing: 'border-box', background: 'var(--surface2)',
    border: '1px solid var(--border)', color: 'var(--text)',
    padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font-body)', outline: 'none',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', width: '100%', maxWidth: 540, maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)', letterSpacing: 2 }}>
            {isEdit ? '✏ MODIFIER L\'ACTIVITÉ' : '+ NOUVELLE ACTIVITÉ'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <Label>ICÔNE EMOJI</Label>
            <input value={form.icon} onChange={e => set('icon', e.target.value)} style={{ ...InputStyle, fontSize: 22, textAlign: 'center', width: 60 }} />
          </div>
          <div>
            <Label>TYPE</Label>
            <select value={form.type} onChange={e => set('type', e.target.value)} style={{ ...InputStyle, cursor: 'pointer' }}>
              {STEP_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <Label>TITRE *</Label>
            <input value={form.title} onChange={e => set('title', e.target.value)} style={InputStyle} placeholder="ex : Safari Pendjari" />
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <Label>DESCRIPTION</Label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              style={{ ...InputStyle, resize: 'vertical' }} placeholder="Courte description affichée sur la flashcard" />
          </div>

          <div>
            <Label>VILLE / RÉGION</Label>
            <select value={form.city} onChange={e => set('city', e.target.value)} style={{ ...InputStyle, cursor: 'pointer' }}>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>PRIX (FCFA) — 0 = GRATUIT</Label>
            <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} style={InputStyle} />
          </div>

          <div>
            <Label>DURÉE (MINUTES)</Label>
            <input type="number" min="0" value={form.duration} onChange={e => set('duration', e.target.value)} style={InputStyle} />
          </div>
          <div>
            <Label>ORDRE D'AFFICHAGE</Label>
            <input type="number" min="0" value={form.order} onChange={e => set('order', e.target.value)} style={InputStyle} />
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <Label>TAGS (séparés par des virgules)</Label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} style={InputStyle}
              placeholder="ex : safari, nature, incontournable, famille, gratuit" />
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

export default function Activities() {
  const qc = useQueryClient()
  const [modal,   setModal]   = useState(null)
  const [confirm, setConfirm] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'activities'],
    queryFn: () => api.get('/activities/all').then(r => r.data),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, is_published }) => api.put(`/activities/${id}`, { is_published }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'activities'] }),
  })
  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/activities/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'activities'] }); setConfirm(null) },
  })

  const activities = data?.data || []

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Activités & Événements"
        subtitle={`${activities.length} flashcards dans le planificateur`}
        actions={<Btn onClick={() => setModal({})}>+ Nouvelle activité</Btn>}
      />

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? <Spinner /> : activities.length === 0 ? <Empty icon="🎯" message="AUCUNE ACTIVITÉ" /> : (
          <table>
            <thead>
              <tr>
                <th>Activité</th>
                <th>Type</th>
                <th>Ville</th>
                <th>Prix</th>
                <th>Durée</th>
                <th>Tags</th>
                <th>Ordre</th>
                <th>Publié</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(act => {
                const typeInfo = STEP_TYPES.find(t => t.value === act.type)
                return (
                  <tr key={act.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{act.icon}</span>
                        <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{act.title}</p>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
                        {typeInfo?.icon} {typeInfo?.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
                        📍 {act.city}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: act.price === 0 ? 'var(--green)' : 'var(--amber)' }}>
                        {act.price === 0 ? 'Gratuit' : `${act.price.toLocaleString()} F`}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
                        {act.duration >= 60 ? `${Math.floor(act.duration/60)}h${act.duration%60>0?act.duration%60+'m':''}` : `${act.duration}min`}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {(act.tags || []).slice(0, 3).map(t => (
                          <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, background: '#1f1200', color: 'var(--amber-dim)', padding: '1px 5px', letterSpacing: 1 }}>
                            {t}
                          </span>
                        ))}
                        {act.tags?.length > 3 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)' }}>+{act.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{act.order}</span>
                    </td>
                    <td>
                      <Toggle checked={act.is_published} onChange={v => toggleMut.mutate({ id: act.id, is_published: v })} label="" />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Btn variant="secondary" size="sm" onClick={() => setModal(act)}>Éditer</Btn>
                        <Btn variant="danger"    size="sm" onClick={() => setConfirm({ id: act.id, name: act.title })}>✕</Btn>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <ActivityModal
          activity={modal?.id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ['admin', 'activities'] })}
        />
      )}

      {confirm && (
        <Confirm
          message={`Supprimer l'activité "${confirm.name}" ?`}
          onConfirm={() => deleteMut.mutate(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
