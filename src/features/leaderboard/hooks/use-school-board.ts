"use client";

import { useEffect, useState } from "react";

import { ensureLeaderboardBoard } from "@/lib/firebase/callable";
import { subscribeLeaderboardBoard } from "@/lib/firebase/firestore";
import type { LeaderboardBoard } from "@/types";

const EMPTY: LeaderboardBoard = { schoolId: "", overall: [], terms: [] };

// One build request per school per session, shared by every board on the page
// (both tabs mount this hook for the same school).
const builds = new Map<string, Promise<unknown>>();

function buildOnce(schoolId: string): Promise<unknown> {
  let pending = builds.get(schoolId);
  if (!pending) {
    pending = ensureLeaderboardBoard({ schoolId });
    // Allow a retry on a later visit if this attempt fails.
    pending.catch(() => builds.delete(schoolId));
    builds.set(schoolId, pending);
  }
  return pending;
}

/**
 * Live precomputed board for one school (1 Firestore read per view). `board` is
 * null while loading; on error it becomes an empty board with `error` set. A
 * missing board is built server-side, and the snapshot then delivers it.
 */
export function useSchoolBoard(schoolId: string) {
  const [board, setBoard] = useState<LeaderboardBoard | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fail = () => {
      if (!active) return;
      setError(true);
      setBoard(EMPTY);
    };
    setBoard(null);
    setError(false);
    const unsubscribe = subscribeLeaderboardBoard(
      schoolId,
      (next) => {
        if (next) setBoard(next);
        else buildOnce(schoolId).catch(fail);
      },
      fail,
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [schoolId]);

  return { board, error };
}
