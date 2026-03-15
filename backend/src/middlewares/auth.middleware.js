// backend/src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma.js'

// Vérifie le JWT et attache l'utilisateur à req.user
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' })
    }

    const token = header.split(' ')[1]
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, is_verified: true },
    })

    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' })

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Token invalide' })
  }
}

// Optionnel : attache l'user si connecté, sinon continue
export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      const token = header.split(' ')[1]
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      req.user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, name: true, role: true },
      })
    }
  } catch (_) { /* ignore */ }
  next()
}

// Vérifie le rôle minimum requis
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissions insuffisantes' })
    }
    next()
  }
}
