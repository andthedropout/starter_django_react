import { cn } from '@/lib/utils'

/** Inline activity indicator; decorative, so the surrounding control owns the label. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={cn('size-4 animate-spin', className)}
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  )
}
