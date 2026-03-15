// frontend/src/pages/InfosPratiques.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'

const FAQ = [
  {
    cat: 'Visa & Entrée', color: '#C4501E', icon: '✈️',
    questions: [
      { q: 'Comment obtenir un e-visa pour le Bénin ?', a: 'Rendez-vous sur evisa.gouv.bj. Remplissez le formulaire en ligne, téléchargez votre passeport (validité 6 mois min.) et une photo. Délai de traitement : 72h ouvrables. Coût : 50 USD.' },
      { q: "Quels pays ont accès au visa à l'arrivée ?", a: "Les ressortissants de l'UE, USA, Canada, Australie et de la plupart des pays africains peuvent obtenir un visa à l'arrivée à l'aéroport de Cotonou. Durée : 30 jours renouvelables." },
      { q: 'Faut-il un vaccin pour entrer au Bénin ?', a: 'Le vaccin contre la fièvre jaune est OBLIGATOIRE (+ preuve par carnet international). Recommandés : hépatites A et B, typhoïde, méningite, antipaludéens.' },
      { q: 'Peut-on prolonger son visa sur place ?', a: "Oui, à la Direction de la Police Nationale à Cotonou (DGPN) ou en ligne via le portail e-visa. Délai : 5-10 jours ouvrables, coût variable selon durée." },
    ],
  },
  {
    cat: 'Santé & Sécurité', color: '#3A6B47', icon: '🏥',
    questions: [
      { q: 'Quels médicaments antipaludéens prendre ?', a: 'Consultez un médecin avant le départ. Les options courantes sont atovaquone-proguanil (Malarone), doxycycline ou méfloquine. Emportez aussi un répulsif anti-moustiques et dormez sous moustiquaire.' },
      { q: 'Quelle eau boire au Bénin ?', a: "Boire uniquement de l'eau en bouteille capsulée ou filtrée. Évitez les glaçons dans les restaurants modestes. L'eau du robinet n'est pas potable." },
      { q: 'Quels sont les hôpitaux recommandés à Cotonou ?', a: 'Clinique CNHU (CHU national), Polyclinique Les Cocotiers, Polyclinique Atinkanmey. Pour les urgences : SAMU Bénin au 13.' },
      { q: 'La destination est-elle sûre ?', a: "Le Bénin est l'un des pays les plus stables d'Afrique de l'Ouest. Les zones touristiques (Cotonou, Ouidah, Grand-Popo, Abomey) sont très sûres. Prudence dans l'extrême nord (zone frontalière Mali/Burkina)." },
    ],
  },
  {
    cat: 'Transport & Mobilité', color: '#C8922A', icon: '🛺',
    questions: [
      { q: 'Comment se déplacer en ville ?', a: "Zémidjan (moto-taxi) : rapide et abordable, négociez le tarif avant (200-500 FCFA). Gozem : VTC sécurisé avec application, prix fixes. Taxi : pour les distances plus longues (1 500-5 000 FCFA en ville)." },
      { q: 'Y a-t-il des bus longue distance ?', a: 'STIF (ligne Cotonou-Parakou, 6h), Cotonou Express, et transport "bush taxi" en collectif (moins cher mais moins confortable). Réservation possible en gare de Cotonou.' },
      { q: 'Peut-on louer une voiture ?', a: "Oui : Avis, Hertz et agences locales à l'aéroport et en ville. Permis international requis. Budget : 35 000-60 000 FCFA/jour avec chauffeur inclus (recommandé pour le nord)." },
      { q: 'Comment aller de Cotonou à Ganvié ?', a: "Depuis Abomey-Calavi (15km de Cotonou en taxi). Embarcadère Sô-Ava : billet pirogue aller-retour 4 000-8 000 FCFA. Prévoir 3-4h pour la visite complète." },
    ],
  },
  {
    cat: 'Budget & Argent', color: '#1e6091', icon: '💰',
    questions: [
      { q: 'Quel est le budget journalier moyen ?', a: "Budget serré : 20 000 FCFA/j (auberge, gargotes, zémidjan). Confort : 50 000-80 000 FCFA/j (hôtel 3★, restaurant, taxi). Luxe : 150 000+ FCFA/j." },
      { q: "Où retirer de l'argent ?", a: "Distributeurs Visa/Mastercard disponibles : BCEAO, Coris Bank, Atlantique Bank. Frais de retrait : 1 500-3 000 FCFA. Prévenez votre banque avant le départ." },
      { q: 'Le Mobile Money est-il utilisé ?', a: 'Oui ! MTN Money et Moov Money sont largement acceptés dans les commerces, marchés et transports. Très pratique pour les petites transactions.' },
      { q: 'Peut-on payer par carte bancaire ?', a: "Dans les grands hôtels, restaurants haut de gamme et certains supermarchés uniquement. Emportez du cash (FCFA) pour les marchés, transports et restaurants locaux." },
    ],
  },
  {
    cat: 'Culture & Coutumes', color: '#6b21a8', icon: '🎭',
    questions: [
      { q: 'Quelles sont les règles à respecter dans les lieux sacrés ?', a: "Demandez toujours l'autorisation avant de photographier. Retirez vos chaussures à l'entrée des temples vodun. Habillez-vous modestement (épaules et genoux couverts). Ne touchez pas les objets rituels." },
      { q: 'Comment saluer les Béninois ?', a: "La poignée de main est incontournable. Utilisez la main droite. Avec les anciens, inclinez légèrement la tête. En milieu rural, saluez toujours le chef du village en arrivant dans un hameau." },
      { q: 'Y a-t-il des tabous alimentaires ?', a: "Certaines communautés ont des totems alimentaires (animaux interdits). Demandez avant de proposer de la nourriture. Le Ramadan est respecté par la communauté musulmane (nord du pays principalement)." },
      { q: 'Quelles fêtes importantes dois-je connaître ?', a: "Fête du Vodun : 10 janvier (Ouidah) — ne pas manquer. Fête nationale : 1er août. Fête de l'Indépendance. Les marchés hebdomadaires (yovogan) varient selon les villes — renseignez-vous localement." },
    ],
  },
]

const GUIDES = [
  { icon: '🗺️', title: 'Guide complet Bénin 2025', desc: 'Destinations, logement, transports, itinéraires — 48 pages', size: 'PDF · 3.2 Mo', color: '#C4501E', tag: 'POPULAIRE', pages: 48 },
  { icon: '💉', title: 'Guide Santé & Vaccins', desc: 'Vaccins obligatoires, pharmacie voyage, urgences', size: 'PDF · 1.1 Mo', color: '#3A6B47', tag: '', pages: 12 },
  { icon: '✈️', title: 'Guide Visa & Formalités', desc: 'e-Visa, documents requis, prolongation', size: 'PDF · 0.8 Mo', color: '#1e6091', tag: '', pages: 8 },
  { icon: '🍲', title: 'Guide Gastronomie locale', desc: 'Plats incontournables, restaurants, marchés', size: 'PDF · 2.1 Mo', color: '#C8922A', tag: '', pages: 24 },
  { icon: '👨‍👩‍👧', title: 'Guide Familles expatriées', desc: 'Écoles, quartiers, coût de vie, vie pratique', size: 'PDF · 1.8 Mo', color: '#6b21a8', tag: 'NOUVEAU', pages: 32 },
  { icon: '🌿', title: 'Guide Éco-tourisme', desc: 'Forêts sacrées, communautés locales, engagements', size: 'PDF · 1.4 Mo', color: '#2d6a4f', tag: '', pages: 18 },
]

const VISA_STEPS = [
  { num: 1, title: "Vérifier l'éligibilité", desc: 'Consultez evisa.gouv.bj pour voir si votre pays peut faire la demande en ligne', icon: '🔍' },
  { num: 2, title: 'Préparer les documents', desc: 'Passeport valide 6+ mois, photo récente, justificatif hébergement, billet retour', icon: '📋' },
  { num: 3, title: 'Remplir le formulaire', desc: 'Formulaire en ligne sur evisa.gouv.bj, paiement 50 USD par carte ou virement', icon: '💳' },
  { num: 4, title: 'Attendre la validation', desc: '48-72h ouvrables. Vérifiez vos spams. Téléchargez et imprimez le visa électronique', icon: '⏱️' },
  { num: 5, title: "Présentation à l'arrivée", desc: 'Montrez le visa imprimé ou sur téléphone + passeport original au contrôle frontière', icon: '🛫' },
]

const URGENCES = [
  { label: 'SAMU', num: '13', color: '#ef4444' },
  { label: 'Police', num: '117', color: '#3b82f6' },
  { label: 'Pompiers', num: '18', color: '#f59e0b' },
  { label: 'Ambassade France', num: '+229 21 30 02 25', color: '#6b7280' },
]

// Simulateur e-visa
const PAYS_ACCES = {
  'France': 'arrivee', 'Belgique': 'arrivee', 'Canada': 'arrivee', 'USA': 'arrivee',
  'Maroc': 'arrivee', 'Sénégal': 'arrivee', 'Côte d\'Ivoire': 'cedeao',
  'Ghana': 'cedeao', 'Niger': 'cedeao', 'Togo': 'cedeao', 'Nigéria': 'cedeao',
  'Chine': 'evisa', 'Inde': 'evisa', 'Brésil': 'evisa',
}

export default function InfosPratiques() {
  const [openFaq, setOpenFaq] = useState(null)
  const [catFilter, setCatFilter] = useState('Visa & Entrée')
  const [paysVisa, setPaysVisa] = useState('')
  const [visaResult, setVisaResult] = useState(null)

  const currentCat = FAQ.find(f => f.cat === catFilter)

  const checkVisa = () => {
    const lower = paysVisa.toLowerCase()
    const match = Object.entries(PAYS_ACCES).find(([k]) => k.toLowerCase().includes(lower))
    if (!match) { setVisaResult('unknown'); return }
    setVisaResult(match[1])
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F6EF', fontFamily: 'DM Sans, sans-serif' }}>

      {/* HERO */}
      <div style={{ background: '#0E0A06', padding: '60px 24px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 80%, rgba(196,80,30,0.12) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: 11, color: '#C8922A', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>Préparez votre voyage</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.2rem,5vw,4rem)', color: '#F5EDD6', fontWeight: 700, marginBottom: 16, lineHeight: 1.15 }}>
            Infos pratiques<br /><em style={{ color: '#C8922A', fontStyle: 'normal' }}>& Préparatifs</em>
          </h1>
          <p style={{ color: 'rgba(245,237,214,0.5)', maxWidth: 580, lineHeight: 1.7, marginBottom: 28 }}>
            e-Visa, vaccins, transport, budget — toutes les informations essentielles pour préparer sereinement votre voyage au Bénin. FAQ complète, guides téléchargeables et démarches visa pas à pas.
          </p>
          {/* Numéros urgence */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {URGENCES.map(u => (
              <div key={u.label} style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 14px', border: `1px solid ${u.color}30` }}>
                <span style={{ fontSize: 11, color: 'rgba(245,237,214,0.5)' }}>{u.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: u.color }}>{u.num}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* E-VISA SECTION */}
        <div style={{ background: 'white', border: '2px solid #C4501E20', marginBottom: 40, overflow: 'hidden' }}>
          <div style={{ background: '#C4501E', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>✈️ Demande de e-Visa en ligne</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '4px 0 0' }}>Démarches simplifiées · Réponse en 72h · 50 USD</p>
            </div>
            <a href="https://evisa.gouv.bj" target="_blank" rel="noopener noreferrer"
              style={{ background: 'white', color: '#C4501E', padding: '10px 22px', textDecoration: 'none', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              Faire ma demande →
            </a>
          </div>

          <div style={{ padding: '24px 24px 0' }}>
            <h3 style={{ fontSize: 15, color: '#374151', fontWeight: 700, marginBottom: 20 }}>Procédure étape par étape</h3>
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
              {VISA_STEPS.map((s, i) => (
                <div key={s.num} style={{ minWidth: 175, padding: '0 16px 0 0', position: 'relative' }}>
                  {i < VISA_STEPS.length - 1 && (
                    <div style={{ position: 'absolute', top: 15, left: 42, width: 'calc(100% - 46px)', height: 2, background: '#e5e7eb' }} />
                  )}
                  <div style={{ width: 32, height: 32, background: '#C4501E', color: 'white', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginBottom: 10, position: 'relative', zIndex: 1 }}>
                    {s.num}
                  </div>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>{s.title}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Simulateur visa */}
          <div style={{ margin: '24px 24px', background: '#fdf5f2', border: '1px solid #C4501E20', padding: '20px 22px' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>🔍 Vérifier votre type de visa</h4>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>Entrez votre pays de résidence pour connaître votre procédure</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={paysVisa}
                onChange={e => { setPaysVisa(e.target.value); setVisaResult(null) }}
                placeholder="Ex : France, Sénégal, Canada..."
                style={{
                  flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid #e5e7eb',
                  fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none',
                }}
                onKeyDown={e => e.key === 'Enter' && checkVisa()}
              />
              <button onClick={checkVisa}
                style={{ background: '#C4501E', color: 'white', border: 'none', padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Vérifier
              </button>
            </div>
            {visaResult && (
              <div style={{
                marginTop: 14, padding: '12px 16px',
                background: visaResult === 'cedeao' ? '#f0f7f2' : visaResult === 'arrivee' ? '#fff7ed' : visaResult === 'evisa' ? '#eff6ff' : '#fef2f2',
                borderLeft: `3px solid ${visaResult === 'cedeao' ? '#3A6B47' : visaResult === 'arrivee' ? '#C8922A' : visaResult === 'evisa' ? '#1e6091' : '#ef4444'}`,
              }}>
                {visaResult === 'cedeao' && <><strong>🌍 Zone CEDEAO</strong> — Entrée libre sans visa (communauté CEDEAO). Passeport ou carte d'identité suffisant.</>}
                {visaResult === 'arrivee' && <><strong>🛬 Visa à l'arrivée</strong> — Disponible à l'aéroport de Cotonou. Préparez 50 USD en espèces + photo d'identité.</>}
                {visaResult === 'evisa' && <><strong>💻 e-Visa requis</strong> — Faites votre demande sur <a href="https://evisa.gouv.bj" target="_blank" rel="noopener noreferrer" style={{ color: '#1e6091' }}>evisa.gouv.bj</a> avant le départ (72h de délai).</>}
                {visaResult === 'unknown' && <><strong>❓ Pays non trouvé</strong> — Consultez <a href="https://evisa.gouv.bj" target="_blank" rel="noopener noreferrer" style={{ color: '#C4501E' }}>evisa.gouv.bj</a> ou l'ambassade du Bénin dans votre pays.</>}
              </div>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1a0a00', marginBottom: 8 }}>FAQ</h2>
          <p style={{ color: '#7A5C30', fontSize: 14, marginBottom: 20 }}>Toutes les réponses aux questions les plus fréquentes</p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {FAQ.map(f => (
              <button key={f.cat} onClick={() => { setCatFilter(f.cat); setOpenFaq(null) }}
                style={{
                  padding: '8px 16px', fontSize: 13, cursor: 'pointer', transition: 'all .15s',
                  background: catFilter === f.cat ? f.color : 'white',
                  color: catFilter === f.cat ? 'white' : '#374151',
                  border: `1px solid ${catFilter === f.cat ? f.color : '#e5e7eb'}`,
                  fontWeight: catFilter === f.cat ? 700 : 400,
                }}>
                {f.icon} {f.cat}
              </button>
            ))}
          </div>

          <div style={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {currentCat?.questions.map((item, i) => (
              <div key={i} style={{ borderBottom: i < currentCat.questions.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <button onClick={() => setOpenFaq(openFaq === `${catFilter}-${i}` ? null : `${catFilter}-${i}`)}
                  style={{ width: '100%', background: 'white', border: 'none', padding: '18px 24px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', lineHeight: 1.4 }}>{item.q}</span>
                  <span style={{ fontSize: 20, color: currentCat.color, flexShrink: 0, transition: 'transform .2s', transform: openFaq === `${catFilter}-${i}` ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === `${catFilter}-${i}` && (
                  <div style={{ background: '#f9fafb', padding: '16px 24px', borderTop: `2px solid ${currentCat.color}` }}>
                    <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guides */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1a0a00', marginBottom: 8 }}>Guides téléchargeables</h2>
          <p style={{ color: '#7A5C30', fontSize: 14, marginBottom: 24 }}>Guides PDF gratuits pour préparer votre séjour hors connexion</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {GUIDES.map(g => (
              <div key={g.title} style={{ background: 'white', padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start', border: '1px solid #e5e7eb', transition: 'box-shadow .2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>{g.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', margin: 0 }}>{g.title}</h4>
                    {g.tag && (
                      <span style={{ fontSize: 10, background: g.color, color: 'white', padding: '2px 8px', fontWeight: 700, letterSpacing: .5, flexShrink: 0, marginLeft: 8 }}>{g.tag}</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 8 }}>{g.desc}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{g.size}</span>
                    <span style={{ fontSize: 10, background: '#f3f4f6', color: '#6b7280', padding: '1px 6px' }}>{g.pages} pages</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/inscription" style={{ fontSize: 11, color: g.color, textDecoration: 'none', fontWeight: 600 }}>
                      📩 Reçu par email
                    </Link>
                    <button style={{ background: g.color, color: 'white', border: 'none', padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => alert('📥 Guide en cours de préparation — disponible bientôt !')}>
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fffbf0', border: '1px solid #C8922A25', padding: '16px 20px', marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 22 }}>📩</span>
            <p style={{ fontSize: 13, color: '#7A5C30', margin: 0 }}>
              <strong>Guides envoyés par email après inscription</strong> — créez un compte gratuit pour accéder à tous les guides et recevoir les mises à jour.{' '}
              <Link to="/inscription" style={{ color: '#C8922A', fontWeight: 700, textDecoration: 'none' }}>Créer un compte →</Link>
            </p>
          </div>
        </div>

        {/* Météo & Meilleure période */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '28px 24px', marginBottom: 40 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#1a0a00', marginBottom: 16 }}>
            🌤️ Quand partir au Bénin ?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { mois: 'Nov – Fév', label: 'Saison idéale', desc: 'Sec et frais. Parfait pour le nord (safari, trek). Harmattan possible.', icon: '⭐', color: '#C8922A' },
              { mois: 'Mar – Mai', label: 'Transition', desc: 'Chaleur montante. Bon pour les musées et la côte.', icon: '🌡️', color: '#3A6B47' },
              { mois: 'Juin – Juil', label: 'Petite saison des pluies', desc: 'Végétation luxuriante. Routes nord difficiles.', icon: '🌧️', color: '#1e6091' },
              { mois: 'Aoû – Oct', label: 'Grande saison des pluies', desc: 'Évitez le safari. Idéal pour la biodiversité côtière.', icon: '⛈️', color: '#6b7280' },
            ].map(s => (
              <div key={s.mois} style={{ padding: '14px 16px', borderTop: `3px solid ${s.color}` }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.mois}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA liens utiles */}
        <div style={{ background: '#1a0a00', padding: '32px 40px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, color: '#C8922A', letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 4px' }}>Liens officiels</p>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#F5EDD6', margin: 0 }}>Ressources gouvernementales du Bénin</h3>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="https://evisa.gouv.bj" target="_blank" rel="noopener noreferrer"
              style={{ background: '#C4501E', color: 'white', padding: '10px 18px', textDecoration: 'none', fontWeight: 700, fontSize: 12 }}>
              ✈️ evisa.gouv.bj
            </a>
            <a href="https://benintourisme.bj" target="_blank" rel="noopener noreferrer"
              style={{ border: '1px solid rgba(245,237,214,0.2)', color: '#F5EDD6', padding: '10px 18px', textDecoration: 'none', fontSize: 12 }}>
              🌍 Tourisme officiel
            </a>
            <Link to="/itineraires"
              style={{ border: '1px solid rgba(200,146,42,0.4)', color: '#C8922A', padding: '10px 18px', textDecoration: 'none', fontSize: 12 }}>
              🗺️ Nos itinéraires
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
