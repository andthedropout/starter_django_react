import { useNavigate } from '@tanstack/react-router'

import { ErrorState } from '@/components/feedback/error-state'
import { LoadingState } from '@/components/feedback/loading-state'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getErrorMessage } from '@/lib/api-error'

import { AccountDetails } from '../components/account-details'
import { AlertMessage } from '../components/alert-message'
import { LogoutButton } from '../components/logout-button'
import { useLogout, useSession } from '../queries'

export function AccountPage() {
  const navigate = useNavigate()
  const session = useSession()
  const logout = useLogout()

  if (session.isPending) return <LoadingState label="Loading your account…" />

  // A transport failure is not a signed-out user: show it and let the visitor retry.
  if (session.error) {
    return (
      <ErrorState
        title="Could not load your account"
        message={getErrorMessage(session.error)}
        onRetry={() => void session.refetch()}
      />
    )
  }

  const user = session.data?.user
  if (!user) {
    return (
      <ErrorState
        title="You are signed out"
        message="Your session is no longer valid. Sign in again to see your account."
        retryLabel="Go to sign in"
        onRetry={() => void navigate({ to: '/login' })}
      />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account</CardTitle>
          <CardDescription>
            Signed in as <span className="text-foreground font-medium">{user.username}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AccountDetails user={user} />
          {logout.error ? <AlertMessage message={getErrorMessage(logout.error)} /> : null}
        </CardContent>
        <CardFooter>
          <LogoutButton
            pending={logout.isPending}
            onLogout={() => {
              logout.mutate(undefined, {
                onSuccess: () => void navigate({ to: '/' }),
              })
            }}
          />
        </CardFooter>
      </Card>
    </div>
  )
}
