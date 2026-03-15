// frontend/src/components/ui/ChatbotWidget.jsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useLocation } from 'react-router-dom'

const AKOFA_AVATAR = '🧕🏾'
const USER_AVATAR  = '👤'

// Mapping route → contexte page
function getPageContext(pathname) {
  if (pathname.includes('/destinations')) return { page: 'destinations', label: 'Destinations' }
  if (pathname.includes('/gastronomie'))  return { page: 'restaurants',  label: 'Gastronomie' }
  if (pathname.includes('/ecoles'))       return { page: 'schools',      label: 'Écoles' }
  if (pathname.includes('/carte'))        return { page: 'map',          label: 'Carte' }
  if (pathname.includes('/marketplace'))  return { page: 'marketplace',  label: 'Marketplace' }
  if (pathname.includes('/installer'))    return { page: 'installer',    label: "S'installer" }
  return { page: 'default', label: 'Accueil' }
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '8px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#C8922A',
          animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row', marginBottom: 12 }}>
      <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>
        {isUser ? USER_AVATAR : AKOFA_AVATAR}
      </div>
      <div style={{
        maxWidth: '78%',
        background: isUser ? '#C8922A' : 'rgba(255,255,255,0.07)',
        color: isUser ? '#0E0A06' : '#F5EDD6',
        padding: '10px 13px',
        borderRadius: isUser ? '14px 2px 14px 14px' : '2px 14px 14px 14px',
        fontSize: 13,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
        {msg.timestamp && (
          <p style={{ fontSize: 10, opacity: 0.5, margin: '4px 0 0', textAlign: isUser ? 'left' : 'right' }}>
            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ChatbotWidget() {
  const location = useLocation()
  const pageCtx  = getPageContext(location.pathname)

  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([
    {
      role: 'assistant',
      content: `Akpé ! 🌍 Je suis **Akofa**, votre guide virtuel du Bénin.\n\nQue souhaitez-vous découvrir aujourd'hui ? Je peux vous conseiller sur les destinations, la culture vodun, la gastronomie ou la vie pratique au Bénin.`,
      timestamp: Date.now(),
    }
  ])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [unread, setUnread]       = useState(0)
  const [showBubble, setShowBubble] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  // Suggestions contextuelles
  const { data: suggestionsData } = useQuery({
    queryKey: ['chatbot-suggestions', pageCtx.page],
    queryFn: () => axios.get(`/api/v1/chatbot/suggestions?page=${pageCtx.page}`).then(r => r.data),
    staleTime: Infinity,
  })
  const suggestions = suggestionsData?.suggestions || []

  // Scroll auto en bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input à l'ouverture
  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Bulle de bienvenue après 8 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open) {
        setShowBubble(true)
        setUnread(1)
        setTimeout(() => setShowBubble(false), 6000)
      }
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', content: text.trim(), timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Construire l'historique pour l'API (sans timestamps, sans msg système initial)
      const history = [...messages, userMsg]
        .filter(m => m.role === 'user' || (m.role === 'assistant' && !m.isWelcome))
        .map(m => ({ role: m.role, content: m.content }))

      const { data } = await axios.post('/api/v1/chatbot/message', {
        messages: history,
        context: { page: pageCtx.label, ...pageCtx },
      })

      setMessages(prev => [...prev, { ...data, timestamp: Date.now() }])
      if (!open) { setUnread(u => u + 1) }

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolé, je rencontre une difficulté technique. Veuillez réessayer dans un instant. 🙏',
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }, [messages, loading, open, pageCtx])

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleSuggestion(s) {
    sendMessage(s)
  }

  function clearConversation() {
    setMessages([{
      role: 'assistant',
      content: `Nouvelle conversation démarrée ! 🌟\n\nComment puis-je vous aider à découvrir le Bénin ?`,
      timestamp: Date.now(),
    }])
  }

  // Compter seulement les messages utilisateur réels (ignorer accueil)
  const msgCount = messages.filter(m => m.role === 'user').length

  return (
    <>
      {/* Bulle de bienvenue */}
      {showBubble && !open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 999,
          background: '#0E0A06', border: '1px solid rgba(200,146,42,0.3)',
          color: '#F5EDD6', padding: '10px 14px', maxWidth: 220,
          fontSize: 12, lineHeight: 1.5,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'bubblePop .3s ease',
        }}>
          <style>{`@keyframes bubblePop { from { opacity:0; transform:scale(.8) translateY(10px); } to { opacity:1; transform:scale(1); } }`}</style>
          <span style={{ color: '#C8922A', fontWeight: 700 }}>Akofa</span> peut répondre à toutes vos questions sur le Bénin ! 🌍
          <div style={{ position: 'absolute', bottom: -6, right: 20, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid rgba(200,146,42,0.3)' }} />
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Guide touristique virtuel Akofa"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 58, height: 58, borderRadius: '50%',
          background: open ? '#1a1208' : 'linear-gradient(135deg, #C8922A, #a06e1a)',
          border: `2px solid ${open ? 'rgba(200,146,42,0.4)' : 'rgba(255,255,255,0.15)'}`,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(200,146,42,0.4)',
          fontSize: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .2s',
          transform: open ? 'rotate(0deg)' : 'scale(1)',
        }}>
        {open ? '✕' : AKOFA_AVATAR}
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: 'white',
            borderRadius: '50%', width: 18, height: 18, fontSize: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Fenêtre chat */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 24, zIndex: 1000,
          width: 'min(380px, calc(100vw - 48px)',
          height: 'min(560px, calc(100vh - 120px))',
          background: '#0E0A06',
          border: '1px solid rgba(200,146,42,0.25)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          animation: 'chatOpen .25s cubic-bezier(.175,.885,.32,1.275)',
          overflow: 'hidden',
        }}>
          <style>{`@keyframes chatOpen { from { opacity:0; transform:scale(.9) translateY(20px); } to { opacity:1; transform:scale(1); } }`}</style>

          {/* Header */}
          <div style={{ background: '#1a1208', borderBottom: '1px solid rgba(200,146,42,0.15)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>{AKOFA_AVATAR}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#F5EDD6', margin: 0 }}>Akofa</p>
              <p style={{ fontSize: 11, color: '#C8922A', margin: '1px 0 0' }}>Guide Touristique Virtuel · {pageCtx.label}</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontSize: 10, color: 'rgba(245,237,214,0.4)' }}>En ligne</span>
            </div>
            <button onClick={clearConversation}
              title="Nouvelle conversation"
              style={{ background: 'none', border: 'none', color: 'rgba(245,237,214,0.3)', cursor: 'pointer', fontSize: 14, padding: '4px', transition: 'color .15s' }}
              onMouseEnter={e => e.target.style.color = '#C8922A'}
              onMouseLeave={e => e.target.style.color = 'rgba(245,237,214,0.3)'}>
              ↺
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,146,42,0.2) transparent' }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: 20 }}>{AKOFA_AVATAR}</div>
                <div style={{ background: 'rgba(255,255,255,0.07)', padding: '6px 12px', borderRadius: '2px 14px 14px 14px' }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions — seulement si peu de messages */}
          {msgCount < 2 && suggestions.length > 0 && !loading && (
            <div style={{ padding: '0 12px 8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ fontSize: 10, color: 'rgba(245,237,214,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, marginTop: 8 }}>Questions fréquentes</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSuggestion(s)}
                    style={{ fontSize: 11, background: 'rgba(200,146,42,0.1)', border: '1px solid rgba(200,146,42,0.2)', color: '#C8922A', padding: '5px 9px', cursor: 'pointer', transition: 'all .15s', borderRadius: 2, textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,146,42,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,146,42,0.1)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} style={{ padding: '10px 12px', borderTop: '1px solid rgba(200,146,42,0.12)', display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Posez votre question..."
              disabled={loading}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(200,146,42,0.2)',
                color: '#F5EDD6',
                padding: '9px 12px',
                fontSize: 13,
                outline: 'none',
                transition: 'border-color .15s',
                '::placeholder': { color: 'rgba(245,237,214,0.3)' },
              }}
              onFocus={e => e.target.style.borderColor = '#C8922A'}
              onBlur={e => e.target.style.borderColor = 'rgba(200,146,42,0.2)'}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? '#C8922A' : 'rgba(200,146,42,0.2)',
                border: 'none', color: input.trim() && !loading ? '#0E0A06' : 'rgba(245,237,214,0.3)',
                padding: '9px 14px', fontSize: 16, cursor: input.trim() && !loading ? 'pointer' : 'default',
                transition: 'all .2s', fontWeight: 700,
              }}>
              ↑
            </button>
          </form>

          {/* Footer */}
          <div style={{ padding: '6px 12px 8px', textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: 'rgba(245,237,214,0.2)', margin: 0 }}>
              Propulsé par Claude · VisitBénin ©
            </p>
          </div>
        </div>
      )}
    </>
  )
}
