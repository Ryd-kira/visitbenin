// backend/src/routes/bookings.routes.js
import { Router } from 'express'
import { prisma } from '../utils/prisma.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()
const requireAdmin = requireRole('admin')

// ── GET /bookings/me — Mes réservations
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { status } = req.query
    const where = { user_id: req.user.id }
    if (status) where.status = status

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { created_at: 'desc' },
    })
    res.json({ data: bookings })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── POST /bookings — Créer une réservation
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      booking_type, entity_id, entity_name,
      date, time_slot, nb_persons, total_price,
      payment_method, notes,
      contact_name, contact_phone, contact_email,
    } = req.body

    // Validation basique
    if (!booking_type || !entity_id || !date || !contact_name || !contact_phone || !contact_email) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' })
    }

    const booking = await prisma.booking.create({
      data: {
        user_id:        req.user.id,
        booking_type,
        entity_id,
        entity_name,
        date:           new Date(date),
        time_slot:      time_slot || null,
        nb_persons:     parseInt(nb_persons) || 1,
        total_price:    parseInt(total_price) || 0,
        payment_method: payment_method || null,
        notes:          notes || null,
        contact_name,
        contact_phone,
        contact_email,
        status:         'pending',
        payment_status: 'unpaid',
      },
    })

    res.status(201).json({ data: booking })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ── GET /bookings/:id — Détail d'une réservation
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, user_id: req.user.id },
    })
    if (!booking) return res.status(404).json({ error: 'Réservation introuvable' })
    res.json({ data: booking })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── PATCH /bookings/:id/cancel — Annuler
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, user_id: req.user.id },
    })
    if (!booking) return res.status(404).json({ error: 'Réservation introuvable' })
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ error: 'Cette réservation ne peut plus être annulée' })
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status:        'cancelled',
        cancelled_at:  new Date(),
        cancel_reason: req.body.reason || null,
      },
    })
    res.json({ data: updated })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ── Admin : GET /bookings — Toutes les réservations
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 30 } = req.query
    const where = {}
    if (status) where.status = status
    if (type)   where.booking_type = type

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { created_at: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ])
    res.json({ data: bookings, total, pages: Math.ceil(total / parseInt(limit)) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Admin : PATCH /bookings/:id — Modifier statut
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, payment_status, payment_ref } = req.body
    const data = {}
    if (status)         { data.status = status; if (status === 'confirmed') data.confirmed_at = new Date() }
    if (payment_status) data.payment_status = payment_status
    if (payment_ref)    data.payment_ref = payment_ref

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data,
    })
    res.json({ data: booking })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

export default router
