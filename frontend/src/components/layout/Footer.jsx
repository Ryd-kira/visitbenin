// frontend/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-nuit border-t border-or/8">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-mono text-xl tracking-widest text-or block mb-3">VISIT<span className="text-sable">BÉNIN</span></Link>
          <p className="text-sable/40 text-sm leading-relaxed">Le guide de référence pour visiter et s'installer au Bénin.</p>
          <p className="text-sable/20 text-xs mt-4">Fait avec ❤️ à Cotonou</p>
        </div>
        <div>
          <h3 className="text-sable/60 text-xs uppercase tracking-widest mb-4">Explorer</h3>
          <div className="flex flex-col gap-2.5">
            {[['Destinations', '/destinations'], ['Gastronomie', '/gastronomie'], ['Écoles', '/ecoles'], ['Carte interactive', '/carte']].map(([l, h]) => (
              <Link key={h} to={h} className="text-sable/40 text-sm hover:text-or transition-colors">{l}</Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sable/60 text-xs uppercase tracking-widest mb-4">S'installer</h3>
          <div className="flex flex-col gap-2.5">
            {[['Guide expatrié', '/sinstaller'], ['Trouver une école', '/ecoles'], ['Visa & Formalités', '/sinstaller#visa'], ['Budget & Logement', '/sinstaller#logement']].map(([l, h]) => (
              <Link key={h} to={h} className="text-sable/40 text-sm hover:text-or transition-colors">{l}</Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sable/60 text-xs uppercase tracking-widest mb-4">Villes phares</h3>
          <div className="flex flex-col gap-2.5">
            {[['Cotonou', '/destinations?city=cotonou'], ['Ouidah', '/destinations?city=ouidah'], ['Porto-Novo', '/destinations?city=porto-novo'], ['Abomey', '/destinations?city=abomey'], ['Grand-Popo', '/destinations?city=grand-popo']].map(([l, h]) => (
              <Link key={h} to={h} className="text-sable/40 text-sm hover:text-or transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-or/8 px-8 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <p className="text-sable/20 text-xs">© 2025 VisitBénin — Tous droits réservés</p>
        <p className="text-sable/20 text-xs">React · Node.js · PostgreSQL</p>
      </div>
    </footer>
  )
}
