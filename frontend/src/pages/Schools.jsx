// frontend/src/pages/Schools.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSchools } from '@/hooks/index'
import PageLoader from '@/components/ui/PageLoader'

export default function Schools() {
  const { t } = useTranslation()
  const [type, setType] = useState('all')
  const [aefe, setAefe] = useState(false)
  const [page, setPage] = useState(1)
  const { data, isLoading } = useSchools({ page, limit: 12, ...(type !== 'all' && { school_type: type }), ...(aefe && { is_aefe: true }) })
  const schools = data?.data || []

  const types = [
    { value: 'all',          label: t('schools.filter_all') },
    { value: 'maternelle', label: 'Maternelle' },
    { value: 'primaire',   label: t('schools.level_primary') },
    { value: 'college',    label: 'Collège' },
    { value: 'lycee',      label: t('schools.level_secondary') },
    { value: 'universite', label: t('schools.level_university') },
  ]

  return (
    <div className="min-h-screen bg-sable-light">
      <div className="bg-[#1B3A5C] py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-or text-xs uppercase tracking-[0.3em] mb-3">{t('schools.subtitle')}</p>
          <h1 className="font-display font-bold text-5xl text-sable">{t('schools.title')}<br /><em className="text-or">Bénin</em></h1>
          <p className="text-sable/50 mt-3 max-w-lg">Maternelle, primaire, lycée, université — les établissements scolaires répertoriés au Bénin.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex gap-2 mb-3 flex-wrap">
          {types.map(t => (
            <button key={t.value} onClick={() => { setType(t.value); setPage(1) }}
              className={`px-4 py-2 text-sm border transition-all ${type === t.value ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]' : 'bg-white text-brun border-or/15 hover:border-[#1B3A5C]/40'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setAefe(!aefe)} className={`mb-6 px-4 py-2 text-sm border transition-all ${aefe ? 'bg-or text-nuit border-or' : 'bg-white text-brun border-or/15 hover:border-or/50'}`}>
          🇫🇷 AEFE / Homologuées seulement
        </button>

        {isLoading ? <PageLoader /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((s, i) => (
              <Link key={s.id} to={`/ecoles/${s.slug}`} style={{ animation: `fadeUp 0.5s ${i*40}ms ease both` }}
                className="group bg-white border border-[#1B3A5C]/10 hover:border-or/40 hover:-translate-y-1 transition-all p-5">
                {s.cover_image && <img src={s.cover_image} alt={s.name} className="w-full h-36 object-cover mb-4 brightness-90 group-hover:brightness-100 transition-all" />}
                <div className="flex gap-2 mb-2">
                  <span className="bg-[#1B3A5C]/10 text-[#1B3A5C] text-xs px-2 py-0.5">{s.school_type}</span>
                  {s.is_aefe && <span className="bg-or/10 text-or-dark text-xs px-2 py-0.5">AEFE</span>}
                </div>
                <h3 className="font-display font-bold text-nuit text-lg leading-tight group-hover:text-terracotta transition-colors">{s.name}</h3>
                <p className="text-brun-light text-sm mt-1">📍 {s.city?.name}</p>
                {s.fees_range_min && <p className="text-or text-sm font-semibold mt-2">À partir de {s.fees_range_min.toLocaleString()} F/an</p>}
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-or text-sm">★</span>
                  <span className="text-sm font-semibold">{Number(s.rating).toFixed(1)}</span>
                  <span className="text-brun-light text-xs">({s.review_count})</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }`}</style>
    </div>
  )
}
