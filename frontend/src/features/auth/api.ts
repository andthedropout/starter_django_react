import { apiRequest } from '@/lib/api-client'

import type { LoginCredentials, SessionResponse, SignupDetails, User } from './types'

/**
 * Transport for `/api/v1/auth/`. No React, no cache, no navigation: one function per backend
 * endpoint so the DRF contract is readable in a single place.
 */

interface UserResponse {
  user: User
}

export function fetchSession(signal?: AbortSignal): Promise<SessionResponse> {
  return apiRequest<SessionResponse>('/auth/session/', signal ? { signal } : {})
}

export function login(credentials: LoginCredentials): Promise<UserResponse> {
  return apiRequest<UserResponse>('/auth/login/', { method: 'POST', body: credentials })
}

export function signup(details: SignupDetails): Promise<UserResponse> {
  return apiRequest<UserResponse>('/auth/signup/', { method: 'POST', body: details })
}

/** Answers 204 No Content, so there is nothing to read back. */
export function logout(): Promise<void> {
  return apiRequest<void>('/auth/logout/', { method: 'POST' })
}
