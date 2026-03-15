import { Router } from 'express'
import { prisma } from '../utils/prisma.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

// GET /activities/all — admin (AVANT /:id)
router.get('/all', requireAuth, requireRole('editor'), async (req, res) => {
  try {
    const data = await prisma.activity.findMany({ orderBy: [{ order: 'asc' }, { created_at: 'desc' }] })
    res.json({ data })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /activities — public
router.get('/', async (req, res) => {
  try {
    const { tag, type, city } = req.query
    let all = await prisma.activity.findMany({
      where: {
        is_published: true,
        ...(type && { type }),
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
      },
      orderBy: [{ order: 'asc' }, { created_at: 'desc' }],
    })
    if (tag) all = all.filter(a => a.tags.includes(tag))
    res.json({ data: all })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /activities
router.post('/', requireAuth, requireRole('editor'), async (req, res) => {
  try {
    const act = await prisma.activity.create({ data: req.body })
    res.status(201).json(act)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// PUT /activities/:id
router.put('/:id', requireAuth, requireRole('editor'), async (req, res) => {
  try {
    const act = await prisma.activity.update({ where: { id: req.params.id }, data: req.body })
    res.json(act)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// DELETE /activities/:id
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.activity.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

export default router
