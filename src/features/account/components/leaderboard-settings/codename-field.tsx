"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { setLeaderboardHandle } from "@/lib/firebase/callable";
import { getCallableErrorMessage } from "@/lib/firebase/errors";

// Must match the server's validation in functions/src/lib/leaderboard.ts.
const CODENAME_RE = /^[a-z0-9_]{3,20}$/;

interface CodenameFieldProps {
  /** The stored handle (auto-generated or chosen), if any. */
  handle: string | null;
  verified: boolean;
}

/** The anonymous codename shown on the board, editable within the server's rules. */
export function CodenameField({ handle, verified }: CodenameFieldProps) {
  const [codename, setCodename] = useState("");
  const [saving, setSaving] = useState(false);

  // Seed the codename input from the stored handle.
  useEffect(() => {
    if (handle) setCodename(handle);
  }, [handle]);

  const normalized = codename.trim().toLowerCase();
  const valid = CODENAME_RE.test(normalized);
  const unchanged = normalized === (handle ?? "");

  async function handleSave() {
    setSaving(true);
    try {
      const res = await setLeaderboardHandle({ handle: codename.trim() });
      setCodename(res.data.handle);
      toast.success("Codename updated.");
    } catch (err) {
      toast.error(getCallableErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor="codename">Your codename</FieldLabel>
      <div className="flex gap-2">
        <Input
          id="codename"
          value={codename}
          onChange={(e) => setCodename(e.target.value)}
          placeholder="e.g. silent_scholar"
          maxLength={20}
          autoComplete="off"
          disabled={saving || !verified}
        />
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || !verified || !valid || unchanged}
        >
          {saving && <Spinner data-icon="inline-start" />}
          Save
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        3–20 characters: letters, numbers, and underscores. This is how you appear on the board
        when anonymous.
      </p>
    </Field>
  );
}
