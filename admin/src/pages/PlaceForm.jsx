// admin/src/pages/PlaceForm.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { placesAPI } from '@/services/api'
import { PageHeader, Input, Select, Textarea, Btn, Toggle } from '@/components/ui/index'

const TYPE_OPTS = [
  { value: 'culture',       label: 'Culture & Histoire' },
  { value: 'nature',        label: 'Nature' },
  { value: 'plage',         label: 'Plage' },
  { value: 'safari',        label: 'Safari' },
  { value: 'religieux',     label: 'Religieux' },
  { value: 'divertissement',label: 'Divertissement' },
]

const CITY_OPTS = [
  { value: '',            label: '— Choisir une ville —' },
  { value: 'cotonou',     label: 'Cotonou' },
  { value: 'porto-novo',  label: 'Porto-Novo' },
  { value: 'ouidah',      label: 'Ouidah' },
  { value: 'abomey',      label: 'Abomey' },
  { value: 'grand-popo',  label: 'Grand-Popo' },
  { value: 'natitingou',  label: 'Natitingou' },
  { value: 'tanguieta',   label: 'Tanguiéta' },
  { value: 'abomey-calavi', label: 'Abomey-Calavi' },
]

const EMPTY = {
  name: '', type: 'culture', description: '', short_desc: '',
  city_id: '', address: '', latitude: '', longitude: '',
  entry_fee: '', website: '', phone: '', tags: '',
  is_featured: false, is_unesco: false, is_published: false,
  cover_image: '',
}

export default function PlaceForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saved,  setSaved]  = useState(false)

  // Charger le lieu existant si édition
  const { data: existing } = useQuery({
    queryKey: ['admin', 'place', id],
    queryFn: () => placesAPI.get(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        name:        existing.name        || '',
        type:        existing.type        || 'culture',
        description: existing.description || '',
        short_desc:  existing.short_desc  || '',
        city_id:     existing.city_id     || '',
        address:     existing.address     || '',
        latitude:    existing.latitude    || '',
        longitude:   existing.longitude   || '',
        entry_fee:   existing.entry_fee   ?? '',
        website:     existing.website     || '',
        phone:       existing.phone       || '',
        tags:        (existing.tags || []).join(', '),
        is_featured: existing.is_featured || false,
        is_unesco:   existing.is_unesco   || false,
        is_published:existing.is_published|| false,
        cover_image: existing.cover_image || '',
      })
    }
  }, [existing])

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? placesAPI.update(id, data) : placesAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'places'] })
      setSaved(true)
      setTimeout(() => { setSaved(false); if (!isEdit) navigate('/places') }, 1500)
    },
    onError: (err) => {
      const errs = err.response?.data?.errors
      if (errs) setErrors(Object.fromEntries(errs.map(e => [e.field, e.message])))
    },
  })

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => { const n = {...e}; delete n[field]; return n })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      latitude:  Number(form.latitude),
      longitude: Number(form.longitude),
      entry_fee: form.entry_fee !== '' ? Number(form.entry_fee) : null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    mutation.mutate(payload)
  }

  const SECTION = ({ title }) => (
    <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 4 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', letterSpacing: 3, textTransform: 'uppercase' }}>{title}</span>
    </div>
  )

  return (
    <div className="animate-fade-in" style={{ maxWidth: 860 }}>
      <PageHeader
        title={isEdit ? 'Modifier le lieu' : 'Nouveau lieu'}
        subtitle={isEdit ? `ID: ${id}` : 'Créer une nouvelle destination'}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {saved && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)', letterSpacing: 1 }}>✓ SAUVEGARDÉ</span>
            )}
            <Btn variant="ghost" onClick={() => navigate('/places')}>Annuler</Btn>
            <Btn onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer le lieu'}
            </Btn>
          </div>
        }
      />

      {mutation.isError && !Object.keys(errors).length && (
        <div style={{ background: '#1f0505', border: '1px solid #3f0a0a', padding: '10px 14px', marginBottom: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>
          ⚠ {mutation.error?.response?.data?.error || 'Une erreur est survenue'}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          <SECTION title="Informations générales" />

          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Nom du lieu *" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} placeholder="ex : Palais Royaux d'Abomey" required />
          </div>

          <Select label="Type *" value={form.type} onChange={e => set('type', e.target.value)} options={TYPE_OPTS} error={errors.type} />
          <Select label="Ville *" value={form.city_id} onChange={e => set('city_id', e.target.value)} options={CITY_OPTS} error={errors.city_id} />

          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Description complète *" value={form.description} onChange={e => set('description', e.target.value)} error={errors.description} rows={5} placeholder="Description détaillée du lieu, son histoire, pourquoi le visiter..." required />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Résumé court (max 300 car.) *" value={form.short_desc} onChange={e => set('short_desc', e.target.value)} error={errors.short_desc} placeholder="Accroche courte affichée dans les listes" required />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: form.short_desc.length > 280 ? 'var(--red)' : 'var(--muted)', marginTop: 4, display: 'block' }}>
              {form.short_desc.length}/300
            </span>
          </div>

          <SECTION title="Localisation" />

          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Adresse" value={form.address} onChange={e => set('address', e.target.value)} placeholder="ex : Quartier ZONGO, Abomey" />
          </div>
          <Input label="Latitude *" type="number" step="0.0001" value={form.latitude} onChange={e => set('latitude', e.target.value)} error={errors.latitude} placeholder="ex : 7.1827" required />
          <Input label="Longitude *" type="number" step="0.0001" value={form.longitude} onChange={e => set('longitude', e.target.value)} error={errors.longitude} placeholder="ex : 1.9914" required />

          <SECTION title="Informations pratiques" />

          <Input label="Entrée (FCFA, vide = gratuit)" type="number" min="0" value={form.entry_fee} onChange={e => set('entry_fee', e.target.value)} placeholder="ex : 3000" />
          <Input label="Téléphone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+229 21 XX XX XX" />
          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Site web" type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
          </div>

          <SECTION title="Médias" />

          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="URL Image principale" value={form.cover_image} onChange={e => set('cover_image', e.target.value)} placeholder="https://images.unsplash.com/..." />
            {form.cover_image && (
              <img src={form.cover_image} alt="" style={{ marginTop: 8, height: 80, objectFit: 'cover', border: '1px solid var(--border)' }} onError={e => e.target.style.display='none'} />
            )}
          </div>

          <SECTION title="Tags & Options" />

          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Tags (séparés par des virgules)" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="UNESCO, histoire, famille, incontournable" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Toggle checked={form.is_featured} onChange={v => set('is_featured', v)} label="Lieu mis en avant (Top)" />
            <Toggle checked={form.is_unesco}   onChange={v => set('is_unesco',   v)} label="Site UNESCO" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Toggle checked={form.is_published} onChange={v => set('is_published', v)} label="Publié (visible sur le site)" />
          </div>
        </div>

        {/* Submit sticky */}
        <div style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '12px 0', marginTop: 32, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => navigate('/places')} type="button">Annuler</Btn>
          <Btn type="submit" disabled={mutation.isPending} size="lg">
            {mutation.isPending ? 'Sauvegarde en cours...' : isEdit ? '✓ Mettre à jour' : '✓ Créer le lieu'}
          </Btn>
        </div>
      </form>
    </div>
  )
}
