// frontend/src/pages/SchoolDetail.jsx
import { useParams, Link } from 'react-router-dom'
import { useSchool } from '@/hooks/index'
import PageLoader from '@/components/ui/PageLoader'
import AddToPlannerBtn from '@/components/ui/AddToPlannerBtn'

export default function SchoolDetail() {
  const { slug } = useParams()
  const { data: school, isLoading } = useSchool(slug)
  if (isLoading) return <PageLoader />
  if (!school) return <div className="text-center py-24"><Link to="/ecoles" className="text-terracotta text-sm">← Retour aux écoles</Link></div>

  return (
    <div className="min-h-screen bg-sable-light">
      <div className="bg-[#1B3A5C] py-14 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 mb-4">
            <span className="bg-white/10 text-sable text-xs px-3 py-1">{school.school_type}</span>
            {school.is_aefe && <span className="bg-or text-nuit text-xs px-3 py-1 font-semibold">AEFE</span>}
          </div>
          <h1 className="font-display font-bold text-4xl text-sable">{school.name}</h1>
          <p className="text-sable/60 mt-2">📍 {school.city?.name} · ★ {Number(school.rating).toFixed(1)} ({school.review_count} avis)</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <h3 className="font-display font-bold text-lg text-nuit mb-4">Frais de scolarité</h3>
            {school.fees_range_min && (
              <div className="text-center py-3 bg-sable rounded">
                <p className="text-2xl font-bold text-[#1B3A5C]">{school.fees_range_min.toLocaleString()} F</p>
                <p className="text-brun-light text-xs">à {school.fees_range_max?.toLocaleString()} F / an</p>
              </div>
            )}
            {school.bac_rate && (
              <div className="mt-3 text-center">
                <p className="text-3xl font-bold text-vert">{school.bac_rate}%</p>
                <p className="text-xs text-brun-light">Taux de réussite BAC</p>
              </div>
            )}
            {school.email && <a href={`mailto:${school.email}`} className="block w-full text-center bg-[#1B3A5C] text-white py-2.5 text-sm mt-4 hover:bg-brun transition-colors">Contacter l'école</a>}
          </div>
          <Link to="/ecoles" className="text-sm text-brun-light hover:text-terracotta transition-colors block text-center">← Autres écoles</Link>
        </div>
      </div>
    </div>
  )
}
