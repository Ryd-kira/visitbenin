import Redis from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,   // ne pas réessayer indéfiniment
  enableOfflineQueue: false,
})

redis.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') console.warn('⚠️  Redis:', err.message)
})

// Helpers cache — silencieux si Redis est down
export async function cacheGet(key) {
  try {
    const val = await redis.get(key)
    return val ? JSON.parse(val) : null
  } catch (_) { return null }
}

export async function cacheSet(key, data, ttlSeconds = 600) {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds)
  } catch (_) {}
}

export async function cacheDel(pattern) {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length) await redis.del(...keys)
  } catch (_) {}
}
