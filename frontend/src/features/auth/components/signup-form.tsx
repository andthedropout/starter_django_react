import { useState, type FormEvent } from 'react'

import { Spinner } from '@/components/feedback/spinner'
import { Button } from '@/components/ui/button'
import type { FieldErrors } from '@/lib/api-error'

import type { SignupDetails } from '../types'
import { AlertMessage } from './alert-message'
import { FormField } from './form-field'

interface SignupFormProps {
  onSubmit: (details: SignupDetails) => void
  pending: boolean
  errorMessage?: string
  fieldErrors: FieldErrors
}

export function SignupForm({ onSubmit, pending, errorMessage, fieldErrors }: SignupFormProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ username, email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {errorMessage ? <AlertMessage message={errorMessage} /> : null}

      <FormField
        id="username"
        name="username"
        label="Username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        value={username}
        disabled={pending}
        error={fieldErrors.username?.[0]}
        onChange={(event) => setUsername(event.target.value)}
      />

      <FormField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        value={email}
        disabled={pending}
        error={fieldErrors.email?.[0]}
        onChange={(event) => setEmail(event.target.value)}
      />

      <FormField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        hint="Django validates length, commonness, and similarity to your other details."
        required
        value={password}
        disabled={pending}
        error={fieldErrors.password?.[0]}
        onChange={(event) => setPassword(event.target.value)}
      />

      <Button type="submit" disabled={pending}>
        {pending ? <Spinner /> : null}
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
