import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Server-rendered public page: static content only, no session query, so crawlers and first
 * paint get the full markup.
 */
const highlights = [
  {
    title: 'Django 5.2 + DRF',
    description:
      'Session authentication with explicit CSRF protection, serializer validation, and a thin service layer.',
  },
  {
    title: 'React 19 + TanStack Start',
    description:
      'SSR for public pages, client-only rendering for the app, TanStack Query for every server read.',
  },
  {
    title: 'One command to run',
    description:
      'Docker Compose brings up Postgres, Django, and Vite; production uses separate lean Python and Bun images.',
  },
]

export function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <section className="flex flex-col items-start gap-6 py-20 sm:py-28">
        <span className="text-muted-foreground border-border rounded-full border px-3 py-1 text-xs font-medium">
          Starter template
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          A lean Django and React starter you can actually build on.
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
          Session-based auth, a typed API boundary, and server rendering where it matters —
          without the demo code you would have to delete first.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to="/signup">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      <section aria-label="What is included" className="grid gap-4 pb-24 sm:grid-cols-3">
        {highlights.map((highlight) => (
          <Card key={highlight.title}>
            <CardHeader>
              <CardTitle className="text-base">{highlight.title}</CardTitle>
              <CardDescription>{highlight.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  )
}
