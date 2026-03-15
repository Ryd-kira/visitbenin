// backend/src/routes/places.routes.js
import { Router } from 'express'
import { prisma } from '../utils/prisma.js'
import { cacheGet, cacheSet, cacheDel } from '../utils/redis.js'
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth.middleware.js'
import { validate, schemas } from '../middlewares/validate.middleware.js'
import slugify from '../utils/slugify.js'

const router = Router()
const CACHE_TTL = 600 // 10 min

// ── GET /places — Liste paginée avec filtres ──
router.get('/', async (req, res) => {
  try {
    const {
      page = 1, limit = 12,
      type, city_id, city,
      featured, unesco,
      search, tags,
      sort = 'rating',
      lat, lng, radius, // recherche géo (km)
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    // Construire le filtre Prisma
    const where = { is_published: true }
    if (type)          where.type = type
    if (city_id)       where.city_id = city_id
    if (city)          where.city = { is: { slug: city } }
    if (featured === 'true') where.is_featured = true
    if (unesco === 'true')   where.is_unesco = true
    if (search) {
      where.OR = [
        { name:       { contains: search, mode: 'insensitive' } },
        { short_desc: { contains: search, mode: 'insensitive' } },
        { tags:       { has: search } },
      ]
    }
    if (tags) {
      const tagList = tags.split(',')
      where.tags = { hasEvery: tagList }
    }

    // Tri
    const orderBy = sort === 'recent'
      ? { created_at: 'desc' }
      : sort === 'reviews' ? { review_count: 'desc' }
      : { rating: 'desc' }

    // Cache key
    const cacheKey = `places:list:${JSON.stringify({ where, skip, limit, sort })}`
    const cached = await cacheGet(cacheKey)
    if (cached) return res.json(cached)

    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          city: { select: { name: true, slug: true } },
        },
      }),
      prisma.place.count({ where }),
    ])

    const response = {
      data: places,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    }

    await cacheSet(cacheKey, response, CACHE_TTL)
    res.json(response)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /places/featured ──
router.get('/featured', async (req, res) => {
  try {
    const cached = await cacheGet('places:featured')
    if (cached) return res.json(cached)

    const places = await prisma.place.findMany({
      where: { is_published: true, is_featured: true },
      take: 6,
      orderBy: { rating: 'desc' },
      include: { city: { select: { name: true, slug: true } } },
    })

    await cacheSet('places:featured', places, 1800)
    res.json(places)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /places/nearby?lat=&lng=&radius=20&limit=5 ──
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 20, limit = 6, exclude } = req.query
    if (!lat || !lng) return res.status(400).json({ error: 'lat et lng requis' })

    // Recherche géo simple via distance haversine en SQL raw
    const places = await prisma.$queryRaw`
      SELECT id, name, slug, type, short_desc, cover_image, rating, review_count, latitude, longitude,
        (6371 * acos(
          cos(radians(${Number(lat)})) * cos(radians(latitude::float)) *
          cos(radians(longitude::float) - radians(${Number(lng)})) +
          sin(radians(${Number(lat)})) * sin(radians(latitude::float))
        )) AS distance_km
      FROM places
      WHERE is_published = true
        ${exclude ? prisma.$raw`AND id != ${exclude}` : prisma.$raw``}
      HAVING (6371 * acos(
        cos(radians(${Number(lat)})) * cos(radians(latitude::float)) *
        cos(radians(longitude::float) - radians(${Number(lng)})) +
        sin(radians(${Number(lat)})) * sin(radians(latitude::float))
      )) < ${Number(radius)}
      ORDER BY distance_km
      LIMIT ${Number(limit)}
    `
    res.json(places)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /places/:slug ──
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params
    const cacheKey = `places:slug:${slug}`
    const cached = await cacheGet(cacheKey)
    if (cached) return res.json(cached)

    const place = await prisma.place.findUnique({
      where: { slug },
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

    if (!place) return res.status(404).json({ error: 'Lieu introuvable' })
    if (!place.is_published && req.user?.role !== 'admin') {
      return res.status(404).json({ error: 'Lieu introuvable' })
    }

    await cacheSet(cacheKey, place, CACHE_TTL)
    res.json(place)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /places ── (admin / editor)
router.post('/', requireAuth, requireRole('admin', 'editor'), validate(schemas.createPlace), async (req, res) => {
  try {
    const slug = slugify(req.body.name)

    const place = await prisma.place.create({
      data: {
        ...req.body,
        slug,
        created_by: req.user.id,
        is_published: false, // draft par défaut
      },
    })

    await cacheDel('places:*')
    res.status(201).json(place)
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Slug déjà utilisé' })
    res.status(500).json({ error: err.message })
  }
})

// ── PUT /places/:id ──
router.put('/:id', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const place = await prisma.place.update({
      where: { id: req.params.id },
      data: { ...req.body, updated_at: new Date() },
    })
    await cacheDel('places:*')
    res.json(place)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Lieu introuvable' })
    res.status(500).json({ error: err.message })
  }
})

// ── POST /places/:id/publish ──
router.post('/:id/publish', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const place = await prisma.place.findUnique({ where: { id: req.params.id } })
    if (!place) return res.status(404).json({ error: 'Lieu introuvable' })

    const updated = await prisma.place.update({
      where: { id: req.params.id },
      data: { is_published: !place.is_published },
    })
    await cacheDel('places:*')
    res.json({ id: updated.id, is_published: updated.is_published })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /places/:id ──
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.place.delete({ where: { id: req.params.id } })
    await cacheDel('places:*')
    res.json({ message: 'Lieu supprimé' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Lieu introuvable' })
    res.status(500).json({ error: err.message })
  }
})

export default router
