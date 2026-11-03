"use client";

import { useState } from "react";
import { toast } from "sonner";

import { getEarnedCount } from "@/features/achievements/lib/badge-seen";
import {
  createBarkada,
  joinBarkada,
  leaveBarkada,
  manageBarkada,
  updateBarkadaMember,
  type BarkadaAction,
} from "@/lib/firebase/callable";
import { getCallableErrorMessage } from "@/lib/firebase/errors";
import { buzz } from "@/lib/haptics";
import type { BarkadaGoal, GwaShown } from "@/types";

export interface EntryInput {
  nickname: string;
  gwaShown: GwaShown;
}

export interface NewBarkada extends EntryInput {
  name: string;
  schoolYear: string;
  semester: string;
  goal: BarkadaGoal;
}

/**
 * The barkada Cloud Functions, with a busy flag and toasts. Each action
 * resolves to its result, or null when it failed (the toast says why).
 */
export function useBarkadaActions() {
  const [busy, setBusy] = useState(false);

  async function run<T>(work: () => Promise<{ data: T }>, success?: string): Promise<T | null> {
    setBusy(true);
    try {
      const { data } = await work();
      if (success) toast.success(success);
      return data;
    } catch (err) {
      toast.error(getCallableErrorMessage(err));
      return null;
    } finally {
      setBusy(false);
    }
  }

  return {
    busy,
    create: async (input: NewBarkada) => {
      const result = await run(() => createBarkada({ ...input, badges: getEarnedCount() }), "Barkada started! Invite your friends.");
      if (result) buzz("save");
      return result;
    },
    join: async (code: string, entry: EntryInput) => {
      const result = await run(() => joinBarkada({ code, ...entry, badges: getEarnedCount() }), "You're in! Tara, laban!");
      if (result) buzz("save");
      return result;
    },
    updateMe: (groupId: string, entry: Partial<EntryInput>) =>
      run(() => updateBarkadaMember({ groupId, ...entry }), "Saved"),
    leave: (groupId: string) => run(() => leaveBarkada({ groupId }), "You left the barkada"),
    manage: (groupId: string, action: BarkadaAction, success?: string) =>
      run(() => manageBarkada({ groupId, ...action }), success),
  };
}

export type BarkadaActions = ReturnType<typeof useBarkadaActions>;
