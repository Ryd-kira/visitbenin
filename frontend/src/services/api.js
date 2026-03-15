import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true,
})

// Injecter le token — import dynamique pour éviter la dépendance circulaire Zustand
api.interceptors.request.use(async (config) => {
  try {
    const mod = await import('@/store/useAuthStore')
    const token = mod.useAuthStore.getState().accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (_) {}
  return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(token => { original.headers.Authorization = `Bearer ${token}`; return api(original) })
      }
      original._retry = true
      isRefreshing = true
      try {
        // URL absolue pour le refresh — fonctionne en dev ET en prod cross-domain
        const refreshURL = `${API_BASE}/auth/refresh`
        const { data } = await axios.post(refreshURL, {}, { withCredentials: true })
        const newToken = data.access_token
        const mod = await import('@/store/useAuthStore')
        mod.useAuthStore.getState().setAccessToken(newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(original)
      } catch (err) {
        processQueue(err, null)
        try {
          const mod = await import('@/store/useAuthStore')
          mod.useAuthStore.getState().logout()
        } catch (_) {}
        window.location.href = '/connexion'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Injecter le token — import dynamique pour éviter la dépendance circulaire Zustand
api.interceptors.request.use(async (config) => {
  try {
    const mod = await import('@/store/useAuthStore')
    const token = mod.useAuthStore.getState().accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (_) {}
  return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(token => { original.headers.Authorization = `Bearer ${token}`; return api(original) })
      }
      original._retry = true
      isRefreshing = true
      try {
        const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
        const newToken = data.access_token
        const mod = await import('@/store/useAuthStore')
        mod.useAuthStore.getState().setAccessToken(newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(original)
      } catch (err) {
        processQueue(err, null)
        try {
          const mod = await import('@/store/useAuthStore')
          mod.useAuthStore.getState().logout()
        } catch (_) {}
        window.location.href = '/connexion'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
