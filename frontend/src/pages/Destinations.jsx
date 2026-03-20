// frontend/src/pages/Destinations.jsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePlaces } from '@/hooks/index'
import PlaceCard from '@/components/ui/PlaceCard'
import FilterBar from '@/components/ui/FilterBar'
import PageLoader from '@/components/ui/PageLoader'

const TYPE_FILTERS = [
  { value: 'all',          label: 'Tous',           icon: '🌍' },
  { value: 'culture',      label: 'Culture',        icon: '🏛️' },
  { value: 'nature',       label: 'Nature',         icon: '🌿' },
  { value: 'plage',        label: 'Plages',         icon: '🏖️' },
  { value: 'safari',       label: 'Safari',         icon: '🦁' },
  { value: 'religieux',    label: 'Religieux',      icon: '🛕' },
  { value: 'divertissement',label: 'Loisirs',       icon: '🎭' },
]

const CITY_FILTERS = [
  { value: 'all',         label: 'Toutes les villes' },
  { value: 'cotonou',     label: 'Cotonou' },
  { value: 'porto-novo',  label: 'Porto-Novo' },
  { value: 'ouidah',      label: 'Ouidah' },
  { value: 'abomey',      label: 'Abomey' },
  { value: 'grand-popo',  label: 'Grand-Popo' },
  { value: 'natitingou',  label: 'Natitingou' },
  { value: 'tanguieta',   label: 'Tanguiéta' },
]

const SORT_OPTIONS = [
  { value: 'rating',  label: 'Mieux notés' },
  { value: 'reviews', label: 'Plus d\'avis' },
  { value: 'recent',  label: 'Récents' },
]

export default function Destinations() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [type,   setType]   = useState(searchParams.get('type')   || 'all')
  const [city,   setCity]   = useState(searchParams.get('city')   || 'all')
  const [sort,   setSort]   = useState('rating')
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)
  const [view,   setView]   = useState('grid') // 'grid' | 'list'
  const [unesco, setUnesco] = useState(false)

  // Sync URL params
  useEffect(() => {
    const params = {}
    if (type !== 'all') params.type = type
    if (city !== 'all') params.city = city
    setSearchParams(params, { replace: true })
    setPage(1)
  }, [type, city])

  const queryParams = {
    page,
    limit: view === 'grid' ? 12 : 15,
    sort,
    ...(type  !== 'all' && { type }),
    ...(city  !== 'all' && { city }),
    ...(search           && { search }),
    ...(unesco           && { unesco: true }),
  }

  const { data, isLoading, isFetching } = usePlaces(queryParams)
  const places     = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="min-h-screen bg-sable-light">

      {/* ── HEADER PAGE ── */}
      <div className="bg-nuit py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-or text-xs uppercase tracking-[0.3em] mb-3">Bénin · Découverte</p>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-sable">
            Destinations &<br /><em className="text-or">Sites à visiter</em>
          </h1>
          <p className="text-sable/50 mt-4 max-w-xl leading-relaxed text-sm md:text-base">
            Sites UNESCO, parcs naturels, plages et lieux sacrés — découvrez les merveilles du Bénin.
          </p>

          {/* Barre de recherche */}
          <div className="flex mt-6 max-w-lg">
            <input
              type="text"
              placeholder="Rechercher un lieu, une ville, un tag..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 bg-white/8 border border-or/20 text-sable placeholder:text-sable/30 px-5 py-3 text-sm outline-none focus:border-or/50 transition-colors"
            />
            <button className="bg-or text-nuit px-5 py-3 text-sm font-semibold hover:bg-or-light transition-colors">
              🔍
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* ── FILTRES ── */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Types */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setType(f.value); setPage(1) }}
                className={`px-4 py-2 text-sm font-medium border whitespace-nowrap transition-all flex-shrink-0 ${
                  type === f.value
                    ? 'bg-or text-nuit border-or'
                    : 'bg-white text-brun border-or/15 hover:border-or/50 hover:text-terracotta'
                }`}
              >
                <span className="mr-1.5">{f.icon}</span>{f.label}
              </button>
            ))}
          </div>

          {/* Ligne 2 : villes + options + vue */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {/* Ville */}
              <select
                value={city}
                onChange={e => { setCity(e.target.value); setPage(1) }}
                className="bg-white border border-or/15 text-brun text-sm px-3 py-2 outline-none hover:border-or/40 transition-colors cursor-pointer"
              >
                {CITY_FILTERS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>

              {/* Tri */}
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-white border border-or/15 text-brun text-sm px-3 py-2 outline-none hover:border-or/40 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* UNESCO toggle */}
              <button
                onClick={() => setUnesco(!unesco)}
                className={`px-4 py-2 text-sm border transition-all ${
                  unesco ? 'bg-nuit text-or border-nuit' : 'bg-white text-brun border-or/15 hover:border-or/40'
                }`}
              >
                🏛️ UNESCO seulement
              </button>
            </div>

            {/* Vue */}
            <div className="flex border border-or/15">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-2 text-sm transition-colors ${view === 'grid' ? 'bg-or text-nuit' : 'bg-white text-brun hover:bg-sable'}`}
              >
                ⊞
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-2 text-sm transition-colors border-l border-or/15 ${view === 'list' ? 'bg-or text-nuit' : 'bg-white text-brun hover:bg-sable'}`}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* ── RÉSULTATS COUNT ── */}
        <div className="flex justify-between items-center mb-5">
          <p className="text-sm text-brun-light">
            {isFetching ? 'Chargement...' : (
              pagination ? `${pagination.total} lieu${pagination.total > 1 ? 'x' : ''} trouvé${pagination.total > 1 ? 's' : ''}` : ''
            )}
          </p>
          {pagination && pagination.pages > 1 && (
            <p className="text-sm text-brun-light">Page {page} / {pagination.pages}</p>
          )}
        </div>

        {/* ── GRILLE / LISTE ── */}
        {isLoading ? (
          <PageLoader />
        ) : places.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🗺️</p>
            <p className="text-brun-light text-lg">Aucun lieu trouvé</p>
            <button
              onClick={() => { setType('all'); setCity('all'); setSearch(''); setUnesco(false) }}
              className="mt-4 text-sm text-terracotta border-b border-terracotta/30 hover:border-terracotta"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {places.map((place, i) => (
              <div key={place.id} style={{ animation: `fadeUp 0.5s ${i * 40}ms ease both` }}>
                <PlaceCard item={place} type="place" variant="grid" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {places.map((place, i) => (
              <div key={place.id} style={{ animation: `fadeUp 0.4s ${i * 30}ms ease both` }}>
                <PlaceCard item={place} type="place" variant="list" />
              </div>
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-or/15 text-sm text-brun disabled:opacity-40 hover:border-or transition-colors"
            >
              ← Précédent
            </button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i
              if (p < 1 || p > pagination.pages) return null
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 text-sm border transition-colors ${
                    p === page ? 'bg-or text-nuit border-or font-bold' : 'border-or/15 text-brun hover:border-or'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 border border-or/15 text-sm text-brun disabled:opacity-40 hover:border-or transition-colors"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        .scrollbar-hide::-webkit-scrollbar { display: none }
      `}</style>
    </div>
  )
}
