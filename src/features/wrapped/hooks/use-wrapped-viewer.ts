"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { toast } from "sonner";

import { APP_NAME, APP_URL } from "@/config/app";
import { renderShareImage } from "@/features/share/lib/render-image";
import { shareImage } from "@/features/share/lib/share-targets";
import { downloadBlob } from "@/features/transfer/lib/file-io";
import { buildWrapped, shortYear, wrappedYears } from "@/features/wrapped/lib/wrapped";
import type { Semester } from "@/types";

export const SLIDE_COUNT = 6;

interface Input {
  open: boolean;
  semesters: Semester[];
  /** The slide element at full size, captured as the image. */
  slideRef: RefObject<HTMLDivElement | null>;
}

/** Wrapped's state: which school year and slide, the GWA privacy switch, and Share/Download of the slide shown. */
export function useWrappedViewer({ open, semesters, slideRef }: Input) {
  const years = useMemo(() => wrappedYears(semesters), [semesters]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [exact, setExact] = useState(true);
  const [busy, setBusy] = useState<"share" | "download" | null>(null);
  const year = chosen && years.includes(chosen) ? chosen : (years[0] ?? "");
  const wrapped = useMemo(() => (year ? buildWrapped(semesters, year) : null), [semesters, year]);

  // Each opening starts from the first slide of the latest year.
  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setChosen(null);
  }, [open]);

  const go = (step: number) => setIndex((i) => Math.min(SLIDE_COUNT - 1, Math.max(0, i + step)));
  const pickYear = (next: string) => {
    setChosen(next);
    setIndex(0);
  };

  const fileName = `gwa-wrapped-${year}-${index + 1}.png`;
  const text = `My S.Y. ${shortYear(year)} GWA Wrapped ✨\n\nMake yours with ${APP_NAME}: ${APP_URL}\n\n#GWAWrapped #GWACalculator`;

  const withImage = async (kind: "share" | "download", consume: (blob: Blob) => Promise<void> | void) => {
    if (!slideRef.current) return;
    setBusy(kind);
    try {
      await consume(await renderShareImage(slideRef.current, "story"));
    } catch (err) {
      console.error("[wrapped] image failed:", err);
      toast.error("Couldn't create the image. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const share = () =>
    withImage("share", async (blob) => {
      if ((await shareImage(blob, fileName, text)) !== "unsupported") return;
      downloadBlob(blob, fileName);
      toast.success("Image downloaded", { description: "This browser can't share images directly. Post it from your downloads." });
    });
  const download = () => withImage("download", (blob) => downloadBlob(blob, fileName));

  return { years, year, pickYear, wrapped, index, setIndex, go, exact, setExact, busy, share, download };
}

export type WrappedViewerState = ReturnType<typeof useWrappedViewer>;
