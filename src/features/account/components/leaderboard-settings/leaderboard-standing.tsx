"use client";

import { useState } from "react";
import { RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { refreshLeaderboardStanding } from "@/lib/firebase/callable";
import { getCallableErrorMessage } from "@/lib/firebase/errors";

/** How the user currently appears on the board, plus a manual refresh. */
export function LeaderboardStanding({ appearsAs }: { appearsAs: string }) {
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshLeaderboardStanding();
      toast.success("Your standing has been updated.");
    } catch (err) {
      toast.error(getCallableErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        You appear on the board as
        <Badge variant="secondary">{appearsAs}</Badge>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={handleRefresh}
        disabled={refreshing}
      >
        {refreshing ? <Spinner data-icon="inline-start" /> : <RefreshCwIcon />}
        Update my standing
      </Button>
    </div>
  );
}
