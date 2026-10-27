/**
 * The GWA formula typeset as a real fraction, inside the same dashed
 * "calculation box" the calculator uses for its GWA readout.
 */
export function FormulaBlock() {
  return (
    <figure className="mt-8 rounded-lg border border-dashed bg-muted/30 px-4 py-8 sm:px-8 sm:py-10">
      <div
        role="math"
        aria-label="GWA equals the sum of each grade times its units, divided by the sum of all units"
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-lg font-bold sm:gap-x-5 sm:text-3xl"
      >
        <span>GWA</span>
        <span className="font-normal text-muted-foreground">=</span>
        <span className="inline-flex flex-col items-center">
          <span className="px-1 pb-2 sm:pb-3">Σ(grade × units)</span>
          <span aria-hidden className="h-1 w-full rounded-full bg-primary" />
          <span className="px-1 pt-2 sm:pt-3">Σ units</span>
        </span>
      </div>
      <figcaption className="mx-auto mt-8 grid max-w-xl gap-x-8 sm:grid-cols-2">
        <p>
          <strong>Above the line:</strong> multiply each subject's grade by its units, then add
          the results together.
        </p>
        <p>
          <strong>Below the line:</strong> add up the units of every subject you're counting.
        </p>
        <p className="sm:col-span-2">
          Divide the two and round to three decimal places. That's the number the calculator
          shows.
        </p>
      </figcaption>
    </figure>
  );
}
