import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PageLoader from '@/components/ui/PageLoader'
import { useLang } from '@/hooks/useLang'
import { partnersService } from '@/services/index'

const TYPES = [
  { value: '',                label: 'Tous',        icon: '◈' },
  { value: 'agence_tourisme', label: 'Agences',      icon: '🧭' },
  { value: 'hebergement',     label: 'Hébergements', icon: '🏨' },
  { value: 'transport',       label: 'Transport',    icon: '🚐' },
  { value: 'excursion',       label: 'Excursions',   icon: '🌿' },
  { value: 'restaurant',      label: 'Restaurants',  icon: '🍽️' },
]

function PartnerCard({ p }) {
  const { t } = useLang()
  return (
    <div style={{ background:'#fff', border:'1px solid rgba(200,146,42,0.12)', overflow:'hidden', transition:'transform .3s, box-shadow .3s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(200,146,42,0.12)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}
    >
      <div style={{ height:140, background:'#F5EDD6', position:'relative', overflow:'hidden' }}>
        {p.cover_image
          ? <img src={p.cover_image} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#F5EDD6,#e8d9b5)'}}>
              <span style={{fontSize:48,opacity:.4}}>{TYPES.find(t=>t.value===p.type)?.icon||'◈'}</span>
            </div>
        }
        {p.is_certified && <div style={{position:'absolute',top:10,left:10,background:'#C8922A',color:'#0E0A06',fontSize:9,fontWeight:700,padding:'3px 8px',letterSpacing:1}}>✓ CERTIFIÉ</div>}
      </div>
      <div style={{padding:18}}>
        <div style={{fontSize:10,color:'#C8922A',letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:4}}>{p.city?.name} · {p.type?.replace('_',' ')}</div>
        <h3 style={{fontFamily:'Playfair Display,serif',fontSize:17,fontWeight:700,color:'#0E0A06',marginBottom:8,lineHeight:1.3}}>{p.name}</h3>
        <p style={{fontSize:12,color:'#7A5C30',lineHeight:1.6,marginBottom:12,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{p.short_desc}</p>
        {p.languages?.length > 0 && (
          <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:12}}>
            {p.languages.map(l=><span key={l} style={{background:'rgba(200,146,42,0.1)',color:'#C8922A',fontSize:10,padding:'2px 8px'}}>{l}</span>)}
          </div>
        )}
        <div style={{display:'flex',gap:8,marginTop:'auto'}}>
          {p.phone && <a href={`tel:${p.phone}`} style={{flex:1,background:'#0E0A06',color:'#F5EDD6',padding:'9px',textAlign:'center',textDecoration:'none',fontSize:12,fontWeight:600,transition:'background .15s'}} onMouseEnter={e=>e.target.style.background='#C8922A'} onMouseLeave={e=>e.target.style.background='#0E0A06'}>Contacter</a>}
          {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" style={{flex:1,border:'1px solid rgba(14,10,6,0.15)',color:'#3D2B10',padding:'9px',textAlign:'center',textDecoration:'none',fontSize:12,transition:'all .15s'}} onMouseEnter={e=>{e.target.style.borderColor='#C8922A';e.target.style.color='#C8922A'}} onMouseLeave={e=>{e.target.style.borderColor='rgba(14,10,6,0.15)';e.target.style.color='#3D2B10'}}>Site web ↗</a>}
        </div>
      </div>
    </div>
  )
}

export default function Partners() {
  const { t } = useLang()
  const [type, setType]     = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['partners', { type, search }],
    queryFn: () => partnersService.getAll({ type: type || undefined, search: search || undefined }).catch(() => ({ data: [] })),
  })

  const partners = data?.data || []

  return (
    <div style={{background:'#F5EDD6',minHeight:'100vh'}}>
      <div style={{background:'#0E0A06',padding:'80px 24px 60px',textAlign:'center'}}>
        <p style={{fontSize:11,color:'#C8922A',letterSpacing:4,textTransform:'uppercase',marginBottom:12}}>RÉSEAU DE CONFIANCE</p>
        <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(28px,5vw,50px)',color:'#F5EDD6',fontWeight:700,marginBottom:16}}>{t('partners.title')}</h1>
        <p style={{color:'rgba(245,237,214,0.5)',fontSize:15,maxWidth:560,margin:'0 auto'}}>{t('partners.subtitle')}</p>
      </div>

      <div style={{background:'white',borderBottom:'1px solid rgba(200,146,42,0.15)',padding:'16px 24px',display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',justifyContent:'center',position:'sticky',top:0,zIndex:50}}>
        {TYPES.map(tp=>(
          <button key={tp.value} onClick={()=>setType(tp.value)} style={{padding:'7px 14px',fontSize:12,fontWeight:500,border:`1px solid ${type===tp.value?'#C8922A':'rgba(200,146,42,0.2)'}`,background:type===tp.value?'#C8922A':'white',color:type===tp.value?'#0E0A06':'#3D2B10',cursor:'pointer',transition:'all .15s'}}>
            {tp.icon} {tp.label}
          </button>
        ))}
        <input type="text" placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{padding:'7px 14px',border:'1px solid rgba(200,146,42,0.2)',color:'#0E0A06',fontSize:12,outline:'none',width:220}} />
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'40px 24px'}}>
        {isLoading ? <PageLoader /> : partners.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 20px',color:'rgba(61,43,16,0.4)'}}>
            <div style={{fontSize:48,marginBottom:16}}>🔍</div>
            <p>Aucun partenaire pour le moment. Revenez bientôt !</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:20}}>
            {partners.map(p=><PartnerCard key={p.id} p={p} />)}
          </div>
        )}
      </div>

      <div style={{background:'#0E0A06',padding:'60px 24px',textAlign:'center'}}>
        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:28,color:'#F5EDD6',marginBottom:16}}>Vous êtes une agence ou un prestataire ?</h2>
        <p style={{color:'rgba(245,237,214,0.5)',fontSize:15,maxWidth:500,margin:'0 auto 28px'}}>Rejoignez notre réseau de partenaires certifiés et touchez des milliers de voyageurs.</p>
        <a href="mailto:partenaires@visitbenin.bj" style={{display:'inline-block',background:'#C8922A',color:'#0E0A06',padding:'13px 32px',textDecoration:'none',fontSize:13,fontWeight:700,letterSpacing:1}}>DEVENIR PARTENAIRE →</a>
      </div>
    </div>
  )
}
