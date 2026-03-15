// frontend/src/components/ui/CurrencyWidget.jsx
// Convertisseur FCFA ↔ EUR / USD — taux mis à jour via l'API exchangerate-api (gratuit)
import { useState, useEffect } from 'react'

// Taux de secours (1 EUR = 655.957 FCFA fixe XOF/EUR, USD variable)
const FALLBACK_RATES = { EUR: 655.957, USD: 600.0 }

export default function CurrencyWidget() {
  const [open,   setOpen]   = useState(false)
  const [amount, setAmount] = useState('')
  const [from,   setFrom]   = useState('FCFA')
  const [to,     setTo]     = useState('EUR')
  const [rates,  setRates]  = useState(FALLBACK_RATES)
  const [updated,setUpdated]= useState(null)
  const [loading,setLoading]= useState(false)

  // Charger les taux à l'ouverture
  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('https://open.er-api.com/v6/latest/XOF')
      .then(r => r.json())
      .then(data => {
        if (data.result === 'success') {
          setRates({ EUR: 1 / data.rates.EUR * data.rates.XOF, USD: 1 / data.rates.USD * data.rates.XOF })
          // Simplifié : XOF base → on veut FCFA→EUR = 1/rates.EUR
          // open.er-api renvoie rates.EUR = valeur de 1 XOF en EUR
          setRates({ EUR: 1 / data.rates.EUR, USD: 1 / data.rates.USD })
          setUpdated(new Date())
        }
      })
      .catch(() => {}) // garde les taux fallback
      .finally(() => setLoading(false))
  }, [open])

  function convert(val, fromCur, toCur) {
    if (!val || isNaN(Number(val))) return ''
    const n = Number(val)
    if (fromCur === 'FCFA') {
      if (toCur === 'EUR') return (n / rates.EUR).toFixed(2)
      if (toCur === 'USD') return (n / rates.USD).toFixed(2)
    } else if (fromCur === 'EUR') {
      if (toCur === 'FCFA') return Math.round(n * rates.EUR).toLocaleString()
      if (toCur === 'USD')  return (n * rates.EUR / rates.USD).toFixed(2)
    } else if (fromCur === 'USD') {
      if (toCur === 'FCFA') return Math.round(n * rates.USD).toLocaleString()
      if (toCur === 'EUR')  return (n * rates.USD / rates.EUR).toFixed(2)
    }
    return ''
  }

  const CURRENCIES = ['FCFA', 'EUR', 'USD']
  const SYMBOLS    = { FCFA: 'F', EUR: '€', USD: '$' }
  const FLAGS      = { FCFA: '🇧🇯', EUR: '🇪🇺', USD: '🇺🇸' }

  const result = convert(amount, from, to)

  // Taux affiché
  const rateDisplay = from === 'FCFA' && to === 'EUR'
    ? `1 000 FCFA = ${(1000/rates.EUR).toFixed(2)} €`
    : from === 'FCFA' && to === 'USD'
    ? `1 000 FCFA = ${(1000/rates.USD).toFixed(2)} $`
    : from === 'EUR'
    ? `1 € = ${Math.round(rates.EUR).toLocaleString()} FCFA`
    : from === 'USD'
    ? `1 $ = ${Math.round(rates.USD).toLocaleString()} FCFA`
    : ''

  // Exemples de prix courants
  const EXAMPLES = [
    { label: 'Zémidjan (moto-taxi, 5 min)',  fcfa: 200 },
    { label: 'Repas local',                   fcfa: 1500 },
    { label: 'Repas restaurant moyen',         fcfa: 5000 },
    { label: 'Nuit hôtel 3★ Cotonou',          fcfa: 35000 },
    { label: 'Visa touriste',                  fcfa: 50000 },
    { label: 'Excursion Ganvié',               fcfa: 10000 },
  ]

  return (
    <>
      {/* Bouton flottant — juste au-dessus du traducteur */}
      <button onClick={() => setOpen(v => !v)} title="Convertisseur FCFA"
        style={{
          position: 'fixed', bottom: 84, right: 24,
          width: 52, height: 52, borderRadius: '50%',
          background: open ? '#0E0A06' : '#3A6B47',
          border: `2px solid ${open ? '#3A6B47' : 'transparent'}`,
          color: 'white', fontSize: 20, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 199, transition: 'all .2s',
        }}>
        {open ? '✕' : '💱'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 146, right: 24, width: 330,
          background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          border: '1px solid rgba(58,107,71,0.2)', zIndex: 199,
          animation: 'fadeUp .2s ease',
        }}>
          {/* Header */}
          <div style={{ background: '#3A6B47', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#F5EDD6', fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>💱 DEVISES</span>
            {updated && !loading && (
              <span style={{ color: 'rgba(245,237,214,0.5)', fontSize: 9 }}>
                Mis à jour {updated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {loading && <span style={{ color: 'rgba(245,237,214,0.5)', fontSize: 9 }}>Actualisation…</span>}
          </div>

          <div style={{ padding: '14px' }}>

            {/* Sélecteurs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
              <select value={from} onChange={e => setFrom(e.target.value)}
                style={{ flex: 1, border: '1px solid #e5e7eb', padding: '8px', fontSize: 13, color: '#1a0a00', outline: 'none', background: '#fafafa', cursor: 'pointer' }}>
                {CURRENCIES.map(c => <option key={c} value={c}>{FLAGS[c]} {c}</option>)}
              </select>
              <button onClick={() => { setFrom(to); setTo(from); setAmount(result.replace(',','')) }}
                style={{ background: '#F0F7F2', border: '1px solid #3A6B47', padding: '8px 12px', cursor: 'pointer', fontSize: 16, color: '#3A6B47' }}>
                ⇄
              </button>
              <select value={to} onChange={e => setTo(e.target.value)}
                style={{ flex: 1, border: '1px solid #e5e7eb', padding: '8px', fontSize: 13, color: '#1a0a00', outline: 'none', background: '#fafafa', cursor: 'pointer' }}>
                {CURRENCIES.filter(c => c !== from).map(c => <option key={c} value={c}>{FLAGS[c]} {c}</option>)}
              </select>
            </div>

            {/* Input montant */}
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#3A6B47', fontWeight: 700, fontSize: 16 }}>
                {SYMBOLS[from]}
              </span>
              <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #e5e7eb', padding: '11px 12px 11px 32px', fontSize: 18, fontWeight: 700, color: '#1a0a00', outline: 'none', textAlign: 'right' }}
                onFocus={e => e.target.style.borderColor='#3A6B47'}
                onBlur={e  => e.target.style.borderColor='#e5e7eb'}
              />
            </div>

            {/* Résultat */}
            <div style={{ background: '#F0F7F2', border: '1px solid #c6dfc9', padding: '12px 14px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#3A6B47', fontWeight: 600 }}>
                {FLAGS[to]} {to}
              </span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: '#1a0a00' }}>
                {result ? `${SYMBOLS[to]} ${typeof result === 'string' ? result : Number(result).toLocaleString()}` : '—'}
              </span>
            </div>

            {/* Taux du jour */}
            {rateDisplay && (
              <p style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', marginBottom: 14 }}>
                Taux : {rateDisplay}
                {from === 'FCFA' || to === 'FCFA' ? ' · XOF ancré à l\'Euro' : ''}
              </p>
            )}

            {/* Exemples de prix */}
            <div>
              <p style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Prix courants au Bénin</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {EXAMPLES.map(ex => (
                  <button key={ex.label} onClick={() => { setAmount(String(ex.fcfa)); setFrom('FCFA') }}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', border: '1px solid #f0f0f0', background: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 11, color: '#374151', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#F0F7F2'}
                    onMouseLeave={e => e.currentTarget.style.background='white'}
                  >
                    <span>{ex.label}</span>
                    <span style={{ fontWeight: 700, color: '#3A6B47', flexShrink: 0, marginLeft: 8 }}>
                      {ex.fcfa.toLocaleString()} F
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
