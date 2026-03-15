// backend/src/routes/users.routes.js
import { Router } from 'express'
import { prisma } from '../utils/prisma.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'
import bcrypt from 'bcryptjs'

const router = Router()

// ── GET /users/me — Profil complet avec stats dashboard
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [user, savedCount, reviewCount, tripCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, avatar_url: true, role: true, is_verified: true, created_at: true },
      }),
      prisma.savedItem.count({ where: { user_id: req.user.id } }),
      prisma.review.count({ where: { user_id: req.user.id } }),
      prisma.trip.count({ where: { user_id: req.user.id } }),
    ])
    res.json({ data: { ...user, stats: { saved: savedCount, reviews: reviewCount, trips: tripCount } } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── PATCH /users/me — Mettre à jour le profil
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { name, avatar_url } = req.body
    const data = {}
    if (name) data.name = name
    if (avatar_url !== undefined) data.avatar_url = avatar_url
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, name: true, avatar_url: true, role: true },
    })
    res.json({ data: user })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── PATCH /users/me/password — Changer le mot de passe
router.patch('/me/password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' })
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const valid = await bcrypt.compare(current_password, user.password_hash)
    if (!valid) return res.status(400).json({ error: 'Mot de passe actuel incorrect' })
    if (new_password.length < 8) return res.status(400).json({ error: 'Nouveau mot de passe trop court (8 min)' })
    const hash = await bcrypt.hash(new_password, 12)
    await prisma.user.update({ where: { id: req.user.id }, data: { password_hash: hash } })
    res.json({ message: 'Mot de passe mis à jour' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── GET /users/me/saved — Mes favoris enrichis
router.get('/me/saved', requireAuth, async (req, res) => {
  try {
    const saved = await prisma.savedItem.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      include: {
        place:      { select: { id: true, name: true, slug: true, cover_image: true, city: true, type: true, rating: true } },
        restaurant: { select: { id: true, name: true, slug: true, cover_image: true, city: true, type: true } },
        school:     { select: { id: true, name: true, slug: true, cover_image: true, city: true, type: true } },
      },
    })
    res.json({ data: saved })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── POST /users/me/saved
router.post('/me/saved', requireAuth, async (req, res) => {
  try {
    const { entity_type, entity_id } = req.body
    const item = await prisma.savedItem.create({
      data: { user_id: req.user.id, entity_type, entity_id },
    })
    res.status(201).json({ data: item })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Déjà en favoris' })
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /users/me/saved/:id
router.delete('/me/saved/:id', requireAuth, async (req, res) => {
  try {
    await prisma.savedItem.deleteMany({
      where: { id: req.params.id, user_id: req.user.id },
    })
    res.json({ message: 'Retiré des favoris' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── GET /users/me/reviews — Mes avis
router.get('/me/reviews', requireAuth, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
    })
    res.json({ data: reviews })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── GET /users/me/trips — Mes voyages
router.get('/me/trips', requireAuth, async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { user_id: req.user.id },
      orderBy: { updated_at: 'desc' },
      include: { steps: { orderBy: { order: 'asc' }, take: 3 } },
    })
    res.json({ data: trips })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Admin routes ──
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {}
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip: (Number(page) - 1) * Number(limit), take: Number(limit),
        select: { id: true, email: true, name: true, role: true, is_verified: true, created_at: true, _count: { select: { reviews: true } } },
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count({ where }),
    ])
    res.json({ data: users, pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.patch('/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
      select: { id: true, email: true, role: true },
    })
    res.json(user)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
