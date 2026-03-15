// backend/src/routes/reviews.routes.js
import { Router } from 'express'
import { prisma } from '../utils/prisma.js'
import { cacheDel } from '../utils/redis.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'
import { validate, schemas } from '../middlewares/validate.middleware.js'

const router = Router()

// POST /reviews — Créer un avis
router.post('/', requireAuth, validate(schemas.createReview), async (req, res) => {
  try {
    const { entity_type, entity_id, rating, title, content, sub_ratings, visited_at } = req.body

    // Vérifier que l'entité existe
    const entity = await prisma[entity_type].findUnique({ where: { id: entity_id } })
    if (!entity) return res.status(404).json({ error: `${entity_type} introuvable` })

    // Un seul avis par user par entité
    const exists = await prisma.review.findFirst({
      where: { user_id: req.user.id, entity_type, entity_id }
    })
    if (exists) return res.status(409).json({ error: 'Vous avez déjà laissé un avis' })

    // Créer l'avis + mettre à jour la moyenne (transaction)
    const [review] = await prisma.$transaction([
      prisma.review.create({
        data: { user_id: req.user.id, entity_type, entity_id, rating, title, content, sub_ratings, visited_at },
        include: { user: { select: { name: true, avatar_url: true } } },
      }),
      // Recalculer la moyenne
      prisma.$executeRawUnsafe(`
        UPDATE ${entity_type}s SET
          rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM reviews WHERE entity_type = '${entity_type}' AND entity_id = '${entity_id}' AND is_published = true),
          review_count = (SELECT COUNT(*) FROM reviews WHERE entity_type = '${entity_type}' AND entity_id = '${entity_id}' AND is_published = true)
        WHERE id = '${entity_id}'
      `),
    ])

    // Invalider le cache de la fiche
    await cacheDel(`${entity_type}s:slug:*`)
    res.status(201).json(review)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /reviews/:id — Supprimer son avis
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } })
    if (!review) return res.status(404).json({ error: 'Avis introuvable' })
    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' })
    }
    await prisma.review.delete({ where: { id: req.params.id } })
    res.json({ message: 'Avis supprimé' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /reviews/:id/helpful — Voter "utile"
router.post('/:id/helpful', requireAuth, async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { helpful_count: { increment: 1 } },
    })
    res.json({ helpful_count: review.helpful_count })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PATCH /reviews/:id/publish — Admin modération
router.patch('/:id/publish', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { is_published: req.body.is_published },
    })
    res.json(review)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
