// frontend/src/pages/RestaurantDetail.jsx
import { useParams, Link } from 'react-router-dom'
import { useRestaurant } from '@/hooks/index'
import PageLoader from '@/components/ui/PageLoader'
import AddToPlannerBtn from '@/components/ui/AddToPlannerBtn'
import BookingModal from '@/components/ui/BookingModal'
import { useState } from 'react'

export default function RestaurantDetail() {
  const { slug } = useParams()
  const { data: resto, isLoading } = useRestaurant(slug)
  const [bookingOpen, setBookingOpen] = useState(false)
  if (isLoading) return <PageLoader />
  if (!resto) return <div className="text-center py-24"><p className="text-brun-light">Restaurant introuvable</p><Link to="/gastronomie" className="text-terracotta text-sm">← Retour</Link></div>

  const priceIcons = { low: '€', medium: '€€', high: '€€€' }

  return (
    <div className="bg-sable-light min-h-screen">
      {/* Hero */}
      <div className="relative h-80 overflow-hidden">
        <img src={resto.cover_image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600'} alt={resto.name} className="w-full h-full object-cover brightness-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-nuit/80 to-transparent" />
        <div className="absolute bottom-0 left-0 px-8 pb-8">
          <span className="bg-or text-nuit text-xs font-semibold px-3 py-1 mb-3 inline-block">{resto.cuisine_type}</span>
          <h1 className="font-display font-bold text-4xl text-sable">{resto.name}</h1>
          <p className="text-sable/60 text-sm mt-1">📍 {resto.city?.name} · {priceIcons[resto.price_range]} · ★ {Number(resto.rating).toFixed(1)} ({resto.review_count} avis)</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            {resto.phone && <p className="text-sm mb-2"><span className="text-brun-light">Tél.</span> <a href={`tel:${resto.phone}`} className="text-terracotta">{resto.phone}</a></p>}
            {resto.opening_hours && (
              <div className="text-sm">
                <p className="text-brun-light mb-1">Horaires</p>
                {Object.entries(resto.opening_hours).slice(0,3).map(([d,h]) => (
                  <p key={d} className="text-nuit text-xs">{d} : {h}</p>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              {resto.has_delivery    && <span className="bg-vert/10 text-vert px-2 py-0.5">🛵 Livraison</span>}
              {resto.has_reservation && <span className="bg-or/10 text-or-dark px-2 py-0.5">📅 Réservation</span>}
              {resto.has_wifi        && <span className="bg-blue-50 text-blue-600 px-2 py-0.5">📶 WiFi</span>}
              {resto.has_parking     && <span className="bg-gray-100 text-gray-600 px-2 py-0.5">🅿️ Parking</span>}
            </div>
          </div>
          <Link to="/gastronomie" className="text-center text-sm text-brun-light hover:text-terracotta transition-colors">← Autres restaurants</Link>
        </div>
      </div>
    </div>
  )
}
