// frontend/src/pages/Ecotourisme.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'

const EXPERIENCES = [
  {
    id: 'forets', icon: '🌳', title: 'Forêts Sacrées', color: '#2d6a4f',
    bg: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
    tag: 'Spiritualité · Faune',
    certifs: ['🌿 Éco-certifié', '👥 Guide vodun'],
    shortDesc: 'Sanctuaires naturels gardés par les prêtres vodun, refuges de biodiversité',
    longDesc: "Les forêts sacrées du Bénin — comme la Forêt de Kpasse à Ouidah — sont des espaces naturels protégés depuis des siècles par les communautés vodun. Véritables corridors écologiques, elles abritent des espèces végétales et animales rares. Une visite guidée par un prêtre local offre une expérience spirituelle et écologique unique.",
    lieux: ['Forêt de Kpasse (Ouidah)', 'Forêt Sacrée Boukoumbé', 'Bois des Singes (Possotomé)'],
    bonnesChoses: ['Guides vodun certifiés', 'Groupes limités à 8 personnes', 'Aucun déchet laissé sur place'],
    temoignage: { texte: "Une expérience spirituelle incomparable. Le guide nous a expliqué chaque plante, chaque rite.", auteur: 'Sophie K., Paris' },
    price: '5 000 – 15 000 FCFA / personne',
    duration: 'Demi-journée',
    impact: '100% revenus locaux',
  },
  {
    id: 'communautes', icon: '🏘️', title: 'Communautés Locales', color: '#c8922a',
    bg: 'linear-gradient(135deg, #78350f 0%, #c8922a 100%)',
    tag: 'Authentique · Humain',
    certifs: ['🤝 Commerce équitable', '🏡 Hébergement local'],
    shortDesc: "Séjours immersifs chez l'habitant, artisans et pêcheurs — impact direct sur l'économie locale",
    longDesc: "L'éco-tourisme communautaire place les habitants au cœur du voyage. Logez chez des familles de pêcheurs à Grand-Popo, participez aux récoltes avec des agriculteurs bio dans l'Atacora, ou apprenez à tisser avec les artisanes d'Abomey. Chaque franc dépensé reste dans la communauté.",
    lieux: ['Villages de pêcheurs Grand-Popo', 'Communauté Tanéka (Atacora)', 'Coopérative femmes Abomey'],
    bonnesChoses: ["100% des revenus aux familles hôtes", 'Cuisine locale bio', "Apprentissage de l'artisanat"],
    temoignage: { texte: "Dormir chez Marie à Grand-Popo, partager son repas de poisson... le vrai Bénin.", auteur: 'Marc D., Bruxelles' },
    price: '20 000 – 45 000 FCFA / nuit (tout compris)',
    duration: '2-5 jours',
    impact: '0 intermédiaire',
  },
  {
    id: 'randonnees', icon: '🥾', title: 'Randonnées & Trekking', color: '#c4501e',
    bg: 'linear-gradient(135deg, #7f1d1d 0%, #c4501e 100%)',
    tag: 'Activité · Nature',
    certifs: ['🌱 Zéro émission', '⛰️ Guide certifié'],
    shortDesc: "Chaîne de l'Atacora, collines Tanguiéta — randonnées guidées avec porteurs locaux",
    longDesc: "Le nord du Bénin offre des paysages de montagne spectaculaires méconnus du grand public. Les falaises de l'Atacora, les villages perchés des Betammaribé, et les sentiers autour de Tanguiéta se parcourent avec des guides locaux certifiés. Un moyen durable de découvrir des territoires intacts.",
    lieux: ["Chaîne de l'Atacora", 'Falaises de Tangbaro', 'Collines de Natitingou'],
    bonnesChoses: ['Guides et porteurs locaux payés équitablement', 'Pique-nique produits locaux', 'Zéro motorisation'],
    temoignage: { texte: "Trois jours dans les collines, sans réseau, avec des guides extraordinaires. Inoubliable.", auteur: 'Leila B., Montréal' },
    price: '15 000 – 35 000 FCFA / jour',
    duration: '1-5 jours',
    impact: '0 CO₂ motorisé',
  },
  {
    id: 'mangroves', icon: '🚣', title: 'Mangroves & Zones Humides', color: '#1e6091',
    bg: 'linear-gradient(135deg, #0c2a4a 0%, #1e6091 100%)',
    tag: 'Biodiversité · Kayak',
    certifs: ['♻️ Kayak écologique', '🐦 Ornitho certifié'],
    shortDesc: "Kayak dans les mangroves de Grand-Popo, observation des oiseaux, nettoyage participatif",
    longDesc: "Les mangroves du littoral béninois sont des écosystèmes fragiles et précieux. Des associations locales proposent des sorties kayak en groupes restreints, avec observation des oiseaux migrateurs et actions de nettoyage des berges. Une expérience à la fois active et engagée.",
    lieux: ['Mangroves Grand-Popo', 'Lac Nokoué', 'Bouche du Roy'],
    bonnesChoses: ['Kayaks biodégradables', 'Nettoyage participatif inclus', 'Rapport biodiversité remis'],
    temoignage: { texte: "On a ramassé des déchets tout en observant des hérons. Une matinée qui a du sens.", auteur: 'Anna L., Lyon' },
    price: '8 000 – 20 000 FCFA / session',
    duration: '3-6 heures',
    impact: 'Nettoyage inclus',
  },
]

const CHARTE = [
  { icon: '🌍', title: "Minimiser l'empreinte", desc: 'Préférer les transports partagés, éviter le plastique, repartir sans déchets' },
  { icon: '👥', title: 'Soutenir le local', desc: "Acheter directement aux producteurs, dormir chez l'habitant, manger dans les gargotes" },
  { icon: '🙏', title: 'Respecter les cultures', desc: 'Demander avant de photographier, porter des tenues appropriées dans les lieux sacrés' },
  { icon: '🌱', title: 'Contribuer à la conservation', desc: 'Participer aux actions de reforestation, signaler les comportements inappropriés' },
]

const LABELS = [
  { icon: '🌿', label: 'Éco-certifié', desc: 'Charte environnementale stricte', color: '#2d6a4f' },
  { icon: '🤝', label: 'Commerce équitable', desc: '80% min. aux acteurs locaux', color: '#c8922a' },
  { icon: '♻️', label: 'Zéro déchet', desc: 'Collecte et tri systématiques', color: '#1e6091' },
  { icon: '🌍', label: 'Carbone neutre', desc: 'Compensé par reforestation', color: '#c4501e' },
]

const STATS = [
  { num: '4', unit: '', label: 'Expériences uniques' },
  { num: '80', unit: '%', label: 'Revenus locaux min.' },
  { num: '0', unit: 'g', label: 'Déchet laissé' },
  { num: '8', unit: '', label: 'Personnes max / groupe' },
]

export default function Ecotourisme() {
  const [selected, setSelected] = useState(null)
  const [charteOpen, setCharteOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#f0f7f2', fontFamily: 'DM Sans, sans-serif' }}>

      {/* HERO */}
      <div style={{ background: '#0a1f14', padding: '60px 24px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(45,106,79,0.22) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 320, height: 320, background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: 11, color: '#4ade80', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>🌿 Tourisme Responsable</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.2rem,5vw,4rem)', color: '#F5EDD6', fontWeight: 700, marginBottom: 16, lineHeight: 1.15 }}>
            Éco-tourisme &<br /><em style={{ color: '#4ade80', fontStyle: 'normal' }}>Responsabilité</em>
          </h1>
          <p style={{ color: 'rgba(245,237,214,0.55)', maxWidth: 580, lineHeight: 1.7, marginBottom: 32 }}>
            Forêts sacrées gardées depuis des siècles, communautés de pêcheurs, trekking dans l'Atacora — des expériences durables qui préservent le Bénin tout en le découvrant.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#4ade80', fontWeight: 700, margin: 0 }}>
                  {s.num}<span style={{ fontSize: 16 }}>{s.unit}</span>
                </p>
                <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.45)', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Labels de certification */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1a3a28', marginBottom: 6 }}>Nos labels & certifications</h2>
          <p style={{ color: '#4a7c5a', fontSize: 13, marginBottom: 18 }}>Chaque expérience est vérifiée selon 4 critères de durabilité</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {LABELS.map(l => (
              <div key={l.label} style={{ background: 'white', padding: '16px 18px', borderLeft: `4px solid ${l.color}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24 }}>{l.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: l.color, marginBottom: 2 }}>{l.label}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{l.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expériences */}
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1a3a28', marginBottom: 6 }}>Nos expériences durables</h2>
        <p style={{ color: '#4a7c5a', fontSize: 14, marginBottom: 28 }}>Chaque expérience reverse 80% des revenus aux acteurs locaux et suit une charte éco-responsable stricte.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 48 }}>
          {EXPERIENCES.map(exp => (
            <div key={exp.id} onClick={() => setSelected(selected === exp.id ? null : exp.id)}
              style={{ cursor: 'pointer', overflow: 'hidden', border: selected === exp.id ? `2px solid ${exp.color}` : '2px solid transparent', transition: 'all .25s', background: 'white' }}>

              {/* Header gradient */}
              <div style={{ background: exp.bg, padding: '20px 18px 16px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 32 }}>{exp.icon}</span>
                  <span style={{ background: 'rgba(0,0,0,0.3)', color: 'white', padding: '3px 9px', fontSize: 10, letterSpacing: .5 }}>{exp.tag}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', margin: 0, marginBottom: 6 }}>{exp.title}</h3>
                {/* Certifs */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {exp.certifs.map(c => (
                    <span key={c} style={{ fontSize: 10, background: 'rgba(255,255,255,0.15)', color: 'white', padding: '2px 8px', fontWeight: 600 }}>{c}</span>
                  ))}
                </div>
              </div>

              <div style={{ padding: '16px 18px' }}>
                <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, marginBottom: 12 }}>{exp.shortDesc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: exp.color, fontWeight: 700 }}>⏱ {exp.duration}</span>
                  <span style={{ fontSize: 11, background: '#f0f7f2', color: '#2d6a4f', padding: '2px 8px', fontWeight: 700 }}>💚 {exp.impact}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{exp.price}</div>
              </div>

              {selected === exp.id && (
                <div style={{ background: '#f9fafb', borderTop: `2px solid ${exp.color}`, padding: 18 }}>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, marginBottom: 14 }}>{exp.longDesc}</p>

                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: exp.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Lieux</p>
                    {exp.lieux.map(l => (
                      <div key={l} style={{ fontSize: 12, color: '#4b5563', padding: '3px 0', borderBottom: '1px solid #e5e7eb' }}>📍 {l}</div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: exp.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Nos engagements</p>
                    {exp.bonnesChoses.map(b => (
                      <div key={b} style={{ fontSize: 12, color: '#4b5563', padding: '2px 0' }}>✅ {b}</div>
                    ))}
                  </div>

                  {/* Témoignage */}
                  <div style={{ background: 'white', border: `1px solid ${exp.color}25`, padding: '12px 14px', marginBottom: 14 }}>
                    <p style={{ fontSize: 12, color: '#374151', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                      "{exp.temoignage.texte}"
                    </p>
                    <p style={{ fontSize: 11, color: exp.color, fontWeight: 700, margin: '6px 0 0' }}>— {exp.temoignage.auteur}</p>
                  </div>

                  <Link to="/planifier"
                    style={{ display: 'inline-block', background: exp.color, color: 'white', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                    Ajouter à mon voyage →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Zones & saisons */}
        <div style={{ background: 'white', border: '1px solid #d1fae5', padding: '28px 24px', marginBottom: 40 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#1a3a28', marginBottom: 16 }}>
            🗺️ Zones éco-touristiques du Bénin
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {[
              { zone: 'Littoral (Grand-Popo, Ouidah)', exps: ['Mangroves', 'Forêts sacrées', 'Villages pêcheurs'], season: 'Nov – Mars', color: '#1e6091' },
              { zone: "Atacora (Natitingou, Tanguiéta)", exps: ['Trekking', 'Tata Somba', 'Communautés Betammaribé'], season: 'Oct – Fév', color: '#c4501e' },
              { zone: 'Mono & Couffo (Abomey)', exps: ['Artisanat', 'Rivière Mono', 'Coopératives'], season: "Toute l'année", color: '#c8922a' },
              { zone: 'Pendjari & W (extrême nord)', exps: ['Safari faune', 'Brousse', 'Bivouac'], season: 'Nov – Avr', color: '#2d6a4f' },
            ].map(z => (
              <div key={z.zone} style={{ padding: '14px 16px', borderLeft: `3px solid ${z.color}`, background: '#fafafa' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a28', marginBottom: 6 }}>{z.zone}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {z.exps.map(e => (
                    <span key={e} style={{ fontSize: 10, background: `${z.color}15`, color: z.color, padding: '2px 6px', fontWeight: 600 }}>{e}</span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>📅 Meilleure période : {z.season}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charte */}
        <div style={{ background: '#0a1f14', padding: 40, marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#F5EDD6', margin: 0 }}>
                Notre Charte du Voyageur Responsable
              </h3>
              <p style={{ color: 'rgba(245,237,214,0.4)', fontSize: 13, marginTop: 4 }}>4 principes pour voyager bien au Bénin</p>
            </div>
            <button onClick={() => setCharteOpen(!charteOpen)}
              style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', padding: '9px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {charteOpen ? 'Réduire' : '📥 Télécharger la charte'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {CHARTE.map(c => (
              <div key={c.title} style={{ background: 'rgba(255,255,255,0.05)', padding: 20, borderTop: '2px solid #4ade80' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                <h4 style={{ color: '#4ade80', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{c.title}</h4>
                <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: 12, lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Link to="/itineraires" style={{ background: '#2d6a4f', color: 'white', padding: '14px 32px', textDecoration: 'none', fontWeight: 700, fontSize: 14, marginRight: 12 }}>
            🗺️ Voir les itinéraires éco
          </Link>
          <Link to="/partenaires" style={{ border: '1px solid #2d6a4f', color: '#2d6a4f', padding: '14px 32px', textDecoration: 'none', fontSize: 14 }}>
            🤝 Nos partenaires locaux
          </Link>
        </div>

      </div>
    </div>
  )
}
