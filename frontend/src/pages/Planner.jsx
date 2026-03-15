// frontend/src/pages/Planner.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/services/api'

// ── DONNÉES STATIQUES ────────────────────────────────────────
const STEP_TYPES = [
  { value: 'hebergement', label: 'Hébergement', icon: '🏨', color: '#3b82f6' },
  { value: 'transport',   label: 'Transport',   icon: '✈️', color: '#8b5cf6' },
  { value: 'activite',    label: 'Activité',    icon: '🎯', color: '#f59e0b' },
  { value: 'excursion',   label: 'Excursion',   icon: '🗺️', color: '#22c55e' },
  { value: 'restaurant',  label: 'Restaurant',  icon: '🍽️', color: '#ef4444' },
  { value: 'decouverte',  label: 'Découverte',  icon: '🏛️', color: '#C8922A' },
  { value: 'location',    label: 'Location',    icon: '🚗', color: '#0ea5e9' },
  { value: 'autre',       label: 'Autre',       icon: '📌', color: '#6b7280' },
]

const CITIES = ['Cotonou', 'Porto-Novo', 'Ouidah', 'Abomey', 'Grand-Popo', 'Natitingou', 'Tanguiéta', 'Abomey-Calavi']

// ── COMPOSANT FLASHCARD ACTIVITÉ ─────────────────────────────
function ActivityCard({ card, onAdd, added }) {
  const stepType = STEP_TYPES.find(s => s.value === card.type) || STEP_TYPES[7]
  return (
    <div style={{
      background: 'white', border: `1px solid ${added ? stepType.color : 'rgba(0,0,0,0.07)'}`,
      borderTop: `3px solid ${stepType.color}`, padding: '12px 14px',
      cursor: 'pointer', transition: 'all .15s', position: 'relative',
    }}
      onMouseEnter={e => { if (!added) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: 24 }}>{card.icon}</span>
        <span style={{ fontSize: 10, background: added ? stepType.color : '#f3f4f6', color: added ? 'white' : '#6b7280', padding: '2px 7px', fontWeight: 600, letterSpacing: .5 }}>
          {stepType.label}
        </span>
      </div>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1a0a00', marginBottom: 3, lineHeight: 1.3 }}>{card.title}</h4>
      <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5, marginBottom: 8 }}>{card.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#C8922A' }}>
            {card.price === 0 ? '🆓 Gratuit' : `${card.price.toLocaleString()} F`}
          </span>
          <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 8 }}>
            ⏱ {card.duration >= 60 ? `${Math.floor(card.duration/60)}h` : `${card.duration}min`}
          </span>
        </div>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>📍 {card.city}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 8 }}>
        {card.tags.map(t => (
          <span key={t} style={{ fontSize: 9, background: '#F5EDD6', color: '#3D2B10', padding: '1px 6px' }}>{t}</span>
        ))}
      </div>
      <button onClick={() => onAdd(card)} style={{
        position: 'absolute', bottom: 10, right: 10,
        background: added ? '#f0fdf4' : stepType.color, border: 'none',
        color: added ? '#16a34a' : 'white',
        fontSize: 11, padding: '4px 10px', cursor: 'pointer', fontWeight: 600,
      }}>
        {added ? '✓ Ajouté' : '+ Ajouter'}
      </button>
    </div>
  )
}

// ── COMPOSANT FLASHCARD LOCATION ─────────────────────────────
function RentalCard({ card, onAdd, added, days = 1 }) {
  const total = card.price_day * days
  const typeColors = { Voiture: '#8b5cf6', Moto: '#f59e0b', Appart: '#3b82f6' }
  const color = typeColors[card.type] || '#6b7280'
  return (
    <div style={{
      background: 'white', border: `1px solid ${added ? color : 'rgba(0,0,0,0.07)'}`,
      borderLeft: `4px solid ${color}`, padding: '12px 14px',
      transition: 'all .15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>{card.icon}</span>
          <div>
            <span style={{ fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1 }}>{card.type}</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1a0a00', margin: 0 }}>{card.title}</h4>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#C8922A' }}>{card.price_day.toLocaleString()} F/j</div>
          {days > 1 && <div style={{ fontSize: 11, color: '#6b7280' }}>{(card.price_day * days).toLocaleString()} F × {days}j</div>}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        {card.features.map(f => (
          <span key={f} style={{ fontSize: 10, background: '#f3f4f6', color: '#374151', padding: '2px 7px' }}>✓ {f}</span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#6b7280' }}>🎯 Idéal : {card.ideal}</span>
        <button onClick={() => onAdd(card)} style={{
          background: added ? '#f0fdf4' : color, border: 'none',
          color: added ? '#16a34a' : 'white',
          fontSize: 11, padding: '5px 12px', cursor: 'pointer', fontWeight: 600,
        }}>
          {added ? '✓ Ajouté' : '+ Réserver'}
        </button>
      </div>
    </div>
  )
}

// ── MODAL ÉTAPE MANUELLE ─────────────────────────────────────
function StepModal({ step, onSave, onClose }) {
  const [form, setForm] = useState(step || { type: 'activite', title: '', description: '', date: '', duration: '', price: '', address: '', notes: '', is_booked: false })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div style={{ background: 'white', width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1a0a00' }}>
            {step?.id ? "Modifier l'étape" : "Ajouter une étape"}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {STEP_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => set('type', t.value)}
                  style={{ padding: '5px 10px', fontSize: 11, border: `1px solid ${form.type === t.value ? t.color : '#e5e7eb'}`, background: form.type === t.value ? t.color : 'white', color: form.type === t.value ? 'white' : '#374151', cursor: 'pointer' }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Titre *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #e5e7eb', padding: '9px 12px', fontSize: 13, color: '#1a0a00', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #e5e7eb', padding: '9px 12px', fontSize: 13, color: '#1a0a00', outline: 'none', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Date</label>
              <input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #e5e7eb', padding: '9px 12px', fontSize: 12, color: '#1a0a00', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Durée (min)</label>
              <input type="number" min="0" value={form.duration} onChange={e => set('duration', e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #e5e7eb', padding: '9px 12px', fontSize: 13, color: '#1a0a00', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Prix (FCFA)</label>
              <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #e5e7eb', padding: '9px 12px', fontSize: 13, color: '#1a0a00', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Lieu</label>
              <input value={form.address} onChange={e => set('address', e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #e5e7eb', padding: '9px 12px', fontSize: 13, color: '#1a0a00', outline: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #e5e7eb', padding: '9px 12px', fontSize: 13, color: '#1a0a00', outline: 'none', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
            <button onClick={() => onSave(form)} disabled={!form.title}
              style={{ padding: '9px 18px', background: !form.title ? '#d1d5db' : '#C8922A', border: 'none', color: !form.title ? '#6b7280' : '#0A0806', cursor: !form.title ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>
              {step?.id ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


// ── COMPOSANT CARTE D'ÉTAPE ──────────────────────────────────────
function StepCard({ step, onEdit, onDelete, onToggleBooked, StepTypeInfo, index, total }) {
  const [expanded, setExpanded] = useState(false)
  const t = StepTypeInfo(step.type)
  const fmtDuration = (d) => d >= 60 ? `${Math.floor(d/60)}h${d%60>0?d%60+'min':''}` : `${d}min`
  const fmtDate = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${expanded ? t.color : 'rgba(0,0,0,0.07)'}`,
      borderLeft: `4px solid ${t.color}`,
      transition: 'all .2s',
      overflow: 'hidden',
    }}>
      {/* ── EN-TÊTE DE CARTE (toujours visible) ── */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
      >
        {/* Numéro d'étape */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: t.color, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
          {index + 1}
        </div>

        {/* Icône type */}
        <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>

        {/* Titre + type */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 10, color: t.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8 }}>
              {t.label}
            </span>
            {step.is_booked && (
              <span style={{ fontSize: 10, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '1px 7px', fontWeight: 600 }}>
                ✓ Réservé
              </span>
            )}
          </div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1a0a00', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {step.title}
          </h4>
          {/* Métadonnées inline compactes */}
          <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
            {step.date     && <span style={{ fontSize: 11, color: '#9ca3af' }}>📅 {fmtDate(step.date)}</span>}
            {step.duration && <span style={{ fontSize: 11, color: '#9ca3af' }}>⏱ {fmtDuration(step.duration)}</span>}
            {step.price > 0   && <span style={{ fontSize: 11, color: '#C8922A', fontWeight: 600 }}>💰 {Number(step.price).toLocaleString()} F</span>}
            {step.price === 0 && <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>🆓 Gratuit</span>}
            {step.address  && <span style={{ fontSize: 11, color: '#9ca3af' }}>📍 {step.address}</span>}
          </div>
        </div>

        {/* Flèche expansion */}
        <span style={{ color: '#9ca3af', fontSize: 12, transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>▼</span>
      </div>

      {/* ── CONTENU EXPANDÉ ── */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${t.color}20`, padding: '0 16px 16px' }}>

          {/* Description */}
          {step.description && (
            <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginTop: 14, marginBottom: 14 }}>
              {step.description}
            </p>
          )}

          {/* Notes */}
          {step.notes && !step.notes.includes('|') && (
            <p style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginBottom: 14 }}>
              📝 {step.notes}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(step) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8922A'; e.currentTarget.style.color = '#C8922A' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151' }}
            >
              ✏️ Modifier
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onToggleBooked(step) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: `1px solid ${step.is_booked ? '#bbf7d0' : '#d1d5db'}`, background: step.is_booked ? '#f0fdf4' : 'white', color: step.is_booked ? '#16a34a' : '#6b7280', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              {step.is_booked ? '✓ Réservé' : '○ Marquer réservé'}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onDelete(step.id) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginLeft: 'auto' }}
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── LISTE DES CARTES + BOUTON AJOUT RAPIDE ───────────────────────
function StepCards({ steps, onEdit, onDelete, onToggleBooked, onAddStep, onAddActivity, StepTypeInfo }) {
  const sorted = [...steps].sort((a, b) =>
    a.date && b.date ? new Date(a.date) - new Date(b.date) : a.order - b.order
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map((step, i) => (
        <StepCard
          key={step.id}
          step={step}
          index={i}
          total={sorted.length}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleBooked={onToggleBooked}
          StepTypeInfo={StepTypeInfo}
        />
      ))}

      {/* ── BOUTONS D'AJOUT RAPIDE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
        <button
          onClick={onAddStep}
          style={{ padding: '13px', border: '2px dashed #C8922A', background: 'transparent', color: '#C8922A', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#FFF8EE'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          ✏️ Étape personnalisée
        </button>
        <button
          onClick={onAddActivity}
          style={{ padding: '13px', border: '2px dashed #3b82f6', background: 'transparent', color: '#3b82f6', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          🎯 Choisir une activité
        </button>
      </div>
    </div>
  )
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────
export default function Planner() {
  const { user, isLoading: authLoading } = useAuthStore()
  const [trips,     setTrips]     = useState([])
  const [active,    setActive]    = useState(null)
  const [steps,     setSteps]     = useState([])
  const [modal,     setModal]     = useState(null)
  const [creating,  setCreating]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [tab,       setTab]       = useState('steps')
  const [actFilter, setActFilter] = useState('tous')
  const [addedActs, setAddedActs] = useState(new Set())

  const [newTrip, setNewTrip] = useState({
    title: '', mode: 'solo', date_start: '', date_end: '',
    budget: '', nb_persons: 1, cities: [], description: '',
  })

  // ── Chargement trips : attendre que l'auth soit résolue ──
  useEffect(() => {
    // authLoading = true pendant la restauration de session (refresh au démarrage)
    // On attend qu'elle soit terminée avant de décider
    if (authLoading) return
    if (!user) { setLoading(false); return }
    setLoading(true)
    api.get('/trips')
      .then(r => { setTrips(r.data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, authLoading])

  // Activités depuis la BDD (gérées par l'admin)
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => api.get('/activities').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })
  const ACTIVITY_CARDS = activitiesData || []

  // Locations depuis la BDD (gérées par l'admin)
  const { data: rentalsData, isLoading: rentalsLoading } = useQuery({
    queryKey: ['rentals'],
    queryFn: () => api.get('/rentals').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })
  const RENTAL_CARDS = rentalsData || []

  const tripDays = active?.date_start && active?.date_end
    ? Math.max(1, Math.ceil((new Date(active.date_end) - new Date(active.date_start)) / 86400000))
    : 1

  // Tags dynamiques extraits des activités chargées depuis l'API
  const allTags = ['tous', ...new Set(ACTIVITY_CARDS.flatMap(a => a.tags || []))]
  const actTags = allTags.slice(0, 10) // max 10 tags dans le filtre

  const filteredActs = actFilter === 'tous'
    ? ACTIVITY_CARDS
    : ACTIVITY_CARDS.filter(a =>
        (a.tags || []).includes(actFilter) ||
        a.type === actFilter ||
        (a.city || '').toLowerCase().includes(actFilter)
      )

  async function createTrip() {
    if (!newTrip.title) return
    const r = await api.post('/trips', { ...newTrip, budget: newTrip.budget ? Number(newTrip.budget) : null, nb_persons: Number(newTrip.nb_persons) })
    setTrips(p => [r.data, ...p])
    setActive(r.data); setSteps([]); setCreating(false)
    setNewTrip({ title: '', mode: 'solo', date_start: '', date_end: '', budget: '', nb_persons: 1, cities: [], description: '' })
  }

  async function selectTrip(trip) {
    setActive(trip)
    setTab('steps')
    // Les steps sont déjà inclus dans GET /trips — pas besoin de recharger
    // Mais on rafraîchit quand même pour avoir les données à jour
    const steps = trip.steps || []
    setSteps(steps)
    setAddedActs(new Set(steps.map(s => s.notes?.split('|')[0]).filter(Boolean)))
    // Rafraîchissement silencieux en arrière-plan
    api.get(`/trips/${trip.id}`)
      .then(r => {
        setSteps(r.data.steps || [])
        setAddedActs(new Set((r.data.steps || []).map(s => s.notes?.split('|')[0]).filter(Boolean)))
      })
      .catch(() => {})
  }

  async function saveStep(form) {
    if (form.id) {
      const r = await api.put(`/trips/${active.id}/steps/${form.id}`, form)
      setSteps(p => p.map(s => s.id === form.id ? r.data : s))
    } else {
      const r = await api.post(`/trips/${active.id}/steps`, form)
      setSteps(p => [...p, r.data])
    }
    setModal(null)
  }

  async function addActivityCard(card) {
    if (addedActs.has(card.id)) return
    const step = {
      type: card.type,
      title: card.title,
      description: card.description,
      price: card.price,
      duration: card.duration,
      address: card.city,
      notes: `${card.id}|flashcard`,
      is_booked: false,
    }
    const r = await api.post(`/trips/${active.id}/steps`, step)
    setSteps(p => [...p, r.data])
    setAddedActs(p => new Set([...p, card.id]))
  }

  async function addRentalCard(card) {
    const step = {
      type: 'location',
      title: `${card.type} — ${card.title}`,
      description: `${(card.features || []).join(', ')} · Idéal : ${card.ideal}`,
      price: card.price_day * tripDays,
      duration: tripDays * 60 * 24,
      notes: `${card.id}|rental`,
      is_booked: false,
    }
    const r = await api.post(`/trips/${active.id}/steps`, step)
    setSteps(p => [...p, r.data])
  }

  async function deleteStep(stepId) {
    await api.delete(`/trips/${active.id}/steps/${stepId}`)
    setSteps(p => p.filter(s => s.id !== stepId))
  }

  async function toggleBooked(step) {
    await api.put(`/trips/${active.id}/steps/${step.id}`, { is_booked: !step.is_booked })
    setSteps(p => p.map(s => s.id === step.id ? { ...s, is_booked: !s.is_booked } : s))
  }

  async function deleteTrip(tripId) {
    await api.delete(`/trips/${tripId}`)
    setTrips(p => p.filter(t => t.id !== tripId))
    if (active?.id === tripId) { setActive(null); setSteps([]) }
  }

  const totalBudget = steps.reduce((a, s) => a + (s.price || 0), 0)
  const booked      = steps.filter(s => s.is_booked).length

  const StepTypeInfo = (t) => STEP_TYPES.find(s => s.value === t) || STEP_TYPES[7]

  if (!user) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>🗺️</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1a0a00' }}>Planifiez votre voyage au Bénin</h2>
      <p style={{ color: '#7A5C30', maxWidth: 400, lineHeight: 1.6 }}>Connectez-vous pour créer des itinéraires, choisir des activités et gérer vos réservations.</p>
      <Link to="/connexion" style={{ background: '#C8922A', color: '#0A0806', padding: '12px 28px', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Se connecter</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F9F6EF' }}>

      {/* Header */}
      <div style={{ background: '#0E0A06', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 11, color: '#C8922A', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Mon espace voyage</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 34, color: '#F5EDD6', fontWeight: 700 }}>Planificateur de voyage</h1>
          <p style={{ color: 'rgba(245,237,214,0.4)', fontSize: 14, marginTop: 6 }}>Organisez chaque étape de votre séjour au Bénin — solo ou avec une agence</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>

        {/* ── SIDEBAR ── */}
        <div>
          <button onClick={() => setCreating(true)}
            style={{ width: '100%', background: '#C8922A', color: '#0A0806', border: 'none', padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
            + Nouveau voyage
          </button>

          {loading ? <p style={{ color: '#7A5C30', fontSize: 13, textAlign: 'center' }}>Chargement…</p>
          : trips.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, background: 'white', border: '1px dashed #D4B483' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🗺️</p>
              <p style={{ color: '#7A5C30', fontSize: 13, lineHeight: 1.5 }}>Aucun voyage encore<br />Créez votre premier itinéraire !</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {trips.map(trip => (
                <div key={trip.id} onClick={() => selectTrip(trip)}
                  style={{ background: active?.id === trip.id ? '#1a0a00' : 'white', padding: '11px 13px', cursor: 'pointer', border: `1px solid ${active?.id === trip.id ? '#C8922A' : '#e5e7eb'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: active?.id === trip.id ? '#F5EDD6' : '#1a0a00', marginBottom: 2 }}>{trip.title}</p>
                      <p style={{ fontSize: 11, color: active?.id === trip.id ? '#C8922A' : '#7A5C30' }}>
                        {trip.mode === 'solo' ? '👤' : trip.mode === 'agency' ? '🏢' : '👥'} {trip.steps?.length || 0} étapes
                      </p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteTrip(trip.id) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: active?.id === trip.id ? 'rgba(245,237,214,0.3)' : '#d1d5db', fontSize: 13 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CONTENU PRINCIPAL ── */}
        <div>
          {!active && !creating ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, background: 'white', border: '1px dashed #D4B483' }}>
              <span style={{ fontSize: 48, marginBottom: 16 }}>✈️</span>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#3D2B10', marginBottom: 6 }}>Sélectionnez ou créez un voyage</p>
              <p style={{ color: '#7A5C30', fontSize: 14 }}>Activités, excursions, hébergement, transport, location de voiture...</p>
            </div>

          ) : creating ? (
            /* ── FORMULAIRE NOUVEAU VOYAGE ── */
            <div style={{ background: 'white', padding: 28 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1a0a00', marginBottom: 24 }}>Nouveau voyage</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Titre *</label>
                  <input value={newTrip.title} onChange={e => setNewTrip(p=>({...p,title:e.target.value}))} placeholder="ex : Mon aventure béninoise 2025"
                    style={{ width:'100%', boxSizing:'border-box', border:'1px solid #e5e7eb', padding:'11px 14px', fontSize:14, color:'#1a0a00', outline:'none' }} />
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Mode de voyage</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[{value:'solo',icon:'👤',label:'Solo / Autonome'},{value:'agency',icon:'🏢',label:'Avec agence'},{value:'group',icon:'👥',label:'En groupe'}].map(m=>(
                      <button key={m.value} onClick={() => setNewTrip(p=>({...p,mode:m.value}))}
                        style={{ flex:1, padding:'12px 8px', border:`2px solid ${newTrip.mode===m.value?'#C8922A':'#e5e7eb'}`, background:newTrip.mode===m.value?'#FFF8EE':'white', cursor:'pointer', textAlign:'center' }}>
                        <div style={{ fontSize:22, marginBottom:3 }}>{m.icon}</div>
                        <div style={{ fontSize:12, fontWeight:600, color:newTrip.mode===m.value?'#C8922A':'#374151' }}>{m.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Départ</label>
                  <input type="date" value={newTrip.date_start} onChange={e => setNewTrip(p=>({...p,date_start:e.target.value}))}
                    style={{ width:'100%', boxSizing:'border-box', border:'1px solid #e5e7eb', padding:'11px 14px', fontSize:13, color:'#1a0a00', outline:'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Retour</label>
                  <input type="date" value={newTrip.date_end} onChange={e => setNewTrip(p=>({...p,date_end:e.target.value}))}
                    style={{ width:'100%', boxSizing:'border-box', border:'1px solid #e5e7eb', padding:'11px 14px', fontSize:13, color:'#1a0a00', outline:'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Budget max (FCFA)</label>
                  <input type="number" min="0" value={newTrip.budget} onChange={e => setNewTrip(p=>({...p,budget:e.target.value}))} placeholder="ex : 500000"
                    style={{ width:'100%', boxSizing:'border-box', border:'1px solid #e5e7eb', padding:'11px 14px', fontSize:13, color:'#1a0a00', outline:'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Personnes</label>
                  <input type="number" min="1" max="50" value={newTrip.nb_persons} onChange={e => setNewTrip(p=>({...p,nb_persons:e.target.value}))}
                    style={{ width:'100%', boxSizing:'border-box', border:'1px solid #e5e7eb', padding:'11px 14px', fontSize:13, color:'#1a0a00', outline:'none' }} />
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Villes à visiter</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {CITIES.map(c => (
                      <button key={c} onClick={() => setNewTrip(p=>({...p,cities:p.cities.includes(c)?p.cities.filter(x=>x!==c):[...p.cities,c]}))}
                        style={{ padding:'6px 12px', fontSize:12, border:`1px solid ${newTrip.cities.includes(c)?'#C8922A':'#e5e7eb'}`, background:newTrip.cities.includes(c)?'#C8922A':'white', color:newTrip.cities.includes(c)?'#0A0806':'#374151', cursor:'pointer' }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                <button onClick={() => setCreating(false)} style={{ padding:'11px 20px', border:'1px solid #e5e7eb', background:'white', color:'#374151', cursor:'pointer', fontSize:13 }}>Annuler</button>
                <button onClick={createTrip} disabled={!newTrip.title}
                  style={{ flex:1, padding:'11px', background:!newTrip.title?'#d1d5db':'#C8922A', border:'none', color:'#0A0806', fontWeight:700, fontSize:14, cursor:!newTrip.title?'not-allowed':'pointer' }}>
                  Créer le voyage ✈️
                </button>
              </div>
            </div>

          ) : (
            /* ── DÉTAIL VOYAGE ── */
            <div>
              {/* En-tête voyage */}
              <div style={{ background: '#1a0a00', padding: '18px 22px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#F5EDD6', marginBottom: 3 }}>{active.title}</h2>
                    <p style={{ color: '#C8922A', fontSize: 12 }}>
                      {active.mode === 'solo' ? '👤 Solo' : active.mode === 'agency' ? '🏢 Avec agence' : '👥 Groupe'}
                      {active.nb_persons > 1 && ` · ${active.nb_persons} pers.`}
                      {active.cities?.length > 0 && ` · ${active.cities.join(', ')}`}
                    </p>
                  </div>
                  {active.budget && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: totalBudget > active.budget ? '#ef4444' : '#22c55e' }}>
                        {totalBudget.toLocaleString()} F
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(245,237,214,0.4)' }}>/ {Number(active.budget).toLocaleString()} F budget</div>
                    </div>
                  )}
                </div>
                {/* Stats rapides */}
                <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
                  {tripDays > 1 && <div><div style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:'#C8922A' }}>{tripDays}</div><div style={{ fontSize:9, color:'rgba(245,237,214,0.3)', letterSpacing:1 }}>JOURS</div></div>}
                  <div><div style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:'#C8922A' }}>{steps.length}</div><div style={{ fontSize:9, color:'rgba(245,237,214,0.3)', letterSpacing:1 }}>ÉTAPES</div></div>
                  <div><div style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:'#C8922A' }}>{booked}</div><div style={{ fontSize:9, color:'rgba(245,237,214,0.3)', letterSpacing:1 }}>RÉSERVÉS</div></div>
                  {totalBudget > 0 && <div><div style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:'#C8922A' }}>{totalBudget.toLocaleString()}</div><div style={{ fontSize:9, color:'rgba(245,237,214,0.3)', letterSpacing:1 }}>FCFA TOTAL</div></div>}
                </div>
              </div>

              {/* Onglets */}
              <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #e5e7eb' }}>
                {[
                  { key: 'steps',      label: `📋 Mon itinéraire (${steps.length})` },
                  { key: 'activities', label: '🎯 Activités & événements' },
                  ...(active.mode !== 'agency' ? [{ key: 'rentals', label: '🚗 Location voiture / appart' }] : []),
                ].map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    style={{ padding: '10px 18px', fontSize: 13, background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.key ? '#C8922A' : 'transparent'}`, color: tab === t.key ? '#C8922A' : '#6b7280', cursor: 'pointer', fontWeight: tab === t.key ? 700 : 400, marginBottom: -2 }}>
                    {t.label}
                  </button>
                ))}
                {tab === 'steps' && (
                  <button onClick={() => setModal({})} style={{ marginLeft: 'auto', background: '#C8922A', border: 'none', color: '#0A0806', padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                    + Ajouter manuellement
                  </button>
                )}
              </div>

              {/* ── ONGLET ITINÉRAIRE ── */}
              {tab === 'steps' && (
                steps.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', border: '1px dashed #D4B483' }}>
                    <p style={{ fontSize: 36, marginBottom: 10 }}>📋</p>
                    <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#3D2B10', marginBottom: 6 }}>Aucune étape planifiée</p>
                    <p style={{ color: '#7A5C30', fontSize: 13, marginBottom: 16 }}>Ajoutez des étapes manuellement ou choisissez parmi nos suggestions</p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <button onClick={() => setModal({})} style={{ background: '#C8922A', border: 'none', color: '#0A0806', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>+ Étape manuelle</button>
                      <button onClick={() => setTab('activities')} style={{ background: 'white', border: '1px solid #C8922A', color: '#C8922A', padding: '10px 20px', cursor: 'pointer', fontSize: 13 }}>🎯 Voir les activités</button>
                    </div>
                  </div>
                ) : (
                  <StepCards
                    steps={steps}
                    onEdit={setModal}
                    onDelete={deleteStep}
                    onToggleBooked={toggleBooked}
                    onAddStep={() => setModal({})}
                    onAddActivity={() => setTab('activities')}
                    StepTypeInfo={StepTypeInfo}
                  />
                )
              )}

              {/* ── ONGLET ACTIVITÉS ── */}
              {tab === 'activities' && (
                <div>
                  <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
                    {actTags.map(tag => (
                      <button key={tag} onClick={() => setActFilter(tag)}
                        style={{ padding:'5px 12px', fontSize:11, border:`1px solid ${actFilter===tag?'#C8922A':'#e5e7eb'}`, background:actFilter===tag?'#C8922A':'white', color:actFilter===tag?'#0A0806':'#374151', cursor:'pointer' }}>
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </button>
                    ))}
                  </div>
                  {activitiesLoading ? (
                    <div style={{ textAlign:'center', padding:'48px 24px', color:'#7A5C30' }}>Chargement des activités…</div>
                  ) : filteredActs.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'48px 24px', background:'white', border:'1px dashed #D4B483' }}>
                      <p style={{ fontSize:36, marginBottom:10 }}>🎯</p>
                      <p style={{ color:'#7A5C30', fontSize:14 }}>Aucune activité pour ce filtre.</p>
                    </div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
                      {filteredActs.map(card => (
                        <ActivityCard key={card.id} card={card} onAdd={addActivityCard} added={addedActs.has(card.id)} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── ONGLET LOCATIONS ── */}
              {tab === 'rentals' && (
                <div>
                  <p style={{ fontSize:13, color:'#7A5C30', marginBottom:16, lineHeight:1.6 }}>
                    🚗 Voitures et apparts disponibles à la location. Prix calculés pour <strong>{tripDays} jour{tripDays > 1 ? 's' : ''}</strong> (durée de votre voyage).
                  </p>
                  {rentalsLoading ? (
                    <div style={{ textAlign:'center', padding:'48px 24px', color:'#7A5C30' }}>Chargement des locations…</div>
                  ) : (
                    <>
                      {/* Voitures & Motos */}
                      <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:'#1a0a00', marginBottom:10 }}>🚗 Location de voiture / moto</h3>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:10, marginBottom:24 }}>
                        {RENTAL_CARDS.filter(c => c.type !== 'Appart').map(card => (
                          <RentalCard key={card.id} card={card} onAdd={addRentalCard} added={false} days={tripDays} />
                        ))}
                      </div>

                      {/* Appartements */}
                      <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:'#1a0a00', marginBottom:10 }}>🏠 Location d'appartement</h3>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:10, marginBottom:20 }}>
                        {RENTAL_CARDS.filter(c => c.type === 'Appart').map(card => (
                          <RentalCard key={card.id} card={card} onAdd={addRentalCard} added={false} days={tripDays} />
                        ))}
                      </div>
                    </>
                  )}

                  <div style={{ background:'#FFF8EE', border:'1px solid #D4B483', padding:'14px 18px', fontSize:12, color:'#7A5C30', lineHeight:1.6 }}>
                    💡 <strong>Note :</strong> Ces tarifs sont indicatifs. La réservation se fait via nos <Link to="/partenaires" style={{ color:'#C8922A' }}>partenaires certifiés</Link>. Cliquer sur "Réserver" ajoute l'étape à votre itinéraire.
                  </div>
                </div>
              )}

              {/* Lien partenaires en mode agence */}
              {active.mode === 'agency' && (
                <div style={{ marginTop:20, background:'#FFF8EE', border:'1px solid #D4B483', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <p style={{ fontWeight:600, color:'#3D2B10', marginBottom:2 }}>Vous cherchez une agence de guide au Bénin ?</p>
                    <p style={{ fontSize:12, color:'#7A5C30' }}>Consultez notre annuaire de partenaires certifiés</p>
                  </div>
                  <Link to="/partenaires" style={{ background:'#C8922A', color:'#0A0806', padding:'9px 16px', textDecoration:'none', fontWeight:700, fontSize:13, flexShrink:0 }}>
                    Voir les partenaires →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <StepModal step={modal?.id ? modal : null} onSave={saveStep} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
