// frontend/src/pages/Guide.jsx
// Page guide d'installation — renvoie vers le contenu complet
import { Link } from 'react-router-dom'

const SECTIONS = [
  { icon: '✈️', title: 'Visa & Entrée',        desc: 'e-Visa, visa à l\'arrivée, permis de résidence', anchor: 'visa' },
  { icon: '🏠', title: 'Logement',              desc: 'Quartiers, prix, agences, conseils location',      anchor: 'logement' },
  { icon: '💰', title: 'Budget & Coût de vie',  desc: 'Budget mensuel, banque, mobile money',             anchor: 'budget' },
  { icon: '🏥', title: 'Santé & Assurance',     desc: 'Vaccins, cliniques, assurance internationale',     anchor: 'sante' },
  { icon: '🛺', title: 'Transport',             desc: 'Zémidjan, Gozem, voiture, trajets interurbains',   anchor: 'transport' },
  { icon: '✅', title: 'Checklist d\'arrivée',  desc: '11 étapes prioritaires après votre installation',  anchor: 'checklist' },
]

export default function Guide() {
  return (
    <div className="min-h-screen bg-sable-light">
      {/* Hero */}
      <div className="relative bg-nuit py-20 px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #C8922A 0%, transparent 50%)' }} />
        <div className="max-w-5xl mx-auto relative">
          <p className="text-or text-xs uppercase tracking-[0.3em] mb-3">Pour expatriés & familles</p>
          <h1 className="font-display font-black text-sable leading-tight mb-4" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}>
            Vivre &<br /><em className="text-or not-italic">s'installer</em><br />au Bénin
          </h1>
          <p className="text-sable/50 text-lg max-w-xl leading-relaxed mb-8">
            Visa, logement, écoles, santé, coût de la vie — le guide complet pour réussir votre installation au Bénin.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link to="#visa" className="bg-or text-nuit px-7 py-3 font-semibold text-sm hover:bg-or-light transition-colors">
              Commencer le guide
            </Link>
            <Link to="/ecoles" className="border border-sable/20 text-sable px-7 py-3 text-sm hover:border-or hover:text-or transition-colors">
              🎓 Trouver une école
            </Link>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="bg-nuit/95 border-b border-or/10 grid grid-cols-2 md:grid-cols-5 max-w-7xl mx-auto">
        {[
          { num: '28°C', label: 'Temp. moy.' },
          { num: '655 F', label: 'Repas local' },
          { num: 'GMT+1', label: 'Fuseau' },
          { num: 'FCFA', label: 'Monnaie' },
          { num: '97%', label: 'Francophones' },
        ].map((s, i) => (
          <div key={i} className="py-5 px-6 text-center border-r border-or/8 last:border-0">
            <p className="font-display font-bold text-2xl text-or">{s.num}</p>
            <p className="text-sable/40 text-xs uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sections du guide */}
      <div className="max-w-5xl mx-auto px-8 py-16">
        <h2 className="font-display font-bold text-3xl text-nuit mb-8 text-center">
          Au programme de ce guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTIONS.map((s, i) => (
            <a key={i} href={`#${s.anchor}`}
              className="group flex gap-4 items-start bg-white border border-or/10 p-5 hover:border-or/40 hover:-translate-y-0.5 transition-all"
            >
              <span className="text-3xl flex-shrink-0">{s.icon}</span>
              <div>
                <p className="font-display font-bold text-nuit group-hover:text-terracotta transition-colors">{s.title}</p>
                <p className="text-sm text-brun-light mt-0.5">{s.desc}</p>
              </div>
              <span className="ml-auto text-or/40 group-hover:text-or transition-colors">→</span>
            </a>
          ))}
        </div>

        {/* Contenu des sections — version condensée */}
        <div className="mt-16 space-y-16">
          {/* Visa */}
          <section id="visa">
            <h2 className="font-display font-bold text-3xl text-nuit mb-2">✈️ Visa & Entrée</h2>
            <div className="w-16 h-1 bg-or mb-6" />
            <p className="text-brun-light leading-relaxed mb-5">Le Bénin a simplifié son entrée avec le visa électronique disponible sur <strong>visa.gouv.bj</strong>. La plupart des nationalités peuvent obtenir un visa en quelques minutes en ligne — traitement en 24–72h, validité 3 mois.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '🌐', t: 'e-Visa en ligne',        d: 'Sur visa.gouv.bj · 50+ nationalités · 50 000 FCFA' },
                { icon: '🛬', t: 'Visa à l\'arrivée',      d: 'Aéroport Cadjehoun · 50 000 FCFA · Passeport 6 mois min.' },
                { icon: '📋', t: 'Long séjour',             d: 'Direction des Étrangers · Dossier + casier judiciaire' },
              ].map((c, i) => (
                <div key={i} className="bg-white border border-or/10 p-4">
                  <p className="text-2xl mb-2">{c.icon}</p>
                  <p className="font-semibold text-nuit text-sm mb-1">{c.t}</p>
                  <p className="text-brun-light text-xs">{c.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Logement */}
          <section id="logement">
            <h2 className="font-display font-bold text-3xl text-nuit mb-2">🏠 Logement</h2>
            <div className="w-16 h-1 bg-or mb-6" />
            <p className="text-brun-light leading-relaxed mb-5">Cotonou concentre l'offre de qualité. Les prix varient du simple au triple selon le quartier. Comptez 2–3 mois pour trouver le bon logement.</p>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-nuit text-sable text-xs uppercase tracking-wider"><th className="p-3 text-left">Type</th><th className="p-3 text-left">Standard</th><th className="p-3 text-left">Résidentiel</th><th className="p-3 text-left">Expatrié</th></tr></thead>
              <tbody>
                {[
                  ['Studio', '80 000 – 120 000 F', '150 000 – 200 000 F', '250 000 – 350 000 F'],
                  ['2 pièces', '120 000 – 180 000 F', '200 000 – 300 000 F', '350 000 – 500 000 F'],
                  ['3–4 pièces', '180 000 – 250 000 F', '300 000 – 450 000 F', '500 000 – 800 000 F'],
                  ['Villa', '250 000 – 400 000 F', '450 000 – 700 000 F', '800 000 – 1 500 000 F'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-or/8 hover:bg-or/3">
                    {row.map((cell, j) => <td key={j} className={`p-3 ${j === 0 ? 'font-medium text-nuit bg-sable' : j === 1 ? 'text-vert font-medium' : j === 3 ? 'text-terracotta font-medium' : 'text-brun-light'}`}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Transport */}
          <section id="transport">
            <h2 className="font-display font-bold text-3xl text-nuit mb-2">🛺 Transport</h2>
            <div className="w-16 h-1 bg-or mb-6" />
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: '🛺', t: 'Zémidjan (Zem)', d: 'Moto-taxi omniprésent. Trajet en ville : 200–500 FCFA. Rapide, négocier avant de monter.' },
                { icon: '📱', t: 'Gozem (app)',      d: 'L\'équivalent béninois d\'Uber. Moto ou voiture. Tarif affiché, plus sûr et confortable.' },
                { icon: '🚗', t: 'Voiture',          d: 'Recommandé pour les familles. Permis français valable 90 jours. Carburant ~700 FCFA/litre.' },
                { icon: '🚌', t: 'Interurbain',      d: 'Bus SOGEBEF entre les villes. Climatisés. Cotonou ↔ Porto-Novo, Abomey, Parakou.' },
              ].map((c, i) => (
                <div key={i} className="bg-white border border-or/10 p-4 flex gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div><p className="font-semibold text-nuit text-sm">{c.t}</p><p className="text-brun-light text-xs mt-0.5">{c.d}</p></div>
                </div>
              ))}
            </div>
          </section>

          {/* Checklist */}
          <section id="checklist">
            <h2 className="font-display font-bold text-3xl text-nuit mb-2">✅ Checklist d'arrivée</h2>
            <div className="w-16 h-1 bg-or mb-6" />
            <div className="flex flex-col">
              {[
                ['Obtenir le visa / e-Visa', 'Sur visa.gouv.bj', 'Avant départ'],
                ['Vaccin fièvre jaune', 'Obligatoire à l\'entrée — 10 jours min. avant', 'Avant départ'],
                ['Acheter une SIM locale (MTN ou Moov)', 'Disponible partout, passeport requis', 'J+1'],
                ['S\'inscrire à l\'ambassade', 'Ariane ou registre des Français', 'J+7'],
                ['Ouvrir un compte bancaire', 'Orabank, UBA, BRS', 'J+15'],
                ['Trouver un logement', 'Bénin Immobilier, Expat.com, Facebook Groups', 'J+30'],
                ['Demander le permis de résidence', 'Direction des Étrangers et des Frontières', 'J+60'],
                ['Inscrire les enfants à l\'école', 'Contacter tôt — délai d\'attente possible', 'J+15'],
              ].map(([label, sub, urgence], i) => {
                const urgColor = urgence === 'Avant départ' ? 'text-terracotta bg-terracotta/10' : urgence === 'J+1' || urgence === 'J+7' || urgence === 'J+15' ? 'text-or bg-or/10' : 'text-vert bg-vert/10'
                return (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-or/8 hover:bg-or/3 px-2 transition-colors">
                    <div className="w-5 h-5 border-2 border-or/30 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-nuit">{label}</p>
                      <p className="text-xs text-brun-light mt-0.5">{sub}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 flex-shrink-0 ${urgColor}`}>{urgence}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
