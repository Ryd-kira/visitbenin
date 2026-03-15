import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatbotWidget from '@/components/ui/ChatbotWidget'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import PageLoader from '@/components/ui/PageLoader'
import Translator from '@/components/ui/Translator'
import CurrencyWidget from '@/components/ui/CurrencyWidget'
import { useAuthStore } from '@/store/useAuthStore'
import { authService } from '@/services/index'

const Home           = lazy(() => import('@/pages/Home'))
const Destinations   = lazy(() => import('@/pages/Destinations'))
const PlaceDetail    = lazy(() => import('@/pages/PlaceDetail'))
const Restaurants    = lazy(() => import('@/pages/Restaurants'))
const RestaurantDetail = lazy(() => import('@/pages/RestaurantDetail'))
const Schools        = lazy(() => import('@/pages/Schools'))
const SchoolDetail   = lazy(() => import('@/pages/SchoolDetail'))
const MapPage        = lazy(() => import('@/pages/MapPage'))
const Guide          = lazy(() => import('@/pages/Guide'))
const Partners       = lazy(() => import('@/pages/Partners'))
const Planner        = lazy(() => import('@/pages/Planner'))
const Login          = lazy(() => import('@/pages/auth/Login'))
const Register       = lazy(() => import('@/pages/auth/Register'))
const NotFound       = lazy(() => import('@/pages/NotFound'))
const Itineraires    = lazy(() => import('@/pages/Itineraires'))
const Ecotourisme    = lazy(() => import('@/pages/Ecotourisme'))
const InfosPratiques = lazy(() => import('@/pages/InfosPratiques'))
const Calendrier     = lazy(() => import('@/pages/Calendrier'))
const Dashboard      = lazy(() => import('@/pages/Dashboard'))
const Marketplace    = lazy(() => import('@/pages/Marketplace'))

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
      <ChatbotWidget />
      <LanguageSwitcher variant="floating" />
    </div>
  )
}

export default function App() {
  const { login, logout, setLoading } = useAuthStore()

  useEffect(() => {
    // Restaurer la session au chargement de page :
    // 1. /auth/refresh utilise le cookie httpOnly pour obtenir un nouvel access token
    // 2. On stocke ce token dans le store pour que l'interceptor l'injecte
    // 3. /auth/me récupère le profil avec ce token
    setLoading(true)
    authService.refresh()
      .then(({ access_token }) => {
        // Stocker provisoirement le token pour que l'interceptor l'utilise sur /me
        useAuthStore.getState().setAccessToken(access_token)
        return authService.me().then(user => login(user, access_token))
      })
      .catch(() => logout())
  }, [])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/connexion"  element={<Login />} />
        <Route path="/inscription" element={<Register />} />

        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/destinations"       element={<Layout><Destinations /></Layout>} />
        <Route path="/destinations/:slug" element={<Layout><PlaceDetail /></Layout>} />
        <Route path="/gastronomie"        element={<Layout><Restaurants /></Layout>} />
        <Route path="/gastronomie/:slug"  element={<Layout><RestaurantDetail /></Layout>} />
        <Route path="/ecoles"             element={<Layout><Schools /></Layout>} />
        <Route path="/ecoles/:slug"       element={<Layout><SchoolDetail /></Layout>} />
        <Route path="/carte"              element={<Layout><MapPage /></Layout>} />
        <Route path="/sinstaller"         element={<Layout><Guide /></Layout>} />
        <Route path="/partenaires"        element={<Layout><Partners /></Layout>} />
        <Route path="/planifier"          element={<Layout><Planner /></Layout>} />
        <Route path="/itineraires"     element={<Layout><Itineraires /></Layout>} />
        <Route path="/ecotourisme"    element={<Layout><Ecotourisme /></Layout>} />
        <Route path="/infos-pratiques" element={<Layout><InfosPratiques /></Layout>} />
        <Route path="/calendrier"      element={<Layout><Calendrier /></Layout>} />
        <Route path="/marketplace"     element={<Layout><Marketplace /></Layout>} />
        <Route path="/dashboard"       element={<Layout><Dashboard /></Layout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
