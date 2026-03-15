import { Router } from 'express'
import { prisma } from '../utils/prisma.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

// GET /rentals/all — admin (AVANT /:id pour éviter le conflit de route)
router.get('/all', requireAuth, requireRole('editor'), async (req, res) => {
  try {
    const data = await prisma.rental.findMany({ orderBy: [{ order: 'asc' }, { created_at: 'desc' }] })
    res.json({ data })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /rentals — public
router.get('/', async (req, res) => {
  try {
    const { type } = req.query
    const data = await prisma.rental.findMany({
      where: { is_published: true, ...(type && { type }) },
      orderBy: [{ order: 'asc' }, { price_day: 'asc' }],
    })
    res.json({ data })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /rentals
router.post('/', requireAuth, requireRole('editor'), async (req, res) => {
  try {
    const rental = await prisma.rental.create({ data: req.body })
    res.status(201).json(rental)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// PUT /rentals/:id
router.put('/:id', requireAuth, requireRole('editor'), async (req, res) => {
  try {
    const rental = await prisma.rental.update({ where: { id: req.params.id }, data: req.body })
    res.json(rental)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// DELETE /rentals/:id
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.rental.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

export default router
