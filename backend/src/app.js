// backend/src/app.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { globalLimiter, loginLimiter, registerLimiter } from './middlewares/rate-limiters.js'

import authRoutes from './routes/auth.routes.js'
import placesRoutes from './routes/places.routes.js'
import restaurantsRoutes from './routes/restaurants.routes.js'
import schoolsRoutes from './routes/schools.routes.js'
import reviewsRoutes from './routes/reviews.routes.js'
import usersRoutes from './routes/users.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import partnersRoutes from './routes/partners.routes.js'
import tripsRoutes from './routes/trips.routes.js'
import activitiesRoutes from './routes/activities.routes.js'
import rentalsRoutes from './routes/rentals.routes.js'
import eventsRoutes   from './routes/events.routes.js'
import bookingsRoutes    from './routes/bookings.routes.js'
import marketplaceRoutes from './routes/marketplace.routes.js'
import chatbotRoutes     from './routes/chatbot.routes.js'

const app = express()

app.use(helmet())
app.use(compression())

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // Autorise les requêtes sans origin (Postman, mobile, etc.)
    if (!origin) return cb(null, true)
    // Autorise les origines connues + tous les previews Vercel
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /\.vercel\.app$/.test(origin)
    ) return cb(null, true)
    cb(new Error(`CORS bloqué : ${origin}`))
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// ─────────────────────────────────────────────────────────────────
//  RATE LIMITING — défini dans ./middlewares/rate-limiters.js
//  loginLimiter et registerLimiter injectés dans auth.routes.js
//  globalLimiter skip login+register pour éviter toute contamination
// ─────────────────────────────────────────────────────────────────

app.use('/api/', globalLimiter)
// loginLimiter et registerLimiter : stores isolés, injectés dans auth.routes.js

// ── ROUTES ──
app.use('/api/v1/auth',        authRoutes)
app.use('/api/v1/places',      placesRoutes)
app.use('/api/v1/restaurants', restaurantsRoutes)
app.use('/api/v1/schools',     schoolsRoutes)
app.use('/api/v1/partners',    partnersRoutes)
app.use('/api/v1/trips',       tripsRoutes)
app.use('/api/v1/activities',  activitiesRoutes)
app.use('/api/v1/rentals',     rentalsRoutes)
app.use('/api/v1/events',      eventsRoutes)
app.use('/api/v1/bookings',    bookingsRoutes)
app.use('/api/v1/marketplace', marketplaceRoutes)
app.use('/api/v1/chatbot',    chatbotRoutes)
app.use('/api/v1/reviews',     reviewsRoutes)
app.use('/api/v1/users',       usersRoutes)
app.use('/api/v1/upload',      uploadRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date() })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Route ' + req.method + ' ' + req.path + ' introuvable' })
})

app.use((err, req, res, next) => {
  console.error('X', err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

export default app
