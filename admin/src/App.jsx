import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { useAdminStore } from '@/store/useAdminStore'
import { authService } from '@/services/api'

const LoginPage       = lazy(() => import('@/pages/Login'))
const Dashboard       = lazy(() => import('@/pages/Dashboard'))
const Places          = lazy(() => import('@/pages/Places'))
const PlaceForm       = lazy(() => import('@/pages/PlaceForm'))
const Restaurants     = lazy(() => import('@/pages/Restaurants'))
const RestaurantForm  = lazy(() => import('@/pages/RestaurantForm'))
const Schools         = lazy(() => import('@/pages/Schools'))
const SchoolForm      = lazy(() => import('@/pages/SchoolForm'))
const Reviews         = lazy(() => import('@/pages/Reviews'))
const Users           = lazy(() => import('@/pages/Users'))
const Media           = lazy(() => import('@/pages/Media'))
const Partners        = lazy(() => import('@/pages/Partners'))
const PartnerForm     = lazy(() => import('@/pages/PartnerForm'))
const Trips           = lazy(() => import('@/pages/Trips'))
const Activities      = lazy(() => import('@/pages/Activities'))
const Rentals         = lazy(() => import('@/pages/Rentals'))
const Events          = lazy(() => import('@/pages/Events'))
const Bookings        = lazy(() => import('@/pages/Bookings'))
const AdminMarketplace = lazy(() => import('@/pages/Marketplace'))

function Loader() {
  return (
    <div style={{ height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, background: '#f59e0b', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: `${i*150}ms` }} />
        ))}
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useAdminStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin' && user.role !== 'editor') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { setUser, setLoading } = useAdminStore()

  useEffect(() => {
    authService.me()
      .then(user => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"              element={<Dashboard />} />

          {/* Contenu */}
          <Route path="places"                 element={<Places />} />
          <Route path="places/new"             element={<PlaceForm />} />
          <Route path="places/:id/edit"        element={<PlaceForm />} />
          <Route path="restaurants"            element={<Restaurants />} />
          <Route path="restaurants/new"        element={<RestaurantForm />} />
          <Route path="restaurants/:id/edit"   element={<RestaurantForm />} />
          <Route path="schools"                element={<Schools />} />
          <Route path="schools/new"            element={<SchoolForm />} />
          <Route path="schools/:id/edit"       element={<SchoolForm />} />

          {/* Partenaires */}
          <Route path="partners"               element={<Partners />} />
          <Route path="partners/new"           element={<PartnerForm />} />
          <Route path="partners/:id/edit"      element={<PartnerForm />} />

          {/* Planificateur */}
          <Route path="trips"                  element={<Trips />} />
          <Route path="activities"             element={<Activities />} />
          <Route path="rentals"                element={<Rentals />} />
          <Route path="events"                 element={<Events />} />
          <Route path="bookings"               element={<Bookings />} />
          <Route path="marketplace"            element={<AdminMarketplace />} />

          {/* Communauté */}
          <Route path="reviews"                element={<Reviews />} />
          <Route path="users"                  element={<Users />} />
          <Route path="media"                  element={<Media />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
