import { resolve, sep } from 'node:path'
import start from './dist/server/server.js'

// TanStack Start owns rendering. This adapter owns sockets, static files, and
// same-origin forwarding to Django; it never implements authentication or SSR.
const publicOrigin = new URL(required('SITE_URL'))
const djangoOrigin = new URL(required('DJANGO_API_URL'))
const clientDirectory = resolve(import.meta.dir, 'client')
const backendPath = /^\/(api|admin|static|media|up)(\/|$)/
const hopByHop = ['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade']

function required(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

function endToEndHeaders(source: Headers) {
  const headers = new Headers(source)
  for (const name of (headers.get('connection') ?? '').split(',')) {
    if (name.trim()) headers.delete(name.trim())
  }
  for (const name of hopByHop) headers.delete(name)
  return headers
}

async function proxy(request: Request, url: URL) {
  const target = new URL(djangoOrigin)
  target.pathname = url.pathname
  target.search = url.search
  const headers = endToEndHeaders(request.headers)
  // The configured public origin, not an arbitrary client forwarding header,
  // determines HTTPS. Django still validates the original Host and Origin.
  headers.set('host', request.headers.get('host') ?? url.host)
  headers.set('x-forwarded-proto', publicOrigin.protocol.slice(0, -1))
  headers.delete('x-forwarded-host')
  headers.delete('x-forwarded-for')
  headers.delete('forwarded')
  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
      decompress: false,
      signal: AbortSignal.timeout(30_000),
    })
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: endToEndHeaders(response.headers),
    })
  } catch (error) {
    console.error('Django upstream unavailable', error instanceof Error ? error.name : 'Error')
    return Response.json({ detail: 'Service temporarily unavailable.' }, { status: 502 })
  }
}

const server = Bun.serve({
  hostname: '0.0.0.0',
  port: Number(process.env.PORT ?? 3000),
  maxRequestBodySize: 2 * 1024 * 1024,
  async fetch(request) {
    const url = new URL(request.url)
    if (backendPath.test(url.pathname)) return proxy(request, url)

    if (url.pathname.startsWith('/assets/')) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } })
      }
      let pathname: string
      try {
        pathname = decodeURIComponent(url.pathname)
      } catch {
        return new Response('Bad request', { status: 400 })
      }
      const path = resolve(clientDirectory, `.${pathname}`)
      if (!path.startsWith(`${clientDirectory}${sep}assets${sep}`)) {
        return new Response('Not found', { status: 404 })
      }
      const file = Bun.file(path)
      if (!(await file.exists())) return new Response('Not found', { status: 404 })
      return new Response(request.method === 'HEAD' ? null : file, {
        headers: {
          'Content-Type': file.type,
          'Content-Length': String(file.size),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    }

    const response = await start.fetch(request)
    // Never cache personalized HTML or SSR responses in a shared cache.
    if (!response.headers.has('cache-control')) response.headers.set('cache-control', 'no-store')
    response.headers.set('x-content-type-options', 'nosniff')
    return response
  },
  error() {
    return new Response('Internal server error', { status: 500 })
  },
})

console.info(`Frontend listening on ${server.url}`)
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, async () => {
    await server.stop()
    process.exit(0)
  })
}
