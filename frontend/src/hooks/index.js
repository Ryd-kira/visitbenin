import { useQuery } from '@tanstack/react-query'
import { placesService, restaurantsService, schoolsService } from '@/services/index'

export function usePlaces(params) {
  return useQuery({
    queryKey: ['places', params],
    queryFn: () => placesService.getAll(params),
    placeholderData: (prev) => prev,
  })
}

export function useFeaturedPlaces() {
  return useQuery({
    queryKey: ['places', 'featured'],
    queryFn: placesService.getFeatured,
    staleTime: 30 * 60 * 1000,
  })
}

export function usePlace(slug) {
  return useQuery({
    queryKey: ['places', slug],
    queryFn: () => placesService.getBySlug(slug),
    enabled: !!slug,
  })
}

export function useRestaurants(params) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => restaurantsService.getAll(params),
    placeholderData: (prev) => prev,
  })
}

export function useRestaurant(slug) {
  return useQuery({
    queryKey: ['restaurants', slug],
    queryFn: () => restaurantsService.getBySlug(slug),
    enabled: !!slug,
  })
}

export function useSchools(params) {
  return useQuery({
    queryKey: ['schools', params],
    queryFn: () => schoolsService.getAll(params),
    placeholderData: (prev) => prev,
  })
}

export function useSchool(slug) {
  return useQuery({
    queryKey: ['schools', slug],
    queryFn: () => schoolsService.getBySlug(slug),
    enabled: !!slug,
  })
}
