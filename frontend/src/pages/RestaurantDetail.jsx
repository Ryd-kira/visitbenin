// frontend/src/pages/RestaurantDetail.jsx
import { useParams, Link } from 'react-router-dom'
import { useRestaurant } from '@/hooks/index'
import PageLoader from '@/components/ui/PageLoader'
import AddToPlannerBtn from '@/components/ui/AddToPlannerBtn'
import BookingModal from '@/components/ui/BookingModal'
import { useState } from 'react'
import MediaCarousel from '@/components/ui/MediaCarousel'

export default function RestaurantDetail() {
  const { slug } = useParams()
  const { data: resto, isLoading } = useRestaurant(slug)
  const [bookingOpen, setBookingOpen] = useState(false)
  if (isLoading) return <PageLoader />
  if (!resto) return <div className="text-center py-24"><p className="text-brun-light">Restaurant introuvable</p><Link to="/gastronomie" className="text-terracotta text-sm">← Retour</Link></div>

  const priceIcons = { low: '€', medium: '€€', high: '€€€' }

  return (
    <div className="bg-sable-light min-h-screen">
      {/* Breadcrumb */}
      <div style={{ background: '#0E0A06', padding: '10px 24px', borderBottom: '1px solid rgba(200,146,42,0.1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(245,237,214,0.4)' }}>
          <Link to="/" style={{ color: 'rgba(245,237,214,0.4)', textDecoration: 'none' }}>Accueil</Link>
          <span>/</span>
          <Link to="/gastronomie" style={{ color: 'rgba(245,237,214,0.4)', textDecoration: 'none' }}>Gastronomie</Link>
          <span>/</span>
          <span style={{ color: '#C8922A' }}>{resto.name}</span>
        </div>
      </div>
      <MediaCarousel images={resto.gallery || []} videos={resto.videos || []} cover={resto.cover_image} name={resto.name} />

      {/* Infos rapides sous le carrousel */}
      <div style={{ background: '#0E0A06', borderBottom: '1px solid rgba(200,146,42,0.1)', padding: '14px 24px' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: '#F5EDD6', fontWeight: 700, marginBottom: 4 }}>{resto.name}</h1>
            <p style={{ fontSize: 13, color: 'rgba(245,237,214,0.5)' }}>
              📍 {resto.city?.name}
              {resto.cuisine_type && ` · ${resto.cuisine_type}`}
              {` · ${priceIcons[resto.price_range]}`}
              {` · ★ ${Number(resto.rating).toFixed(1)} (${resto.review_count} avis)`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Bouton planificateur + réservation */}
          <div className="mb-6 flex flex-wrap gap-3">
            <AddToPlannerBtn item={{ title: resto.name, type: 'restaurant', price: null, description: resto.short_desc || resto.description, city: resto.city?.name || '', slug: resto.slug }} />
            {resto.has_reservation && (
              <button
                onClick={() => setBookingOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white text-sm font-bold hover:bg-terracotta-dark transition-colors"
              >
                🍽 Réserver une table
              </button>
            )}
          </div>
          <BookingModal
            isOpen={bookingOpen}
            onClose={() => setBookingOpen(false)}
            entity={resto}
            bookingType="restaurant"
            pricePerPerson={0}
          />
          <p className="text-brun-light leading-relaxed mb-6">{resto.description}</p>
          {/* Menu */}
          {resto.menu_items && (
            <div>
              <h2 className="font-display font-bold text-2xl text-nuit mb-4">Menu</h2>
              <div className="flex flex-col gap-2">
                {resto.menu_items.map((item, i) => (
                  <div key={i} className="bg-white border border-or/10 p-4 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-nuit text-sm">{item.name}</p>
                      {item.desc && <p className="text-brun-light text-xs mt-0.5">{item.desc}</p>}
                    </div>
                    <span className="text-or font-bold text-sm flex-shrink-0 ml-4">{item.price?.toLocaleString()} F</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Avis */}
          {resto.reviews?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display font-bold text-2xl text-nuit mb-4">Avis ({resto.review_count})</h2>
              {resto.reviews.slice(0, 5).map(r => (
                <div key={r.id} className="bg-white border border-or/8 p-4 mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-sm text-nuit">{r.user.name}</span>
                    <span className="text-or text-sm">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-brun-light text-sm">{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-or/15 p-5">
            <h3 className="font-display font-bold text-lg text-nuit mb-4">Informations</h3>
            <div className="flex flex-col gap-0 text-sm divide-y divide-or/8">
              {resto.city && (
                <div className="flex justify-between py-2.5">
                  <span className="text-brun-light">📍 Ville</span>
                  <span className="font-semibold text-nuit">{resto.city.name}</span>
                </div>
              )}
              {resto.phone && (
                <div className="flex justify-between py-2.5">
                  <span className="text-brun-light">📞 Téléphone</span>
                  <a href={`tel:${resto.phone}`} className="font-semibold text-terracotta hover:underline">{resto.phone}</a>
                </div>
              )}
              {resto.website && (
                <div className="flex justify-between py-2.5">
                  <span className="text-brun-light">🌐 Site web</span>
                  <a href={resto.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-terracotta hover:underline text-xs">Voir le site →</a>
                </div>
              )}
              {resto.address && (
                <div className="flex justify-between py-2.5 gap-4">
                  <span className="text-brun-light flex-shrink-0">🏠 Adresse</span>
                  <span className="font-semibold text-nuit text-right text-xs">{resto.address}</span>
                </div>
              )}
              {Number(resto.rating) > 0 && (
                <div className="flex justify-between py-2.5">
                  <span className="text-brun-light">⭐ Note</span>
                  <span className="font-semibold text-nuit">{Number(resto.rating).toFixed(1)}/5 <span className="text-brun-light font-normal">({resto.review_count})</span></span>
                </div>
              )}
            </div>

            {/* Horaires */}
            {resto.opening_hours && Object.keys(resto.opening_hours).length > 0 && (
              <div className="mt-4 pt-4 border-t border-or/10">
                <p className="text-xs font-semibold text-brun uppercase tracking-wider mb-2">🕐 Horaires</p>
                {Object.entries(resto.opening_hours).map(([d,h]) => (
                  <div key={d} className="flex justify-between text-xs py-0.5">
                    <span className="text-brun-light capitalize">{d}</span>
                    <span className="text-nuit font-medium">{h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Services */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-or/10 text-xs">
              {resto.has_delivery    && <span className="bg-vert/10 text-vert px-2 py-1">🛵 Livraison</span>}
              {resto.has_reservation && <span className="bg-or/10 text-or-dark px-2 py-1">📅 Réservation</span>}
              {resto.has_wifi        && <span className="bg-blue-50 text-blue-600 px-2 py-1">📶 WiFi</span>}
              {resto.has_parking     && <span className="bg-gray-100 text-gray-600 px-2 py-1">🅿️ Parking</span>}
            </div>

            {/* Boutons */}
            <div className="flex flex-col gap-2 mt-5">
              {resto.phone && (
                <a href={`tel:${resto.phone}`} className="w-full bg-nuit text-sable py-2.5 text-sm font-medium text-center hover:bg-brun transition-colors block">
                  📞 Appeler
                </a>
              )}
              {resto.latitude && resto.longitude && (
                <a href={`https://www.google.com/maps?q=${resto.latitude},${resto.longitude}`} target="_blank" rel="noopener noreferrer"
                  className="w-full border border-or/20 text-brun py-2.5 text-sm hover:border-or hover:text-or transition-colors text-center block">
                  📍 Google Maps
                </a>
              )}
            </div>
          </div>
          <Link to="/gastronomie" className="text-center text-sm text-brun-light hover:text-terracotta transition-colors">← Autres restaurants</Link>
        </div>
      </div>
    </div>
  )
}
