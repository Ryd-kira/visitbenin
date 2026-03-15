import { Router } from 'express'
import { prisma } from '../utils/prisma.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

// GET /partners
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, type, city, search, featured } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where = {
      is_published: true,
      ...(type    && { type }),
      ...(featured && { is_featured: true }),
      ...(city    && { city: { slug: city } }),
      ...(search  && {
        OR: [
          { name:        { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }),
    }

    const [data, total] = await Promise.all([
      prisma.partner.findMany({
        where, skip, take: Number(limit),
        include: { city: { select: { name: true, slug: true } } },
        orderBy: [{ is_featured: 'desc' }, { rating: 'desc' }],
      }),
      prisma.partner.count({ where }),
    ])

    res.json({ data, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /partners/:slug
router.get('/:slug', async (req, res) => {
  try {
    const partner = await prisma.partner.findUnique({
      where: { slug: req.params.slug },
      include: { city: true },
    })
    if (!partner) return res.status(404).json({ error: 'Partenaire non trouvé' })
    res.json(partner)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /partners — admin only
router.post('/', requireAuth, requireRole('editor'), async (req, res) => {
  try {
    const { name, ...rest } = req.body
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const partner = await prisma.partner.create({ data: { name, slug, ...rest } })
    res.status(201).json(partner)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /partners/:id
router.put('/:id', requireAuth, requireRole('editor'), async (req, res) => {
  try {
    const partner = await prisma.partner.update({ where: { id: req.params.id }, data: req.body })
    res.json(partner)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /partners/:id
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.partner.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
