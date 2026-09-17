import { useState, type FormEvent } from 'react'

import { Spinner } from '@/components/feedback/spinner'
import { Button } from '@/components/ui/button'
import type { FieldErrors } from '@/lib/api-error'

import type { LoginCredentials } from '../types'
import { AlertMessage } from './alert-message'
import { FormField } from './form-field'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void
  pending: boolean
  /** Non-field failure to show above the fields. */
  errorMessage?: string
  fieldErrors: FieldErrors
}

export function LoginForm({ onSubmit, pending, errorMessage, fieldErrors }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ username, password })
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
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        value={password}
        disabled={pending}
        error={fieldErrors.password?.[0]}
        onChange={(event) => setPassword(event.target.value)}
      />

      <Button type="submit" disabled={pending}>
        {pending ? <Spinner /> : null}
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
