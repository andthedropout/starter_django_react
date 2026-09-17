import type { ErrorComponentProps } from '@tanstack/react-router'

import { ErrorState } from '@/components/feedback/error-state'
import { getErrorMessage } from '@/lib/api-error'

/** Router-level error boundary: every route failure lands here instead of a blank screen. */
export function RouteError({ error, reset }: ErrorComponentProps) {
  return <ErrorState message={getErrorMessage(error)} onRetry={reset} />
}
