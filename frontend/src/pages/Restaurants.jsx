// frontend/src/pages/Restaurants.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRestaurants } from '@/hooks/index'
import PlaceCard from '@/components/ui/PlaceCard'
import PageLoader from '@/components/ui/PageLoader'

export default function Restaurants() {
  const { t } = useTranslation()
  const [price, setPrice] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const PRICE_FILTERS = [
    { value: 'all',    label: t('common.all'),               icon: '💰' },
    { value: 'low',    label: t('restaurants.price_low'),    icon: '€' },
    { value: 'medium', label: t('restaurants.price_medium'), icon: '€€' },
    { value: 'high',   label: t('restaurants.price_high'),   icon: '€€€' },
  ]

  const { data, isLoading } = useRestaurants({
    page, limit: 12,
    ...(price !== 'all' && { price_range: price }),
    ...(search && { search }),
  })
  const restos = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="min-h-screen bg-sable-light">
      <div className="bg-nuit py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-or text-xs uppercase tracking-[0.3em] mb-3">{t('restaurants.subtitle')}</p>
          <h1 className="font-display font-bold text-5xl text-sable">
            {t('restaurants.title')}<br /><em className="text-or">béninoise</em>
          </h1>
          <p className="text-sable/50 mt-3 max-w-lg">Maquis locaux, restaurants gastronomiques, bars de plage — les meilleures adresses du Bénin sélectionnées.</p>
          <div className="flex mt-5 max-w-md">
            <input
              type="text" placeholder={t('restaurants.search_placeholder')}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 bg-white/8 border border-or/20 text-sable placeholder:text-sable/30 px-4 py-3 text-sm outline-none focus:border-or/40"
            />
            <button className="bg-or text-nuit px-5 py-3 text-sm">🔍</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {PRICE_FILTERS.map(f => (
            <button key={f.value} onClick={() => { setPrice(f.value); setPage(1) }}
              className={`px-4 py-2 text-sm font-medium border whitespace-nowrap flex-shrink-0 transition-all ${price === f.value ? 'bg-or text-nuit border-or' : 'bg-white text-brun border-or/15 hover:border-or/50'}`}>
              <span className="mr-1">{f.icon}</span>{f.label}
            </button>
          ))}
        </div>

        {isLoading ? <PageLoader /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {restos.map((r, i) => (
              <div key={r.id} style={{ animation: `fadeUp 0.5s ${i * 40}ms ease both` }}>
                <PlaceCard item={r} type="restaurant" />
              </div>
            ))}
          </div>
        )}

        {pagination?.pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-4 py-2 border border-or/15 text-sm disabled:opacity-40 hover:border-or">← Précédent</button>
            <span className="px-4 py-2 bg-or text-nuit text-sm font-bold">{page}</span>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p+1))} disabled={page===pagination.pages} className="px-4 py-2 border border-or/15 text-sm disabled:opacity-40 hover:border-or">Suivant →</button>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }`}</style>
    </div>
  )
}
