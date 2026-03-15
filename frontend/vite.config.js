// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    // Proxy uniquement en développement local
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Découpage des chunks pour optimiser le chargement
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          query:   ['@tanstack/react-query'],
          map:     ['leaflet', 'react-leaflet'],
          i18n:    ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
})
