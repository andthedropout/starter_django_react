import type { User } from '../types'

export function AccountDetails({ user }: { user: User }) {
  return (
    <dl className="grid gap-4 text-sm sm:grid-cols-2">
      <div className="grid gap-1">
        <dt className="text-muted-foreground">Username</dt>
        <dd className="font-medium">{user.username}</dd>
      </div>
      <div className="grid gap-1">
        <dt className="text-muted-foreground">Email</dt>
        <dd className="font-medium">{user.email || '—'}</dd>
      </div>
      <div className="grid gap-1">
        <dt className="text-muted-foreground">User ID</dt>
        <dd className="font-mono font-medium">{user.id}</dd>
      </div>
    </dl>
  )
}
