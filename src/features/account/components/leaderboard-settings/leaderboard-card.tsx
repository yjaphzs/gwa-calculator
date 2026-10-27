"use client";

import { TrophyIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-provider";
import { CodenameField } from "@/features/account/components/leaderboard-settings/codename-field";
import { LeaderboardStanding } from "@/features/account/components/leaderboard-settings/leaderboard-standing";
import { ParticipationToggles } from "@/features/account/components/leaderboard-settings/participation-toggles";
import { SchoolProgramField } from "@/features/account/components/leaderboard-settings/school-program-field";
import { VerifyEmailNotice } from "@/features/account/components/leaderboard-settings/verify-email-notice";
import { useLeaderboardParticipation } from "@/features/account/hooks/use-leaderboard-participation";
import { useLeaderboardSettings } from "@/features/leaderboard/hooks/use-leaderboard-settings";

/** Account → leaderboard opt-in: school, participation, codename, standing. */
export function LeaderboardCard() {
  const { user, profile } = useAuth();
  const settings = useLeaderboardSettings(user?.uid);
  const participation = useLeaderboardParticipation(settings);

  if (!user) return null;

  const verified = user.emailVerified;
  const { optIn, anonymous } = participation;
  const appearsAs = anonymous
    ? (settings?.handle ?? "anonymous")
    : (user.displayName ?? profile?.displayName ?? "your name");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrophyIcon className="size-5 text-primary" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          Optional. Compare your overall and per-semester GWAs with others at your school. You
          choose whether to appear by name or anonymously, and you can leave at any time.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <SchoolProgramField uid={user.uid} profile={profile} optIn={optIn} />

        <Separator />

        {!verified && <VerifyEmailNotice />}

        <ParticipationToggles
          optIn={optIn}
          anonymous={anonymous}
          busy={participation.busy}
          verified={verified}
          hasSavedSchool={!!profile?.schoolId}
          onToggleJoin={participation.toggleJoin}
          onToggleAnonymous={participation.toggleAnonymous}
        />

        {/* Custom codename (used when appearing anonymously) */}
        {anonymous && <CodenameField handle={settings?.handle ?? null} verified={verified} />}

        {/* How the boards qualify */}
        <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          Each saved semester with <strong>12+ units</strong> appears on its{" "}
          <strong>per-semester</strong> board. The <strong>overall</strong> board is a complete
          academic summary. It needs at least <strong>8 semesters</strong> and{" "}
          <strong>120 units</strong>, so it only shows near- or fully-finished students.
        </p>

        {optIn && <LeaderboardStanding appearsAs={appearsAs} />}
      </CardContent>
    </Card>
  );
}
