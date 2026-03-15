// frontend/src/pages/Marketplace.jsx
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from '@/services/api.js'
import { useAuthStore } from '@/store/useAuthStore'

// ── API ──
const api = {
  products: (params) => axios.get('/api/v1/marketplace/products', { params }).then(r => r.data),
  shops:    ()       => axios.get('/api/v1/marketplace/shops').then(r => r.data.data),
  cart:     ()       => axios.get('/api/v1/marketplace/orders/cart').then(r => r.data.data),
  addCart:  (d)      => axios.post('/api/v1/marketplace/orders/cart/add', d),
  removeCart:(id)    => axios.delete(`/api/v1/marketplace/orders/cart/remove/${id}`),
  checkout: (d)      => axios.post('/api/v1/marketplace/orders/checkout', d),
}

const CATEGORIES = [
  { id: 'nourriture', label: 'Nourriture',   icon: '🍲' },
  { id: 'artisanat',  label: 'Artisanat',    icon: '🎨' },
  { id: 'vetements',  label: 'Vêtements',    icon: '👗' },
  { id: 'beaute',     label: 'Beauté',       icon: '💄' },
  { id: 'services',   label: 'Services',     icon: '🛠' },
  { id: 'autre',      label: 'Autre',        icon: '📦' },
]

const PAYMENT_METHODS = [
  { id: 'mtn_money',  icon: '📱', label: 'MTN Mobile Money',  color: '#f59e0b' },
  { id: 'moov_money', icon: '📱', label: 'Moov Money',        color: '#3b82f6' },
  { id: 'cash',       icon: '💵', label: 'Paiement à la livraison', color: '#22c55e' },
]

function formatPrice(p) { return p?.toLocaleString('fr-FR') + ' FCFA' }

// ════════════════════════════════════════
// COMPOSANT PANIER
// ════════════════════════════════════════
function CartPanel({ isOpen, onClose }) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [step, setStep] = useState('cart') // cart | checkout | done
  const [form, setForm] = useState({ delivery_address: '', delivery_city: 'Cotonou', contact_name: user?.name || '', contact_phone: '', contact_email: user?.email || '', payment_method: '', notes: '' })

  const { data: cart } = useQuery({ queryKey: ['cart'], queryFn: api.cart, enabled: !!user && isOpen })
  const items = cart?.items || []
  const total = cart?.total_price || 0

  const remove = useMutation({
    mutationFn: api.removeCart,
    onSuccess: () => qc.invalidateQueries(['cart']),
  })

  const checkout = useMutation({
    mutationFn: api.checkout,
    onSuccess: () => { qc.invalidateQueries(['cart']); setStep('done') },
  })

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', justifyContent: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', maxWidth: 420, height: '100%', background: 'white', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ background: '#0E0A06', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, color: '#C8922A', letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
              {step === 'done' ? 'Commande passée !' : 'Mon panier'}
            </p>
            {step === 'cart' && <p style={{ fontSize: 13, color: 'rgba(245,237,214,0.5)', margin: '2px 0 0' }}>{items.length} article{items.length > 1 ? 's' : ''}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(245,237,214,0.5)', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>

          {/* Pas connecté */}
          {!user && (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>🛒</p>
              <p style={{ fontWeight: 700, marginBottom: 8 }}>Connectez-vous pour accéder à votre panier</p>
              <Link to="/connexion" onClick={onClose} style={{ display: 'inline-block', background: '#C8922A', color: 'white', padding: '10px 24px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Se connecter</Link>
            </div>
          )}

          {/* Commande confirmée */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ fontSize: 56, marginBottom: 16 }}>🎉</p>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#111827', marginBottom: 8 }}>Commande passée !</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>Vous serez contacté par le vendeur sous 24h pour confirmer la livraison.</p>
              <Link to="/dashboard" onClick={() => { onClose(); setStep('cart') }}
                style={{ display: 'inline-block', background: '#0E0A06', color: '#F5EDD6', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                Voir mes commandes
              </Link>
            </div>
          )}

          {/* Panier */}
          {user && step === 'cart' && (
            items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <p style={{ fontSize: 36 }}>🛍️</p>
                <p style={{ color: '#9ca3af', marginTop: 8 }}>Votre panier est vide</p>
                <button onClick={onClose} style={{ marginTop: 16, background: '#C8922A', color: 'white', border: 'none', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Continuer les achats
                </button>
              </div>
            ) : (
              <div>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ width: 64, height: 64, background: '#f9fafb', flexShrink: 0, overflow: 'hidden' }}>
                      {item.product?.images?.[0]
                        ? <img src={item.product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📦</div>
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2, lineHeight: 1.3 }}>{item.product?.name}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{item.product?.shop?.name}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#C8922A' }}>{formatPrice(item.subtotal)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                          <span>×{item.quantity}</span>
                          <button onClick={() => remove.mutate(item.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>🗑</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 16, padding: '14px', background: '#f9fafb', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                    <span>Sous-total</span><span>{formatPrice(total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
                    <span>Livraison</span><span style={{ color: '#22c55e' }}>À confirmer avec le vendeur</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#111827', borderTop: '1px solid #e5e7eb', paddingTop: 10 }}>
                    <span>Total</span><span style={{ color: '#C8922A' }}>{formatPrice(total)}</span>
                  </div>
                </div>

                <button onClick={() => setStep('checkout')}
                  style={{ width: '100%', background: '#C8922A', color: 'white', border: 'none', padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Passer la commande →
                </button>
              </div>
            )
          )}

          {/* Checkout */}
          {user && step === 'checkout' && (
            <div>
              <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', color: '#C8922A', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16, fontWeight: 600 }}>
                ← Retour au panier
              </button>

              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Informations de livraison</h3>

              {[
                ['contact_name',  'Nom complet *',    'text'],
                ['contact_phone', 'Téléphone (WhatsApp) *', 'tel'],
                ['contact_email', 'Email *',          'email'],
                ['delivery_address', 'Adresse *',     'text'],
                ['delivery_city',    'Ville *',       'text'],
              ].map(([k, label, type]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input type={type} value={form[k]}
                    onChange={e => setForm(f => ({...f, [k]: e.target.value}))}
                    style={{ width: '100%', border: '1px solid #e5e7eb', padding: '9px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              ))}

              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10, marginTop: 16 }}>Mode de paiement *</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.id} type="button" onClick={() => setForm(f => ({...f, payment_method: pm.id}))}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: `2px solid ${form.payment_method === pm.id ? pm.color : '#e5e7eb'}`, background: form.payment_method === pm.id ? pm.color + '12' : 'white', cursor: 'pointer' }}>
                    <span style={{ fontSize: 20 }}>{pm.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: form.payment_method === pm.id ? 700 : 400 }}>{pm.label}</span>
                    {form.payment_method === pm.id && <span style={{ marginLeft: 'auto', color: pm.color }}>✓</span>}
                  </button>
                ))}
              </div>

              <div style={{ background: '#f9fafb', padding: '12px', marginBottom: 16, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#111827' }}>
                  <span>Total à payer</span>
                  <span style={{ color: '#C8922A' }}>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={() => checkout.mutate(form)}
                disabled={checkout.isPending || !form.payment_method || !form.contact_name || !form.contact_phone}
                style={{ width: '100%', background: '#C8922A', color: 'white', border: 'none', padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: checkout.isPending ? 0.7 : 1 }}>
                {checkout.isPending ? 'Traitement...' : '✅ Confirmer la commande'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════
export default function Marketplace() {
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const [category, setCategory]       = useState('')
  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [cartOpen, setCartOpen]       = useState(false)
  const [view, setView]               = useState('products') // products | shops
  const [addedId, setAddedId]         = useState(null)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['mp-products', category, search],
    queryFn: () => api.products({ category: category || undefined, search: search || undefined, limit: 40 }),
  })

  const { data: shops } = useQuery({
    queryKey: ['mp-shops'],
    queryFn: api.shops,
    enabled: view === 'shops',
  })

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: api.cart,
    enabled: !!user,
  })

  const cartCount = cart?.items?.length || 0

  const addToCart = useMutation({
    mutationFn: api.addCart,
    onSuccess: (_, vars) => {
      qc.invalidateQueries(['cart'])
      setAddedId(vars.product_id)
      setTimeout(() => setAddedId(null), 2000)
    },
  })

  const products = productsData?.data || []
  const total    = productsData?.total || 0

  function handleSearch(e) {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>

      {/* ── HERO ── */}
      <div style={{ background: '#0E0A06', padding: '48px 24px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, rgba(200,146,42,0.08) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: '#C8922A', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>🛒 Commerce Local</p>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem,4vw,3.2rem)', color: '#F5EDD6', fontWeight: 700, marginBottom: 10, lineHeight: 1.15 }}>
                MissèBo Market<br />
                <em style={{ color: '#C8922A', fontStyle: 'normal' }}>Produits du Bénin</em>
              </h1>
              <p style={{ color: 'rgba(245,237,214,0.45)', maxWidth: 500, lineHeight: 1.7 }}>
                Artisanat, épices, pagnes, poteries — achetez directement aux producteurs béninois. Livraison à Cotonou et dans les grandes villes.
              </p>
            </div>

            {/* Bouton panier */}
            <button onClick={() => setCartOpen(true)}
              style={{ position: 'relative', background: '#C8922A', color: '#0E0A06', border: 'none', padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'center' }}>
              🛒 Mon panier
              {cartCount > 0 && (
                <span style={{ background: '#0E0A06', color: '#C8922A', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Tabs vue */}
          <div style={{ display: 'flex', gap: 0, marginTop: 24 }}>
            {[['products', '🛍️ Produits'], ['shops', '🏪 Boutiques']].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '8px 18px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none', color: view === v ? '#C8922A' : 'rgba(245,237,214,0.4)', fontWeight: view === v ? 700 : 400, borderBottom: `2px solid ${view === v ? '#C8922A' : 'transparent'}`, transition: 'all .15s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── VUE PRODUITS ── */}
        {view === 'products' && (
          <>
            {/* Filtres */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6 }}>
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  placeholder="Rechercher un produit..."
                  style={{ border: '1px solid #e5e7eb', padding: '8px 14px', fontSize: 13, outline: 'none', width: 220 }} />
                <button type="submit" style={{ background: '#C8922A', color: 'white', border: 'none', padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>Chercher</button>
                {search && <button type="button" onClick={() => { setSearch(''); setSearchInput('') }} style={{ background: 'none', border: '1px solid #e5e7eb', padding: '8px 12px', fontSize: 12, cursor: 'pointer', color: '#6b7280' }}>✕</button>}
              </form>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => setCategory('')}
                  style={{ padding: '7px 14px', fontSize: 12, cursor: 'pointer', border: 'none', background: !category ? '#0E0A06' : '#f3f4f6', color: !category ? '#F5EDD6' : '#374151', fontWeight: !category ? 700 : 400 }}>
                  Tout
                </button>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCategory(category === c.id ? '' : c.id)}
                    style={{ padding: '7px 14px', fontSize: 12, cursor: 'pointer', border: 'none', background: category === c.id ? '#C8922A' : '#f3f4f6', color: category === c.id ? 'white' : '#374151', fontWeight: category === c.id ? 700 : 400 }}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>{total} produit{total > 1 ? 's' : ''}</p>
            </div>

            {/* Grille produits */}
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9ca3af' }}>
                <p style={{ fontSize: 32 }}>⏳</p><p>Chargement...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', border: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 36 }}>📭</p>
                <p style={{ color: '#9ca3af', marginTop: 8 }}>Aucun produit trouvé</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    added={addedId === product.id}
                    onAdd={() => {
                      if (!user) { setCartOpen(true); return }
                      addToCart.mutate({ product_id: product.id, quantity: 1 })
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── VUE BOUTIQUES ── */}
        {view === 'shops' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {(shops || []).map(shop => (
              <div key={shop.id} style={{ background: 'white', border: '1px solid #f3f4f6', overflow: 'hidden', transition: 'box-shadow .2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ height: 140, overflow: 'hidden', background: '#f3f4f6', position: 'relative' }}>
                  {shop.cover_image
                    ? <img src={shop.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏪</div>
                  }
                  {shop.is_verified && (
                    <span style={{ position: 'absolute', top: 8, right: 8, background: '#22c55e', color: 'white', fontSize: 10, padding: '3px 8px', fontWeight: 700 }}>✓ Vérifié</span>
                  )}
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{shop.name}</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>📍 {shop.city} · {shop._count?.products || 0} produits</p>
                  {shop.description && <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 12 }}>{shop.description.slice(0, 90)}…</p>}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {shop.whatsapp && (
                      <a href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                        style={{ background: '#25d366', color: 'white', padding: '7px 12px', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                        💬 WhatsApp
                      </a>
                    )}
                    <button onClick={() => { setView('products') }}
                      style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '7px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                      Voir produits
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SECTION CONFIANCE ── */}
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            ['🛡️', 'Vendeurs vérifiés', 'Chaque boutique est contrôlée par notre équipe'],
            ['📱', 'Paiement Mobile Money', 'MTN Money, Moov Money et espèces acceptés'],
            ['🚴', 'Livraison Cotonou', 'Livraison via Gozem sous 24h à Cotonou'],
            ['🤝', '100% Local', 'Directement des producteurs béninois'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: 'white', border: '1px solid #f3f4f6', padding: '18px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>{icon}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{title}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panier drawer */}
      <CartPanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Badge panier flottant mobile */}
      {cartCount > 0 && !cartOpen && (
        <button onClick={() => setCartOpen(true)}
          style={{ position: 'fixed', bottom: 24, right: 24, background: '#C8922A', color: '#0E0A06', border: 'none', borderRadius: '50px', padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(200,146,42,0.4)', zIndex: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          🛒 {cartCount} article{cartCount > 1 ? 's' : ''}
        </button>
      )}
    </div>
  )
}

// ── Carte produit ──
function ProductCard({ product, added, onAdd }) {
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  return (
    <div style={{ background: 'white', border: '1px solid #f3f4f6', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow .2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

      <div style={{ height: 180, overflow: 'hidden', background: '#f3f4f6', position: 'relative' }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📦</div>
        }
        {product.is_featured && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: '#C8922A', color: 'white', fontSize: 10, padding: '3px 8px', fontWeight: 700 }}>⭐ Top vente</span>
        )}
        {discount && (
          <span style={{ position: 'absolute', top: 8, right: 8, background: '#ef4444', color: 'white', fontSize: 10, padding: '3px 8px', fontWeight: 700 }}>-{discount}%</span>
        )}
      </div>

      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 10, color: '#C8922A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>
          {product.shop?.name} · {product.shop?.city}
          {product.shop?.is_verified && ' ✓'}
        </p>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.3, marginBottom: 6, flex: 1 }}>{product.name}</h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#C8922A', margin: 0 }}>{formatPrice(product.price)}</p>
            {product.original_price && (
              <p style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through', margin: 0 }}>{formatPrice(product.original_price)}</p>
            )}
            <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>/ {product.unit}</p>
          </div>
          <button onClick={onAdd}
            style={{ background: added ? '#22c55e' : '#0E0A06', color: 'white', border: 'none', padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
            {added ? '✓ Ajouté' : '+ Panier'}
          </button>
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p style={{ fontSize: 10, color: '#ef4444', marginTop: 6 }}>⚠ Plus que {product.stock} en stock</p>
        )}
      </div>
    </div>
  )
}
