import { Spinner } from '@/components/feedback/spinner'

export function LoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm"
    >
      <Spinner />
      {label}
    </div>
  )
}
