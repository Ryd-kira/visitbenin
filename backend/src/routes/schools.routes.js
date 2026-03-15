// backend/src/routes/schools.routes.js
import { Router } from 'express'
import { prisma } from '../utils/prisma.js'
import { cacheGet, cacheSet, cacheDel } from '../utils/redis.js'
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth.middleware.js'
import slugify from '../utils/slugify.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, school_type, program, city_id, is_aefe, search } = req.query
    const where = { is_published: true }
    if (school_type)      where.school_type = school_type
    if (program)          where.program = program
    if (city_id)          where.city_id = city_id
    if (is_aefe === 'true') where.is_aefe = true
    if (search) where.OR = [
      { name:       { contains: search, mode: 'insensitive' } },
      { short_desc: { contains: search, mode: 'insensitive' } },
    ]

    const skip = (Number(page) - 1) * Number(limit)
    const cacheKey = `schools:list:${JSON.stringify({ where, skip })}`
    const cached = await cacheGet(cacheKey)
    if (cached) return res.json(cached)

    const [data, total] = await Promise.all([
      prisma.school.findMany({ where, skip, take: Number(limit), orderBy: { rating: 'desc' }, include: { city: { select: { name: true } } } }),
      prisma.school.count({ where }),
    ])

    const response = { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } }
    await cacheSet(cacheKey, response, 600)
    res.json(response)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
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
    if (!school) return res.status(404).json({ error: 'École introuvable' })
    res.json(school)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const school = await prisma.school.create({
      data: { ...req.body, slug: slugify(req.body.name), created_by: req.user.id, is_published: false },
    })
    await cacheDel('schools:*')
    res.status(201).json(school)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/:id', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const school = await prisma.school.update({ where: { id: req.params.id }, data: req.body })
    await cacheDel('schools:*')
    res.json(school)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
