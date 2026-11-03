"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { inSeason } from "@/features/share/lib/seasons";
import { shortYear, wrappedYears } from "@/features/wrapped/lib/wrapped";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Semester } from "@/types";

/**
 * From March to June (Recognition Day and graduation season), invites people
 * with a finished school year to open its Wrapped. Hiding it lasts until the
 * next school year has a Wrapped.
 */
export function WrappedBanner({ semesters, onOpen }: { semesters: Semester[]; onOpen: () => void }) {
  const [inRecognitionSeason] = useState(() => inSeason("recognition", new Date()));
  const year = wrappedYears(semesters)[0];
  const [hidden, setHidden] = useLocalStorage(`gwa_wrapped_banner_${year ?? "none"}`, false);
  if (!inRecognitionSeason || !year || hidden) return null;

  return (
    <aside className="mt-4 flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-3 pl-4">
      <span aria-hidden className="text-2xl">
        🎓
      </span>
      <p className="min-w-0 flex-1 text-sm">
        <strong>Recognition season na!</strong> Your S.Y. {shortYear(year)} GWA Wrapped is ready.
      </p>
      <Button size="sm" className="shrink-0 max-md:h-10" onClick={onOpen}>
        Open Wrapped
      </Button>
      <Button variant="ghost" size="icon" className="shrink-0 max-md:size-10" aria-label="Hide the Wrapped banner" onClick={() => setHidden(true)}>
        <XIcon />
      </Button>
    </aside>
  );
}
