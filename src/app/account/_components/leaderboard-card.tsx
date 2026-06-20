"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MailWarningIcon,
  RefreshCwIcon,
  TrophyIcon,
} from "lucide-react";

import { useAuth } from "@/context/auth-provider";
import { getSchoolById, type School } from "@/config/schools";
import {
  subscribeLeaderboardSettings,
  updateUserProfile,
} from "@/lib/firebase/firestore";
import {
  refreshLeaderboardStanding,
  requestEmailVerification,
  setLeaderboardHandle,
  setLeaderboardParticipation,
} from "@/lib/firebase/callable";
import { getAuthErrorMessage } from "@/lib/firebase/errors";
import type { LeaderboardSettings } from "@/types";
import { SchoolCombobox } from "@/components/smart/school-combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";

/** Prefers a thrown HttpsError's message over Firebase's generic "internal". */
function leaderboardError(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    const msg = (err as { message: string }).message;
    if (msg && !/^internal$/i.test(msg)) return msg;
  }
  return getAuthErrorMessage(err);
}

// Must match the server's validation in functions/src/lib/leaderboard.ts.
const CODENAME_RE = /^[a-z0-9_]{3,20}$/;

export function LeaderboardCard() {
  const { user, profile } = useAuth();

  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [program, setProgram] = useState("");
  const [savingSchool, setSavingSchool] = useState(false);

  const [settings, setSettings] = useState<LeaderboardSettings | null>(null);
  const [anonymous, setAnonymous] = useState(true);
  const [codename, setCodename] = useState("");
  const [savingCodename, setSavingCodename] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [resending, setResending] = useState(false);

  // Seed the school + program fields from the stored profile.
  useEffect(() => {
    setSchoolId(profile?.schoolId ?? null);
    setProgram(profile?.program ?? "");
  }, [profile?.schoolId, profile?.program]);

  // Live-subscribe to the user's own (server-written) leaderboard settings.
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return;
    return subscribeLeaderboardSettings(uid, setSettings);
  }, [uid]);

  // Mirror the stored anonymity choice once it loads.
  useEffect(() => {
    if (settings) setAnonymous(settings.isAnonymous);
  }, [settings]);

  // Seed the codename input from the stored handle (auto-generated or chosen).
  useEffect(() => {
    if (settings?.handle) setCodename(settings.handle);
  }, [settings?.handle]);

  if (!user) return null;

  const optIn = settings?.optIn ?? false;
  const savedSchool = profile?.schoolId ?? null;
  const schoolUnchanged =
    schoolId === savedSchool && program.trim() === (profile?.program ?? "");
  const verified = user.emailVerified;

  const normalizedCodename = codename.trim().toLowerCase();
  const codenameValid = CODENAME_RE.test(normalizedCodename);
  const codenameUnchanged = normalizedCodename === (settings?.handle ?? "");

  async function handlePickSchool(school: School | null) {
    setSchoolId(school?.id ?? null);
  }

  async function handleSaveSchool() {
    if (!user || !schoolId) return;
    const school = getSchoolById(schoolId);
    if (!school) return;
    setSavingSchool(true);
    try {
      await updateUserProfile(user.uid, {
        schoolId: school.id,
        schoolName: school.name,
        schoolType: school.type,
        program: program.trim() || null,
      });
      // Propagate the school change to an existing board entry, if any.
      if (settings?.optIn) await refreshLeaderboardStanding();
      toast.success("School saved.");
    } catch (err) {
      toast.error(leaderboardError(err));
    } finally {
      setSavingSchool(false);
    }
  }

  async function handleToggleJoin(next: boolean) {
    if (!user) return;
    setBusy(true);
    try {
      await setLeaderboardParticipation({ optIn: next, isAnonymous: anonymous });
      toast.success(
        next ? "You've joined the leaderboard." : "You've left the leaderboard.",
      );
    } catch (err) {
      toast.error(leaderboardError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleAnonymous(next: boolean) {
    setAnonymous(next);
    if (!user || !optIn) return; // not on the board yet — just remember the choice
    setBusy(true);
    try {
      await setLeaderboardParticipation({ optIn: true, isAnonymous: next });
      toast.success(
        next ? "You now appear anonymously." : "You now appear with your name.",
      );
    } catch (err) {
      setAnonymous(!next); // revert on failure
      toast.error(leaderboardError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveCodename() {
    if (!user) return;
    setSavingCodename(true);
    try {
      const res = await setLeaderboardHandle({ handle: codename.trim() });
      setCodename(res.data.handle);
      toast.success("Codename updated.");
    } catch (err) {
      toast.error(leaderboardError(err));
    } finally {
      setSavingCodename(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshLeaderboardStanding();
      toast.success("Your standing has been updated.");
    } catch (err) {
      toast.error(leaderboardError(err));
    } finally {
      setRefreshing(false);
    }
  }

  async function handleResendVerification() {
    setResending(true);
    try {
      await requestEmailVerification();
      toast.success("Verification email sent — check your inbox.");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setResending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrophyIcon className="size-5 text-primary" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          Optional. Compare your overall and per-semester GWAs with others at
          your school. You choose whether to appear by name or anonymously, and
          you can leave at any time.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* School */}
        <Field>
          <FieldLabel htmlFor="school">School</FieldLabel>
          <SchoolCombobox
            id="school"
            value={schoolId}
            onChange={handlePickSchool}
            disabled={savingSchool}
          />
        </Field>

        {/* Program / college within the school */}
        <Field>
          <FieldLabel htmlFor="program">
            College / Program{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              id="program"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g. College of Engineering"
              disabled={savingSchool}
            />
            <Button
              type="button"
              onClick={handleSaveSchool}
              disabled={savingSchool || schoolUnchanged || !schoolId}
            >
              {savingSchool && <Spinner data-icon="inline-start" />}
              Save
            </Button>
          </div>
        </Field>

        <Separator />

        {/* Email-verification gate */}
        {!verified && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            <MailWarningIcon className="size-4 text-amber-600" />
            <span>Verify your email to join the leaderboard.</span>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={handleResendVerification}
              disabled={resending}
            >
              {resending ? "Sending…" : "Resend verification"}
            </Button>
          </div>
        )}

        {/* Join toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Join the leaderboard</span>
            <span className="text-xs text-muted-foreground">
              {savedSchool
                ? "Publish your standing to your school's board."
                : "Choose and save your school first."}
            </span>
          </div>
          <Switch
            checked={optIn}
            disabled={busy || !verified || !savedSchool}
            onCheckedChange={handleToggleJoin}
          />
        </div>

        {/* Anonymity toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Show me as anonymous</span>
            <span className="text-xs text-muted-foreground">
              Hide your name and photo behind a random handle.
            </span>
          </div>
          <Switch
            checked={anonymous}
            disabled={busy || !verified}
            onCheckedChange={handleToggleAnonymous}
          />
        </div>

        {/* Custom codename (used when appearing anonymously) */}
        {anonymous && (
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
                disabled={savingCodename || !verified}
              />
              <Button
                type="button"
                onClick={handleSaveCodename}
                disabled={
                  savingCodename ||
                  !verified ||
                  !codenameValid ||
                  codenameUnchanged
                }
              >
                {savingCodename && <Spinner data-icon="inline-start" />}
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              3–20 characters — letters, numbers, and underscores. This is how
              you appear on the board when anonymous.
            </p>
          </Field>
        )}

        {/* How the boards qualify */}
        <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          Each saved semester with <strong>12+ units</strong> appears on its{" "}
          <strong>per-semester</strong> board. The <strong>overall</strong> board
          is a complete academic summary — it needs at least{" "}
          <strong>8 semesters</strong> and <strong>120 units</strong>, so it only
          shows near- or fully-finished students.
        </p>

        {/* Current standing (when on the board) */}
        {optIn && (
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              You appear on the board as
              <Badge variant="secondary">
                {anonymous
                  ? (settings?.handle ?? "anonymous")
                  : (user.displayName ?? profile?.displayName ?? "your name")}
              </Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCwIcon />
              )}
              Update my standing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
