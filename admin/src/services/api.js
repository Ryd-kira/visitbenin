// admin/src/services/api.js
import axios from 'axios'
import { useAdminStore } from '@/store/useAdminStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
})

// Injecter le token
api.interceptors.request.use(cfg => {
  const token = useAdminStore.getState().accessToken
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auth
export const authService = {
  login:   d  => api.post('/auth/login', d).then(r => r.data),
  logout:  () => api.post('/auth/logout').then(r => r.data),
  me:      () => api.get('/auth/me').then(r => r.data),
  refresh: () => api.post('/auth/refresh').then(r => r.data),
}

// Places
export const placesAPI = {
  list:    p  => api.get('/places',        { params: { ...p, limit: 20 } }).then(r => r.data),
  get:     id => api.get(`/places/${id}`).then(r => r.data),
  create:  d  => api.post('/places', d).then(r => r.data),
  update:  (id, d) => api.put(`/places/${id}`, d).then(r => r.data),
  publish: id => api.post(`/places/${id}/publish`).then(r => r.data),
  delete:  id => api.delete(`/places/${id}`).then(r => r.data),
}

// Restaurants
export const restaurantsAPI = {
  list:    p  => api.get('/restaurants',   { params: { ...p, limit: 20 } }).then(r => r.data),
  get:     id => api.get(`/restaurants/${id}`).then(r => r.data),
  create:  d  => api.post('/restaurants', d).then(r => r.data),
  update:  (id, d) => api.put(`/restaurants/${id}`, d).then(r => r.data),
  publish: id => api.post(`/restaurants/${id}/publish`).then(r => r.data),
  delete:  id => api.delete(`/restaurants/${id}`).then(r => r.data),
}

// Schools
export const schoolsAPI = {
  list:    p  => api.get('/schools',       { params: { ...p, limit: 20 } }).then(r => r.data),
  get:     id => api.get(`/schools/${id}`).then(r => r.data),
  create:  d  => api.post('/schools', d).then(r => r.data),
  update:  (id, d) => api.put(`/schools/${id}`, d).then(r => r.data),
}

// Reviews
export const reviewsAPI = {
  list:    p  => api.get('/reviews',       { params: p }).then(r => r.data),
  publish: (id, v) => api.patch(`/reviews/${id}/publish`, { is_published: v }).then(r => r.data),
  delete:  id => api.delete(`/reviews/${id}`).then(r => r.data),
}

// Users
export const usersAPI = {
  list:       p  => api.get('/users',      { params: p }).then(r => r.data),
  setRole:    (id, role) => api.patch(`/users/${id}/role`, { role }).then(r => r.data),
}

// Stats (custom endpoint ou calcul front)
export const statsAPI = {
  overview: () => Promise.all([
    api.get('/places',      { params: { limit: 1 } }),
    api.get('/restaurants', { params: { limit: 1 } }),
    api.get('/schools',     { params: { limit: 1 } }),
    api.get('/users',       { params: { limit: 1 } }),
    api.get('/partners',    { params: { limit: 1 } }).catch(() => ({ data: {} })),
    api.get('/trips/admin/all', { params: { limit: 1 } }).catch(() => ({ data: {} })),
    api.get('/activities/all').catch(() => ({ data: { data: [] } })),
    api.get('/rentals/all').catch(() => ({ data: { data: [] } })),
  ]).then(([p, r, s, u, pa, tr, ac, re]) => ({
    places:      p.data.pagination?.total  || 0,
    restaurants: r.data.pagination?.total  || 0,
    schools:     s.data.pagination?.total  || 0,
    users:       u.data.pagination?.total  || 0,
    partners:    pa.data.pagination?.total || 0,
    trips:       tr.data.pagination?.total || tr.data.stats?.total || 0,
    activities:  ac.data.data?.length      || 0,
    rentals:     re.data.data?.length      || 0,
  })),
}

export default api
