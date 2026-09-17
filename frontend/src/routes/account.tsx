import { createFileRoute, redirect } from '@tanstack/react-router'

import { AccountPage } from '@/features/auth/pages/account-page'
import { sessionQueryOptions } from '@/features/auth/queries'

export const Route = createFileRoute('/account')({
  ssr: false,
  /**
   * The backend session is the only source of truth. A transport failure is deliberately not
   * treated as "signed out": it propagates to the route error boundary, which offers a retry.
   */
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions)
    if (!session.user) throw redirect({ to: '/login' })
  },
  head: () => ({
    meta: [
      { title: 'Account · Django + React Starter' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AccountPage,
})
