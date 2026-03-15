// admin/src/pages/SchoolForm.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolsAPI } from '@/services/api'
import { PageHeader, Input, Select, Textarea, Btn, Toggle } from '@/components/ui/index'

const CITY_OPTS = [
  { value: '', label: '— Ville —' },
  { value: 'cotonou', label: 'Cotonou' },
  { value: 'porto-novo', label: 'Porto-Novo' },
  { value: 'ouidah', label: 'Ouidah' },
  { value: 'abomey-calavi', label: 'Abomey-Calavi' },
  { value: 'natitingou', label: 'Natitingou' },
]
const TYPE_OPTS = [
  { value: 'maternelle', label: 'Maternelle' }, { value: 'primaire', label: 'Primaire' },
  { value: 'college', label: 'Collège' },       { value: 'lycee', label: 'Lycée' },
  { value: 'universite', label: 'Université' }, { value: 'formation', label: 'Formation' },
]
const PROG_OPTS = [
  { value: 'francais', label: 'Français' }, { value: 'anglais', label: 'Anglais' },
  { value: 'bilingue', label: 'Bilingue' }, { value: 'local', label: 'Local' },
]

export default function SchoolForm() {
  const { id } = useParams(); const isEdit = Boolean(id)
  const navigate = useNavigate(); const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '', school_type: 'lycee', program: 'francais', description: '',
    short_desc: '', city_id: '', address: '', latitude: '', longitude: '',
    fees_range_min: '', fees_range_max: '', bac_rate: '', student_count: '',
    founded_year: '', phone: '', email: '', website: '', cover_image: '',
    is_aefe: false, accepts_international: true, is_published: false, is_featured: false,
  })
  const [saved, setSaved] = useState(false)

  const { data: existing } = useQuery({ queryKey: ['admin', 'school', id], queryFn: () => schoolsAPI.get(id), enabled: isEdit })
  useEffect(() => {
    if (existing) setForm(prev => ({ ...prev, ...existing, fees_range_min: existing.fees_range_min ?? '', fees_range_max: existing.fees_range_max ?? '', bac_rate: existing.bac_rate ?? '' }))
  }, [existing])

  const mutation = useMutation({
    mutationFn: d => isEdit ? schoolsAPI.update(id, d) : schoolsAPI.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'schools'] }); setSaved(true); setTimeout(() => { setSaved(false); if (!isEdit) navigate('/schools') }, 1500) },
  })

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }))

  const numFields = ['latitude', 'longitude', 'fees_range_min', 'fees_range_max', 'bac_rate', 'student_count', 'founded_year']
  function buildPayload() {
    const p = { ...form }
    numFields.forEach(f => { if (p[f] !== '') p[f] = Number(p[f]); else p[f] = null })
    return p
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 860 }}>
      <PageHeader
        title={isEdit ? "Modifier l'école" : 'Nouvelle école'}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {saved && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)' }}>✓ SAUVEGARDÉ</span>}
            <Btn variant="ghost" onClick={() => navigate('/schools')}>Annuler</Btn>
            <Btn onClick={() => mutation.mutate(buildPayload())} disabled={mutation.isPending}>
              {mutation.isPending ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer'}
            </Btn>
          </div>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ gridColumn: '1/-1' }}><Input label="Nom *" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
        <Select label="Type" value={form.school_type} onChange={e => set('school_type', e.target.value)} options={TYPE_OPTS} />
        <Select label="Programme" value={form.program} onChange={e => set('program', e.target.value)} options={PROG_OPTS} />
        <div style={{ gridColumn: '1/-1' }}><Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={4} /></div>
        <div style={{ gridColumn: '1/-1' }}><Input label="Résumé court" value={form.short_desc} onChange={e => set('short_desc', e.target.value)} /></div>
        <Select label="Ville" value={form.city_id} onChange={e => set('city_id', e.target.value)} options={CITY_OPTS} />
        <Input label="Adresse" value={form.address} onChange={e => set('address', e.target.value)} />
        <Input label="Latitude" type="number" step="0.0001" value={form.latitude} onChange={e => set('latitude', e.target.value)} />
        <Input label="Longitude" type="number" step="0.0001" value={form.longitude} onChange={e => set('longitude', e.target.value)} />
        <Input label="Frais min. FCFA/an" type="number" value={form.fees_range_min} onChange={e => set('fees_range_min', e.target.value)} />
        <Input label="Frais max. FCFA/an" type="number" value={form.fees_range_max} onChange={e => set('fees_range_max', e.target.value)} />
        <Input label="Taux BAC (%)" type="number" min="0" max="100" step="0.1" value={form.bac_rate} onChange={e => set('bac_rate', e.target.value)} />
        <Input label="Nb. étudiants" type="number" value={form.student_count} onChange={e => set('student_count', e.target.value)} />
        <Input label="Année fondation" type="number" value={form.founded_year} onChange={e => set('founded_year', e.target.value)} placeholder="ex : 1982" />
        <Input label="Téléphone" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        <div style={{ gridColumn: '1/-1' }}><Input label="Site web" type="url" value={form.website} onChange={e => set('website', e.target.value)} /></div>
        <div style={{ gridColumn: '1/-1' }}><Input label="Image (URL)" value={form.cover_image} onChange={e => set('cover_image', e.target.value)} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Toggle checked={form.is_aefe}               onChange={v => set('is_aefe', v)}               label="Affilié AEFE" />
          <Toggle checked={form.accepts_international} onChange={v => set('accepts_international', v)} label="Accepte étrangers" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Toggle checked={form.is_published} onChange={v => set('is_published', v)} label="Publié" />
          <Toggle checked={form.is_featured}  onChange={v => set('is_featured',  v)} label="Mis en avant" />
        </div>
      </div>
    </div>
  )
}
