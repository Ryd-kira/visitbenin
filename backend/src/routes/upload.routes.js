// backend/src/routes/upload.routes.js
import { Router } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Multer — stockage en mémoire (buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Type de fichier non autorisé (jpg, png, webp seulement)'))
    }
    cb(null, true)
  },
})

// POST /upload/image — Upload une image vers Cloudinary
router.post('/image', requireAuth, requireRole('admin', 'editor'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' })

    const folder = req.body.folder || 'visitbenin'

    // Upload le buffer vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          eager: [{ width: 400, height: 300, crop: 'fill', quality: 80 }], // thumbnail
        },
        (err, res) => { if (err) reject(err); else resolve(res) }
      )
      stream.end(req.file.buffer)
    })

    res.json({
      url:            result.secure_url,
      thumbnail:      result.eager?.[0]?.secure_url || result.secure_url,
      cloudinary_id:  result.public_id,
      width:          result.width,
      height:         result.height,
      format:         result.format,
      bytes:          result.bytes,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /upload/image — Supprimer une image Cloudinary
router.delete('/image', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { cloudinary_id } = req.body
    if (!cloudinary_id) return res.status(400).json({ error: 'cloudinary_id requis' })
    await cloudinary.uploader.destroy(cloudinary_id)
    res.json({ message: 'Image supprimée' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
