"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getSchoolById } from "@/config/schools";
import { SchoolCombobox } from "@/features/leaderboard/components/school-combobox";
import { refreshLeaderboardStanding } from "@/lib/firebase/callable";
import { getCallableErrorMessage } from "@/lib/firebase/errors";
import { updateUserProfile } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/types";

interface SchoolProgramFieldProps {
  uid: string;
  profile: UserProfile | null;
  /** On the board already → push the school change to the existing entry. */
  optIn: boolean;
}

/** School picker + optional college/program, saved to the profile. */
export function SchoolProgramField({ uid, profile, optIn }: SchoolProgramFieldProps) {
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [program, setProgram] = useState("");
  const [saving, setSaving] = useState(false);

  // Seed the school + program fields from the stored profile.
  useEffect(() => {
    setSchoolId(profile?.schoolId ?? null);
    setProgram(profile?.program ?? "");
  }, [profile?.schoolId, profile?.program]);

  const unchanged =
    schoolId === (profile?.schoolId ?? null) && program.trim() === (profile?.program ?? "");

  async function handleSave() {
    const school = getSchoolById(schoolId);
    if (!school) return;
    setSaving(true);
    try {
      await updateUserProfile(uid, {
        schoolId: school.id,
        schoolName: school.name,
        schoolType: school.type,
        program: program.trim() || null,
      });
      if (optIn) await refreshLeaderboardStanding();
      toast.success("School saved.");
    } catch (err) {
      toast.error(getCallableErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Field>
        <FieldLabel htmlFor="school">School</FieldLabel>
        <SchoolCombobox
          id="school"
          value={schoolId}
          onChange={(school) => setSchoolId(school?.id ?? null)}
          disabled={saving}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="program">
          College / Program <span className="font-normal text-muted-foreground">(optional)</span>
        </FieldLabel>
        <div className="flex gap-2">
          <Input
            id="program"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            placeholder="e.g. College of Engineering"
            disabled={saving}
          />
          <Button type="button" onClick={handleSave} disabled={saving || unchanged || !schoolId}>
            {saving && <Spinner data-icon="inline-start" />}
            Save
          </Button>
        </div>
      </Field>
    </>
  );
}
