import app from './app.js'
import { prisma } from './utils/prisma.js'
import { redis } from './utils/redis.js'

const PORT = process.env.PORT || 3001

async function start() {
  try {
    // Test connexion BDD
    await prisma.$connect()
    console.log('✅ PostgreSQL connecté')

    // Redis optionnel — le serveur démarre même sans Redis
    try {
      await Promise.race([
        redis.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ])
      console.log('✅ Redis connecté')
    } catch (redisErr) {
      console.warn('⚠️  Redis indisponible — cache désactivé, le reste fonctionne normalement')
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 VisitBénin API démarrée`)
      console.log(`   URL    : http://localhost:${PORT}`)
      console.log(`   Health : http://localhost:${PORT}/health`)
      console.log(`   Env    : ${process.env.NODE_ENV || 'development'}\n`)
    })
  } catch (err) {
    console.error('❌ Échec démarrage:', err)
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM reçu, arrêt gracieux...')
  await prisma.$disconnect()
  try { redis.disconnect() } catch (_) {}
  process.exit(0)
})

start()
