// backend/src/routes/auth.routes.js
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma.js'
import { requireAuth } from '../middlewares/auth.middleware.js'
import { validate, schemas } from '../middlewares/validate.middleware.js'
import { loginLimiter, registerLimiter } from '../middlewares/rate-limiters.js'

const router = Router()

// ── HELPERS JWT ──
function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  })
}
function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  })
}
function setRefreshCookie(res, token) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    path: '/api/v1/auth',
  })
}

// ── POST /auth/register ──
router.post('/register', registerLimiter, validate(schemas.register), async (req, res) => {
  try {
    const { email, password, name } = req.body

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Email déjà utilisé' })

    const password_hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, password_hash, name },
      select: { id: true, email: true, name: true, role: true },
    })

    const accessToken  = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })

    setRefreshCookie(res, refreshToken)
    res.status(201).json({ user, access_token: accessToken })
  } catch (err) {
    console.error('[register] Erreur:', err.message)
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email déjà utilisé' })
    }
    if (err.code?.startsWith?.('P') || err.message?.includes('connect')) {
      return res.status(503).json({ error: 'Service temporairement indisponible. Réessayez dans quelques instants.', code: 'DB_UNAVAILABLE' })
    }
    res.status(500).json({ error: 'Erreur interne. Réessayez.', detail: err.message })
  }
})

// ── POST /auth/login ──
router.post('/login', loginLimiter, validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      // Informer l'utilisateur du nombre de tentatives restantes
      const remaining = req.rateLimit ? req.rateLimit.remaining : null
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
        ...(remaining !== null && remaining <= 2 && {
          warning: `Attention : encore ${remaining} tentative${remaining > 1 ? 's' : ''} avant verrouillage temporaire.`,
        }),
      })
    }

    const accessToken  = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })

    setRefreshCookie(res, refreshToken)
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      access_token: accessToken,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /auth/refresh ──
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.refresh_token
    if (!token) return res.status(401).json({ error: 'Refresh token manquant' })

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

    const stored = await prisma.refreshToken.findUnique({ where: { token } })
    if (!stored || stored.expires_at < new Date()) {
      return res.status(401).json({ error: 'Refresh token invalide ou expiré' })
    }

    // Rotation du refresh token
    await prisma.refreshToken.delete({ where: { token } })
    const newRefresh = signRefreshToken(payload.sub)
    const newAccess  = signAccessToken(payload.sub)

    await prisma.refreshToken.create({
      data: {
        token: newRefresh,
        user_id: payload.sub,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })

    setRefreshCookie(res, newRefresh)
    res.json({ access_token: newAccess })
  } catch (err) {
    res.status(401).json({ error: 'Refresh token invalide' })
  }
})

// ── POST /auth/logout ──
router.post('/logout', async (req, res) => {
  const token = req.cookies.refresh_token
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => {})
    res.clearCookie('refresh_token', { path: '/api/v1/auth' })
  }
  res.json({ message: 'Déconnexion réussie' })
})

// ── GET /auth/me ──
router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, email: true, name: true, avatar_url: true,
      role: true, is_verified: true, created_at: true,
      _count: { select: { reviews: true, saved_items: true } },
    },
  })
  res.json(user)
})

export default router
