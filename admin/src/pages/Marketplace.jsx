// admin/src/pages/Marketplace.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const TABS = ['Commandes', 'Boutiques', 'Produits']

const ORDER_STATUS = {
  pending:   { label: 'En attente',  color: '#f59e0b' },
  confirmed: { label: 'Confirmée',   color: '#60a5fa' },
  shipped:   { label: 'Expédiée',    color: '#a78bfa' },
  delivered: { label: 'Livrée',      color: '#4ade80' },
  cancelled: { label: 'Annulée',     color: '#f87171' },
}

export default function AdminMarketplace() {
  const [tab, setTab] = useState('Commandes')
  const qc = useQueryClient()

  // ── Commandes ──
  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => axios.get('/api/v1/marketplace/orders').then(r => r.data),
    enabled: tab === 'Commandes',
  })

  // ── Boutiques ──
  const { data: shopsData } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: () => axios.get('/api/v1/marketplace/shops?limit=50').then(r => r.data),
    enabled: tab === 'Boutiques',
  })

  // ── Produits ──
  const { data: productsData } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => axios.get('/api/v1/marketplace/products?limit=100').then(r => r.data),
    enabled: tab === 'Produits',
  })

  const updateOrder = useMutation({
    mutationFn: ({ id, status, payment_status }) => axios.patch(`/api/v1/marketplace/orders/${id}`, { status, payment_status }),
    onSuccess: () => qc.invalidateQueries(['admin-orders']),
  })

  const toggleShop = useMutation({
    mutationFn: ({ id, is_published, is_verified }) => axios.patch(`/api/v1/marketplace/shops/${id}/publish`, { is_published, is_verified }),
    onSuccess: () => qc.invalidateQueries(['admin-shops']),
  })

  const toggleProduct = useMutation({
    mutationFn: ({ id, is_published, is_featured }) => axios.patch(`/api/v1/marketplace/products/${id}/publish`, { is_published, is_featured }),
    onSuccess: () => qc.invalidateQueries(['admin-products']),
  })

  const orders   = ordersData?.data   || []
  const shops    = shopsData?.data    || []
  const products = productsData?.data || []

  // KPIs
  const pendingOrders   = orders.filter(o => o.status === 'pending').length
  const totalRevenue    = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total_price, 0)

  return (
    <div style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#F5EDD6', minHeight: '100vh', padding: '24px 0' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b', margin: 0 }}>🛒 Marketplace</h1>
        <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.4)', marginTop: 4 }}>Gestion boutiques, produits, commandes</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginBottom: 24 }}>
        {[
          ['Commandes en attente', pendingOrders,       '#f59e0b'],
          ['Boutiques actives',    shops.filter(s => s.is_published).length, '#4ade80'],
          ['Produits publiés',     products.filter(p => p.is_published).length, '#60a5fa'],
          ['Revenus encaissés',    `${totalRevenue.toLocaleString()} F`, '#a78bfa'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: '#111', border: `1px solid ${color}20`, padding: '14px 16px' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color, margin: 0 }}>{val}</p>
            <p style={{ fontSize: 11, color: 'rgba(245,237,214,0.4)', marginTop: 4 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #222' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background: 'none', border: 'none', padding: '10px 18px', fontSize: 13, cursor: 'pointer', color: tab === t ? '#f59e0b' : 'rgba(245,237,214,0.4)', borderBottom: `2px solid ${tab === t ? '#f59e0b' : 'transparent'}`, fontFamily: 'inherit', fontWeight: tab === t ? 700 : 400, transition: 'all .15s' }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── COMMANDES ── */}
      {tab === 'Commandes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {orders.length === 0 && <p style={{ color: 'rgba(245,237,214,0.3)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>Aucune commande</p>}
          {orders.map(order => {
            const sc = ORDER_STATUS[order.status] || ORDER_STATUS.pending
            return (
              <div key={order.id} style={{ background: '#111', border: '1px solid #222', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
                      <span style={{ fontSize: 10, background: sc.color + '20', color: sc.color, padding: '2px 8px', fontWeight: 700 }}>{sc.label}</span>
                      <span style={{ fontSize: 10, color: 'rgba(245,237,214,0.35)' }}>#{order.id.slice(0,8).toUpperCase()}</span>
                      <span style={{ fontSize: 10, color: 'rgba(245,237,214,0.35)' }}>{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#F5EDD6', marginBottom: 3 }}>
                      👤 {order.contact_name || order.user?.name} · {order.contact_phone}
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.4)' }}>
                      📍 {order.delivery_address}, {order.delivery_city}
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.4)', marginTop: 4 }}>
                      🛍️ {order.items?.map(i => `${i.product?.name} ×${i.quantity}`).join(', ')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', margin: 0 }}>{order.total_price?.toLocaleString()} F</p>
                    <p style={{ fontSize: 11, color: 'rgba(245,237,214,0.35)', margin: '2px 0 0' }}>{order.payment_method?.replace('_', ' ')}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {order.status === 'pending' && (
                    <>
                      <Btn color="#60a5fa" onClick={() => updateOrder.mutate({ id: order.id, status: 'confirmed' })}>✓ Confirmer</Btn>
                      <Btn color="#f87171" onClick={() => updateOrder.mutate({ id: order.id, status: 'cancelled' })}>✕ Annuler</Btn>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <Btn color="#a78bfa" onClick={() => updateOrder.mutate({ id: order.id, status: 'shipped' })}>📦 Expédier</Btn>
                  )}
                  {order.status === 'shipped' && (
                    <Btn color="#4ade80" onClick={() => updateOrder.mutate({ id: order.id, status: 'delivered' })}>✅ Livré</Btn>
                  )}
                  {order.payment_status === 'unpaid' && order.status !== 'cancelled' && (
                    <Btn color="#4ade80" onClick={() => updateOrder.mutate({ id: order.id, payment_status: 'paid' })}>💳 Payé</Btn>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── BOUTIQUES ── */}
      {tab === 'Boutiques' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {shops.length === 0 && <p style={{ color: 'rgba(245,237,214,0.3)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>Aucune boutique</p>}
          {shops.map(shop => (
            <div key={shop.id} style={{ background: '#111', border: '1px solid #222', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, background: '#1a1a1a', overflow: 'hidden', flexShrink: 0 }}>
                  {shop.cover_image ? <img src={shop.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏪</div>}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#F5EDD6', margin: 0 }}>{shop.name}</p>
                    {shop.is_verified  && <span style={{ fontSize: 10, background: '#14532d', color: '#4ade80', padding: '2px 6px' }}>✓ Vérifié</span>}
                    {shop.is_published && <span style={{ fontSize: 10, background: '#1e3a5f', color: '#60a5fa', padding: '2px 6px' }}>Publié</span>}
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(245,237,214,0.4)', margin: '3px 0 0' }}>📍 {shop.city} · {shop._count?.products || 0} produits</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <Btn color={shop.is_verified ? '#f59e0b' : '#4ade80'}
                  onClick={() => toggleShop.mutate({ id: shop.id, is_published: shop.is_published, is_verified: !shop.is_verified })}>
                  {shop.is_verified ? '✓ Vérifié' : '🔍 Vérifier'}
                </Btn>
                <Btn color={shop.is_published ? '#f87171' : '#4ade80'}
                  onClick={() => toggleShop.mutate({ id: shop.id, is_published: !shop.is_published, is_verified: shop.is_verified })}>
                  {shop.is_published ? '⊗ Dépublier' : '↑ Publier'}
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PRODUITS ── */}
      {tab === 'Produits' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 8 }}>
          {products.length === 0 && <p style={{ color: 'rgba(245,237,214,0.3)', fontSize: 13, padding: '40px 0', textAlign: 'center', gridColumn: '1/-1' }}>Aucun produit</p>}
          {products.map(product => (
            <div key={product.id} style={{ background: '#111', border: '1px solid #222', padding: '12px 14px' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, background: '#1a1a1a', overflow: 'hidden', flexShrink: 0 }}>
                  {product.images?.[0] ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#F5EDD6', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
                  <p style={{ fontSize: 10, color: 'rgba(245,237,214,0.35)', margin: '3px 0 0' }}>{product.shop?.name} · {product.price?.toLocaleString()} F</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {product.is_published && <span style={{ fontSize: 10, background: '#1e3a5f', color: '#60a5fa', padding: '2px 6px' }}>Publié</span>}
                {product.is_featured  && <span style={{ fontSize: 10, background: '#78350f', color: '#f59e0b', padding: '2px 6px' }}>⭐ Top</span>}
                <span style={{ fontSize: 10, color: 'rgba(245,237,214,0.3)' }}>Stock: {product.stock}</span>
              </div>
              <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                <Btn color={product.is_published ? '#f87171' : '#4ade80'}
                  onClick={() => toggleProduct.mutate({ id: product.id, is_published: !product.is_published, is_featured: product.is_featured })}>
                  {product.is_published ? '⊗ Retirer' : '↑ Publier'}
                </Btn>
                <Btn color={product.is_featured ? '#94a3b8' : '#f59e0b'}
                  onClick={() => toggleProduct.mutate({ id: product.id, is_published: product.is_published, is_featured: !product.is_featured })}>
                  {product.is_featured ? '★ Top' : '☆ Mettre en avant'}
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Btn({ children, color, onClick }) {
  return (
    <button onClick={onClick}
      style={{ background: color + '18', color, border: `1px solid ${color}30`, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: '"IBM Plex Mono",monospace', transition: 'background .15s' }}
      onMouseEnter={e => e.currentTarget.style.background = color + '30'}
      onMouseLeave={e => e.currentTarget.style.background = color + '18'}>
      {children}
    </button>
  )
}
