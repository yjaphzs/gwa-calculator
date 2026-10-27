import Link from "next/link";
import { CalculatorIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Closing call to action plus the "your registrar decides" note. */
export function GuideCta() {
  return (
    <section aria-labelledby="compute-yours" className="mt-12 rounded-lg border bg-muted/30 p-5 sm:p-6">
      <h2 id="compute-yours" className="mt-0!">
        Compute your own GWA
      </h2>
      <p>
        Enter your subjects in the calculator and it does every step above for you. It also
        flags honors once you reach 12 units.
      </p>
      <Button asChild className="mt-4 text-primary-foreground! no-underline!">
        <Link href="/">
          <CalculatorIcon />
          Open the calculator
        </Link>
      </Button>
      <p className="text-xs!">
        This guide explains how this calculator works and describes common practice in Philippine
        colleges. Your school's registrar has the final say on your official GWA and honors.
      </p>
    </section>
  );
}
