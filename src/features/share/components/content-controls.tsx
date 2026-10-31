"use client";

import { Switch } from "@/components/ui/switch";
import { OptionChips } from "@/features/share/components/option-chips";
import { SubjectChecklist } from "@/features/share/components/subject-checklist";
import type { ShareStudio } from "@/features/share/hooks/use-share-studio";
import type { ShareShow, SubjectFilter } from "@/features/share/lib/share-options";
import { shareGwa } from "@/features/share/lib/share-text";

interface Toggle {
  key: keyof ShareShow;
  label: string;
  hint?: string | ((studio: ShareStudio) => string);
  /** Only offered when it has something to show. */
  when?: (studio: ShareStudio) => boolean;
}

const TOGGLES: Toggle[] = [
  {
    key: "exact",
    label: "Exact GWA",
    hint: (s) => `Off shows ${shareGwa(s.content?.gwa ?? 1, false)}`,
    when: (s) => s.content?.gwa != null,
  },
  { key: "honor", label: "Honor" },
  { key: "units", label: "Units" },
  { key: "trend", label: "Semester trend", when: (s) => (s.content?.trend.length ?? 0) >= 2 },
  { key: "subjects", label: "Subjects" },
  { key: "name", label: "My name", hint: "From your profile", when: (s) => !!s.identity.name },
  { key: "school", label: "My school", hint: "From your profile", when: (s) => !!s.identity.school },
];

function SwitchRow({ label, hint, checked, onToggle }: { label: string; hint?: string; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 border-b py-1.5 last:border-0">
      <span className="flex flex-col text-sm">
        {label}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onToggle} aria-label={label} />
    </label>
  );
}

/** What appears on the image. Subjects and personal details are off until switched on. */
export function ContentControls({ studio }: { studio: ShareStudio }) {
  const { options, toggle, update, content } = studio;

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col">
        <legend className="mb-2 text-sm font-medium text-muted-foreground">Show</legend>
        {TOGGLES.filter((t) => !t.when || t.when(studio)).map((t) => (
          <SwitchRow
            key={t.key}
            label={t.label}
            hint={typeof t.hint === "function" ? t.hint(studio) : t.hint}
            checked={options.show[t.key]}
            onToggle={() => toggle(t.key)}
          />
        ))}
      </fieldset>

      {options.show.subjects && (
        <div className="flex flex-col gap-4">
          <OptionChips<SubjectFilter>
            label="Which subjects"
            value={options.filter}
            onChange={(filter) => update({ filter })}
            options={[
              { value: "all", label: "All" },
              { value: "best3", label: "Best 3" },
              { value: "best5", label: "Best 5" },
              { value: "choose", label: "Choose…" },
            ]}
          />
          {options.filter === "choose" && (
            <SubjectChecklist
              subjects={content?.subjects ?? []}
              chosen={options.chosen}
              onChange={(chosen) => update({ chosen })}
            />
          )}
          <OptionChips<"best" | "original">
            label="Order"
            value={options.sort}
            onChange={(sort) => update({ sort })}
            options={[
              { value: "best", label: "Best first" },
              { value: "original", label: "As listed" },
            ]}
          />
          <fieldset className="flex flex-col">
            <legend className="sr-only">Subject details</legend>
            <SwitchRow label="Grades" checked={options.show.grades} onToggle={() => toggle("grades")} />
            <SwitchRow label="Subject titles" hint="Off shows the codes" checked={options.show.titles} onToggle={() => toggle("titles")} />
          </fieldset>
        </div>
      )}
    </div>
  );
}
