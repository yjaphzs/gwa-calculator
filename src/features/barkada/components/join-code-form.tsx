"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseInviteCode } from "@/features/barkada/lib/invite";

/** "Have a code?": paste an invite link or type the 8-character code. */
export function JoinCodeForm({ onJoin }: { onJoin: (code: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  return (
    <form
      className="flex flex-col gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        const code = parseInviteCode(value);
        setError(!code);
        if (code) {
          onJoin(code);
          setValue("");
        }
      }}
    >
      <label htmlFor="barkada-code" className="text-sm font-medium">
        Have a code?
      </label>
      <div className="flex gap-2">
        <Input
          id="barkada-code"
          value={value}
          placeholder="K7P2-QX9M or an invite link"
          autoComplete="off"
          aria-invalid={error}
          aria-describedby={error ? "barkada-code-error" : undefined}
          className="max-md:h-10"
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
        />
        <Button type="submit" variant="outline" className="max-md:h-10" disabled={!value.trim()}>
          Join
        </Button>
      </div>
      {error && (
        <p id="barkada-code-error" className="text-xs text-destructive">
          That code doesn&apos;t look right. It has 8 letters and numbers, like K7P2-QX9M.
        </p>
      )}
    </form>
  );
}
