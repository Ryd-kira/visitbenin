// admin/src/pages/PartnerForm.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { PageHeader, Input, Select, Textarea, Btn, Toggle } from '@/components/ui/index'

const TYPE_OPTS = [
  { value: 'agence_tourisme', label: '🏢 Agence de tourisme' },
  { value: 'hebergement',     label: '🏨 Hébergement' },
  { value: 'transport',       label: '🚗 Transport' },
  { value: 'excursion',       label: '🗺️ Excursion / Guide' },
  { value: 'restaurant',      label: '🍽️ Restauration' },
  { value: 'autre',           label: '📌 Autre' },
]

const CITY_OPTS = [
  { value: '', label: '— Choisir une ville —' },
  { value: 'cotonou',       label: 'Cotonou' },
  { value: 'porto-novo',    label: 'Porto-Novo' },
  { value: 'ouidah',        label: 'Ouidah' },
  { value: 'abomey',        label: 'Abomey' },
  { value: 'grand-popo',    label: 'Grand-Popo' },
  { value: 'natitingou',    label: 'Natitingou' },
  { value: 'tanguieta',     label: 'Tanguiéta' },
  { value: 'abomey-calavi', label: 'Abomey-Calavi' },
]

const PRICE_OPTS = [
  { value: 'low',    label: '€ — Économique' },
  { value: 'medium', label: '€€ — Intermédiaire' },
  { value: 'high',   label: '€€€ — Premium' },
]

const EMPTY = {
  name: '', type: 'agence_tourisme', description: '', short_desc: '',
  city_id: '', address: '', latitude: '', longitude: '',
  phone: '', email: '', website: '',
  logo: '', cover_image: '',
  services: '', languages: '',
  price_range: 'medium',
  is_certified: false, is_featured: false, is_published: false,
}

export default function PartnerForm() {
  const { id }    = useParams()
  const isEdit    = Boolean(id)
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const [form,    setForm]  = useState(EMPTY)
  const [saved,   setSaved] = useState(false)
  const [errors,  setErrors]= useState({})

  const { data: existing } = useQuery({
    queryKey: ['admin', 'partner', id],
    queryFn: () => api.get(`/partners/${id}`).then(r => r.data),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        ...EMPTY, ...existing,
        services:  (existing.services  || []).join(', '),
        languages: (existing.languages || []).join(', '),
        city_id:   existing.city_id || '',
        latitude:  existing.latitude  ?? '',
        longitude: existing.longitude ?? '',
      })
    }
  }, [existing])

  const mutation = useMutation({
    mutationFn: payload => isEdit
      ? api.put(`/partners/${id}`, payload).then(r => r.data)
      : api.post('/partners', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'partners'] })
      setSaved(true)
      setTimeout(() => { setSaved(false); if (!isEdit) navigate('/partners') }, 1500)
    },
    onError: err => {
      const errs = err.response?.data?.errors
      if (errs) setErrors(Object.fromEntries(errs.map(e => [e.field, e.message])))
    },
  })

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  function handleSubmit() {
    const payload = {
      ...form,
      latitude:  form.latitude  !== '' ? Number(form.latitude)  : null,
      longitude: form.longitude !== '' ? Number(form.longitude) : null,
      services:  form.services  ? form.services.split(',').map(s => s.trim()).filter(Boolean)  : [],
      languages: form.languages ? form.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
    }
    mutation.mutate(payload)
  }

  const Section = ({ title }) => (
    <div style={{ gridColumn: '1/-1', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 2 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', letterSpacing: 3 }}>{title}</span>
    </div>
  )

  return (
    <div className="animate-fade-in" style={{ maxWidth: 860 }}>
      <PageHeader
        title={isEdit ? 'Modifier le partenaire' : 'Nouveau partenaire'}
        subtitle={isEdit ? `ID : ${id}` : 'Ajouter un partenaire ou une agence'}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {saved && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)', letterSpacing: 1 }}>✓ SAUVEGARDÉ</span>}
            <Btn variant="ghost" onClick={() => navigate('/partners')}>Annuler</Btn>
            <Btn onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? 'Sauvegarde…' : isEdit ? 'Mettre à jour' : 'Créer'}
            </Btn>
          </div>
        }
      />

      {mutation.isError && !Object.keys(errors).length && (
        <div style={{ background: '#1f0505', border: '1px solid #3f0a0a', padding: '10px 14px', marginBottom: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>
          ⚠ {mutation.error?.response?.data?.error || 'Une erreur est survenue'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Section title="INFORMATIONS GÉNÉRALES" />

        <div style={{ gridColumn: '1/-1' }}>
          <Input label="Nom du partenaire *" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} placeholder="ex : Agence Découverte Bénin" required />
        </div>

        <Select label="Type *" value={form.type} onChange={e => set('type', e.target.value)} options={TYPE_OPTS} />
        <Select label="Budget / Gamme" value={form.price_range} onChange={e => set('price_range', e.target.value)} options={PRICE_OPTS} />

        <div style={{ gridColumn: '1/-1' }}>
          <Textarea label="Description complète *" value={form.description} onChange={e => set('description', e.target.value)} rows={4} error={errors.description} required />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Input label="Résumé court (affiché dans les listes)" value={form.short_desc} onChange={e => set('short_desc', e.target.value)} placeholder="Accroche en 1-2 phrases" />
        </div>

        <Section title="LOCALISATION" />

        <Select label="Ville" value={form.city_id} onChange={e => set('city_id', e.target.value)} options={CITY_OPTS} />
        <Input label="Adresse" value={form.address} onChange={e => set('address', e.target.value)} placeholder="ex : Quartier Haie Vive, Cotonou" />
        <Input label="Latitude" type="number" step="0.0001" value={form.latitude} onChange={e => set('latitude', e.target.value)} placeholder="ex : 6.3654" />
        <Input label="Longitude" type="number" step="0.0001" value={form.longitude} onChange={e => set('longitude', e.target.value)} placeholder="ex : 2.4183" />

        <Section title="CONTACTS" />

        <Input label="Téléphone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+229 21 XX XX XX" />
        <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@agence.bj" />
        <div style={{ gridColumn: '1/-1' }}>
          <Input label="Site web" type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
        </div>

        <Section title="MÉDIAS" />

        <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Input label="Logo (URL)" value={form.logo} onChange={e => set('logo', e.target.value)} placeholder="https://..." />
            {form.logo && <img src={form.logo} alt="" style={{ marginTop: 8, height: 48, objectFit: 'contain', background: 'var(--surface2)', padding: 4 }} onError={e => e.target.style.display='none'} />}
          </div>
          <div>
            <Input label="Image de couverture (URL)" value={form.cover_image} onChange={e => set('cover_image', e.target.value)} placeholder="https://..." />
            {form.cover_image && <img src={form.cover_image} alt="" style={{ marginTop: 8, height: 48, objectFit: 'cover', width: '100%' }} onError={e => e.target.style.display='none'} />}
          </div>
        </div>

        <Section title="SERVICES & LANGUES" />

        <div style={{ gridColumn: '1/-1' }}>
          <Input label="Services proposés (séparés par des virgules)" value={form.services} onChange={e => set('services', e.target.value)}
            placeholder="ex : Safari, Guide local, Location 4x4, Hébergement, Transfert aéroport" />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Input label="Langues parlées (séparées par des virgules)" value={form.languages} onChange={e => set('languages', e.target.value)}
            placeholder="ex : Français, Anglais, Espagnol, Fon" />
        </div>

        <Section title="OPTIONS" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Toggle checked={form.is_certified} onChange={v => set('is_certified', v)} label="Partenaire certifié VisitBénin" />
          <Toggle checked={form.is_featured}  onChange={v => set('is_featured',  v)} label="Mis en avant (page d'accueil)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Toggle checked={form.is_published} onChange={v => set('is_published', v)} label="Publié (visible sur le site)" />
        </div>
      </div>

      {/* Submit sticky */}
      <div style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '12px 0', marginTop: 32, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={() => navigate('/partners')} type="button">Annuler</Btn>
        <Btn onClick={handleSubmit} disabled={mutation.isPending} size="lg">
          {mutation.isPending ? 'Sauvegarde…' : isEdit ? '✓ Mettre à jour' : '✓ Créer le partenaire'}
        </Btn>
      </div>
    </div>
  )
}
