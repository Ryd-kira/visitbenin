import api from './api'

export const placesService = {
  getAll:      (params) => api.get('/places', { params }).then(r => r.data),
  getFeatured: ()       => api.get('/places/featured').then(r => r.data),
  getBySlug:   (slug)   => api.get(`/places/${slug}`).then(r => r.data),
  getNearby:   (params) => api.get('/places/nearby', { params }).then(r => r.data),
  create:      (data)   => api.post('/places', data).then(r => r.data),
  update:      (id, d)  => api.put(`/places/${id}`, d).then(r => r.data),
  publish:     (id)     => api.post(`/places/${id}/publish`).then(r => r.data),
  delete:      (id)     => api.delete(`/places/${id}`).then(r => r.data),
}

export const restaurantsService = {
  getAll:    (params) => api.get('/restaurants', { params }).then(r => r.data),
  getBySlug: (slug)   => api.get(`/restaurants/${slug}`).then(r => r.data),
  create:    (data)   => api.post('/restaurants', data).then(r => r.data),
  update:    (id, d)  => api.put(`/restaurants/${id}`, d).then(r => r.data),
  publish:   (id)     => api.post(`/restaurants/${id}/publish`).then(r => r.data),
}

export const schoolsService = {
  getAll:    (params) => api.get('/schools', { params }).then(r => r.data),
  getBySlug: (slug)   => api.get(`/schools/${slug}`).then(r => r.data),
  create:    (data)   => api.post('/schools', data).then(r => r.data),
  update:    (id, d)  => api.put(`/schools/${id}`, d).then(r => r.data),
}

export const reviewsService = {
  create:  (data) => api.post('/reviews', data).then(r => r.data),
  delete:  (id)   => api.delete(`/reviews/${id}`).then(r => r.data),
  helpful: (id)   => api.post(`/reviews/${id}/helpful`).then(r => r.data),
}

export const authService = {
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  login:    (data) => api.post('/auth/login', data).then(r => r.data),
  logout:   ()     => api.post('/auth/logout').then(r => r.data),
  me:       ()     => api.get('/auth/me').then(r => r.data),
  refresh:  ()     => api.post('/auth/refresh').then(r => r.data),
}

export const partnersService = {
  getAll:    (params) => api.get('/partners', { params }).then(r => r.data),
  getBySlug: (slug)   => api.get(`/partners/${slug}`).then(r => r.data),
}

export const tripsService = {
  create: (data) => api.post('/trips', data).then(r => r.data),
  getAll: ()     => api.get('/trips').then(r => r.data),
  get:    (id)   => api.get(`/trips/${id}`).then(r => r.data),
  update: (id,d) => api.put(`/trips/${id}`, d).then(r => r.data),
  delete: (id)   => api.delete(`/trips/${id}`).then(r => r.data),
}
