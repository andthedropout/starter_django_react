import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorStateProps {
  title?: string
  message: string
  /** Omitted when the failure is not something the user can retry. */
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Card role="alert">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {onRetry ? (
          <CardContent>
            <Button variant="outline" onClick={onRetry}>
              {retryLabel}
            </Button>
          </CardContent>
        ) : null}
      </Card>
    </div>
  )
}
