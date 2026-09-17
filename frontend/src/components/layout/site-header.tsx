import { Link } from '@tanstack/react-router'

/**
 * Intentionally session-agnostic: the header renders inside the server-rendered public page,
 * so it must not depend on the session query. Account state lives on the account route.
 */
export function SiteHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          Django <span className="text-muted-foreground">+</span> React
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          <Link
            to="/account"
            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 transition-colors"
            activeProps={{ className: 'text-foreground' }}
          >
            Account
          </Link>
          <Link
            to="/login"
            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 transition-colors"
            activeProps={{ className: 'text-foreground' }}
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  )
}
