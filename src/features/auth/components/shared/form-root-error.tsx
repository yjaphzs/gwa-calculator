/** A form-level error banner (e.g. a failed sign-in), hidden when there's no message. */
export function FormRootError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
      {message}
    </p>
  );
}
