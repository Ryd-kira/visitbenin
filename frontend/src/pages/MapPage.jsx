// frontend/src/pages/MapPage.jsx
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axios from '@/services/api.js'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CATEGORIES = {
  places:      { label: 'Sites',       icon: '🏛', color: '#C4501E', route: '/destinations' },
  restaurants: { label: 'Restaurants', icon: '🍽', color: '#C8922A', route: '/gastronomie' },
  schools:     { label: 'Ecoles',      icon: '🏫', color: '#3A6B47', route: '/ecoles' },
}

const PLACE_TYPES = {
  culture: '#C4501E', nature: '#3A6B47', plage: '#0ea5e9',
  safari: '#92400e', religieux: '#7c3aed', divertissement: '#C8922A',
}

const BENIN_CITIES = [
  { name: 'Cotonou',    coords: [6.3654, 2.4183] },
  { name: 'Porto-Novo', coords: [6.4969, 2.6289] },
  { name: 'Ouidah',     coords: [6.3676, 2.0852] },
  { name: 'Abomey',     coords: [7.1827, 1.9897] },
  { name: 'Parakou',    coords: [9.3370, 2.6280] },
  { name: 'Natitingou', coords: [10.307, 1.3843] },
  { name: 'Ganvie',     coords: [6.4658, 2.4175] },
  { name: 'Pendjari',   coords: [11.165, 1.5177] },
]

function createPin(color, selected = false) {
  const s = selected ? 36 : 28
  return L.divIcon({
    className: '',
    html: `<div style="width:${s}px;height:${s}px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:${selected ? 3 : 2}px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.5)"></div>`,
    iconSize: [s, s], iconAnchor: [s/2, s], popupAnchor: [0, -s-4],
  })
}

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => { if (target) map.flyTo(target.coords, target.zoom || 13, { duration: 1.2 }) }, [target])
  return null
}

export default function MapPage() {
  const [cats, setCats]           = useState({ places: true, restaurants: false, schools: false })
  const [typeFilter, setTypeFilter] = useState(null)
  const [selected, setSelected]   = useState(null)
  const [search, setSearch]       = useState('')
  const [sideOpen, setSideOpen]   = useState(true)
  const [flyTarget, setFlyTarget] = useState(null)

  const { data: pData } = useQuery({ queryKey: ['mp-places'],  queryFn: () => axios.get('/api/v1/places?limit=200').then(r => r.data.data),      enabled: cats.places })
  const { data: rData } = useQuery({ queryKey: ['mp-restos'],  queryFn: () => axios.get('/api/v1/restaurants?limit=200').then(r => r.data.data), enabled: cats.restaurants })
  const { data: sData } = useQuery({ queryKey: ['mp-schools'], queryFn: () => axios.get('/api/v1/schools?limit=200').then(r => r.data.data),     enabled: cats.schools })

  const places = (pData || []).filter(p => p.latitude && p.longitude)
  const restos = (rData || []).filter(p => p.latitude && p.longitude)
  const schools = (sData || []).filter(p => p.latitude && p.longitude)

  const allPoints = [
    ...places.map(p => ({...p, _cat: 'places'})),
    ...restos.map(p =>  ({...p, _cat: 'restaurants'})),
    ...schools.map(p => ({...p, _cat: 'schools'})),
  ]

  const filteredPlaces = typeFilter ? places.filter(p => p.type === typeFilter) : places

  const searchResults = search.length >= 2
    ? allPoints.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.city?.name || p.city || '').toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : []

  function pick(point) {
    setSelected(point)
    setFlyTarget({ coords: [+point.latitude, +point.longitude], zoom: 14 })
    setSearch('')
  }

  const cfg = selected ? CATEGORIES[selected._cat] : null

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', overflow: 'hidden', position: 'relative' }}>

      {/* SIDEBAR */}
      <div style={{ width: sideOpen ? 300 : 0, minWidth: sideOpen ? 300 : 0, background: '#0E0A06', borderRight: '1px solid rgba(200,146,42,0.12)', display: 'flex', flexDirection: 'column', transition: 'all .3s', overflow: 'hidden', zIndex: 10 }}>
        {sideOpen && <>
          {/* Titre + Recherche */}
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(200,146,42,0.08)' }}>
            <p style={{ fontSize: 11, color: '#C8922A', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Carte du Benin · {allPoints.length} lieux</p>
            <div style={{ position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Rechercher..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,146,42,0.18)', color: '#F5EDD6', padding: '8px 12px', fontSize: 12, boxSizing: 'border-box', outline: 'none' }} />
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1208', border: '1px solid rgba(200,146,42,0.2)', zIndex: 200, maxHeight: 200, overflowY: 'auto' }}>
                  {searchResults.map(p => (
                    <button key={p.id} onClick={() => pick(p)}
                      style={{ width: '100%', background: 'none', border: 'none', padding: '9px 12px', color: '#F5EDD6', fontSize: 12, cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 8, alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,146,42,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <span>{CATEGORIES[p._cat]?.icon}</span>
                      <div><p style={{ margin: 0, fontWeight: 600 }}>{p.name}</p><p style={{ margin: 0, fontSize: 10, color: 'rgba(245,237,214,0.4)' }}>{p.city?.name || p.city}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filtres catégorie */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(200,146,42,0.08)' }}>
            <p style={{ fontSize: 10, color: 'rgba(245,237,214,0.28)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 7 }}>Afficher</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {Object.entries(CATEGORIES).map(([k, c]) => (
                <button key={k} onClick={() => setCats(prev => ({...prev, [k]: !prev[k]}))}
                  style={{ padding: '5px 10px', fontSize: 11, cursor: 'pointer', border: 'none', background: cats[k] ? c.color+'28' : 'rgba(255,255,255,0.05)', color: cats[k] ? c.color : 'rgba(245,237,214,0.38)', borderBottom: `2px solid ${cats[k] ? c.color : 'transparent'}` }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre type site */}
          {cats.places && (
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(200,146,42,0.08)' }}>
              <p style={{ fontSize: 10, color: 'rgba(245,237,214,0.28)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 7 }}>Type de site</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <button onClick={() => setTypeFilter(null)}
                  style={{ padding: '4px 9px', fontSize: 10, cursor: 'pointer', border: 'none', background: !typeFilter ? '#C8922A' : 'rgba(255,255,255,0.05)', color: !typeFilter ? '#0E0A06' : 'rgba(245,237,214,0.4)', fontWeight: !typeFilter ? 700 : 400 }}>Tous</button>
                {Object.entries(PLACE_TYPES).map(([k, col]) => (
                  <button key={k} onClick={() => setTypeFilter(typeFilter === k ? null : k)}
                    style={{ padding: '4px 9px', fontSize: 10, cursor: 'pointer', border: 'none', background: typeFilter === k ? col+'28' : 'rgba(255,255,255,0.05)', color: typeFilter === k ? col : 'rgba(245,237,214,0.4)', fontWeight: typeFilter === k ? 700 : 400, textTransform: 'capitalize' }}>
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation villes */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(200,146,42,0.08)' }}>
            <p style={{ fontSize: 10, color: 'rgba(245,237,214,0.28)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 7 }}>Villes</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {BENIN_CITIES.map(c => (
                <button key={c.name} onClick={() => setFlyTarget({ coords: c.coords, zoom: 13 })}
                  style={{ padding: '4px 9px', fontSize: 10, cursor: 'pointer', border: '1px solid rgba(200,146,42,0.15)', background: 'none', color: 'rgba(245,237,214,0.5)', transition: 'all .15s' }}
                  onMouseEnter={e => { e.target.style.color = '#C8922A'; e.target.style.borderColor = '#C8922A' }}
                  onMouseLeave={e => { e.target.style.color = 'rgba(245,237,214,0.5)'; e.target.style.borderColor = 'rgba(200,146,42,0.15)' }}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Fiche sélectionnée ou liste */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
            {selected ? (
              <div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(245,237,214,0.4)', fontSize: 12, cursor: 'pointer', marginBottom: 12, padding: 0 }}>← Retour</button>
                {selected.cover_image && <img src={selected.cover_image} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', marginBottom: 12 }} />}
                <span style={{ fontSize: 10, background: cfg?.color+'28', color: cfg?.color, padding: '2px 8px', fontWeight: 700 }}>{cfg?.icon} {cfg?.label}</span>
                <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 17, color: '#F5EDD6', margin: '10px 0 4px', lineHeight: 1.3 }}>{selected.name}</h3>
                <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.4)', marginBottom: 10 }}>📍 {selected.city?.name || selected.city}</p>
                {selected.short_desc && <p style={{ fontSize: 12, color: 'rgba(245,237,214,0.55)', lineHeight: 1.6, marginBottom: 14 }}>{selected.short_desc}</p>}
                <Link to={`${cfg?.route}/${selected.slug}`}
                  style={{ display: 'block', background: cfg?.color, color: 'white', padding: '10px', textDecoration: 'none', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                  Voir la fiche →
                </Link>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 10, color: 'rgba(245,237,214,0.28)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 9 }}>Derniers ajouts</p>
                {allPoints.slice(0, 12).map(p => (
                  <button key={p.id} onClick={() => pick(p)}
                    style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 8px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,146,42,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <span style={{ fontSize: 15 }}>{CATEGORIES[p._cat]?.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#F5EDD6' }}>{p.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: 'rgba(245,237,214,0.35)' }}>{p.city?.name || p.city}</p>
                    </div>
                  </button>
                ))}
                {allPoints.length > 12 && <p style={{ fontSize: 11, color: '#C8922A', textAlign: 'center', marginTop: 8 }}>+ {allPoints.length - 12} autres — utilisez la recherche</p>}
              </div>
            )}
          </div>
        </>}
      </div>

      {/* Toggle sidebar */}
      <button onClick={() => setSideOpen(o => !o)}
        style={{ position: 'absolute', left: sideOpen ? 300 : 0, top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: '#0E0A06', border: '1px solid rgba(200,146,42,0.2)', color: '#C8922A', width: 18, height: 44, cursor: 'pointer', fontSize: 11, padding: 0, transition: 'left .3s' }}>
        {sideOpen ? '‹' : '›'}
      </button>

      {/* CARTE */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={[9.3, 2.3]} zoom={7} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="© OpenStreetMap © CARTO" />
          <FlyTo target={flyTarget} />

          {cats.places && filteredPlaces.map(p => (
            <Marker key={p.id} position={[+p.latitude, +p.longitude]}
              icon={createPin(PLACE_TYPES[p.type] || '#C4501E', selected?.id === p.id)}
              eventHandlers={{ click: () => pick({...p, _cat:'places'}) }}>
              <Popup><PopupCard entity={p} cat="places" /></Popup>
            </Marker>
          ))}

          {cats.restaurants && restos.map(p => (
            <Marker key={p.id} position={[+p.latitude, +p.longitude]}
              icon={createPin('#C8922A', selected?.id === p.id)}
              eventHandlers={{ click: () => pick({...p, _cat:'restaurants'}) }}>
              <Popup><PopupCard entity={p} cat="restaurants" /></Popup>
            </Marker>
          ))}

          {cats.schools && schools.map(p => (
            <Marker key={p.id} position={[+p.latitude, +p.longitude]}
              icon={createPin('#3A6B47', selected?.id === p.id)}
              eventHandlers={{ click: () => pick({...p, _cat:'schools'}) }}>
              <Popup><PopupCard entity={p} cat="schools" /></Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Légende */}
        <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(14,10,6,0.92)', border: '1px solid rgba(200,146,42,0.18)', padding: '10px 14px', zIndex: 500 }}>
          {Object.entries(CATEGORIES).filter(([k]) => cats[k]).map(([k, c]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, background: c.color, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'rgba(245,237,214,0.55)' }}>{c.icon} {c.label}</span>
            </div>
          ))}
        </div>

        {/* Compteur */}
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(14,10,6,0.85)', border: '1px solid rgba(200,146,42,0.18)', padding: '5px 12px', zIndex: 500 }}>
          <span style={{ fontSize: 11, color: '#C8922A', fontWeight: 700 }}>{allPoints.length} lieux</span>
        </div>
      </div>
    </div>
  )
}

function PopupCard({ entity, cat }) {
  const c = CATEGORIES[cat]
  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif', minWidth: 190, maxWidth: 230 }}>
      {entity.cover_image && <img src={entity.cover_image} alt="" style={{ width: '100%', height: 90, objectFit: 'cover', marginBottom: 8 }} />}
      <p style={{ fontSize: 10, color: c?.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{c?.icon} {c?.label}</p>
      <p style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 3, lineHeight: 1.3 }}>{entity.name}</p>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>📍 {entity.city?.name || entity.city}</p>
      {entity.short_desc && <p style={{ fontSize: 11, color: '#555', lineHeight: 1.5, marginBottom: 8 }}>{entity.short_desc.slice(0, 70)}…</p>}
      <Link to={`${c?.route}/${entity.slug}`}
        style={{ display: 'block', background: c?.color, color: 'white', padding: '6px 10px', textDecoration: 'none', fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
        Voir →
      </Link>
    </div>
  )
}
