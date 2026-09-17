import { ApiError } from './api-error'

/**
 * The only module in the app that is allowed to touch the network (enforced by ESLint).
 *
 * Contract with the Django backend:
 * - session cookies do the authentication, so every request is `same-origin`
 * - unsafe methods carry `X-CSRFToken` taken from `GET /api/v1/auth/csrf/` JSON, fetched
 *   immediately before the call so token rotation and multi-tab usage cannot desync; the
 *   token is never persisted anywhere
 * - anything that is not a well-formed JSON success is raised as an `ApiError`; there is no
 *   fallback that turns a failure into a fake success
 *
 * This client is browser-only by design. Server-rendered routes must not call it: routes
 * that need the session are declared `ssr: false`.
 */

const API_PREFIX = '/api/v1'
const CSRF_PATH = '/auth/csrf/'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const NEEDS_CSRF: Record<HttpMethod, boolean> = {
  GET: false,
  POST: true,
  PUT: true,
  PATCH: true,
  DELETE: true,
}

export interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  signal?: AbortSignal
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (NEEDS_CSRF[method]) headers['X-CSRFToken'] = await fetchCsrfToken(signal)

  const response = await send(path, {
    method,
    headers,
    credentials: 'same-origin',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    ...(signal ? { signal } : {}),
  })

  return readJson<T>(response)
}

async function fetchCsrfToken(signal?: AbortSignal): Promise<string> {
  const response = await send(CSRF_PATH, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
    ...(signal ? { signal } : {}),
  })

  const payload = await readJson<unknown>(response)
  const token =
    typeof payload === 'object' && payload !== null && 'csrfToken' in payload
      ? payload.csrfToken
      : undefined

  if (typeof token !== 'string' || token.length === 0) {
    throw new ApiError('The server did not return a CSRF token.', response.status)
  }
  return token
}

async function send(path: string, init: RequestInit): Promise<Response> {
  if (typeof window === 'undefined') {
    throw new ApiError(
      `Refusing to call ${API_PREFIX}${path} during server rendering: the API client needs ` +
        'browser cookies. Mark the route `ssr: false` or move the call into a server function.',
      0,
    )
  }

  try {
    return await fetch(`${API_PREFIX}${path}`, init)
  } catch (cause) {
    // Aborts are cooperative cancellation, not failures: let the query layer see them.
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0)
  }
}

async function readJson<T>(response: Response): Promise<T> {
  // 204 No Content is the documented answer for logout.
  if (response.status === 204) return undefined as T

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  let payload: unknown
  if (isJson) {
    try {
      payload = await response.json()
    } catch {
      throw new ApiError('The server returned a malformed JSON response.', response.status)
    }
  }

  if (!response.ok) throw ApiError.fromResponse(response.status, payload)

  if (!isJson) {
    throw new ApiError(
      `Expected a JSON response but received "${contentType || 'an unknown content type'}".`,
      response.status,
    )
  }

  return payload as T
}
