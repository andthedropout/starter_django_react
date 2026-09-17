import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import { fetchSession, login, logout, signup } from './api'
import type { SessionResponse, User } from './types'

/** Every cache entry under this key belongs to the auth feature, not to an account. */
const AUTH_SCOPE = 'auth'

/**
 * The server is the only authority on who is signed in: this query reads the session cookie
 * state from the backend instead of mirroring it in client storage.
 */
export const sessionQueryOptions = queryOptions({
  queryKey: [AUTH_SCOPE, 'session'],
  queryFn: ({ signal }) => fetchSession(signal),
  staleTime: 30_000,
})

export function useSession() {
  return useQuery(sessionQueryOptions)
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: ({ user }) => applyIdentity(queryClient, user),
  })
}

export function useSignup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signup,
    onSuccess: ({ user }) => applyIdentity(queryClient, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => applyIdentity(queryClient, null),
  })
}

/**
 * The signed-in identity changed. Cancel every in-flight read first — a slow session GET
 * started under the previous identity would otherwise resolve afterwards and overwrite the
 * new one — then seed the known session and drop the previous account's cached data.
 */
async function applyIdentity(queryClient: QueryClient, user: User | null): Promise<void> {
  await queryClient.cancelQueries()
  queryClient.setQueryData(sessionQueryOptions.queryKey, { user } satisfies SessionResponse)
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== AUTH_SCOPE })
}
