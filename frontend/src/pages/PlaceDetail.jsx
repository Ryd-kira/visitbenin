// frontend/src/pages/PlaceDetail.jsx
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usePlace } from '@/hooks/index'
import { reviewsService } from '@/services/index'
import { useAuthStore } from '@/store/useAuthStore'
import PageLoader from '@/components/ui/PageLoader'
import AddToPlannerBtn from '@/components/ui/AddToPlannerBtn'
import BookingModal from '@/components/ui/BookingModal'
import MediaCarousel from '@/components/ui/MediaCarousel'

const TYPE_LABELS = {
  culture: 'Culture & Histoire', nature: 'Nature',
  plage: 'Plage', safari: 'Safari', religieux: 'Religieux',
}

export default function PlaceDetail() {
  const { slug } = useParams()
  const { data: place, isLoading, error } = usePlace(slug)

  if (isLoading) return <PageLoader />
  if (error || !place) return (
    <div className="text-center py-32">
      <p className="text-6xl mb-4">😕</p>
      <h2 className="font-display text-2xl text-nuit mb-2">Lieu introuvable</h2>
      <Link to="/destinations" className="text-terracotta text-sm border-b border-terracotta/30">← Retour aux destinations</Link>
    </div>
  )

  return (
    <div className="bg-sable-light min-h-screen">
      {/* Breadcrumb */}
      <div style={{ background: '#0E0A06', padding: '10px 24px', borderBottom: '1px solid rgba(200,146,42,0.1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(245,237,214,0.4)' }}>
          <Link to="/" style={{ color: 'rgba(245,237,214,0.4)', textDecoration: 'none' }}>Accueil</Link>
          <span>/</span>
          <Link to="/destinations" style={{ color: 'rgba(245,237,214,0.4)', textDecoration: 'none' }}>Destinations</Link>
          <span>/</span>
          <span style={{ color: '#C8922A' }}>{place.name}</span>
        </div>
      </div>
      <MediaCarousel images={place.gallery || []} videos={place.videos || []} cover={place.cover_image} name={place.name} />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-10">
          <Description place={place} />
          <Reviews place={place} />
        </div>
        <Sidebar place={place} />
      </div>
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────
function Hero({ place }) {
  const [gallery, setGallery] = useState(false)

  const images = [place.cover_image, ...(place.gallery || [])].filter(Boolean)

  return (
    <div className="relative">
      {/* Image principale */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={images[0] || 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Ganvie_stilt_village%2C_Benin.jpg/1280px-Ganvie_stilt_village%2C_Benin.jpg'}
          alt={place.name}
          className="w-full h-full object-cover brightness-75"
          style={{ animation: 'slowZoom 10s ease-in-out infinite alternate' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nuit/80 via-nuit/20 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-8 flex items-center gap-2 text-sable/60 text-xs">
          <Link to="/" className="hover:text-or transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/destinations" className="hover:text-or transition-colors">Destinations</Link>
          <span>/</span>
          <span className="text-sable">{place.name}</span>
        </div>

        {/* Bouton galerie */}
        {images.length > 1 && (
          <button
            onClick={() => setGallery(true)}
            className="absolute bottom-6 right-8 bg-nuit/70 text-sable border border-sable/20 px-4 py-2 text-xs backdrop-blur-sm hover:border-or hover:text-or transition-colors"
          >
            📷 Voir les {images.length} photos
          </button>
        )}

        {/* Infos overlay bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-or text-nuit text-xs font-semibold px-3 py-1">{TYPE_LABELS[place.type] || place.type}</span>
            {place.is_unesco && <span className="bg-nuit/80 text-sable text-xs px-3 py-1 backdrop-blur-sm">🏛️ UNESCO</span>}
            {place.is_featured && <span className="bg-terracotta text-white text-xs px-3 py-1">⭐ Incontournable</span>}
          </div>
          <h1 className="font-display font-black text-sable text-5xl leading-tight mb-2">
            {place.name}
          </h1>
          <div className="flex items-center gap-4 text-sable/70 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="text-or text-base">{'★'.repeat(Math.round(place.rating))}</span>
              <strong className="text-sable">{Number(place.rating).toFixed(1)}</strong>
              <span className="text-sable/40">({place.review_count} avis)</span>
            </span>
            <span>·</span>
            <span>📍 {place.city?.name}</span>
          </div>
        </div>
      </div>

      {/* Galerie thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 px-8 -mt-1 bg-nuit pb-3 overflow-x-auto">
          {images.slice(0, 5).map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className="w-20 h-14 object-cover flex-shrink-0 cursor-pointer opacity-70 hover:opacity-100 border-2 border-transparent hover:border-or transition-all"
            />
          ))}
          {images.length > 5 && (
            <button
              onClick={() => setGallery(true)}
              className="w-20 h-14 flex-shrink-0 bg-nuit/60 border border-or/20 text-sable/50 text-xs hover:border-or hover:text-or transition-colors"
            >
              +{images.length - 5}
            </button>
          )}
        </div>
      )}

      <style>{`@keyframes slowZoom { from { transform: scale(1) } to { transform: scale(1.04) } }`}</style>
    </div>
  )
}

// ─── DESCRIPTION ─────────────────────────────────────
function Description({ place }) {
  const [expanded, setExpanded] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-nuit mb-4">À propos</h2>
      <p className={`text-brun-light leading-relaxed text-[0.95rem] ${!expanded ? 'line-clamp-4' : ''}`}>
        {place.description}
      </p>
      {place.description?.length > 300 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-terracotta text-sm mt-2 border-b border-terracotta/30 hover:border-terracotta"
        >
          {expanded ? 'Voir moins ↑' : 'Lire la suite ↓'}
        </button>
      )}

      {/* Tags */}
      {place.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {place.tags.map(tag => (
            <span key={tag} className="bg-or/10 text-brun text-xs px-3 py-1 border border-or/15">#{tag}</span>
          ))}
        </div>
      )}

      {/* Bouton planificateur */}
      <div className="mt-6 flex flex-wrap gap-3">
        <AddToPlannerBtn item={{
          title: place.name,
          type: 'decouverte',
          price: place.entry_fee,
          description: place.short_desc || place.description,
          city: place.city?.name || '',
          slug: place.slug,
        }} />
        <button
          onClick={() => setBookingOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white text-sm font-bold hover:bg-terracotta-dark transition-colors"
        >
          📅 Réserver une visite guidée
        </button>
      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        entity={place}
        bookingType="activity"
        pricePerPerson={place.entry_fee || 0}
      />

      {/* Infos pratiques */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {place.entry_fee !== null && (
          <div className="bg-white border border-or/10 p-4">
            <p className="text-xs text-brun-light uppercase tracking-wider mb-1">Entrée</p>
            <p className="font-semibold text-nuit">{place.entry_fee === 0 ? 'Gratuit' : `${place.entry_fee?.toLocaleString()} FCFA`}</p>
          </div>
        )}
        {place.city && (
          <div className="bg-white border border-or/10 p-4">
            <p className="text-xs text-brun-light uppercase tracking-wider mb-1">Ville</p>
            <p className="font-semibold text-nuit">{place.city.name}</p>
          </div>
        )}
        {place.opening_hours && (
          <div className="bg-white border border-or/10 p-4 col-span-2">
            <p className="text-xs text-brun-light uppercase tracking-wider mb-2">Horaires</p>
            <div className="grid grid-cols-4 gap-1 text-xs">
              {Object.entries(place.opening_hours).map(([day, h]) => (
                <div key={day} className="flex gap-1">
                  <span className="text-brun-light capitalize w-8">{day.slice(0,3)}</span>
                  <span className="font-medium text-nuit">{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── REVIEWS ─────────────────────────────────────────
function Reviews({ place }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ rating: 5, title: '', content: '' })

  const mutation = useMutation({
    mutationFn: (data) => reviewsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places', place.slug] })
      setShowForm(false)
      setForm({ rating: 5, title: '', content: '' })
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    mutation.mutate({ entity_type: 'place', entity_id: place.id, ...form })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display font-bold text-2xl text-nuit">
          Avis <span className="text-brun-light text-xl">({place.review_count})</span>
        </h2>
        {user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-or text-nuit px-5 py-2 text-sm font-semibold hover:bg-or-light transition-colors"
          >
            + Laisser un avis
          </button>
        ) : (
          <Link to="/connexion" className="text-sm text-terracotta border-b border-terracotta/30">Connectez-vous pour noter</Link>
        )}
      </div>

      {/* Formulaire avis */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-or/15 p-6 mb-6">
          <h3 className="font-semibold text-nuit mb-4">Votre avis sur {place.name}</h3>
          <div className="mb-4">
            <p className="text-sm text-brun-light mb-2">Note</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setForm(f => ({ ...f, rating: n }))}
                  className={`text-2xl transition-transform hover:scale-110 ${n <= form.rating ? 'text-or' : 'text-gray-300'}`}
                >★</button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Titre de votre avis (optionnel)"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border border-or/15 px-4 py-2.5 text-sm mb-3 outline-none focus:border-or/40 transition-colors"
          />
          <textarea
            placeholder="Décrivez votre expérience (min. 20 caractères)..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={4}
            required
            minLength={20}
            className="w-full border border-or/15 px-4 py-2.5 text-sm outline-none focus:border-or/40 transition-colors resize-none"
          />
          <div className="flex gap-3 mt-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-or text-nuit px-6 py-2.5 text-sm font-semibold hover:bg-or-light disabled:opacity-60 transition-colors"
            >
              {mutation.isPending ? 'Publication...' : 'Publier l\'avis'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm text-brun-light hover:text-nuit border border-or/10 hover:border-or/30 transition-colors">
              Annuler
            </button>
          </div>
          {mutation.isError && (
            <p className="text-terracotta text-sm mt-2">{mutation.error?.response?.data?.error || 'Erreur lors de la publication'}</p>
          )}
        </form>
      )}

      {/* Liste des avis */}
      <div className="flex flex-col gap-4">
        {(place.reviews || []).length === 0 ? (
          <div className="text-center py-10 text-brun-light">
            <p className="text-3xl mb-2">💬</p>
            <p>Soyez le premier à laisser un avis !</p>
          </div>
        ) : (
          place.reviews.map(review => (
            <div key={review.id} className="bg-white border border-or/8 p-5">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-or/15 rounded-full flex items-center justify-center text-sm font-bold text-or">
                    {review.user.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-nuit">{review.user.name}</p>
                    <p className="text-xs text-brun-light">{new Date(review.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                <div className="text-or text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              </div>
              {review.title && <p className="font-semibold text-nuit text-sm mb-1">{review.title}</p>}
              <p className="text-brun-light text-sm leading-relaxed">{review.content}</p>
              <div className="flex gap-3 mt-3">
                <button className="text-xs text-brun-light hover:text-nuit transition-colors">
                  👍 Utile ({review.helpful_count})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── SIDEBAR ─────────────────────────────────────────
function Sidebar({ place }) {
  return (
    <div className="flex flex-col gap-5">

      {/* Widget infos clés */}
      <div className="bg-white border border-or/15 p-5">
        <h3 className="font-display font-bold text-lg text-nuit mb-4">Infos pratiques</h3>
        <div className="flex flex-col gap-0 text-sm divide-y divide-or/8">

          {place.city && (
            <div className="flex justify-between py-2.5">
              <span className="text-brun-light">📍 Ville</span>
              <span className="font-semibold text-nuit">{place.city.name}</span>
            </div>
          )}

          {place.entry_fee !== null && place.entry_fee !== undefined && (
            <div className="flex justify-between py-2.5">
              <span className="text-brun-light">🎟 Entrée</span>
              <span className={`font-semibold ${place.entry_fee === 0 ? 'text-green-600' : 'text-nuit'}`}>
                {place.entry_fee === 0 ? '✓ Gratuit' : `${place.entry_fee?.toLocaleString()} FCFA`}
              </span>
            </div>
          )}

          {place.phone && (
            <div className="flex justify-between py-2.5">
              <span className="text-brun-light">📞 Téléphone</span>
              <a href={`tel:${place.phone}`} className="font-semibold text-terracotta hover:underline">{place.phone}</a>
            </div>
          )}

          {place.website && (
            <div className="flex justify-between py-2.5">
              <span className="text-brun-light">🌐 Site web</span>
              <a href={place.website} target="_blank" rel="noopener noreferrer"
                className="font-semibold text-terracotta hover:underline text-xs">
                Voir le site →
              </a>
            </div>
          )}

          {place.address && (
            <div className="flex justify-between py-2.5 gap-4">
              <span className="text-brun-light flex-shrink-0">🏠 Adresse</span>
              <span className="font-semibold text-nuit text-right text-xs">{place.address}</span>
            </div>
          )}

          {place.is_unesco && (
            <div className="flex justify-between py-2.5">
              <span className="text-brun-light">🏛 Classement</span>
              <span className="font-semibold text-or">Patrimoine UNESCO</span>
            </div>
          )}

          {Number(place.rating) > 0 && (
            <div className="flex justify-between py-2.5">
              <span className="text-brun-light">⭐ Note</span>
              <span className="font-semibold text-nuit">
                {Number(place.rating).toFixed(1)}/5
                <span className="text-brun-light font-normal ml-1">({place.review_count} avis)</span>
              </span>
            </div>
          )}
        </div>

        {/* Horaires */}
        {place.opening_hours && Object.keys(place.opening_hours).length > 0 && (
          <div className="mt-4 pt-4 border-t border-or/10">
            <p className="text-xs font-semibold text-brun uppercase tracking-wider mb-2">🕐 Horaires</p>
            <div className="flex flex-col gap-1">
              {Object.entries(place.opening_hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between text-xs">
                  <span className="text-brun-light capitalize">{day}</span>
                  <span className="font-medium text-nuit">{hours}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {place.tags?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-or/10 flex flex-wrap gap-2">
            {place.tags.map(tag => (
              <span key={tag} className="text-xs bg-sable text-brun px-2 py-1 rounded-sm">{tag}</span>
            ))}
          </div>
        )}

        {/* Boutons action */}
        <div className="flex flex-col gap-2 mt-5">
          <a href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
            target="_blank" rel="noopener noreferrer"
            className="w-full bg-nuit text-sable py-2.5 text-sm font-medium text-center hover:bg-brun transition-colors block">
            📍 Itinéraire Google Maps
          </a>
          {place.phone && (
            <a href={`tel:${place.phone}`}
              className="w-full border border-or/20 text-brun py-2.5 text-sm hover:border-or hover:text-or transition-colors text-center block">
              📞 Appeler
            </a>
          )}
          {place.website && (
            <a href={place.website} target="_blank" rel="noopener noreferrer"
              className="w-full border border-or/20 text-brun py-2.5 text-sm hover:border-or hover:text-or transition-colors text-center block">
              🌐 Site officiel
            </a>
          )}
        </div>
      </div>

      {/* Mini carte */}
      {place.latitude && place.longitude && (
        <div className="bg-white border border-or/15 overflow-hidden">
          <a href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
            target="_blank" rel="noopener noreferrer">
            <img
              src={`https://static-maps.yandex.ru/1.x/?lang=fr_FR&ll=${place.longitude},${place.latitude}&z=13&l=map&size=450,200&pt=${place.longitude},${place.latitude},pm2rdl`}
              alt="Localisation"
              className="w-full h-36 object-cover hover:opacity-90 transition-opacity"
              onError={e => { e.target.style.display = 'none' }}
            />
          </a>
          <div className="p-3 text-xs text-brun-light flex items-center gap-2">
            <span>📍</span>
            <span>{place.address || `${place.city?.name}, Bénin`}</span>
          </div>
        </div>
      )}

      {/* Note globale */}
      <div className="bg-nuit border border-or/15 p-5 text-center">
        <div className="font-display font-black text-6xl text-or">{Number(place.rating).toFixed(1)}</div>
        <div className="text-or text-xl mt-1">{'★'.repeat(Math.round(place.rating))}</div>
        <p className="text-sable/50 text-xs mt-2">{place.review_count} avis</p>
        <div className="border-t border-or/10 mt-4 pt-4">
          <Link to="/destinations" className="text-sable/40 text-xs hover:text-or transition-colors">
            ← Retour aux destinations
          </Link>
        </div>
      </div>
    </div>
  )
}
