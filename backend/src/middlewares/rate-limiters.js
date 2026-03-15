// backend/src/middlewares/rate-limiters.js
import rateLimit from 'express-rate-limit'

// ── Login : 10 tentatives / 15 min par (IP + email) ────────────
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = (req.body?.email || '').toLowerCase().trim()
    return `login::${req.ip}::${email}`
  },
  handler: (req, res) => {
    const resetMs   = req.rateLimit?.resetTime ? req.rateLimit.resetTime - Date.now() : 900000
    const resetMins = Math.max(1, Math.ceil(resetMs / 60000))
    res.status(429).json({
      error: `Trop de tentatives échouées. Réessayez dans ${resetMins} minute${resetMins > 1 ? 's' : ''}.`,
      blocked_for_minutes: resetMins,
      retry_after: Date.now() + resetMs,
      code: 'LOGIN_RATE_LIMITED',
    })
  },
})

// ── Register : 5 tentatives / heure par (IP + email) ───────────
// Clé = IP + email → aucun bannissement global d'IP (hôtels, cybercafés...)
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !(req.body?.email || '').trim(),
  keyGenerator: (req) => {
    const email = (req.body?.email || '').toLowerCase().trim()
    return `register::${req.ip}::${email}`
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Trop de tentatives pour cette adresse email. Réessayez dans 1 heure.',
      code: 'REGISTER_RATE_LIMITED',
    })
  },
})

// ── Global : toutes les routes sauf login/register ─────────────
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const p = req.path
    return p.endsWith('/auth/login') || p.endsWith('/auth/register')
  },
  message: { error: 'Trop de requêtes. Réessayez dans 15 minutes.' },
})
