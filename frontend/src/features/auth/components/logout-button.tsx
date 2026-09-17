import { Spinner } from '@/components/feedback/spinner'
import { Button } from '@/components/ui/button'

interface LogoutButtonProps {
  onLogout: () => void
  pending: boolean
}

/** Signing out is a state change: it is a POST mutation behind a button, never a link. */
export function LogoutButton({ onLogout, pending }: LogoutButtonProps) {
  return (
    <Button type="button" variant="outline" onClick={onLogout} disabled={pending}>
      {pending ? <Spinner /> : null}
      {pending ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}
