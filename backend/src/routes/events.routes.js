// backend/src/routes/events.routes.js
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'

const requireAdmin = requireRole('admin')

const router = Router()
const prisma = new PrismaClient()

// ── GET /api/v1/events — liste publique (publiés)
router.get('/', async (req, res) => {
  try {
    const { month, year, city, tag, limit = 50 } = req.query

    const where = { is_published: true }

    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (tag)  where.tags = { has: tag }

    if (month && year) {
      const m = parseInt(month)
      const y = parseInt(year)
      const start = new Date(y, m - 1, 1)
      const end   = new Date(y, m, 0, 23, 59, 59)
      where.date_start = { gte: start, lte: end }
    } else if (year) {
      const y = parseInt(year)
      where.date_start = {
        gte: new Date(y, 0, 1),
        lte: new Date(y, 11, 31, 23, 59, 59),
      }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date_start: 'asc' },
      take: parseInt(limit),
    })

    res.json({ data: events, total: events.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/v1/events/upcoming — prochains événements (6 mois)
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date()
    const sixMonths = new Date()
    sixMonths.setMonth(sixMonths.getMonth() + 6)

    const events = await prisma.event.findMany({
      where: {
        is_published: true,
        date_start: { gte: now, lte: sixMonths },
      },
      orderBy: { date_start: 'asc' },
      take: 20,
    })

    res.json({ data: events })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/v1/events/:slug
router.get('/:slug', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: req.params.slug },
    })
    if (!event || (!event.is_published)) {
      return res.status(404).json({ error: 'Événement introuvable' })
    }
    res.json({ data: event })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/v1/events — créer (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      name, slug, description, location, city,
      latitude, longitude, cover_image,
      date_start, date_end, is_recurring, recurrence,
      tags, is_published,
    } = req.body

    const event = await prisma.event.create({
      data: {
        name, slug, description, location, city,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        cover_image: cover_image || null,
        date_start: new Date(date_start),
        date_end: date_end ? new Date(date_end) : null,
        is_recurring: is_recurring ?? false,
        recurrence: recurrence || null,
        tags: tags || [],
        is_published: is_published ?? false,
      },
    })
    res.status(201).json({ data: event })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Slug déjà utilisé' })
    res.status(400).json({ error: err.message })
  }
})

// ── PATCH /api/v1/events/:id — modifier (admin)
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body }
    if (data.date_start) data.date_start = new Date(data.date_start)
    if (data.date_end)   data.date_end   = new Date(data.date_end)
    if (data.latitude)   data.latitude   = parseFloat(data.latitude)
    if (data.longitude)  data.longitude  = parseFloat(data.longitude)

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data,
    })
    res.json({ data: event })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── DELETE /api/v1/events/:id — supprimer (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } })
    res.json({ message: 'Événement supprimé' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
