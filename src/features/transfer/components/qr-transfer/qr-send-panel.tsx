"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { encodeTransferFrames } from "@/features/transfer/lib/qr-frames";
import type { CalculatorState } from "@/types";

/** Shows the data as one QR code, or a pager of codes for larger payloads. */
export function QrSendPanel({ state }: { state: CalculatorState }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const { frames, compressedLength } = useMemo(() => encodeTransferFrames(state), [state]);
  const total = frames.length;
  const multi = total > 1;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-lg bg-white p-4">
        <QRCodeSVG value={frames[frameIndex] ?? frames[0]} size={256} level={multi ? "L" : "M"} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">{state.subjects.length} subjects</Badge>
        <Badge variant="outline">{state.semesters.length} semesters</Badge>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Compressed: {compressedLength.toLocaleString()} chars
        {multi && ` • ${total} QR codes`}
      </p>
      {multi && (
        <>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous QR code"
              disabled={frameIndex === 0}
              onClick={() => setFrameIndex((i) => i - 1)}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="text-sm font-medium tabular-nums">
              {frameIndex + 1} / {total}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next QR code"
              disabled={frameIndex === total - 1}
              onClick={() => setFrameIndex((i) => i + 1)}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Show each QR code one at a time for the receiving device to scan.
          </p>
        </>
      )}
    </div>
  );
}
