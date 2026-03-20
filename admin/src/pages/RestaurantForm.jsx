// admin/src/pages/RestaurantForm.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantsAPI } from '@/services/api'
import MediaUploader from '@/components/ui/MediaUploader'
import { PageHeader, Input, Select, Textarea, Btn, Toggle } from '@/components/ui/index'

const CITY_OPTS = [
  { value: '', label: '— Ville —' },
  { value: 'cotonou', label: 'Cotonou' },
  { value: 'porto-novo', label: 'Porto-Novo' },
  { value: 'ouidah', label: 'Ouidah' },
  { value: 'abomey', label: 'Abomey' },
  { value: 'grand-popo', label: 'Grand-Popo' },
]
const PRICE_OPTS = [
  { value: 'low', label: '€ — Petits prix (< 3 000 FCFA)' },
  { value: 'medium', label: '€€ — Moyen (3 000 – 10 000 FCFA)' },
  { value: 'high', label: '€€€ — Gastronomique (> 10 000 FCFA)' },
]
const EMPTY = {
  name: '', cuisine_type: '', price_range: 'medium', description: '',
  short_desc: '', city_id: '', address: '', latitude: '', longitude: '',
  phone: '', website: '', cover_image: '', gallery: [], videos: [],
  has_delivery: false, has_reservation: false, has_wifi: false, has_parking: false, has_ac: false,
  is_published: false, is_featured: false,
}

export default function RestaurantForm() {
  const { id } = useParams(); const isEdit = Boolean(id)
  const navigate = useNavigate(); const qc = useQueryClient()
  const [form, setForm] = useState(EMPTY)
  const [saved, setSaved] = useState(false)

  const { data: existing } = useQuery({ queryKey: ['admin', 'restaurant', id], queryFn: () => restaurantsAPI.get(id), enabled: isEdit })
  useEffect(() => { if (existing) setForm({ ...EMPTY, ...existing, city_id: existing.city_id || '' }) }, [existing])

  const mutation = useMutation({
    mutationFn: d => isEdit ? restaurantsAPI.update(id, d) : restaurantsAPI.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] }); setSaved(true); setTimeout(() => { setSaved(false); if (!isEdit) navigate('/restaurants') }, 1500) },
  })

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }))

  return (
    <div className="animate-fade-in" style={{ maxWidth: 860 }}>
      <PageHeader
        title={isEdit ? 'Modifier le restaurant' : 'Nouveau restaurant'}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {saved && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)' }}>✓ SAUVEGARDÉ</span>}
            <Btn variant="ghost" onClick={() => navigate('/restaurants')}>Annuler</Btn>
            <Btn onClick={() => mutation.mutate({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) })} disabled={mutation.isPending}>
              {mutation.isPending ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer'}
            </Btn>
          </div>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ gridColumn: '1/-1' }}><Input label="Nom *" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
        <Input label="Type de cuisine" value={form.cuisine_type} onChange={e => set('cuisine_type', e.target.value)} placeholder="ex : Béninoise traditionnelle" />
        <Select label="Budget" value={form.price_range} onChange={e => set('price_range', e.target.value)} options={PRICE_OPTS} />
        <div style={{ gridColumn: '1/-1' }}><Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={4} /></div>
        <div style={{ gridColumn: '1/-1' }}><Input label="Résumé court" value={form.short_desc} onChange={e => set('short_desc', e.target.value)} /></div>
        <Select label="Ville" value={form.city_id} onChange={e => set('city_id', e.target.value)} options={CITY_OPTS} />
        <Input label="Adresse" value={form.address} onChange={e => set('address', e.target.value)} />
        <Input label="Latitude" type="number" step="0.0001" value={form.latitude} onChange={e => set('latitude', e.target.value)} />
        <Input label="Longitude" type="number" step="0.0001" value={form.longitude} onChange={e => set('longitude', e.target.value)} />
        <Input label="Téléphone" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <Input label="Site web" type="url" value={form.website} onChange={e => set('website', e.target.value)} />
        <div style={{ gridColumn: '1/-1', background: '#111', border: '1px solid #222', padding: 16 }}>
            <MediaUploader
              label="Photos & Vidéos"
              images={form.gallery}
              videos={form.videos}
              coverImage={form.cover_image}
              onImagesChange={urls => set('gallery', urls)}
              onVideosChange={urls => set('videos', urls)}
              onCoverChange={url => set('cover_image', url)}
            />
          </div>

        <div style={{ gridColumn: '1/-1', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', letterSpacing: 3 }}>OPTIONS & SERVICES</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Toggle checked={form.has_delivery}    onChange={v => set('has_delivery',    v)} label="Livraison disponible" />
          <Toggle checked={form.has_reservation} onChange={v => set('has_reservation', v)} label="Réservation possible" />
          <Toggle checked={form.has_wifi}        onChange={v => set('has_wifi',        v)} label="WiFi gratuit" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Toggle checked={form.has_parking}  onChange={v => set('has_parking',  v)} label="Parking" />
          <Toggle checked={form.has_ac}       onChange={v => set('has_ac',       v)} label="Climatisation" />
          <Toggle checked={form.is_published} onChange={v => set('is_published', v)} label="Publié sur le site" />
          <Toggle checked={form.is_featured}  onChange={v => set('is_featured',  v)} label="Mis en avant" />
        </div>
      </div>
    </div>
  )
}
