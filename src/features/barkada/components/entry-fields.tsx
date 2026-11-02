"use client";

import { CheckIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionChips } from "@/features/share/components/option-chips";
import type { GwaShown } from "@/types";

const GWA_OPTIONS: { value: GwaShown; label: string; hint: string }[] = [
  { value: "hidden", label: "Hidden", hint: "Your barkada sees only your honor band." },
  { value: "masked", label: "1.**", hint: "Your barkada sees the whole number only, like 1.**." },
  { value: "exact", label: "Exact", hint: "Your barkada sees your full GWA for the term." },
];

/** Hidden by default; the member chooses how much of their GWA the group sees. */
export function GwaShownField({ value, onChange }: { value: GwaShown; onChange: (value: GwaShown) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <OptionChips<GwaShown>
        label="Show my GWA"
        value={value}
        onChange={onChange}
        options={GWA_OPTIONS.map(({ value: v, label }) => ({ value: v, label }))}
      />
      <p className="text-xs text-muted-foreground">{GWA_OPTIONS.find((o) => o.value === value)?.hint}</p>
    </div>
  );
}

export function NicknameField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="barkada-nickname">Your nickname in the barkada</Label>
      <Input
        id="barkada-nickname"
        value={value}
        maxLength={24}
        autoComplete="nickname"
        placeholder="e.g. Jan"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** What joining shares, in plain words, shown before anyone joins or starts a group. */
export function WhatTheySee() {
  const row = (shared: boolean, text: string) => (
    <li className="flex items-start gap-2">
      {shared ? (
        <CheckIcon className="mt-0.5 size-4 shrink-0 text-chart-line" />
      ) : (
        <XIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      )}
      <span>{text}</span>
    </li>
  );
  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
      <p className="mb-2 font-medium">What your barkada sees</p>
      <ul className="flex flex-col gap-1.5">
        {row(true, "Your nickname, your honor band for the term, and your badge count")}
        {row(true, "Your GWA, only if you choose to show it")}
        {row(false, "Never your subjects, grades, or email")}
      </ul>
    </div>
  );
}
