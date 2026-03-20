// frontend/src/pages/SchoolDetail.jsx
import { useParams, Link } from 'react-router-dom'
import { useSchool } from '@/hooks/index'
import PageLoader from '@/components/ui/PageLoader'
import AddToPlannerBtn from '@/components/ui/AddToPlannerBtn'
import MediaCarousel from '@/components/ui/MediaCarousel'

export default function SchoolDetail() {
  const { slug } = useParams()
  const { data: school, isLoading } = useSchool(slug)
  if (isLoading) return <PageLoader />
  if (!school) return <div className="text-center py-24"><Link to="/ecoles" className="text-terracotta text-sm">← Retour aux écoles</Link></div>

  return (
    <div className="min-h-screen bg-sable-light">
      {/* Breadcrumb */}
      <div style={{ background: '#1B3A5C', padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Accueil</Link>
          <span>/</span>
          <Link to="/ecoles" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Écoles</Link>
          <span>/</span>
          <span style={{ color: '#C8922A' }}>{school.name}</span>
        </div>
      </div>
      <MediaCarousel images={school.gallery || []} videos={school.videos || []} cover={school.cover_image} name={school.name} />

      {/* Infos titre sous carrousel */}
      <div style={{ background: '#1B3A5C', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 11, padding: '2px 10px' }}>{school.school_type}</span>
            {school.is_aefe && <span style={{ background: '#C8922A', color: '#0E0A06', fontSize: 11, padding: '2px 10px', fontWeight: 700 }}>AEFE</span>}
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: 'white', fontWeight: 700, marginBottom: 4 }}>{school.name}</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>📍 {school.city?.name} · ★ {Number(school.rating).toFixed(1)} ({school.review_count} avis)</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Bouton planificateur */}
          <div className="mb-6">
            <AddToPlannerBtn item={{ title: school.name, type: 'decouverte', price: null, description: school.short_desc || school.description, city: school.city?.name || '', slug: school.slug }} />
          </div>
          <p className="text-brun-light leading-relaxed mb-6">{school.description}</p>
          {school.levels?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-display font-bold text-xl text-nuit mb-3">Niveaux proposés</h3>
              <div className="flex flex-wrap gap-2">
                {school.levels.map(l => <span key={l} className="bg-[#1B3A5C]/8 text-[#1B3A5C] text-sm px-3 py-1">{l}</span>)}
              </div>
            </div>
          )}
          {school.facilities?.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-xl text-nuit mb-3">Équipements</h3>
              <div className="grid grid-cols-2 gap-2">
                {school.facilities.map(f => <div key={f} className="flex items-center gap-2 text-sm text-brun-light"><span className="text-vert">✓</span>{f}</div>)}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="bg-white border border-[#1B3A5C]/15 p-5 mb-4">
            <h3 className="font-display font-bold text-lg text-nuit mb-4">Informations</h3>

            {/* Frais */}
            {school.fees_range_min && (
              <div className="text-center py-3 bg-sable mb-4">
                <p className="text-2xl font-bold text-[#1B3A5C]">{school.fees_range_min.toLocaleString()} FCFA</p>
                <p className="text-brun-light text-xs">à {school.fees_range_max?.toLocaleString()} FCFA / an</p>
              </div>
            )}
            {school.bac_rate && (
              <div className="mb-4 text-center">
                <p className="text-3xl font-bold text-vert">{school.bac_rate}%</p>
                <p className="text-xs text-brun-light">Taux de réussite BAC</p>
              </div>
            )}

            {/* Infos contact */}
            <div className="flex flex-col gap-0 text-sm divide-y divide-gray-100 mt-4">
              {school.phone && (
                <div className="flex justify-between py-2">
                  <span className="text-brun-light">📞 Tél.</span>
                  <a href={`tel:${school.phone}`} className="font-semibold text-[#1B3A5C] hover:underline">{school.phone}</a>
                </div>
              )}
              {school.email && (
                <div className="flex justify-between py-2">
                  <span className="text-brun-light">📧 Email</span>
                  <a href={`mailto:${school.email}`} className="font-semibold text-[#1B3A5C] hover:underline text-xs">{school.email}</a>
                </div>
              )}
              {school.website && (
                <div className="flex justify-between py-2">
                  <span className="text-brun-light">🌐 Web</span>
                  <a href={school.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1B3A5C] hover:underline text-xs">Voir le site →</a>
                </div>
              )}
              {school.student_count && (
                <div className="flex justify-between py-2">
                  <span className="text-brun-light">👥 Effectifs</span>
                  <span className="font-semibold text-nuit">{school.student_count.toLocaleString()} élèves</span>
                </div>
              )}
              {school.founded_year && (
                <div className="flex justify-between py-2">
                  <span className="text-brun-light">📅 Fondée</span>
                  <span className="font-semibold text-nuit">en {school.founded_year}</span>
                </div>
              )}
              {school.is_aefe && (
                <div className="flex justify-between py-2">
                  <span className="text-brun-light">🇫🇷 Réseau</span>
                  <span className="font-semibold text-[#1B3A5C]">AEFE homologué</span>
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex flex-col gap-2 mt-5">
              {school.email && (
                <a href={`mailto:${school.email}`} className="block w-full text-center bg-[#1B3A5C] text-white py-2.5 text-sm hover:bg-brun transition-colors">
                  📧 Contacter l'école
                </a>
              )}
              {school.phone && (
                <a href={`tel:${school.phone}`} className="block w-full text-center border border-[#1B3A5C]/20 text-[#1B3A5C] py-2.5 text-sm hover:border-[#1B3A5C] transition-colors">
                  📞 Appeler
                </a>
              )}
              {school.latitude && school.longitude && (
                <a href={`https://www.google.com/maps?q=${school.latitude},${school.longitude}`} target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center border border-[#1B3A5C]/20 text-[#1B3A5C] py-2.5 text-sm hover:border-[#1B3A5C] transition-colors">
                  📍 Voir sur la carte
                </a>
              )}
            </div>
          </div>
          <Link to="/ecoles" className="text-sm text-brun-light hover:text-terracotta transition-colors block text-center">← Autres écoles</Link>
        </div>
      </div>
    </div>
  )
}
