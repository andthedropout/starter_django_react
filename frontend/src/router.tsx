import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { NotFoundState } from '@/components/feedback/not-found-state'
import { RouteError } from '@/components/feedback/route-error'
import { ApiError } from '@/lib/api-error'

import { routeTree } from './routeTree.gen'

/**
 * Called once per request on the server and once per page load in the browser, so the query
 * cache can never be shared between two visitors.
 */
export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Retry transport failures only: a 4xx answer is information, not a glitch.
        retry: (failureCount, error) =>
          failureCount < 2 && error instanceof ApiError && error.isNetworkError,
      },
      mutations: { retry: false },
    },
  })

  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultErrorComponent: RouteError,
    defaultNotFoundComponent: NotFoundState,
    Wrap: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

/** Fully inferred by TanStack Router; named here so consumers import a stable contract. */
export type AppRouter = ReturnType<typeof getRouter>

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter
  }
}
