// frontend/src/store/useAuthStore.js
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user:        null,
  accessToken: null,
  isLoading:   true,

  setUser:        (user)  => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  setLoading:     (v)     => set({ isLoading: v }),

  login: (user, token) => set({ user, accessToken: token, isLoading: false }),

  logout: () => set({ user: null, accessToken: null, isLoading: false }),
}))
