// frontend/src/components/ui/BookingModal.jsx
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { Link } from 'react-router-dom'
import axios from 'axios'

const PAYMENT_METHODS = [
  { id: 'mtn_money',  icon: '📱', label: 'MTN Mobile Money',  color: '#f59e0b' },
  { id: 'moov_money', icon: '📱', label: 'Moov Money',        color: '#3b82f6' },
  { id: 'card',       icon: '💳', label: 'Carte bancaire',    color: '#6b7280' },
  { id: 'cash',       icon: '💵', label: 'Espèces sur place', color: '#22c55e' },
]

const TIME_SLOTS = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00']

export default function BookingModal({ isOpen, onClose, entity, bookingType, pricePerPerson = 0 }) {
  const { user } = useAuthStore()

  const [step, setStep]   = useState(1) // 1=détails 2=contact 3=paiement 4=confirmation
  const [form, setForm]   = useState({
    date:           '',
    time_slot:      '',
    nb_persons:     1,
    payment_method: '',
    notes:          '',
    contact_name:   user?.name || '',
    contact_phone:  '',
    contact_email:  user?.email || '',
  })
  const [errors, setErrors] = useState({})

  const totalPrice = pricePerPerson * form.nb_persons

  const createBooking = useMutation({
    mutationFn: (data) => axios.post('/api/v1/bookings', data).then(r => r.data.data),
    onSuccess: () => setStep(4),
    onError: (err) => setErrors({ global: err.response?.data?.error || 'Erreur lors de la réservation' }),
  })

  function validate(currentStep) {
    const e = {}
    if (currentStep === 1) {
      if (!form.date) e.date = 'Date obligatoire'
      else if (new Date(form.date) < new Date()) e.date = 'La date doit être dans le futur'
      if (form.nb_persons < 1) e.nb_persons = 'Au moins 1 personne'
    }
    if (currentStep === 2) {
      if (!form.contact_name.trim())  e.contact_name  = 'Nom obligatoire'
      if (!form.contact_phone.trim()) e.contact_phone = 'Téléphone obligatoire'
      if (!form.contact_email.trim() || !form.contact_email.includes('@')) e.contact_email = 'Email invalide'
    }
    if (currentStep === 3) {
      if (!form.payment_method) e.payment_method = 'Choisissez un mode de paiement'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (validate(step)) setStep(s => s + 1)
  }

  function submit() {
    if (!validate(3)) return
    createBooking.mutate({
      booking_type:  bookingType,
      entity_id:     entity.id,
      entity_name:   entity.name,
      date:          form.date,
      time_slot:     form.time_slot || null,
      nb_persons:    form.nb_persons,
      total_price:   totalPrice,
      payment_method: form.payment_method,
      notes:         form.notes,
      contact_name:  form.contact_name,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email,
    })
  }

  function reset() {
    setStep(1)
    setForm({ date: '', time_slot: '', nb_persons: 1, payment_method: '', notes: '', contact_name: user?.name || '', contact_phone: '', contact_email: user?.email || '' })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  // Overlay
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) reset() }}>

      <div style={{ background: 'white', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>

        {/* Header */}
        <div style={{ background: '#0E0A06', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 11, color: '#C8922A', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Réservation</p>
            <h2 style={{ color: '#F5EDD6', fontSize: 17, fontWeight: 700, fontFamily: 'Playfair Display, serif', margin: 0, lineHeight: 1.3 }}>
              {entity?.name}
            </h2>
          </div>
          <button onClick={reset} style={{ background: 'none', border: 'none', color: 'rgba(245,237,214,0.5)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 0, marginLeft: 12, flexShrink: 0 }}>✕</button>
        </div>

        {/* Stepper */}
        {step < 4 && (
          <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
            {[['1','Détails'],['2','Contact'],['3','Paiement']].map(([n, label], i) => (
              <div key={n} style={{ flex: 1, padding: '12px 8px', textAlign: 'center', borderBottom: `2px solid ${step > i ? '#C8922A' : step === i + 1 ? '#C8922A' : 'transparent'}`, background: step === i + 1 ? '#fffbf5' : 'white' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: step >= i + 1 ? '#C8922A' : '#9ca3af' }}>{n}. {label}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '24px' }}>
          {errors.global && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              ❌ {errors.global}
            </div>
          )}

          {/* ── Non connecté ── */}
          {!user && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>🔐</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Connexion requise</p>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Connectez-vous pour réserver {entity?.name}</p>
              <Link to="/connexion" onClick={onClose}
                style={{ background: '#C8922A', color: 'white', padding: '10px 24px', textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'inline-block' }}>
                Se connecter
              </Link>
            </div>
          )}

          {/* ── ÉTAPE 1 : Détails ── */}
          {user && step === 1 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Choisir la date et le nombre de personnes</h3>

              <Field label="Date *" error={errors.date}>
                <input type="date" value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  style={inputStyle(!!errors.date)} />
              </Field>

              <Field label="Créneau horaire (optionnel)">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TIME_SLOTS.map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, time_slot: f.time_slot === t ? '' : t }))}
                      style={{ padding: '6px 14px', fontSize: 12, cursor: 'pointer', border: `1px solid ${form.time_slot === t ? '#C8922A' : '#e5e7eb'}`, background: form.time_slot === t ? '#C8922A' : 'white', color: form.time_slot === t ? 'white' : '#374151', fontWeight: form.time_slot === t ? 700 : 400 }}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Nombre de personnes *" error={errors.nb_persons}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button type="button" onClick={() => setForm(f => ({ ...f, nb_persons: Math.max(1, f.nb_persons - 1) }))}
                    style={{ width: 36, height: 36, border: '1px solid #e5e7eb', background: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 20, fontWeight: 700, minWidth: 32, textAlign: 'center', color: '#111827' }}>{form.nb_persons}</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, nb_persons: Math.min(20, f.nb_persons + 1) }))}
                    style={{ width: 36, height: 36, border: '1px solid #e5e7eb', background: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>personne{form.nb_persons > 1 ? 's' : ''}</span>
                </div>
              </Field>

              <Field label="Notes ou demandes spéciales (optionnel)">
                <textarea value={form.notes} rows={2}
                  placeholder="Régime alimentaire, accessibilité, anniversaire..."
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ ...inputStyle(), resize: 'none' }} />
              </Field>

              {/* Résumé prix */}
              {pricePerPerson > 0 && (
                <div style={{ background: '#f9fafb', border: '1px solid #f3f4f6', padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                    <span>{pricePerPerson.toLocaleString()} FCFA × {form.nb_persons} pers.</span>
                    <span>{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#111827', borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>
                    <span>Total</span>
                    <span style={{ color: '#C8922A' }}>{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                </div>
              )}

              <button onClick={next} style={btnStyle('#0E0A06', '#F5EDD6')}>Suivant →</button>
            </div>
          )}

          {/* ── ÉTAPE 2 : Contact ── */}
          {user && step === 2 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Vos coordonnées</h3>

              <Field label="Nom complet *" error={errors.contact_name}>
                <input type="text" value={form.contact_name}
                  onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                  style={inputStyle(!!errors.contact_name)} />
              </Field>

              <Field label="Téléphone * (WhatsApp recommandé)" error={errors.contact_phone}>
                <input type="tel" value={form.contact_phone} placeholder="+229 97 000 000"
                  onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                  style={inputStyle(!!errors.contact_phone)} />
              </Field>

              <Field label="Email *" error={errors.contact_email}>
                <input type="email" value={form.contact_email}
                  onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                  style={inputStyle(!!errors.contact_email)} />
              </Field>

              <div style={{ background: '#fffbf5', border: '1px solid #fde68a', padding: '12px 14px', fontSize: 12, color: '#92400e', marginBottom: 20 }}>
                💡 La confirmation sera envoyée par email et SMS. Assurez-vous que vos coordonnées sont correctes.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} style={btnStyle('#f3f4f6', '#374151')}>← Retour</button>
                <button onClick={next} style={{ ...btnStyle('#0E0A06', '#F5EDD6'), flex: 1 }}>Suivant →</button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : Paiement ── */}
          {user && step === 3 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Mode de paiement</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Le paiement est sécurisé. Vous ne serez débité qu'à la confirmation.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.id} type="button" onClick={() => setForm(f => ({ ...f, payment_method: pm.id }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: `2px solid ${form.payment_method === pm.id ? pm.color : '#e5e7eb'}`, background: form.payment_method === pm.id ? pm.color + '10' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}>
                    <span style={{ fontSize: 22 }}>{pm.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: form.payment_method === pm.id ? 700 : 400, color: form.payment_method === pm.id ? '#111827' : '#374151' }}>{pm.label}</span>
                    {form.payment_method === pm.id && <span style={{ marginLeft: 'auto', color: pm.color, fontSize: 18 }}>✓</span>}
                  </button>
                ))}
              </div>

              {errors.payment_method && (
                <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 12 }}>⚠ {errors.payment_method}</p>
              )}

              {/* Récapitulatif */}
              <div style={{ background: '#f9fafb', padding: '16px', marginBottom: 20, fontSize: 13 }}>
                <p style={{ fontWeight: 700, color: '#111827', marginBottom: 10 }}>Récapitulatif</p>
                {[
                  ['Prestation', entity?.name],
                  ['Date', form.date ? new Date(form.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'],
                  form.time_slot && ['Créneau', form.time_slot],
                  ['Personnes', `${form.nb_persons} personne${form.nb_persons > 1 ? 's' : ''}`],
                  ['Contact', `${form.contact_name} · ${form.contact_phone}`],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
                    <span>{k}</span><span style={{ color: '#111827', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
                {pricePerPerson > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontWeight: 700, fontSize: 15 }}>
                    <span>Total</span>
                    <span style={{ color: '#C8922A' }}>{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(2)} style={btnStyle('#f3f4f6', '#374151')}>← Retour</button>
                <button onClick={submit} disabled={createBooking.isPending}
                  style={{ ...btnStyle('#C8922A', 'white'), flex: 1, opacity: createBooking.isPending ? 0.7 : 1 }}>
                  {createBooking.isPending ? '⏳ Traitement…' : '✅ Confirmer la réservation'}
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 : Confirmation ── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>
                Réservation envoyée !
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 6 }}>
                Votre demande de réservation pour <strong>{entity?.name}</strong> a bien été reçue.
              </p>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>
                Une confirmation sera envoyée à <strong>{form.contact_email}</strong> dans les 24h.
              </p>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px 16px', fontSize: 13, color: '#15803d', marginBottom: 24, textAlign: 'left' }}>
                <p style={{ fontWeight: 700, marginBottom: 6 }}>Prochaines étapes :</p>
                <p>1. Vous recevrez un email de confirmation avec les détails</p>
                <p>2. Le prestataire vous contactera pour finaliser</p>
                {form.payment_method !== 'cash' && <p>3. Le paiement sera traité après confirmation</p>}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Link to="/dashboard" onClick={reset}
                  style={{ background: '#0E0A06', color: '#F5EDD6', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                  Voir mes réservations
                </Link>
                <button onClick={reset} style={btnStyle('#f3f4f6', '#374151')}>Fermer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Composants helper ──
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
      {error && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 4 }}>⚠ {error}</p>}
    </div>
  )
}

function inputStyle(hasError = false) {
  return {
    width: '100%', border: `1px solid ${hasError ? '#fca5a5' : '#e5e7eb'}`,
    padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none',
    background: hasError ? '#fef2f2' : 'white',
  }
}

function btnStyle(bg, color) {
  return {
    background: bg, color, border: 'none', padding: '11px 20px',
    fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'opacity .15s',
  }
}
