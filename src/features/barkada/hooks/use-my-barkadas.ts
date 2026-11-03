"use client";

import { useEffect, useState } from "react";

import { writeSentBadges } from "@/features/barkada/lib/barkada-local";
import { subscribeMyBarkadas } from "@/lib/firebase/firestore";
import type { BarkadaGroup } from "@/types";

interface MyBarkadas {
  groups: BarkadaGroup[];
  loading: boolean;
  error: boolean;
}

/** The user's barkadas, live, sorted by name. */
export function useMyBarkadas(uid: string | null): MyBarkadas {
  const [state, setState] = useState<MyBarkadas>({ groups: [], loading: true, error: false });

  useEffect(() => {
    if (!uid) return;
    return subscribeMyBarkadas(
      uid,
      (groups) => {
        setState({ groups: [...groups].sort((a, b) => a.name.localeCompare(b.name)), loading: false, error: false });
        // Tell the badge sync what the groups have for us (and that we're in some at all).
        const counts = new Set(groups.map((g) => g.members[uid]?.badges ?? 0));
        writeSentBadges(uid, groups.length === 0 ? null : counts.size === 1 ? [...counts][0] : -1);
      },
      () => setState((prev) => ({ ...prev, loading: false, error: true })),
    );
  }, [uid]);

  return state;
}
