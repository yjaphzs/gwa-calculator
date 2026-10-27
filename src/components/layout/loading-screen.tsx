import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

/**
 * Full-screen loader used by auth guards while auth state resolves. Theme-aware
 * (uses the app background) so it blends in for both light and dark modes.
 */
export function LoadingScreen({ message, className }: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background px-6 text-foreground",
        className,
      )}
    >
      <Spinner className="size-8 text-primary" />
      <p className="text-sm text-muted-foreground tabular-nums">
        {message ?? "Loading…"}
      </p>
    </div>
  );
}
