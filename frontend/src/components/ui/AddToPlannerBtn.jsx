// frontend/src/components/ui/AddToPlannerBtn.jsx
// Bouton flottant "Ajouter à mon voyage" — utilisable sur toute page de détail
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/services/api'

export default function AddToPlannerBtn({ item }) {
  // item = { title, type, price, description, city, slug }
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [open,    setOpen]    = useState(false)
  const [trips,   setTrips]   = useState([])
  const [loading, setLoading] = useState(false)
  const [added,   setAdded]   = useState(false)
  const [error,   setError]   = useState('')

  async function openModal() {
    if (!user) { navigate('/connexion'); return }
    setOpen(true); setError(''); setAdded(false)
    setLoading(true)
    try {
      const r = await api.get('/trips')
      setTrips(r.data.data || [])
    } catch { setError('Impossible de charger vos voyages.') }
    finally { setLoading(false) }
  }

  async function addToTrip(tripId) {
    setLoading(true)
    try {
      await api.post(`/trips/${tripId}/steps`, {
        type:        item.type || 'decouverte',
        title:       item.title,
        description: item.description || '',
        price:       item.price || null,
        address:     item.city || '',
        notes:       item.slug ? `place:${item.slug}` : '',
        is_booked:   false,
      })
      setAdded(true)
      setTimeout(() => setOpen(false), 1200)
    } catch { setError('Erreur lors de l\'ajout. Réessayez.') }
    finally { setLoading(false) }
  }

  return (
    <>
      {/* Bouton déclencheur */}
      <button onClick={openModal} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#C8922A', color: '#0A0806',
        border: 'none', padding: '11px 20px',
        fontSize: 13, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif',
        transition: 'background .15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#b07d22'}
        onMouseLeave={e => e.currentTarget.style.background = '#C8922A'}
      >
        🗺️ Ajouter à mon voyage
      </button>

      {/* Modal de sélection du voyage */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(14,10,6,0.75)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={() => setOpen(false)}>
          <div style={{
            background: 'white', width: '100%', maxWidth: 420,
            padding: 28, position: 'relative',
          }} onClick={e => e.stopPropagation()}>

            <button onClick={() => setOpen(false)} style={{
              position: 'absolute', top: 14, right: 14,
              background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af',
            }}>✕</button>

            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1a0a00', marginBottom: 6 }}>
              Ajouter à un voyage
            </h3>
            <p style={{ fontSize: 12, color: '#7A5C30', marginBottom: 20 }}>
              📍 <strong>{item.title}</strong>
            </p>

            {added ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ fontSize: 36, marginBottom: 8 }}>✅</p>
                <p style={{ color: '#22c55e', fontWeight: 700 }}>Ajouté à votre voyage !</p>
                <Link to="/planifier" style={{ display: 'inline-block', marginTop: 12, color: '#C8922A', fontSize: 13, fontWeight: 600 }}>
                  Voir mon planificateur →
                </Link>
              </div>
            ) : loading ? (
              <p style={{ textAlign: 'center', color: '#7A5C30', padding: '24px 0' }}>Chargement…</p>
            ) : error ? (
              <p style={{ color: '#E87050', fontSize: 13 }}>❌ {error}</p>
            ) : trips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ color: '#7A5C30', fontSize: 14, marginBottom: 16 }}>
                  Vous n'avez pas encore de voyage planifié.
                </p>
                <Link to="/planifier" onClick={() => setOpen(false)} style={{
                  display: 'inline-block', background: '#C8922A', color: '#0A0806',
                  padding: '10px 20px', fontWeight: 700, fontSize: 13, textDecoration: 'none',
                }}>
                  Créer un voyage →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {trips.map(trip => (
                  <button key={trip.id} onClick={() => addToTrip(trip.id)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', border: '1px solid #e5e7eb', background: 'white',
                    cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8922A'; e.currentTarget.style.background = '#FFF8EE' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white' }}
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1a0a00', marginBottom: 2 }}>{trip.title}</p>
                      <p style={{ fontSize: 11, color: '#7A5C30' }}>
                        {trip.mode === 'solo' ? '👤 Solo' : trip.mode === 'agency' ? '🏢 Agence' : '👥 Groupe'}
                        {' · '}{trip.steps?.length || 0} étape{(trip.steps?.length || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span style={{ color: '#C8922A', fontSize: 18 }}>+</span>
                  </button>
                ))}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 10, marginTop: 4 }}>
                  <Link to="/planifier" onClick={() => setOpen(false)} style={{
                    display: 'block', textAlign: 'center', color: '#C8922A',
                    fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  }}>
                    + Créer un nouveau voyage
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
