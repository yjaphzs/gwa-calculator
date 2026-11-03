"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentControls } from "@/features/share/components/content-controls";
import type { ShareStudio } from "@/features/share/hooks/use-share-studio";
import { scopeKey, type ShareScope } from "@/features/share/lib/share-content";

interface ShowTabProps {
  studio: ShareStudio;
  scopes: { scope: ShareScope; label: string }[];
}

/** The studio's Show tab: which result to share, then what appears on the image. */
export function ShowTab({ studio, scopes }: ShowTabProps) {
  const { options, update } = studio;
  const byKey = new Map(scopes.map((s) => [scopeKey(s.scope), s.scope]));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="share-scope" className="text-sm font-medium text-muted-foreground">
          What to share
        </label>
        <Select
          value={scopeKey(options.scope)}
          onValueChange={(key) => update({ scope: byKey.get(key) ?? options.scope, chosen: [] })}
        >
          <SelectTrigger id="share-scope" className="w-full max-md:h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scopes.map((s) => (
              <SelectItem key={scopeKey(s.scope)} value={scopeKey(s.scope)}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ContentControls studio={studio} />
    </div>
  );
}
