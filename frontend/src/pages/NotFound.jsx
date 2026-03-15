// frontend/src/pages/NotFound.jsx
import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-8">
      <div className="font-display font-black text-[12rem] leading-none text-or/15 select-none">404</div>
      <h1 className="font-display font-bold text-3xl text-nuit -mt-8 mb-3">Page introuvable</h1>
      <p className="text-brun-light mb-6 max-w-sm">Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" className="bg-or text-nuit px-8 py-3 font-semibold hover:bg-or-light transition-colors">← Retour à l'accueil</Link>
    </div>
  )
}
