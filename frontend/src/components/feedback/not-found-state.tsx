import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export function NotFoundState() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">This page does not exist</h1>
      <p className="text-muted-foreground text-sm">
        The link may be outdated, or the page may have moved.
      </p>
      <Button asChild variant="outline">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  )
}
