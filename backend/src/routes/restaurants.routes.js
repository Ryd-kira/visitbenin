// backend/src/routes/restaurants.routes.js
import { Router } from 'express'
import { prisma } from '../utils/prisma.js'
import { cacheGet, cacheSet, cacheDel } from '../utils/redis.js'
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth.middleware.js'
import slugify from '../utils/slugify.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, price_range, city_id, city, featured, search, sort = 'rating' } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const where = { is_published: true }
    if (price_range)       where.price_range = price_range
    if (city_id)           where.city_id = city_id
    if (featured === 'true') where.is_featured = true
    if (search) where.OR = [
      { name:       { contains: search, mode: 'insensitive' } },
      { cuisine_type: { contains: search, mode: 'insensitive' } },
    ]

    const orderBy = sort === 'recent' ? { created_at: 'desc' } : { rating: 'desc' }
    const cacheKey = `restaurants:list:${JSON.stringify({ where, skip, limit })}`
    const cached = await cacheGet(cacheKey)
    if (cached) return res.json(cached)

    const [data, total] = await Promise.all([
      prisma.restaurant.findMany({ where, skip, take: Number(limit), orderBy, include: { city: { select: { name: true, slug: true } } } }),
      prisma.restaurant.count({ where }),
    ])

    const response = { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } }
    await cacheSet(cacheKey, response, 600)
    res.json(response)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const cacheKey = `restaurants:slug:${req.params.slug}`
    const cached = await cacheGet(cacheKey)
    if (cached) return res.json(cached)

    const resto = await prisma.restaurant.findUnique({
      where: { slug: req.params.slug },
      include: {
        city: true,
        reviews: {
          where: { is_published: true },
          take: 10,
          orderBy: { created_at: 'desc' },
          include: { user: { select: { name: true, avatar_url: true } } },
        },
      },
    })
    if (!resto) return res.status(404).json({ error: 'Restaurant introuvable' })
    await cacheSet(cacheKey, resto, 600)
    res.json(resto)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const resto = await prisma.restaurant.create({
      data: { ...req.body, slug: slugify(req.body.name), created_by: req.user.id, is_published: false },
    })
    await cacheDel('restaurants:*')
    res.status(201).json(resto)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/:id', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const resto = await prisma.restaurant.update({ where: { id: req.params.id }, data: req.body })
    await cacheDel('restaurants:*')
    res.json(resto)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/:id/publish', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const r = await prisma.restaurant.findUnique({ where: { id: req.params.id } })
    if (!r) return res.status(404).json({ error: 'Introuvable' })
    const updated = await prisma.restaurant.update({ where: { id: req.params.id }, data: { is_published: !r.is_published } })
    await cacheDel('restaurants:*')
    res.json({ id: updated.id, is_published: updated.is_published })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.restaurant.delete({ where: { id: req.params.id } })
    await cacheDel('restaurants:*')
    res.json({ message: 'Supprimé' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
