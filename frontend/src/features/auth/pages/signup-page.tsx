import { Link, useNavigate } from '@tanstack/react-router'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getErrorMessage, getFieldErrors } from '@/lib/api-error'

import { SignupForm } from '../components/signup-form'
import { useSignup } from '../queries'

export function SignupPage() {
  const navigate = useNavigate()
  const { mutate, isPending, error } = useSignup()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Signing up also signs you in on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm
            pending={isPending}
            errorMessage={error ? getErrorMessage(error) : undefined}
            fieldErrors={getFieldErrors(error)}
            onSubmit={(details) => {
              mutate(details, {
                onSuccess: () => void navigate({ to: '/account' }),
              })
            }}
          />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-center text-sm">
        Already registered?{' '}
        <Link to="/login" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  )
}
