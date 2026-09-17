import { Link, useNavigate } from '@tanstack/react-router'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getErrorMessage, getFieldErrors } from '@/lib/api-error'

import { LoginForm } from '../components/login-form'
import { useLogin } from '../queries'

export function LoginPage() {
  const navigate = useNavigate()
  const { mutate, isPending, error } = useLogin()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>Use your account credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            pending={isPending}
            errorMessage={error ? getErrorMessage(error) : undefined}
            fieldErrors={getFieldErrors(error)}
            onSubmit={(credentials) => {
              // The session is only authoritative once the mutation resolved, so navigation
              // happens in onSuccess — never optimistically.
              mutate(credentials, {
                onSuccess: () => void navigate({ to: '/account' }),
              })
            }}
          />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-center text-sm">
        No account yet?{' '}
        <Link to="/signup" className="text-foreground underline underline-offset-4">
          Create one
        </Link>
      </p>
    </div>
  )
}
