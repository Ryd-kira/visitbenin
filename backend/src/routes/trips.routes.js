import { Router } from 'express'
import { prisma } from '../utils/prisma.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const router = Router()

// GET /trips — mes voyages
router.get('/', requireAuth, async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { user_id: req.user.id },
      include: { steps: { orderBy: { order: 'asc' } } },
      orderBy: { updated_at: 'desc' },
    })
    res.json({ data: trips })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /trips/admin/all — ADMIN : tous les voyages de tous les utilisateurs
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'editor') {
      return res.status(403).json({ error: 'Accès refusé' })
    }
    const { page = 1, limit = 20, search, mode, status } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where = {
      ...(mode   && { mode }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title:      { contains: search, mode: 'insensitive' } },
          { user: { name:  { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ]
      }),
    }

    const [data, total, statsCounts] = await Promise.all([
      prisma.trip.findMany({
        where, skip, take: Number(limit),
        include: {
          user:   { select: { name: true, email: true } },
          _count: { select: { steps: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.trip.count({ where }),
      prisma.trip.groupBy({ by: ['mode', 'status'], _count: true }),
    ])

    const stats = {
      total:    await prisma.trip.count(),
      planned:  await prisma.trip.count({ where: { status: 'planned' } }),
      ongoing:  await prisma.trip.count({ where: { status: 'ongoing' } }),
      solo:     await prisma.trip.count({ where: { mode: 'solo' } }),
    }

    res.json({ data, stats, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /trips/public — voyages publics (inspiration)
router.get('/public', async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { is_public: true, status: { not: 'draft' } },
      include: {
        user:  { select: { name: true } },
        steps: { orderBy: { order: 'asc' }, take: 5 },
      },
      orderBy: { created_at: 'desc' },
      take: 12,
    })
    res.json({ data: trips })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /trips/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, user_id: req.user.id },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            place:   { select: { name: true, slug: true, cover_image: true } },
            partner: { select: { name: true, slug: true, logo: true, phone: true, email: true } },
          },
        },
      },
    })
    if (!trip) return res.status(404).json({ error: 'Voyage non trouvé' })
    res.json(trip)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Convertit "YYYY-MM-DD" en ISO DateTime complet attendu par Prisma
function toISO(val) {
  if (!val) return null
  // Déjà ISO complet
  if (String(val).includes('T')) return new Date(val).toISOString()
  // Format date HTML "YYYY-MM-DD" → minuit UTC
  const d = new Date(String(val) + 'T00:00:00.000Z')
  return isNaN(d.getTime()) ? null : d.toISOString()
}

function sanitizeTripData(body) {
  const { steps, user_id, ...data } = body
  return {
    ...data,
    date_start:  toISO(data.date_start),
    date_end:    toISO(data.date_end),
    budget:      data.budget     ? Number(data.budget)     : null,
    nb_persons:  data.nb_persons ? Number(data.nb_persons) : 1,
    description: data.description || '',
  }
}

// POST /trips — créer un voyage
router.post('/', requireAuth, async (req, res) => {
  try {
    const trip = await prisma.trip.create({
      data: { ...sanitizeTripData(req.body), user_id: req.user.id },
      include: { steps: true },
    })
    res.status(201).json(trip)
  } catch (err) {
    console.error('[POST /trips]', err.message)
    res.status(400).json({ error: err.message })
  }
})

// PUT /trips/:id — modifier
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const trip = await prisma.trip.update({
      where: { id: req.params.id, user_id: req.user.id },
      data: sanitizeTripData(req.body),
    })
    res.json(trip)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /trips/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.trip.delete({ where: { id: req.params.id, user_id: req.user.id } })
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── ÉTAPES ─────────────────────────────────────

// POST /trips/:id/steps
router.post('/:id/steps', requireAuth, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, user_id: req.user.id } })
    if (!trip) return res.status(404).json({ error: 'Voyage non trouvé' })

    const lastStep = await prisma.tripStep.findFirst({ where: { trip_id: req.params.id }, orderBy: { order: 'desc' } })
    const order = (lastStep?.order ?? -1) + 1

    const step = await prisma.tripStep.create({
      data: { ...req.body, trip_id: req.params.id, order },
      include: { place: { select: { name: true, slug: true } }, partner: { select: { name: true, slug: true } } },
    })
    res.status(201).json(step)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /trips/:id/steps/:stepId
router.put('/:id/steps/:stepId', requireAuth, async (req, res) => {
  try {
    const step = await prisma.tripStep.update({
      where: { id: req.params.stepId },
      data: req.body,
      include: { place: { select: { name: true, slug: true } }, partner: { select: { name: true, slug: true } } },
    })
    res.json(step)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /trips/:id/steps/:stepId
router.delete('/:id/steps/:stepId', requireAuth, async (req, res) => {
  try {
    await prisma.tripStep.delete({ where: { id: req.params.stepId } })
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /trips/:id/steps/reorder
router.put('/:id/steps/reorder', requireAuth, async (req, res) => {
  try {
    const { order } = req.body // [{ id, order }]
    await Promise.all(order.map(({ id, order }) => prisma.tripStep.update({ where: { id }, data: { order } })))
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
