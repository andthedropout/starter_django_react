import { fileURLToPath } from 'node:url'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type ProxyOptions } from 'vite'

/**
 * TanStack Start owns the browser entry in every environment: it renders the public page on
 * the server and hydrates the app routes. Django only owns its own URL prefixes, which the
 * dev server forwards to the `web` container.
 */
const djangoTarget = process.env.DJANGO_API_URL ?? 'http://web:8000'

/**
 * Regex key with an explicit segment boundary: a plain `/api` prefix would also capture
 * `/apiculture`. `changeOrigin` stays off so Django keeps seeing the browser's Host and
 * Origin (ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS, and session cookies depend on it), which
 * matches how the production adapter forwards requests.
 */
const djangoOwnedPathPattern = '^/(api|admin|static|media|up)(/|$)'

const toDjango: ProxyOptions = { target: djangoTarget, changeOrigin: false }

export default defineConfig({
  plugins: [
    // MUST come before react(): route generation and server-function compilation depend on it.
    tanstackStart(),
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    // Container-internal port is fixed; publishing/remapping is compose's concern.
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: process.env.VITE_USE_POLLING === 'true',
    },
    proxy: { [djangoOwnedPathPattern]: toDjango },
  },
})
