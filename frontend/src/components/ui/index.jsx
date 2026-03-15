// frontend/src/components/ui/PlaceCard.jsx
import { Link } from 'react-router-dom'
import StarRating from './StarRating'

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
      <Link to={route} className="flex gap-4 p-4 bg-white border border-or/10 hover:border-or/40 transition-all group">
        <img src={item.cover_image} alt={item.name} className="w-24 h-24 object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest text-or mb-1">{item.city?.name}</p>
          <h3 className="font-display font-bold text-nuit group-hover:text-terracotta transition-colors truncate">{item.name}</h3>
          <p className="text-sm text-brun-light mt-1 line-clamp-2">{item.short_desc}</p>
          <StarRating value={item.rating} count={item.review_count} className="mt-2" />
        </div>
      </Link>
    )
  }

  return (
    <Link to={route} className="group block bg-white border border-or/10 hover:border-or/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden h-48">
        <img
          src={item.cover_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.is_featured && (
          <span className="absolute top-3 left-3 bg-or text-nuit text-xs font-semibold px-2 py-0.5 uppercase tracking-wide">Top</span>
        )}
        {item.is_unesco && (
          <span className="absolute top-3 right-3 bg-nuit text-sable text-xs px-2 py-0.5">UNESCO</span>
        )}
        {item.price_range && (
          <span className="absolute top-3 right-3">
            <BudgetBadge range={item.price_range} />
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-widest text-or mb-1">{item.city?.name || item.city}</p>
        <h3 className="font-display font-bold text-nuit text-lg leading-tight group-hover:text-terracotta transition-colors">{item.name}</h3>
        <p className="text-sm text-brun-light mt-1.5 line-clamp-2 leading-relaxed">{item.short_desc}</p>
        <StarRating value={item.rating} count={item.review_count} className="mt-3" />
      </div>
    </Link>
  )
}

// ─────────────────────────────────────

// frontend/src/components/ui/StarRating.jsx
export default function StarRating({ value, count, className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-or text-sm">{'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}</span>
      <span className="text-sm font-semibold text-nuit">{Number(value).toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-xs text-brun-light">({count.toLocaleString()})</span>
      )}
    </div>
  )
}

// ─────────────────────────────────────

// frontend/src/components/ui/BudgetBadge.jsx
const RANGE_CONFIG = {
  low:    { label: '€',      bg: 'bg-vert/15',      text: 'text-vert' },
  medium: { label: '€€',     bg: 'bg-or/15',        text: 'text-or-dark' },
  high:   { label: '€€€',    bg: 'bg-terracotta/15',text: 'text-terracotta-dark' },
}

export function BudgetBadge({ range }) {
  const cfg = RANGE_CONFIG[range] || RANGE_CONFIG.medium
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

// ─────────────────────────────────────

// frontend/src/components/ui/PageLoader.jsx
export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 bg-or rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────

// frontend/src/components/ui/FilterBar.jsx
export default function FilterBar({ filters, active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-4 py-2 text-sm font-medium border transition-all ${
            active === f.value
              ? 'bg-or text-nuit border-or'
              : 'bg-white text-brun border-or/20 hover:border-or hover:text-terracotta'
          }`}
        >
          {f.icon && <span className="mr-1.5">{f.icon}</span>}
          {f.label}
        </button>
      ))}
    </div>
  )
}
