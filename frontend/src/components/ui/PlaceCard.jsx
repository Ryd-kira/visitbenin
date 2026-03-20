import { Link } from 'react-router-dom'

const TYPE_ROUTES = {
  place:      '/destinations',
  restaurant: '/gastronomie',
  school:     '/ecoles',
  hotel:      '/hotels',
}

// Placeholder béninois si pas d'image
const FALLBACK_IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Ganvie_stilt_village%2C_Benin.jpg/600px-Ganvie_stilt_village%2C_Benin.jpg'

export default function PlaceCard({ item, type = 'place', variant = 'grid' }) {
  const route = `${TYPE_ROUTES[type]}/${item.slug}`
  const img   = item.cover_image || FALLBACK_IMG

  if (variant === 'list') {
    return (
      <Link to={route} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: 'white', border: '1px solid rgba(200,146,42,0.1)', textDecoration: 'none', transition: 'border-color .2s, box-shadow .2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,146,42,0.35)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(200,146,42,0.08)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,146,42,0.1)';  e.currentTarget.style.boxShadow = 'none' }}>
        <div style={{ width: 96, height: 72, flexShrink: 0, overflow: 'hidden', background: '#f3f4f6' }}>
          <img src={img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = FALLBACK_IMG} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#C8922A', marginBottom: 3 }}>{item.city?.name || item.city}</p>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#0E0A06', fontSize: 15, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h3>
          <p style={{ fontSize: 12, color: '#7A5C30', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.short_desc}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{ color: '#C8922A', fontSize: 11 }}>★</span>
            <span style={{ fontWeight: 600, fontSize: 12, color: '#0E0A06' }}>{Number(item.rating || 0).toFixed(1)}</span>
            {item.review_count !== undefined && <span style={{ fontSize: 11, color: '#9ca3af' }}>({item.review_count})</span>}
            {item.is_unesco && <span style={{ fontSize: 10, background: '#0E0A06', color: '#C8922A', padding: '1px 6px', marginLeft: 4, fontWeight: 700 }}>UNESCO</span>}
          </div>
        </div>
      </Link>
    )
  }

  // Variant grid (défaut)
  return (
    <Link to={route} style={{ display: 'block', textDecoration: 'none', background: 'white', border: '1px solid rgba(200,146,42,0.1)', overflow: 'hidden', transition: 'transform .25s, border-color .25s, box-shadow .25s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(200,146,42,0.3)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(200,146,42,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(200,146,42,0.1)'; e.currentTarget.style.boxShadow = 'none' }}>

      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f3f4f6' }}>
        <img src={img} alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
          onError={e => e.target.src = FALLBACK_IMG}
          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {item.is_featured && (
            <span style={{ background: '#C8922A', color: '#0E0A06', fontSize: 9, fontWeight: 700, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: 1 }}>★ Top</span>
          )}
          {item.is_unesco && (
            <span style={{ background: '#0E0A06', color: '#C8922A', fontSize: 9, fontWeight: 700, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: 1 }}>UNESCO</span>
          )}
        </div>

        {/* Prix range (restaurants) */}
        {item.price_range && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(14,10,6,0.75)', color: '#C8922A', fontSize: 11, fontWeight: 700, padding: '2px 8px', backdropFilter: 'blur(4px)' }}>
            {{ low: '€', medium: '€€', high: '€€€' }[item.price_range]}
          </span>
        )}

        {/* Entrée gratuite */}
        {item.entry_fee === 0 && (
          <span style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(34,197,94,0.85)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px' }}>Entrée libre</span>
        )}

        {/* Nb photos si galerie */}
        {(item.gallery?.length > 0 || item.videos?.length > 0) && (
          <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.8)', fontSize: 10, padding: '2px 8px' }}>
            📷 {(item.gallery?.length || 0) + 1}
            {item.videos?.length > 0 && ` · ▶ ${item.videos.length}`}
          </span>
        )}
      </div>

      {/* Infos */}
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#C8922A', marginBottom: 4 }}>{item.city?.name || item.city}</p>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#0E0A06', fontSize: 16, lineHeight: 1.3, marginBottom: 6 }}>{item.name}</h3>
        {item.short_desc && (
          <p style={{ fontSize: 12, color: '#7A5C30', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 10 }}>
            {item.short_desc}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: '#C8922A', fontSize: 12 }}>★</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#0E0A06' }}>{Number(item.rating || 0).toFixed(1)}</span>
            {item.review_count !== undefined && <span style={{ fontSize: 11, color: '#9ca3af' }}>({item.review_count})</span>}
          </div>
          {item.entry_fee > 0 && (
            <span style={{ fontSize: 11, color: '#7A5C30', fontWeight: 600 }}>{item.entry_fee.toLocaleString()} FCFA</span>
          )}
          {item.phone && (
            <span style={{ fontSize: 11, color: '#C8922A' }}>📞</span>
          )}
        </div>
      </div>
    </Link>
  )
}
