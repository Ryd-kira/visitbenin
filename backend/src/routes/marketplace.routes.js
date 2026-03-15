// backend/src/routes/marketplace.routes.js
import { Router } from 'express'
import { prisma } from '../utils/prisma.js'
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth.middleware.js'

const router = Router()
const requireAdmin = requireRole('admin')

// ════════════════════════════════════════
// SHOPS
// ════════════════════════════════════════

// GET /marketplace/shops — Liste publique
router.get('/shops', async (req, res) => {
  try {
    const { city, limit = 20, page = 1 } = req.query
    const where = { is_published: true }
    if (city) where.city = { contains: city, mode: 'insensitive' }

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        include: { _count: { select: { products: true } } },
        orderBy: [{ is_verified: 'desc' }, { rating: 'desc' }],
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.shop.count({ where }),
    ])
    res.json({ data: shops, total })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /marketplace/shops/:slug
router.get('/shops/:slug', async (req, res) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: { where: { is_published: true }, orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }] },
        _count: { select: { products: true } },
      },
    })
    if (!shop || !shop.is_published) return res.status(404).json({ error: 'Boutique introuvable' })
    res.json({ data: shop })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /marketplace/shops — Créer boutique
router.post('/shops', requireAuth, async (req, res) => {
  try {
    const { name, slug, description, cover_image, city, address, phone, whatsapp } = req.body
    const shop = await prisma.shop.create({
      data: { owner_id: req.user.id, name, slug, description, cover_image, city, address, phone, whatsapp },
    })
    res.status(201).json({ data: shop })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Slug déjà utilisé' })
    res.status(400).json({ error: err.message })
  }
})

// ════════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════════

// GET /marketplace/products — Catalogue public
router.get('/products', optionalAuth, async (req, res) => {
  try {
    const { category, search, featured, city, limit = 24, page = 1 } = req.query
    const where = { is_published: true, shop: { is_published: true } }

    if (category) where.category = category
    if (featured === 'true') where.is_featured = true
    if (search)   where.name = { contains: search, mode: 'insensitive' }
    if (city)     where.shop = { ...where.shop, city: { contains: city, mode: 'insensitive' } }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { shop: { select: { id: true, name: true, slug: true, city: true, is_verified: true } } },
        orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ])
    res.json({ data: products, total, pages: Math.ceil(total / parseInt(limit)) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /marketplace/products/:slug
router.get('/products/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { shop: true },
    })
    if (!product || !product.is_published) return res.status(404).json({ error: 'Produit introuvable' })
    res.json({ data: product })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /marketplace/products — Ajouter produit (propriétaire boutique)
router.post('/products', requireAuth, async (req, res) => {
  try {
    const { shop_id, name, slug, description, price, original_price, unit, stock, category, images, tags } = req.body

    // Vérifier que la boutique appartient à l'user
    const shop = await prisma.shop.findFirst({ where: { id: shop_id, owner_id: req.user.id } })
    if (!shop && req.user.role !== 'admin') return res.status(403).json({ error: 'Non autorisé' })

    const product = await prisma.product.create({
      data: { shop_id, name, slug, description, price: parseInt(price), original_price: original_price ? parseInt(original_price) : null, unit: unit || 'unité', stock: parseInt(stock) || 0, category, images: images || [], tags: tags || [] },
    })
    res.status(201).json({ data: product })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Slug déjà utilisé' })
    res.status(400).json({ error: err.message })
  }
})

// ════════════════════════════════════════
// ORDERS (Panier + Commandes)
// ════════════════════════════════════════

// GET /marketplace/orders/cart — Panier actuel
router.get('/orders/cart', optionalAuth, async (req, res) => {
  try {
    if (!req.user) return res.json({ data: null })

    const cart = await prisma.order.findFirst({
      where: { user_id: req.user.id, status: 'cart' },
      include: {
        items: {
          include: {
            product: { include: { shop: { select: { id: true, name: true, city: true } } } },
          },
        },
      },
    })
    res.json({ data: cart })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /marketplace/orders/cart/add — Ajouter au panier
router.post('/orders/cart/add', requireAuth, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body

    const product = await prisma.product.findUnique({ where: { id: product_id, is_published: true } })
    if (!product) return res.status(404).json({ error: 'Produit introuvable' })
    if (product.stock < quantity) return res.status(400).json({ error: 'Stock insuffisant' })

    // Trouver ou créer le panier
    let cart = await prisma.order.findFirst({ where: { user_id: req.user.id, status: 'cart' } })
    if (!cart) {
      cart = await prisma.order.create({ data: { user_id: req.user.id, status: 'cart' } })
    }

    // Vérifier si le produit est déjà dans le panier
    const existing = await prisma.orderItem.findFirst({ where: { order_id: cart.id, product_id } })

    if (existing) {
      await prisma.orderItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity, subtotal: (existing.quantity + quantity) * product.price },
      })
    } else {
      await prisma.orderItem.create({
        data: { order_id: cart.id, product_id, quantity, unit_price: product.price, subtotal: quantity * product.price },
      })
    }

    // Recalculer le total
    const items = await prisma.orderItem.findMany({ where: { order_id: cart.id } })
    const total = items.reduce((s, i) => s + i.subtotal, 0)
    await prisma.order.update({ where: { id: cart.id }, data: { total_price: total } })

    res.json({ message: 'Produit ajouté au panier', cart_id: cart.id })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// DELETE /marketplace/orders/cart/remove/:itemId
router.delete('/orders/cart/remove/:itemId', requireAuth, async (req, res) => {
  try {
    const item = await prisma.orderItem.findFirst({
      where: { id: req.params.itemId, order: { user_id: req.user.id, status: 'cart' } },
    })
    if (!item) return res.status(404).json({ error: 'Item introuvable' })

    await prisma.orderItem.delete({ where: { id: item.id } })

    // Recalculer total
    const remaining = await prisma.orderItem.findMany({ where: { order_id: item.order_id } })
    const total = remaining.reduce((s, i) => s + i.subtotal, 0)
    await prisma.order.update({ where: { id: item.order_id }, data: { total_price: total } })

    res.json({ message: 'Retiré du panier' })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// POST /marketplace/orders/checkout — Valider la commande
router.post('/orders/checkout', requireAuth, async (req, res) => {
  try {
    const { delivery_address, delivery_city, contact_name, contact_phone, contact_email, payment_method, notes } = req.body

    const cart = await prisma.order.findFirst({
      where: { user_id: req.user.id, status: 'cart' },
      include: { items: true },
    })
    if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'Panier vide' })

    const order = await prisma.order.update({
      where: { id: cart.id },
      data: {
        status: 'pending',
        delivery_address, delivery_city,
        contact_name, contact_phone, contact_email,
        payment_method, notes,
        confirmed_at: new Date(),
      },
    })
    res.json({ data: order })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// GET /marketplace/orders/me — Mes commandes
router.get('/orders/me', requireAuth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { user_id: req.user.id, status: { not: 'cart' } },
      include: {
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
      },
      orderBy: { created_at: 'desc' },
    })
    res.json({ data: orders })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — Toutes les commandes
router.get('/orders', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query
    const where = status ? { status } : { status: { not: 'cart' } }
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
        orderBy: { created_at: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ])
    res.json({ data: orders, total })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — Modifier statut commande
router.patch('/orders/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, payment_status } = req.body
    const data = {}
    if (status)         data.status = status
    if (payment_status) data.payment_status = payment_status
    if (status === 'delivered') data.delivered_at = new Date()

    const order = await prisma.order.update({ where: { id: req.params.id }, data })
    res.json({ data: order })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// Admin — Publier/dépublier shop ou product
router.patch('/shops/:id/publish', requireAuth, requireAdmin, async (req, res) => {
  try {
    const shop = await prisma.shop.update({ where: { id: req.params.id }, data: { is_published: req.body.is_published, is_verified: req.body.is_verified } })
    res.json({ data: shop })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.patch('/products/:id/publish', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.update({ where: { id: req.params.id }, data: { is_published: req.body.is_published, is_featured: req.body.is_featured } })
    res.json({ data: product })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

export default router
