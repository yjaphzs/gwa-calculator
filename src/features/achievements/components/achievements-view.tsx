"use client";

import dynamic from "next/dynamic";
import { AwardIcon, Share2Icon, SparklesIcon } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeTile } from "@/features/achievements/components/badge-tile";
import { useBadges } from "@/features/achievements/hooks/use-badges";
import type { BadgeStatus } from "@/features/achievements/lib/evaluate-badges";
import { MergeDialog } from "@/features/persistence/components/merge-dialog";
import { useCalculatorData } from "@/features/persistence/hooks/use-calculator-data";
import { useShareDialog } from "@/features/share/hooks/use-share-dialog";
import { useWrappedDialog } from "@/features/wrapped/hooks/use-wrapped-dialog";
import { shortYear, wrappedYears } from "@/features/wrapped/lib/wrapped";

// Both load the first time they're opened.
const ShareStudio = dynamic(() => import("@/features/share/components/share-studio"), { ssr: false });
const WrappedViewer = dynamic(() => import("@/features/wrapped/components/wrapped-viewer"), { ssr: false });

function BadgeSection({ title, statuses }: { title: string; statuses: BadgeStatus[] }) {
  if (statuses.length === 0) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-muted-foreground">
        {title} ({statuses.length})
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {statuses.map((status) => (
          <BadgeTile key={status.badge.id} status={status} />
        ))}
      </ul>
    </section>
  );
}

/**
 * Badges earned from the user's own subjects and semesters. Works for guests
 * (data in this browser) and signed-in users alike; visiting clears the nav dot.
 */
export function AchievementsView() {
  const data = useCalculatorData();
  const statuses = useBadges({ subjects: data.subjects, semesters: data.semesters, ready: !data.loading, onPage: true });
  const earned = statuses.filter((s) => s.earned);
  const share = useShareDialog();
  const wrapped = useWrappedDialog();
  const latestYear = wrappedYears(data.semesters)[0];
  const shareCard = () =>
    share.openShare({ style: "card", mood: "proud", scope: data.semesters.length > 0 ? { kind: "overall" } : { kind: "current" } });
  const percent = Math.round((earned.length / statuses.length) * 100);

  return (
    <AppShell footer={<SiteFooter />}>
      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <AwardIcon aria-hidden className="size-6 text-primary" />
          Achievements
        </h1>
        <p className="text-sm text-muted-foreground">
          Badges you earn from your grades and saved semesters. Save each semester to unlock more.
        </p>
      </header>

      {data.loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm">
                <span className="text-2xl font-bold tabular-nums">{earned.length}</span>
                <span className="text-muted-foreground"> of {statuses.length} badges earned</span>
              </p>
              {earned.length > 0 && (
                <Button variant="outline" size="sm" className="max-md:h-10" onClick={shareCard}>
                  <Share2Icon />
                  Share my card
                </Button>
              )}
            </div>
            <div aria-hidden className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
            </div>
          </div>
          {latestYear && (
            <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4">
              <SparklesIcon aria-hidden className="size-6 shrink-0 text-primary" />
              <p className="min-w-0 flex-1 text-sm">
                <strong>Your GWA Wrapped</strong>
                <span className="text-muted-foreground"> · S.Y. {shortYear(latestYear)} in six slides, ready to share.</span>
              </p>
              <Button size="sm" className="shrink-0 max-md:h-10" onClick={wrapped.openWrapped}>
                Open
              </Button>
            </div>
          )}
          <BadgeSection title="Earned" statuses={earned} />
          <BadgeSection title="Still to earn" statuses={statuses.filter((s) => !s.earned)} />
        </>
      )}

      {share.used && (
        <ShareStudio
          open={share.open}
          onOpenChange={share.setOpen}
          preset={share.preset}
          subjects={data.subjects}
          semesters={data.semesters}
        />
      )}
      {wrapped.used && <WrappedViewer open={wrapped.open} onOpenChange={wrapped.setOpen} semesters={data.semesters} />}
      <MergeDialog conflict={data.pendingMerge} onResolve={data.resolveMerge} />
    </AppShell>
  );
}
