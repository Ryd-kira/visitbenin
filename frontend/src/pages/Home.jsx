// frontend/src/pages/Home.jsx
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useFeaturedPlaces } from '@/hooks/index'
import PlaceCard from '@/components/ui/PlaceCard'
import PageLoader from '@/components/ui/PageLoader'

const HERO_SLIDES = [
  { img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=90', label: 'Ganvié · La Venise Africaine', city: 'Lac Nokoué' },
  { img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=90', label: 'Parc de la Pendjari', city: 'Atacora' },
  { img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=90', label: 'Plage de Grand-Popo', city: 'Mono' },
  { img: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=1600&q=90', label: "Palais d'Abomey", city: 'Zou' },
]

const STATS = [
  { num: '3',   label: 'Sites UNESCO', icon: '🏛️' },
  { num: '12',  label: 'Départements', icon: '🗺️' },
  { num: '28°', label: 'Temp. moy.', icon: '☀️' },
  { num: '97%', label: 'Francophones', icon: '🇧🇯' },
]

const CATEGORIES = [
  { label: 'Culture & Histoire', icon: '🏛️', type: 'culture',  count: 87,  color: 'from-terracotta/80', img: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=600&q=80' },
  { label: 'Nature & Safaris',   icon: '🌿', type: 'nature',   count: 45,  color: 'from-vert/80',       img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80' },
  { label: 'Plages',             icon: '🏖️', type: 'plage',    count: 18,  color: 'from-blue-600/80',   img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
  { label: 'Gastronomie',        icon: '🍽️', type: 'resto',    count: 320, color: 'from-or/80',         img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80' },
  { label: 'Écoles',             icon: '🎓', type: 'ecole',    count: 152, color: 'from-blue-800/80',   img: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&q=80' },
  { label: 'S\'installer',       icon: '🏠', type: 'guide',    count: null, color: 'from-brun/80',      img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80' },
]

const CAT_ROUTES = {
  culture: '/destinations?type=culture',
  nature:  '/destinations?type=nature',
  plage:   '/destinations?type=plage',
  resto:   '/gastronomie',
  ecole:   '/ecoles',
  guide:   '/sinstaller',
}

// Hook simple pour l'animation au scroll
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity = 1; el.style.transform = 'translateY(0)'; obs.unobserve(el) }
    }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

export default function Home() {
  const { t } = useTranslation()
  const [slide, setSlide] = useState(0)
  const { data: featured, isLoading } = useFeaturedPlaces()

  // Auto-slide hero
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const s1 = useReveal(), s2 = useReveal(), s3 = useReveal(), s4 = useReveal()

  return (
    <div className="bg-sable-light">

      {/* ═══ HERO ═══ */}
      <section className="relative h-[92vh] overflow-hidden">
        {/* Images slideshow */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === slide ? 1 : 0 }}
          >
            <img
              src={s.img}
              alt={s.label}
              className="w-full h-full object-cover"
              style={{ animation: i === slide ? 'slowZoom 8s ease-in-out forwards' : 'none' }}
            />
          </div>
        ))}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-nuit/85 via-nuit/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-nuit/60 via-transparent to-transparent" />

        {/* Contenu hero */}
        <div className="absolute inset-0 flex flex-col justify-end pb-24 px-8 md:px-16 max-w-5xl">
          <div style={{ animation: 'fadeUp 0.7s 0.1s ease both', opacity: 0 }}>
            <p className="text-or text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
              <span className="inline-block w-10 h-px bg-or" />
              {t('home.hero_eyebrow')}
            </p>
          </div>
          <h1
            className="font-display font-black text-sable leading-[0.92] mb-6"
            style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', animation: 'fadeUp 0.7s 0.2s ease both', opacity: 0 }}
          >
            {t('home.hero_title')}<br />
            <em className="text-or not-italic">{t('home.hero_title_accent')}</em>
          </h1>
          <p
            className="text-sable/60 text-lg max-w-lg leading-relaxed mb-8 font-light"
            style={{ animation: 'fadeUp 0.7s 0.35s ease both', opacity: 0 }}
          >
            {t('home.hero_subtitle')}
          </p>
          <div
            className="flex gap-3 flex-wrap"
            style={{ animation: 'fadeUp 0.7s 0.5s ease both', opacity: 0 }}
          >
            <Link to="/destinations" className="bg-or text-nuit px-7 py-3 font-semibold text-sm hover:bg-or-light transition-colors">
              {t('home.hero_cta_explore')}
            </Link>
            <Link to="/carte" className="border border-sable/30 text-sable px-7 py-3 text-sm hover:border-or hover:text-or transition-colors">
              🗺️ {t('map.title')}
            </Link>
            <Link to="/sinstaller" className="border border-sable/30 text-sable px-7 py-3 text-sm hover:border-or hover:text-or transition-colors">
              {t('nav.install')}
            </Link>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 right-10 flex gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="transition-all"
            >
              <div className={`h-0.5 transition-all duration-500 ${i === slide ? 'w-8 bg-or' : 'w-3 bg-sable/30 hover:bg-sable/60'}`} />
              {i === slide && <p className="text-sable/50 text-xs mt-1 whitespace-nowrap">{s.city}</p>}
            </button>
          ))}
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <div className="bg-nuit border-b border-or/10">
        <div className="max-w-7xl mx-auto grid grid-cols-4">
          {STATS.map((s, i) => (
            <div key={i} className="py-6 px-8 text-center border-r border-or/8 last:border-0">
              <div className="text-2xl mb-0.5">{s.icon}</div>
              <div className="font-display text-3xl font-bold text-or">{s.num}</div>
              <div className="text-sable/40 text-xs uppercase tracking-widest mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CATÉGORIES ═══ */}
      <section
        ref={s1}
        className="py-20 px-8 max-w-7xl mx-auto"
        style={{ opacity: 0, transform: 'translateY(30px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}
      >
        <div className="text-center mb-12">
          <p className="text-or text-xs uppercase tracking-[0.3em] mb-3">Explorer par thème</p>
          <h2 className="font-display font-bold text-4xl text-nuit">Qu'est-ce qui vous attire <em className="text-terracotta">au Bénin ?</em></h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              to={CAT_ROUTES[cat.type]}
              className="group relative overflow-hidden h-44 block"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <img
                src={cat.img}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent`} />
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <div className="text-2xl mb-1">{cat.icon}</div>
                <h3 className="text-white font-display font-bold text-lg leading-tight">{cat.label}</h3>
                {cat.count && <p className="text-white/60 text-xs mt-0.5">{cat.count} {cat.type === 'ecole' ? 'établissements' : 'adresses'}</p>}
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-or/50 transition-colors pointer-events-none" />
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ FEATURED PLACES ═══ */}
      <section
        ref={s2}
        className="py-20 bg-nuit"
        style={{ opacity: 0, transform: 'translateY(30px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-or text-xs uppercase tracking-[0.3em] mb-3">{t('home.section_featured')}</p>
              <h2 className="font-display font-bold text-4xl text-sable">
                {t('home.section_featured_sub').split(' ').slice(0, 3).join(' ')}<br />
                <em className="text-or">{t('home.section_featured_sub').split(' ').slice(3).join(' ')}</em>
              </h2>
            </div>
            <Link to="/destinations" className="text-sable/50 text-sm hover:text-or transition-colors border-b border-sable/20 hover:border-or pb-0.5">
              {t('common.see_all')} →
            </Link>
          </div>

          {isLoading ? (
            <PageLoader />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(featured || []).slice(0, 6).map((place, i) => (
                <div
                  key={place.id}
                  style={{ animationDelay: `${i * 100}ms`, animation: 'fadeUp 0.6s ease both' }}
                >
                  <FeaturedCard place={place} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ HIGHLIGHT OUIDAH ═══ */}
      <section
        ref={s3}
        className="grid md:grid-cols-2 min-h-96"
        style={{ opacity: 0, transform: 'translateY(30px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}
      >
        <div className="relative overflow-hidden min-h-64">
          <img
            src="https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=900&q=85"
            alt="Ouidah"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-nuit/80 to-transparent" />
        </div>
        <div className="bg-nuit flex flex-col justify-center px-12 py-16">
          <p className="text-or text-xs uppercase tracking-[0.3em] mb-4">Destination phare</p>
          <h2 className="font-display font-bold text-4xl text-sable mb-4 leading-tight">
            Ouidah,<br /><em className="text-or">berceau du Vodun</em>
          </h2>
          <p className="text-sable/50 leading-relaxed mb-6 font-light">
            Route des Esclaves, Temple des Pythons, Forêt Sacrée de Kpassè et Festival Vodun International chaque 10 janvier — Ouidah concentre l'essence spirituelle et historique du Bénin.
          </p>
          <div className="flex gap-3">
            <Link to="/destinations?city=ouidah" className="bg-or text-nuit px-6 py-2.5 text-sm font-semibold hover:bg-or-light transition-colors">
              Explorer Ouidah
            </Link>
            <Link to="/destinations?city=ouidah&type=culture" className="border border-or/30 text-sable/60 px-6 py-2.5 text-sm hover:border-or hover:text-or transition-colors">
              Sites UNESCO
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ S'INSTALLER BAND ═══ */}
      <section
        ref={s4}
        className="py-16 bg-sable-light border-y border-or/12"
        style={{ opacity: 0, transform: 'translateY(30px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div>
              <p className="text-or text-xs uppercase tracking-[0.3em] mb-3">Pour les expatriés & familles</p>
              <h2 className="font-display font-bold text-3xl text-nuit">
                Vous vous installez<br /><em className="text-terracotta">au Bénin ?</em>
              </h2>
              <p className="text-brun-light mt-3 max-w-xl leading-relaxed">
                Visa, logement, écoles, santé, budget — tout ce qu'il faut savoir pour réussir votre installation.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link to="/sinstaller" className="bg-nuit text-sable px-7 py-3 font-semibold text-sm hover:bg-brun transition-colors">
                Guide d'installation
              </Link>
              <Link to="/ecoles" className="border border-nuit/20 text-nuit px-7 py-3 text-sm hover:border-or transition-colors">
                🎓 Trouver une école
              </Link>
            </div>
          </div>

          {/* Mini checklist */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
            {[
              { icon: '✈️', label: 'e-Visa en ligne', sub: 'visa.gouv.bj' },
              { icon: '🏠', label: 'Logement', sub: 'Dès 120 000 F/mois' },
              { icon: '🎓', label: 'Écoles françaises', sub: 'AEFE disponible' },
              { icon: '🏥', label: 'Santé', sub: 'Assurance recommandée' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-or/10 p-4 flex gap-3 items-start">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-nuit">{item.label}</p>
                  <p className="text-xs text-brun-light mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3 NOUVELLES SECTIONS ═══ */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-or uppercase tracking-[0.3em] text-center mb-2">Tout pour préparer votre voyage</p>
          <h2 className="font-display font-bold text-3xl text-nuit text-center mb-10">Voyagez mieux au Bénin</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { to:'/itineraires', icon:'🗺️', title:'Itinéraires sur mesure', desc:'Aventure, culture, famille ou éco — des itinéraires clé en main adaptés à votre profil, avec Ganvié, Pendjari et les sites UNESCO.', color:'#C8922A', cta:'Choisir mon itinéraire' },
              { to:'/ecotourisme', icon:'🌿', title:'Éco-tourisme & Responsabilité', desc:"Forêts sacrées, communautés de pêcheurs, randonnées dans l'Atacora — des expériences durables qui préservent le Bénin.", color:'#2d6a4f', cta:'Voyager responsable' },
              { to:'/infos-pratiques', icon:'📋', title:'Infos pratiques', desc:'e-Visa en ligne, FAQ complète, vaccins, transport, budget — tous vos préparatifs simplifiés avec nos guides PDF téléchargeables.', color:'#C4501E', cta:'Préparer mon voyage' },
            ].map(card => (
              <Link key={card.to} to={card.to} style={{ textDecoration:'none' }}
                className="group block border border-gray-100 hover:border-or/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg overflow-hidden">
                <div style={{ background: card.color, padding: '20px 24px' }}>
                  <span style={{ fontSize: 36 }}>{card.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-display font-bold text-nuit text-xl mb-3 group-hover:text-or transition-colors">{card.title}</h3>
                  <p className="text-nuit/50 text-sm leading-relaxed mb-4">{card.desc}</p>
                  <span style={{ color: card.color, fontSize: 13, fontWeight: 700 }}>{card.cta} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NOUVELLES FONCTIONNALITÉS ═══ */}
      <section className="py-16 bg-nuit">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-or text-xs uppercase tracking-[0.3em] mb-3 text-center">Tout pour votre voyage</p>
          <h2 className="font-display font-bold text-3xl text-sable text-center mb-2">
            Planifiez en toute sérénité
          </h2>
          <p className="text-sable/40 text-center mb-10 max-w-xl mx-auto">
            Des outils conçus pour voyager au Bénin sans stress — de la préparation jusqu'au retour.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { to: '/itineraires', icon: '🗺️', title: 'Itinéraires sur mesure', desc: 'Aventure, culture, famille ou éco-tourisme — des circuits pensés pour votre profil avec Ganvié, la Pendjari et bien plus.', cta: 'Choisir mon itinéraire', accent: '#C8922A' },
              { to: '/ecotourisme', icon: '🌿', title: 'Éco-tourisme responsable', desc: 'Forêts sacrées vodun, communautés de pêcheurs, randonnées Atacora — un tourisme qui respecte et enrichit le Bénin.', cta: 'Découvrir les expériences', accent: '#3A6B47' },
              { to: '/infos-pratiques', icon: '📋', title: 'Infos pratiques & e-Visa', desc: 'e-Visa en 72h, FAQ complète, guides PDF téléchargeables, vaccins, budget, contacts d\'urgence — tout avant de partir.', cta: 'Préparer mon voyage', accent: '#C4501E' },
            ].map((item, i) => (
              <Link key={i} to={item.to} style={{ textDecoration: 'none' }}>
                <div className="border border-sable/10 p-7 hover:border-or/40 transition-colors group" style={{ background: 'rgba(245,237,214,0.03)' }}>
                  <span className="text-4xl block mb-4">{item.icon}</span>
                  <h3 className="font-semibold text-sable text-lg mb-3 group-hover:text-or transition-colors">{item.title}</h3>
                  <p className="text-sable/40 text-sm leading-relaxed mb-5">{item.desc}</p>
                  <span style={{ color: item.accent, fontSize: 13, fontWeight: 600 }}>{item.cta} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER MINI CTA ═══ */}
      <div className="bg-terracotta text-white py-14 px-8 text-center">
        <h2 className="font-display font-bold text-3xl mb-3">
          {t('home.cta_banner')}
        </h2>
        <p className="opacity-75 mb-6 max-w-lg mx-auto">{t('home.cta_banner_sub')}</p>
        <Link to="/inscription" className="inline-block bg-white text-terracotta px-8 py-3 font-bold text-sm hover:bg-sable transition-colors">
          {t('home.cta_free')}
        </Link>
      </div>

      <style>{`
        @keyframes slowZoom { from { transform: scale(1) } to { transform: scale(1.06) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}

// Card adaptée au fond sombre
function FeaturedCard({ place }) {
  const TYPE_LABELS = { culture: 'Culture', nature: 'Nature', plage: 'Plage', safari: 'Safari', religieux: 'Religieux' }
  return (
    <Link
      to={`/destinations/${place.slug}`}
      className="group block bg-white/5 border border-white/8 hover:border-or/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={place.cover_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600'}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
        />
        {place.is_featured && (
          <span className="absolute top-3 left-3 bg-or text-nuit text-xs font-semibold px-2 py-0.5">Top</span>
        )}
        {place.is_unesco && (
          <span className="absolute top-3 right-3 bg-nuit/80 text-sable text-xs px-2 py-0.5 backdrop-blur-sm">UNESCO</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-widest text-or mb-1">{place.city?.name} · {TYPE_LABELS[place.type] || place.type}</p>
        <h3 className="font-display font-bold text-sable text-lg leading-tight group-hover:text-or transition-colors">{place.name}</h3>
        <p className="text-sable/40 text-sm mt-1.5 line-clamp-2">{place.short_desc}</p>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-or text-sm">{'★'.repeat(Math.round(place.rating))}</span>
          <span className="text-sable font-semibold text-sm">{Number(place.rating).toFixed(1)}</span>
          <span className="text-sable/30 text-xs">({place.review_count?.toLocaleString()})</span>
        </div>
      </div>
    </Link>
  )
}
