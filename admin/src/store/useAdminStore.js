// admin/src/store/useAdminStore.js
import { create } from 'zustand'

export const useAdminStore = create((set) => ({
  user:      null,
  loading:   true,
  sidebarOpen: true,
  setUser:    (user)    => set({ user }),
  setLoading: (v)       => set({ loading: v }),
  toggleSidebar: ()     => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  logout:     ()        => set({ user: null }),
}))
