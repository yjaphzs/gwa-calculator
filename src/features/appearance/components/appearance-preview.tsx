import { Button } from "@/components/ui/button";

/** A few real controls in the current colors, so a choice can be judged before closing. */
export function AppearancePreview() {
  return (
    <div aria-hidden className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button size="sm" tabIndex={-1}>
            Save
          </Button>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">1st Sem</span>
        </div>
        <svg viewBox="0 0 120 28" className="h-7 w-full max-w-40" preserveAspectRatio="none">
          <polyline
            points="0,22 30,16 60,18 90,8 120,4"
            fill="none"
            stroke="var(--chart-line)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">GWA</p>
        <p className="font-mono text-3xl font-bold tabular-nums">1.250</p>
      </div>
    </div>
  );
}
