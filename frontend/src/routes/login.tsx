import { createFileRoute } from '@tanstack/react-router'

import { LoginPage } from '@/features/auth/pages/login-page'

export const Route = createFileRoute('/login')({
  // Session-dependent and private: never rendered or prefetched on the server.
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Sign in · Django + React Starter' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: LoginPage,
})
