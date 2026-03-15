// admin/src/pages/Events.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const TAGS_OPTIONS = [
  'vodun','royauté','nature','arts','safari','fête-nationale',
  'tradition','cheval','festival','lac','agriculture','marché',
  'islam','théâtre','photo','histoire','diaspora','mystère',
  'pêche','récolte','patrimoine','faune','international','nuit',
]

const EMPTY_FORM = {
  name: '', slug: '', description: '', location: '', city: '',
  latitude: '', longitude: '', cover_image: '',
  date_start: '', date_end: '', is_recurring: false, recurrence: '',
  tags: [], is_published: false,
}

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function Events() {
  const qc = useQueryClient()
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filterMonth, setFilterMonth] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => axios.get('/api/v1/events?limit=200').then(r => r.data.data),
  })

  const events = data || []

  const createMut = useMutation({
    mutationFn: d => axios.post('/api/v1/events', d),
    onSuccess: () => { qc.invalidateQueries(['admin-events']); resetForm() },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => axios.patch(`/api/v1/events/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['admin-events']); resetForm() },
  })

  const deleteMut = useMutation({
    mutationFn: id => axios.delete(`/api/v1/events/${id}`),
    onSuccess: () => qc.invalidateQueries(['admin-events']),
  })

  const togglePublish = useMutation({
    mutationFn: ({ id, is_published }) => axios.patch(`/api/v1/events/${id}`, { is_published }),
    onSuccess: () => qc.invalidateQueries(['admin-events']),
  })

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(false)
  }

  function startEdit(ev) {
    setForm({
      name: ev.name,
      slug: ev.slug,
      description: ev.description,
      location: ev.location,
      city: ev.city,
      latitude: ev.latitude || '',
      longitude: ev.longitude || '',
      cover_image: ev.cover_image || '',
      date_start: ev.date_start?.split('T')[0] || '',
      date_end: ev.date_end?.split('T')[0] || '',
      is_recurring: ev.is_recurring,
      recurrence: ev.recurrence || '',
      tags: ev.tags || [],
      is_published: ev.is_published,
    })
    setEditing(ev.id)
    setShowForm(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      date_end: form.date_end || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    }
    if (editing) updateMut.mutate({ id: editing, data: payload })
    else createMut.mutate(payload)
  }

  function toggleTag(tag) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  const filtered = filterMonth
    ? events.filter(e => new Date(e.date_start).getMonth() + 1 === parseInt(filterMonth))
    : events

  const MONTHS = ['','Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

  return (
    <div style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#F5EDD6', minHeight: '100vh', padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b', margin: 0 }}>📅 Événements</h1>
          <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.4)', marginTop: 4 }}>
            {events.length} événements · {events.filter(e => e.is_published).length} publiés
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#F5EDD6', padding: '8px 12px', fontSize: 12 }}>
            <option value="">Tous les mois</option>
            {MONTHS.slice(1).map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <button onClick={() => { resetForm(); setShowForm(true) }}
            style={{ background: '#f59e0b', color: '#0a0a0a', border: 'none', padding: '10px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            + Nouvel événement
          </button>
        </div>
      </div>

      {/* ── FORMULAIRE ── */}
      {showForm && (
        <div style={{ background: '#111', border: '1px solid #f59e0b30', padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#f59e0b', fontSize: 16, marginBottom: 20 }}>
            {editing ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                ['name', 'Nom *', 'text', true],
                ['slug', 'Slug *', 'text', true],
                ['city', 'Ville *', 'text', true],
                ['location', 'Lieu précis *', 'text', true],
                ['date_start', 'Date début *', 'date', true],
                ['date_end', 'Date fin', 'date', false],
                ['latitude', 'Latitude', 'number', false],
                ['longitude', 'Longitude', 'number', false],
                ['cover_image', 'URL image couverture', 'url', false],
                ['recurrence', 'Récurrence (ex: Annuel)', 'text', false],
              ].map(([key, label, type, req]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, color: 'rgba(245,237,214,0.5)', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    required={req}
                    step={type === 'number' ? 'any' : undefined}
                    onChange={e => {
                      const v = e.target.value
                      setForm(f => ({
                        ...f,
                        [key]: v,
                        ...(key === 'name' && !editing ? { slug: slugify(v) } : {}),
                      }))
                    }}
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', color: '#F5EDD6', padding: '8px 12px', fontSize: 12, boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'rgba(245,237,214,0.5)', display: 'block', marginBottom: 4 }}>Description *</label>
              <textarea value={form.description} required rows={4}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', color: '#F5EDD6', padding: '8px 12px', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'rgba(245,237,214,0.5)', display: 'block', marginBottom: 8 }}>Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TAGS_OPTIONS.map(tag => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    style={{
                      padding: '4px 12px', fontSize: 11, cursor: 'pointer', border: 'none',
                      background: form.tags.includes(tag) ? '#f59e0b' : '#1a1a1a',
                      color: form.tags.includes(tag) ? '#0a0a0a' : 'rgba(245,237,214,0.5)',
                      fontWeight: form.tags.includes(tag) ? 700 : 400,
                    }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              {[['is_recurring', '🔁 Récurrent'], ['is_published', '✅ Publié']].map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit"
                style={{ background: '#f59e0b', color: '#0a0a0a', border: 'none', padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {editing ? 'Enregistrer' : 'Créer'}
              </button>
              <button type="button" onClick={resetForm}
                style={{ background: 'transparent', color: 'rgba(245,237,214,0.5)', border: '1px solid #333', padding: '10px 16px', fontSize: 13, cursor: 'pointer' }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── LISTE ── */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(245,237,214,0.3)' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(ev => (
            <div key={ev.id} style={{ background: '#111', border: '1px solid #222', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 16 }}>{ev.is_published ? '✅' : '⏸'}</span>
                  <p style={{ fontSize: 14, fontWeight: 700, color: ev.is_published ? '#F5EDD6' : '#666' }}>{ev.name}</p>
                  {ev.is_recurring && <span style={{ fontSize: 10, background: '#0f2a1a', color: '#4ade80', padding: '2px 8px' }}>🔁 récurrent</span>}
                </div>
                <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.35)', marginTop: 4 }}>
                  📍 {ev.city} · 📅 {new Date(ev.date_start).toLocaleDateString('fr-FR')}
                  {ev.date_end && ` → ${new Date(ev.date_end).toLocaleDateString('fr-FR')}`}
                </p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                  {(ev.tags || []).slice(0, 4).map(t => (
                    <span key={t} style={{ fontSize: 10, background: '#1a1a1a', color: '#888', padding: '2px 6px', border: '1px solid #333' }}>{t}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => togglePublish.mutate({ id: ev.id, is_published: !ev.is_published })}
                  style={{ background: ev.is_published ? '#1a2a1a' : '#2a1a00', color: ev.is_published ? '#4ade80' : '#f59e0b', border: `1px solid ${ev.is_published ? '#4ade8030' : '#f59e0b30'}`, padding: '6px 12px', fontSize: 11, cursor: 'pointer' }}>
                  {ev.is_published ? 'Dépublier' : 'Publier'}
                </button>
                <button onClick={() => startEdit(ev)}
                  style={{ background: '#1a1a2a', color: '#60a5fa', border: '1px solid #60a5fa30', padding: '6px 12px', fontSize: 11, cursor: 'pointer' }}>
                  Modifier
                </button>
                <button onClick={() => { if (confirm(`Supprimer "${ev.name}" ?`)) deleteMut.mutate(ev.id) }}
                  style={{ background: '#2a1a1a', color: '#f87171', border: '1px solid #f8717130', padding: '6px 12px', fontSize: 11, cursor: 'pointer' }}>
                  Suppr.
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'rgba(245,237,214,0.3)', fontSize: 13 }}>
              Aucun événement trouvé
            </div>
          )}
        </div>
      )}
    </div>
  )
}
