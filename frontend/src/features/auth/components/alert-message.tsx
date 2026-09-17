/** Non-field error summary (DRF `detail` / `non_field_errors`, or a transport failure). */
export function AlertMessage({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
    >
      {message}
    </p>
  )
}
