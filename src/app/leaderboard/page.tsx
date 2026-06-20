"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MedalIcon, TrophyIcon, UserIcon, UsersIcon } from "lucide-react";

import { useAuth } from "@/context/auth-provider";
import { getSchoolById, type School } from "@/config/schools";
import {
  fetchLeaderboard,
  fetchSemesterLeaderboard,
  subscribeLeaderboardSettings,
} from "@/lib/firebase/firestore";
import { refreshLeaderboardStanding } from "@/lib/firebase/callable";
import type { LeaderboardEntry, LeaderboardSemesterEntry } from "@/types";
import { SchoolCombobox } from "@/components/smart/school-combobox";
import { LeaderboardIntroDialog } from "@/components/smart/leaderboard-intro-dialog";
import Paginator from "@/components/smart/paginator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAGE_SIZE = 10;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

/** A paginated ranked list shared by the overall and per-term boards. */
function RankedList({
  entries,
  ownHandle,
}: {
  entries: LeaderboardEntry[];
  ownHandle: string | null;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(entries.length / PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [entries]);

  const pageEntries = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <ItemGroup className="gap-3">
        {pageEntries.map((entry, i) => {
          const rank = (page - 1) * PAGE_SIZE + i + 1;
          const isOwn = !!ownHandle && entry.handle === ownHandle;
          const name = entry.isAnonymous
            ? entry.handle
            : (entry.displayName ?? entry.handle);
          return (
            <Item
              key={entry.handle}
              variant="outline"
              className={isOwn ? "border-primary bg-primary/5" : undefined}
            >
              <div className="w-7 shrink-0 text-center font-mono text-sm font-medium text-muted-foreground">
                {rank}
              </div>
              <ItemMedia>
                <Avatar>
                  {!entry.isAnonymous && entry.photoURL && (
                    <AvatarImage src={entry.photoURL} alt="" />
                  )}
                  <AvatarFallback className="text-xs">
                    {entry.isAnonymous ? (
                      <UserIcon className="size-4" />
                    ) : (
                      initials(name)
                    )}
                  </AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="flex items-center gap-2">
                  <span className="truncate">{name}</span>
                  {isOwn && (
                    <Badge variant="default" className="text-[10px]">
                      You
                    </Badge>
                  )}
                </ItemTitle>
                <ItemDescription className="truncate">
                  {entry.program ?? entry.schoolName}
                </ItemDescription>
              </ItemContent>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-mono text-xl font-bold">
                  {entry.gwa.toFixed(3)}
                </span>
                {entry.honor && (
                  <Badge variant="secondary" className="gap-1">
                    <MedalIcon className="size-3 text-primary" />
                    <span className="hidden sm:inline">{entry.honor}</span>
                  </Badge>
                )}
              </div>
            </Item>
          );
        })}
      </ItemGroup>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {entries.length} student{entries.length === 1 ? "" : "s"}
          </span>
          <Paginator
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showPreviousNext
          />
        </div>
      )}
    </>
  );
}

function LoadError() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UsersIcon />
        </EmptyMedia>
        <EmptyTitle>Couldn&apos;t load the leaderboard</EmptyTitle>
        <EmptyDescription>
          Something went wrong fetching the rankings. Please try again later.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

/** Overall (cumulative) board for a school. */
function OverallBoard({
  schoolId,
  ownHandle,
  version,
}: {
  schoolId: string;
  ownHandle: string | null;
  version: number;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState(false);
  const schoolName = getSchoolById(schoolId)?.name ?? "this school";

  useEffect(() => {
    let active = true;
    setEntries(null);
    setError(false);
    fetchLeaderboard(schoolId, 100)
      .then((rows) => {
        if (active) setEntries(rows);
      })
      .catch(() => {
        if (active) {
          setError(true);
          setEntries([]);
        }
      });
    return () => {
      active = false;
    };
  }, [schoolId, version]);

  if (entries === null) return <LoadingRows />;
  if (error) return <LoadError />;
  if (entries.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrophyIcon />
          </EmptyMedia>
          <EmptyTitle>No one&apos;s here yet</EmptyTitle>
          <EmptyDescription>
            No one from {schoolName} has joined the overall board yet. Be the
            first — opt in from your Account page.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return <RankedList entries={entries} ownHandle={ownHandle} />;
}

/** Per-term board for a school, with a term selector. */
function SemesterBoard({
  schoolId,
  ownHandle,
  version,
}: {
  schoolId: string;
  ownHandle: string | null;
  version: number;
}) {
  const [entries, setEntries] = useState<LeaderboardSemesterEntry[] | null>(
    null,
  );
  const [error, setError] = useState(false);
  const [term, setTerm] = useState<string | null>(null);
  const schoolName = getSchoolById(schoolId)?.name ?? "this school";

  useEffect(() => {
    let active = true;
    setEntries(null);
    setError(false);
    fetchSemesterLeaderboard(schoolId)
      .then((rows) => {
        if (active) setEntries(rows);
      })
      .catch(() => {
        if (active) {
          setError(true);
          setEntries([]);
        }
      });
    return () => {
      active = false;
    };
  }, [schoolId, version]);

  // Distinct terms present, most recent first.
  const terms = useMemo(() => {
    if (!entries) return [];
    const map = new Map<string, string>();
    for (const e of entries) if (!map.has(e.termKey)) map.set(e.termKey, e.termLabel);
    return [...map.entries()]
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [entries]);

  // Default to the most recent term once data loads / changes.
  useEffect(() => {
    if (terms.length === 0) {
      setTerm(null);
    } else if (!term || !terms.some((t) => t.key === term)) {
      setTerm(terms[0].key);
    }
  }, [terms, term]);

  if (entries === null) return <LoadingRows />;
  if (error) return <LoadError />;
  if (entries.length === 0 || terms.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrophyIcon />
          </EmptyMedia>
          <EmptyTitle>No semesters yet</EmptyTitle>
          <EmptyDescription>
            No one from {schoolName} has a semester on the board yet. Join from
            your Account page — each saved semester (12+ units) gets ranked here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const rows = entries.filter((e) => e.termKey === term);

  return (
    <div className="flex flex-col gap-4">
      <Select value={term ?? undefined} onValueChange={setTerm}>
        <SelectTrigger className="w-full sm:w-72">
          <SelectValue placeholder="Select a term" />
        </SelectTrigger>
        <SelectContent>
          {terms.map((t) => (
            <SelectItem key={t.key} value={t.key}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <RankedList entries={rows} ownHandle={ownHandle} />
    </div>
  );
}

export default function LeaderboardPage() {
  const { user, profile } = useAuth();

  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [ownHandle, setOwnHandle] = useState<string | null>(null);
  const [optedIn, setOptedIn] = useState(false);
  const [version, setVersion] = useState(0);
  const refreshedRef = useRef(false);

  // Default the filter to the signed-in user's own school (once).
  useEffect(() => {
    if (profile?.schoolId) setSchoolId((prev) => prev ?? profile.schoolId ?? null);
  }, [profile?.schoolId]);

  // Know our own handle + opt-in state (to highlight our row + refresh on visit).
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return;
    return subscribeLeaderboardSettings(uid, (s) => {
      setOwnHandle(s?.handle ?? null);
      setOptedIn(s?.optIn ?? false);
    });
  }, [uid]);

  // Refresh our own standing once when we open the page, so the boards reflect
  // any grade edits made since we last published, then trigger a refetch.
  const bumpVersion = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!optedIn || refreshedRef.current) return;
    refreshedRef.current = true;
    refreshLeaderboardStanding()
      .then(bumpVersion)
      .catch(() => {
        /* not critical — boards still show the last published values */
      });
  }, [optedIn, bumpVersion]);

  return (
    <div className="flex flex-col gap-4">
      <LeaderboardIntroDialog />
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <TrophyIcon className="size-6 text-primary" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">
          GWA rankings by school, for students who opted in. Lower is better —
          1.00 leads. Join or leave anytime from your{" "}
          <Link href="/account" className="underline underline-offset-2">
            Account
          </Link>{" "}
          page.
        </p>
      </div>

      <SchoolCombobox
        value={schoolId}
        onChange={(s: School | null) => {
          if (s) setSchoolId(s.id);
        }}
        placeholder="Pick a school to view its boards…"
      />

      {!schoolId ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>Pick a school</EmptyTitle>
            <EmptyDescription>
              Choose a school above to see its boards. Set your own school on the
              Account page to default here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Tabs defaultValue="overall" className="mt-1">
          <TabsList>
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="semester">Per semester</TabsTrigger>
          </TabsList>
          <TabsContent value="overall" className="mt-4">
            <OverallBoard
              schoolId={schoolId}
              ownHandle={ownHandle}
              version={version}
            />
          </TabsContent>
          <TabsContent value="semester" className="mt-4">
            <SemesterBoard
              schoolId={schoolId}
              ownHandle={ownHandle}
              version={version}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
