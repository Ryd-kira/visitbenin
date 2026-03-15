import { Link } from 'react-router-dom'

const TYPE_ROUTES = {
  place:      '/destinations',
  restaurant: '/gastronomie',
  school:     '/ecoles',
  hotel:      '/hotels',
}

export default function PlaceCard({ item, type = 'place', variant = 'grid' }) {
  const route = `${TYPE_ROUTES[type]}/${item.slug}`

  if (variant === 'list') {
    return (
      <Link to={route} className="flex gap-4 p-4 bg-white border border-or/10 hover:border-or/40 transition-all group" style={{ display: 'flex', gap: 16, padding: 16, background: 'white', border: '1px solid rgba(200,146,42,0.1)', textDecoration: 'none' }}>
        {item.cover_image && (
          <img src={item.cover_image} alt={item.name} style={{ width: 96, height: 72, objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#C8922A', marginBottom: 4 }}>{item.city?.name}</p>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#0E0A06', fontSize: 16, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h3>
          <p style={{ fontSize: 12, color: '#7A5C30', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.short_desc}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <span style={{ color: '#C8922A', fontSize: 12 }}>{'★'.repeat(Math.round(item.rating || 0))}</span>
            <span style={{ fontWeight: 600, fontSize: 12 }}>{Number(item.rating || 0).toFixed(1)}</span>
            {item.review_count !== undefined && <span style={{ fontSize: 11, color: '#7A5C30' }}>({item.review_count})</span>}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={route} style={{ display: 'block', textDecoration: 'none', background: 'white', border: '1px solid rgba(200,146,42,0.1)', overflow: 'hidden', transition: 'transform 0.3s, border-color 0.3s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(200,146,42,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(200,146,42,0.1)' }}
    >
      <div style={{ position: 'relative', height: 192, overflow: 'hidden' }}>
        <img
          src={item.cover_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600'}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        {item.is_featured && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: '#C8922A', color: '#0E0A06', fontSize: 10, fontWeight: 600, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Top</span>
        )}
        {item.is_unesco && (
          <span style={{ position: 'absolute', top: 12, right: 12, background: '#0E0A06', color: '#F5EDD6', fontSize: 10, padding: '2px 8px' }}>UNESCO</span>
        )}
        {item.price_range && (
          <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(14,10,6,0.8)', color: '#C8922A', fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
            {{ low: '€', medium: '€€', high: '€€€' }[item.price_range]}
          </span>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#C8922A', marginBottom: 4 }}>{item.city?.name || item.city}</p>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#0E0A06', fontSize: 17, lineHeight: 1.3, marginBottom: 6 }}>{item.name}</h3>
        <p style={{ fontSize: 12, color: '#7A5C30', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.short_desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <span style={{ color: '#C8922A', fontSize: 13 }}>{'★'.repeat(Math.round(item.rating || 0))}</span>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{Number(item.rating || 0).toFixed(1)}</span>
          {item.review_count !== undefined && <span style={{ fontSize: 11, color: '#7A5C30' }}>({item.review_count?.toLocaleString()})</span>}
        </div>
      </div>
    </Link>
  )
}
