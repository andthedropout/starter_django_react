import { createFileRoute} from '@tanstack/react-router'
import SignUp from '@/pages/auth/SignUp'

export const Route = createFileRoute('/signup')({
  ssr: false,  // CLIENT-ONLY - auth pages typically stay SPA
  component: SignUp,
})
