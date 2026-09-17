import { createFileRoute } from '@tanstack/react-router'

import { readSiteUrl } from '@/lib/site-config.server'

/** Only `/` is indexable; the app routes are private and already send `noindex`. */
export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = readSiteUrl() ?? new URL(request.url).origin
        const body = [
          'User-agent: *',
          'Disallow: /login',
          'Disallow: /signup',
          'Disallow: /account',
          'Disallow: /api/',
          'Disallow: /admin/',
          `Sitemap: ${origin}/sitemap.xml`,
          '',
        ].join('\n')

        return new Response(body, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      },
    },
  },
})
