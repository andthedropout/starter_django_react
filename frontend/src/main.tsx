import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@/components/theme-provider'
import { HelmetProvider } from 'react-helmet-async'

// Development tools - only in local environment
if (import.meta.env.DEV) {
  // React Grab - visual component inspector
  import('react-grab').then((module) => {
    const grab = module.default || module.grab || module
    if (typeof grab === 'function') {
      grab()
    }
  })

  // React Scan - performance monitoring (shows overlay, scanning paused by default)
  import('react-scan').then(({ scan }) => {
    scan({
      enabled: true,
      playSound: false,
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
