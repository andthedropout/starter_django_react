/**
 * Error shapes for the Django REST Framework contract.
 *
 * DRF answers failures either with `{"detail": "..."}` for non-field problems or with
 * `{"field": ["message", ...]}` (plus `non_field_errors`) for validation problems. This
 * module owns that translation so UI code never parses response payloads itself, and so
 * queries/pages can react to errors without importing the transport layer.
 */

export type FieldErrors = Readonly<Record<string, readonly string[]>>

const GENERIC_FALLBACK = 'Something went wrong. Please try again.'

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }

  /** No HTTP response was received at all (offline, DNS failure, dev proxy down). */
  get isNetworkError(): boolean {
    return this.status === 0
  }

  /** The server refused the request because the session is missing or stale. */
  get isUnauthenticated(): boolean {
    return this.status === 401 || this.status === 403
  }

  static fromResponse(status: number, payload: unknown): ApiError {
    const fieldErrors = toFieldErrors(payload)
    return new ApiError(summarize(status, payload, fieldErrors), status, fieldErrors)
  }
}

export function getErrorMessage(error: unknown, fallback: string = GENERIC_FALLBACK): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message.length > 0) return error.message
  return fallback
}

export function getFieldErrors(error: unknown): FieldErrors {
  return error instanceof ApiError ? error.fieldErrors : {}
}

export function getFieldError(error: unknown, field: string): string | undefined {
  return getFieldErrors(error)[field]?.[0]
}

/** DRF sends either a bare string or a list of strings per key; anything else is noise. */
function toMessages(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  return []
}

function toFieldErrors(payload: unknown): FieldErrors {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return {}

  const fieldErrors: Record<string, readonly string[]> = {}
  for (const [field, value] of Object.entries(payload)) {
    if (field === 'detail' || field === 'non_field_errors') continue
    const messages = toMessages(value)
    if (messages.length > 0) fieldErrors[field] = messages
  }
  return fieldErrors
}

function summarize(status: number, payload: unknown, fieldErrors: FieldErrors): string {
  if (typeof payload === 'object' && payload !== null) {
    if ('detail' in payload) {
      const [detail] = toMessages(payload.detail)
      if (detail !== undefined) return detail
    }
    if ('non_field_errors' in payload) {
      const [nonField] = toMessages(payload.non_field_errors)
      if (nonField !== undefined) return nonField
    }
  }

  if (Object.keys(fieldErrors).length > 0) return 'Please correct the highlighted fields.'

  if (status === 401 || status === 403) return 'Your session has expired. Please sign in again.'
  if (status === 404) return 'That resource could not be found.'
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.'
  if (status >= 500) return 'The server is having trouble right now. Please try again.'
  return `${GENERIC_FALLBACK} (HTTP ${status})`
}
