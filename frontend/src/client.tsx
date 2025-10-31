import { StartClient } from '@tanstack/react-start/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import './index.css'

// Check if we have SSR data (production/SSR mode) or not (dev mode)
// @ts-expect-error - TanStack Start adds this global in SSR mode
const hasSSRData = typeof window !== 'undefined' && window.$_TSR

if (hasSSRData) {
  // Production SSR: hydrate the server-rendered HTML using TanStack Start
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>
  )
} else {
  // Development mode: client-only rendering using standalone TanStack Router
  const router = getRouter()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
