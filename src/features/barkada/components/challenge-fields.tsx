"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GOALS, goalLabel } from "@/features/barkada/lib/barkada-rank";
import { SEMESTER_TERMS, generateSchoolYears } from "@/features/semesters/lib/semesters";
import { OptionChips } from "@/features/share/components/option-chips";
import type { BarkadaGoal } from "@/types";

export interface ChallengeValues {
  name: string;
  schoolYear: string;
  semester: string;
  goal: BarkadaGoal;
}

const SHORT_GOALS: Record<BarkadaGoal, string> = {
  "deans-lister": "Dean's Lister+",
  "college-scholar": "College Scholar+",
  "university-scholar": "University Scholar",
};

interface ChallengeFieldsProps {
  values: ChallengeValues;
  onChange: (patch: Partial<ChallengeValues>) => void;
}

/** The barkada's name, its term (same pickers as saving a semester), and its goal. */
export function ChallengeFields({ values, onChange }: ChallengeFieldsProps) {
  const years = generateSchoolYears(5);
  if (!years.includes(values.schoolYear)) years.push(values.schoolYear);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="barkada-name">Barkada name</Label>
        <Input
          id="barkada-name"
          value={values.name}
          maxLength={30}
          placeholder="e.g. Block A Squad"
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="barkada-semester">Semester</Label>
          <Select value={values.semester} onValueChange={(semester) => onChange({ semester })}>
            <SelectTrigger id="barkada-semester" className="w-full max-md:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEMESTER_TERMS.map((term) => (
                <SelectItem key={term} value={term}>
                  {term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="barkada-year">School year</Label>
          <Select value={values.schoolYear} onValueChange={(schoolYear) => onChange({ schoolYear })}>
            <SelectTrigger id="barkada-year" className="w-full max-md:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <OptionChips<BarkadaGoal>
          label="Goal"
          value={values.goal}
          onChange={(goal) => onChange({ goal })}
          options={GOALS.map((g) => ({ value: g.value, label: SHORT_GOALS[g.value] }))}
        />
        <p className="text-xs text-muted-foreground">{goalLabel(values.goal)} this term.</p>
      </div>
    </>
  );
}
