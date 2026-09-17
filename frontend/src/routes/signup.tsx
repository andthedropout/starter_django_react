import { createFileRoute } from '@tanstack/react-router'

import { SignupPage } from '@/features/auth/pages/signup-page'

export const Route = createFileRoute('/signup')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Create account · Django + React Starter' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: SignupPage,
})
