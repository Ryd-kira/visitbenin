// frontend/src/pages/Itineraires.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

const PROFILS = [
  {
    id: 'aventure', icon: '🧭', label: 'Aventure & Nature',
    color: '#3A6B47', bg: '#f0f7f2',
    desc: "Safari, randonnées, kayak, surf — pour les esprits libres qui aiment sortir des sentiers battus.",
    tags: ['Safari Pendjari', 'Randonnée Atacora', 'Surf Grand-Popo', 'Kayak Lac Ahémé', 'Trek Tata Somba'],
    quizMatch: ['nature', 'sport', 'decouverte'],
    itineraires: [
      {
        titre: 'Grand Nord Sauvage', duree: '8 jours', budget: '180 000 – 350 000 FCFA', budgetMin: 180000,
        difficulte: 'Modéré', saison: 'Nov – Fév', groupeSize: '2-8 personnes',
        highlights: ["Seul parc aux lions d'AOC", 'Nuit chez habitant Betammaribé', 'Lever de soleil sur la savane'],
        etapes: [
          { jour: 'J1–2', lieu: 'Natitingou', desc: 'Arrivée, Tata Somba, marchés locaux', icon: '🏰' },
          { jour: 'J3–5', lieu: 'Pendjari', desc: 'Safari 4x4 — lions, éléphants, hippopotames', icon: '🦁' },
          { jour: 'J6–7', lieu: 'Atacora', desc: 'Randonnée dans les monts, nuit chez habitant', icon: '⛰️' },
          { jour: 'J8', lieu: 'Retour', desc: 'Route panoramique vers Cotonou', icon: '🚌' },
        ],
        ecoNote: '✅ 70% des revenus reversés aux communautés locales',
        plannerLabel: 'Importer cet itinéraire',
      },
      {
        titre: 'Côte Atlantique Active', duree: '5 jours', budget: '80 000 – 150 000 FCFA', budgetMin: 80000,
        difficulte: 'Facile', saison: 'Oct – Mars', groupeSize: '1-6 personnes',
        highlights: ['Surf en Atlantique', 'Kayak lacustre unique', 'Forêt sacrée Vodun'],
        etapes: [
          { jour: 'J1', lieu: 'Cotonou', desc: 'Plage de Fidjrossè, dîner fruits de mer', icon: '🌊' },
          { jour: 'J2', lieu: 'Grand-Popo', desc: 'Surf & bodyboard, village de pêcheurs', icon: '🏄' },
          { jour: 'J3', lieu: 'Lac Ahémé', desc: 'Kayak entre villages lacustres', icon: '🚣' },
          { jour: 'J4', lieu: 'Ouidah', desc: 'Forêt sacrée des pythons, route des esclaves', icon: '🌿' },
          { jour: 'J5', lieu: 'Cotonou', desc: 'Marché Dantokpa, départ', icon: '🛍️' },
        ],
        ecoNote: '🌊 Kayaks biodégradables, nettoyage participatif inclus',
        plannerLabel: 'Importer cet itinéraire',
      },
    ],
  },
  {
    id: 'culture', icon: '🏛️', label: 'Culture & Histoire',
    color: '#C4501E', bg: '#fdf5f2',
    desc: "Royaumes, Vodun, patrimoine UNESCO, arts et traditions — plongez dans l'âme béninoise.",
    tags: ["Palais d'Abomey", 'Route des Esclaves', 'Musées Porto-Novo', 'Fête du Vodun', 'Ganvié'],
    quizMatch: ['histoire', 'art', 'patrimoine'],
    itineraires: [
      {
        titre: 'Royaumes du Dahomey', duree: '7 jours', budget: '120 000 – 220 000 FCFA', budgetMin: 120000,
        difficulte: 'Facile', saison: "Toute l'année", groupeSize: '1-15 personnes',
        highlights: ['3 sites UNESCO', 'Cérémonie Vodun authentique', 'Pirogue à Ganvié'],
        etapes: [
          { jour: 'J1', lieu: 'Cotonou', desc: 'Arrivée, quartier historique Zongo', icon: '🌆' },
          { jour: 'J2', lieu: 'Porto-Novo', desc: 'Musée da Silva, Grande Mosquée', icon: '🕌' },
          { jour: 'J3–4', lieu: 'Abomey', desc: 'Palais Royaux UNESCO, Musée Historique', icon: '👑' },
          { jour: 'J5', lieu: 'Ouidah', desc: 'Temple des Pythons, Route des Esclaves', icon: '⛓️' },
          { jour: 'J6', lieu: 'Ganvié', desc: 'Village lacustre en pirogue', icon: '🚣' },
          { jour: 'J7', lieu: 'Cotonou', desc: 'Fondation Zinsou, art contemporain', icon: '🎨' },
        ],
        ecoNote: '🏛️ Guides certifiés ANPT, droits d\'entrée reversés aux sites',
        plannerLabel: 'Importer cet itinéraire',
      },
      {
        titre: 'Bénin des Arts', duree: '4 jours', budget: '70 000 – 130 000 FCFA', budgetMin: 70000,
        difficulte: 'Facile', saison: "Toute l'année", groupeSize: '1-10 personnes',
        highlights: ['Art contemporain africain', 'Artisans traditionnels Fon', 'Poteries de Sè'],
        etapes: [
          { jour: 'J1', lieu: 'Cotonou', desc: 'Fondation Zinsou, galeries contemporaines', icon: '🎨' },
          { jour: 'J2', lieu: 'Porto-Novo', desc: 'Musée Ethnographique, potiers de Sè', icon: '🏺' },
          { jour: 'J3', lieu: 'Abomey', desc: 'Bas-reliefs royaux, tapisseries Fon', icon: '🖼️' },
          { jour: 'J4', lieu: 'Ouidah', desc: 'Fondation Ti Jean, retour Cotonou', icon: '📿' },
        ],
        ecoNote: '🎨 Achat direct aux artisans, zéro intermédiaire',
        plannerLabel: 'Importer cet itinéraire',
      },
    ],
  },
  {
    id: 'famille', icon: '👨‍👩‍👧‍👦', label: 'En Famille',
    color: '#C8922A', bg: '#fffbf0',
    desc: 'Découvertes ludiques, animaux, plages sûres et expériences inoubliables pour petits et grands.',
    tags: ['Ganvié en pirogue', 'Plage Grand-Popo', 'Marché Dantokpa', 'Cours de cuisine', 'Pythons Ouidah'],
    quizMatch: ['enfants', 'confort', 'plage'],
    itineraires: [
      {
        titre: 'Bénin en Famille', duree: '7 jours', budget: '200 000 – 400 000 FCFA', budgetMin: 200000,
        difficulte: 'Très facile', saison: 'Nov – Avr', groupeSize: '4-12 personnes',
        highlights: ['Pythons apprivoisés à Ouidah', 'Pirogue à Ganvié', 'Cours cuisine enfants'],
        etapes: [
          { jour: 'J1', lieu: 'Cotonou', desc: 'Arrivée, plage de Fidjrossè, restaurant familial', icon: '🌴' },
          { jour: 'J2', lieu: 'Ganvié', desc: "Pirogue sur le lac — les enfants adorent !", icon: '🚣' },
          { jour: 'J3', lieu: 'Ouidah', desc: 'Temple des pythons, plage', icon: '🐍' },
          { jour: 'J4–5', lieu: 'Grand-Popo', desc: 'Plage sûre, pêcheurs locaux', icon: '🏖️' },
          { jour: 'J6', lieu: 'Abomey', desc: 'Palais des rois, musée vivant', icon: '🏰' },
          { jour: 'J7', lieu: 'Cotonou', desc: 'Cours de cuisine béninoise en famille', icon: '🍲' },
        ],
        ecoNote: '👨‍👩‍👧 Adapté enfants 4-14 ans, ryhtme doux garanti',
        plannerLabel: 'Importer cet itinéraire',
      },
      {
        titre: 'Week-end Découverte', duree: '3 jours', budget: '60 000 – 120 000 FCFA', budgetMin: 60000,
        difficulte: 'Très facile', saison: "Toute l'année", groupeSize: '2-8 personnes',
        highlights: ['Village lacustre unique', 'Pythons sacrés', 'Artisanat local'],
        etapes: [
          { jour: 'J1', lieu: 'Ganvié', desc: "Village sur l'eau, marché flottant", icon: '🚣' },
          { jour: 'J2', lieu: 'Ouidah', desc: 'Temple des pythons, Forêt sacrée', icon: '🌿' },
          { jour: 'J3', lieu: 'Cotonou', desc: 'Marché Dantokpa, artisanat', icon: '🛍️' },
        ],
        ecoNote: '🛍️ Artisanat authentique, achat direct aux producteurs',
        plannerLabel: 'Importer cet itinéraire',
      },
    ],
  },
]

const DIFF_COLOR = { 'Facile': '#22c55e', 'Très facile': '#3b82f6', 'Modéré': '#f59e0b' }

const QUIZ_QUESTIONS = [
  {
    q: 'Quelle expérience vous attire le plus ?',
    options: [
      { label: '🦁 Safari & animaux sauvages', value: 'nature' },
      { label: '🏛️ Musées & histoire royale', value: 'histoire' },
      { label: '🎨 Art & artisanat local', value: 'art' },
      { label: '🏄 Sports & plein air', value: 'sport' },
    ],
  },
  {
    q: 'Vous voyagez avec…',
    options: [
      { label: '👫 En couple ou solo', value: 'decouverte' },
      { label: '👨‍👩‍👧 En famille avec enfants', value: 'enfants' },
      { label: '👥 Entre amis', value: 'sport' },
      { label: '🏢 Dans un cadre pro', value: 'patrimoine' },
    ],
  },
  {
    q: 'Votre rapport au confort ?',
    options: [
      { label: '⛺ Aventure brute, on gère !', value: 'nature' },
      { label: '🏨 Hôtel confortable le soir', value: 'patrimoine' },
      { label: '🏖️ Plage & détente avant tout', value: 'plage' },
      { label: "🌿 Chez l'habitant, immersif", value: 'decouverte' },
    ],
  },
]

function QuizModal({ onClose, onResult }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])

  const choose = (val) => {
    const next = [...answers, val]
    if (step < QUIZ_QUESTIONS.length - 1) {
      setAnswers(next)
      setStep(step + 1)
    } else {
      const counts = {}
      next.forEach(v => { counts[v] = (counts[v] || 0) + 1 })
      const topVal = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
      const matched = PROFILS.find(p => p.quizMatch.includes(topVal)) || PROFILS[0]
      onResult(matched.id)
    }
  }

  const q = QUIZ_QUESTIONS[step]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(14,10,6,0.88)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#1a0e06', border: '1px solid rgba(200,146,42,0.35)',
        maxWidth: 500, width: '100%', padding: '36px 32px', position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: '#9ca3af', fontSize: 22, cursor: 'pointer' }}>✕</button>

        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {QUIZ_QUESTIONS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3,
              background: i <= step ? '#C8922A' : 'rgba(255,255,255,0.1)',
              transition: 'background .3s',
            }} />
          ))}
        </div>

        <p style={{ fontSize: 11, color: '#C8922A', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>
          Question {step + 1}/{QUIZ_QUESTIONS.length}
        </p>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#F5EDD6', marginBottom: 22, lineHeight: 1.4 }}>
          {q.q}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q.options.map(opt => (
            <button key={opt.value} onClick={() => choose(opt.value)}
              style={{
                padding: '14px 16px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(200,146,42,0.2)', color: '#F5EDD6',
                fontSize: 13, cursor: 'pointer', textAlign: 'left',
                transition: 'all .15s', fontFamily: 'DM Sans, sans-serif',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,146,42,0.14)'; e.currentTarget.style.borderColor = '#C8922A' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(200,146,42,0.2)' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Itineraires() {
  const { user } = useAuthStore()
  const [profil, setProfil] = useState('aventure')
  const [open, setOpen] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [budgetFilter, setBudgetFilter] = useState(0)
  const [importedMsg, setImportedMsg] = useState(null)
  const cur = PROFILS.find(p => p.id === profil)

  const filtered = cur.itineraires.filter(i => budgetFilter === 0 || i.budgetMin <= budgetFilter)

  const handleQuizResult = (profilId) => {
    setProfil(profilId)
    setOpen(null)
    setShowQuiz(false)
  }

  const handleImport = (itin) => {
    if (!user) { window.location.href = '/connexion'; return }
    setImportedMsg(`✅ "${itin.titre}" ajouté à votre Planner !`)
    setTimeout(() => setImportedMsg(null), 3500)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F6EF', fontFamily: 'DM Sans, sans-serif' }}>
      {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} onResult={handleQuizResult} />}

      {importedMsg && (
        <div style={{
          position: 'fixed', bottom: 28, right: 24, background: '#3A6B47', color: 'white',
          padding: '14px 22px', fontWeight: 700, fontSize: 14, zIndex: 999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}>
          {importedMsg}
        </div>
      )}

      {/* HERO */}
      <div style={{ background: '#0E0A06', padding: '60px 24px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 40%, rgba(200,146,42,0.15) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: 11, color: '#C8922A', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>Voyages sur mesure</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 16 }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.2rem,5vw,3.8rem)', color: '#F5EDD6', fontWeight: 700, lineHeight: 1.15 }}>
              Votre Bénin,<br /><em style={{ color: '#C8922A', fontStyle: 'italic' }}>votre rythme</em>
            </h1>
            <button onClick={() => setShowQuiz(true)}
              style={{
                background: 'rgba(200,146,42,0.12)', border: '1px solid rgba(200,146,42,0.4)',
                color: '#C8922A', padding: '13px 22px', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 13,
                transition: 'all .2s', marginTop: 10, alignSelf: 'flex-start',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,146,42,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,146,42,0.12)'}
            >
              ✨ Trouver mon profil →
            </button>
          </div>

          <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: 15, maxWidth: 520, lineHeight: 1.7, marginBottom: 36 }}>
            Répondez à 3 questions pour découvrir votre itinéraire idéal — ou explorez directement par profil.
          </p>

          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
            {PROFILS.map(p => (
              <button key={p.id} onClick={() => { setProfil(p.id); setOpen(null) }}
                style={{
                  padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: `3px solid ${profil === p.id ? p.color : 'transparent'}`,
                  color: profil === p.id ? '#F5EDD6' : 'rgba(245,237,214,0.35)',
                  fontSize: 13, fontWeight: profil === p.id ? 700 : 400,
                  transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>

        {/* Banner profil */}
        <div style={{
          background: cur.bg, border: `1px solid ${cur.color}25`,
          padding: '22px 26px', marginBottom: 24,
          display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 44 }}>{cur.icon}</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#1a0a00', marginBottom: 6 }}>{cur.label}</h2>
            <p style={{ color: '#5a4520', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{cur.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cur.tags.map(t => (
                <span key={t} style={{ fontSize: 11, padding: '3px 9px', background: 'white', border: `1px solid ${cur.color}30`, color: cur.color, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
          <Link to={user ? '/planifier' : '/connexion'}
            style={{ background: cur.color, color: 'white', padding: '11px 20px', textDecoration: 'none', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
            ✏️ {user ? 'Créer mon itinéraire' : 'Se connecter pour planifier'}
          </Link>
        </div>

        {/* Filtre budget */}
        <div style={{
          background: 'white', border: '1px solid #e5e7eb', padding: '14px 20px',
          marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>💰 Budget max :</span>
          {[
            { label: 'Tous les budgets', val: 0 },
            { label: '< 100k FCFA', val: 100000 },
            { label: '< 200k FCFA', val: 200000 },
            { label: '< 400k FCFA', val: 400000 },
          ].map(opt => (
            <button key={opt.val} onClick={() => setBudgetFilter(opt.val)}
              style={{
                padding: '6px 14px', fontSize: 12, cursor: 'pointer',
                background: budgetFilter === opt.val ? cur.color : '#f3f4f6',
                color: budgetFilter === opt.val ? 'white' : '#374151',
                border: 'none', fontWeight: budgetFilter === opt.val ? 700 : 400, transition: 'all .15s',
              }}>
              {opt.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <span style={{ fontSize: 12, color: '#ef4444' }}>
              Aucun résultat —{' '}
              <button onClick={() => setBudgetFilter(0)} style={{ color: cur.color, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                Voir tous
              </button>
            </span>
          )}
        </div>

        {/* Cartes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18, marginBottom: 48 }}>
          {filtered.map((itin, i) => (
            <div key={i} onClick={() => setOpen(open === i ? null : i)}
              style={{
                background: 'white', border: `2px solid ${open === i ? cur.color : 'rgba(0,0,0,0.07)'}`,
                cursor: 'pointer', transition: 'all .2s',
                boxShadow: open === i ? `0 8px 24px ${cur.color}22` : 'none',
              }}>
              <div style={{ background: cur.color, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 15, fontFamily: 'Playfair Display, serif' }}>{itin.titre}</span>
                <span style={{ transition: 'transform .2s', transform: open === i ? 'rotate(180deg)' : 'none', color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>▼</span>
              </div>

              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#7A5C30' }}>⏱ {itin.duree}</span>
                  <span style={{ fontSize: 12, color: '#7A5C30' }}>💰 {itin.budget}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: DIFF_COLOR[itin.difficulte] || '#6b7280' }}>● {itin.difficulte}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, padding: '3px 8px', background: '#f3f4f6', color: '#374151' }}>📅 {itin.saison}</span>
                  <span style={{ fontSize: 11, padding: '3px 8px', background: '#f3f4f6', color: '#374151' }}>👥 {itin.groupeSize}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                  {itin.highlights.map(h => (
                    <span key={h} style={{ fontSize: 11, padding: '2px 8px', background: `${cur.color}12`, color: cur.color, fontWeight: 600 }}>✦ {h}</span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: '#3A6B47', background: '#f0f7f2', padding: '6px 10px', borderLeft: '3px solid #3A6B47' }}>
                  {itin.ecoNote}
                </div>
              </div>

              {open === i && (
                <div style={{ borderTop: `1px solid ${cur.color}20`, padding: '16px 20px 20px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 17, top: 10, bottom: 10, width: 2, background: `${cur.color}20` }} />
                    {itin.etapes.map((e, j) => (
                      <div key={j} style={{ display: 'flex', gap: 14, padding: '9px 0', alignItems: 'flex-start' }}>
                        <div style={{
                          width: 36, height: 36,
                          background: j === 0 ? cur.color : 'white',
                          border: `2px solid ${cur.color}`,
                          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, flexShrink: 0, zIndex: 1,
                        }}>{e.icon}</div>
                        <div>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
                            <span style={{ fontSize: 10, color: cur.color, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{e.jour}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a0a00' }}>{e.lieu}</span>
                          </div>
                          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{e.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleImport(itin)}
                      style={{
                        flex: 1, background: cur.color, color: 'white', padding: '11px',
                        border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                      }}>
                      📥 {user ? 'Importer dans le Planner' : 'Se connecter pour importer'}
                    </button>
                    <Link to="/partenaires" onClick={e => e.stopPropagation()}
                      style={{ padding: '11px 14px', border: `1px solid ${cur.color}`, color: cur.color, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                      Agences
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sites phares */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1a0a00', marginBottom: 6 }}>Sites incontournables du Bénin</h2>
          <p style={{ color: '#7A5C30', fontSize: 14, marginBottom: 20 }}>Inclus dans nos itinéraires signature</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { icon: '🚣', name: 'Ganvié', tag: 'Village lacustre', badge: 'Unique au monde' },
              { icon: '🦁', name: 'Pendjari', tag: 'Parc national', badge: 'Lions en AOC' },
              { icon: '👑', name: "Palais d'Abomey", tag: 'Royaumes Fon', badge: 'UNESCO' },
              { icon: '⛓️', name: 'Route des Esclaves', tag: 'Mémoire & Histoire', badge: '' },
              { icon: '🐍', name: 'Temple des Pythons', tag: 'Ouidah · Vodun', badge: '' },
              { icon: '🏰', name: 'Tata Somba', tag: 'Architecture unique', badge: 'Rare' },
            ].map(site => (
              <div key={site.name} style={{ background: 'white', padding: '16px 14px', border: '1px solid #e5e7eb', position: 'relative' }}>
                {site.badge && (
                  <span style={{
                    position: 'absolute', top: 8, right: 8,
                    fontSize: 9, background: '#C8922A', color: 'white',
                    padding: '2px 6px', fontWeight: 700, letterSpacing: .5,
                  }}>{site.badge}</span>
                )}
                <div style={{ fontSize: 28, marginBottom: 8 }}>{site.icon}</div>
                <div style={{ fontWeight: 700, color: '#1a0a00', fontSize: 13 }}>{site.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{site.tag}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div style={{ background: '#1a0a00', padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#C8922A', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Itinéraire 100% personnalisé</p>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#F5EDD6', marginBottom: 8 }}>Construisez le vôtre, étape par étape</h3>
          <p style={{ color: 'rgba(245,237,214,0.4)', fontSize: 14, marginBottom: 22 }}>Ajoutez vos lieux, choisissez vos activités, fixez votre budget.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowQuiz(true)}
              style={{ background: '#C8922A', color: '#0A0806', padding: '13px 28px', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              ✨ Faire le quiz de profil
            </button>
            <Link to="/planifier" style={{ border: '1px solid rgba(245,237,214,0.2)', color: '#F5EDD6', padding: '13px 28px', textDecoration: 'none', fontSize: 14 }}>
              ✏️ Planifier manuellement
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
