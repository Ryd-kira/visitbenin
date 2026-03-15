// backend/src/middlewares/validate.middleware.js
import Joi from 'joi'

// Valide req.body contre un schéma Joi
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })
    if (error) {
      const errors = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      }))
      return res.status(422).json({ error: 'Données invalides', errors })
    }
    req.body = value
    next()
  }
}

// ── SCHÉMAS DE VALIDATION ──────────────────────

export const schemas = {
  // Auth
  register: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name:     Joi.string().min(2).max(100).required(),
  }),
  login: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Place
  createPlace: Joi.object({
    name:          Joi.string().min(2).max(200).required(),
    type:          Joi.string().valid('culture','nature','plage','safari','religieux','divertissement').required(),
    description:   Joi.string().min(10).required(),
    short_desc:    Joi.string().max(300).required(),
    city_id:       Joi.string().uuid().required(),
    address:       Joi.string().optional(),
    latitude:      Joi.number().min(-90).max(90).required(),
    longitude:     Joi.number().min(-180).max(180).required(),
    entry_fee:     Joi.number().integer().min(0).allow(null).optional(),
    opening_hours: Joi.object().optional(),
    website:       Joi.string().uri().allow('').optional(),
    phone:         Joi.string().max(20).allow('').optional(),
    is_unesco:     Joi.boolean().optional(),
    tags:          Joi.array().items(Joi.string()).optional(),
  }),

  // Review
  createReview: Joi.object({
    entity_type:  Joi.string().valid('place','restaurant','school','hotel').required(),
    entity_id:    Joi.string().uuid().required(),
    rating:       Joi.number().integer().min(1).max(5).required(),
    title:        Joi.string().max(100).optional(),
    content:      Joi.string().min(20).required(),
    sub_ratings:  Joi.object().optional(),
    visited_at:   Joi.date().optional(),
  }),
}
