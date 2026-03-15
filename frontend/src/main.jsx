// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import './i18n/index.js'   // ← initialise i18next avant le rendu
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:    5 * 60 * 1000,   // 5 min
      gcTime:       10 * 60 * 1000,  // 10 min
      retry:        1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
)
