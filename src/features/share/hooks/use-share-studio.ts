"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { toast } from "sonner";

import { APP_NAME, APP_URL } from "@/config/app";
import { useAuth } from "@/context/auth-provider";
import { brightAccent } from "@/features/appearance/lib/favicon";
import { useScheme } from "@/features/appearance/lib/scheme-store";
import { evaluateBadges } from "@/features/achievements/lib/evaluate-badges";
import { OWN_CAPTION_MAX, captionPool, wrapIndex } from "@/features/share/lib/captions";
import { availableMoods, moodById, variantsFor } from "@/features/share/lib/moods";
import { renderShareImage } from "@/features/share/lib/render-image";
import { buildShareContent } from "@/features/share/lib/share-content";
import { defaultOptions, type ShareOptions, type ShareShow } from "@/features/share/lib/share-options";
import { shareImage } from "@/features/share/lib/share-targets";
import { steppedMood, surpriseOptions } from "@/features/share/lib/surprise";
import { buildShareText, imageFileName } from "@/features/share/lib/share-text";
import { downloadBlob } from "@/features/transfer/lib/file-io";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { buzz } from "@/lib/haptics";
import type { Semester, Subject } from "@/types";

const OWN_CAPTION_KEY = "gwa_share_caption";

interface ShareStudioInput {
  open: boolean;
  /** Starting choices (scope, mood) from wherever Share was pressed. */
  preset: Partial<ShareOptions>;
  subjects: Subject[];
  semesters: Semester[];
  /** The full-size template element that gets captured as the image. */
  templateRef: RefObject<HTMLDivElement | null>;
}

/** Everything the share studio shows and does: options, the image's content, and Share/Download/Copy. */
export function useShareStudio({ open, preset, subjects, semesters, templateRef }: ShareStudioInput) {
  const { profile } = useAuth();
  const scheme = useScheme();
  const [options, setOptions] = useState(() => defaultOptions(preset));
  const [busy, setBusy] = useState<"share" | "download" | null>(null);
  const [savedCaption, setSavedCaption] = useLocalStorage(OWN_CAPTION_KEY, "");
  // Seasonal moods join the list during their season.
  const [moods] = useState(() => availableMoods(new Date()));
  const presetRef = useRef(preset);
  useEffect(() => {
    presetRef.current = preset;
  }, [preset]);

  // Start fresh from the preset each time the studio opens.
  useEffect(() => {
    if (open) setOptions(defaultOptions(presetRef.current));
  }, [open]);

  const content = useMemo(() => buildShareContent(options.scope, subjects, semesters), [options.scope, subjects, semesters]);
  const mood = moodById(options.mood);
  const variants = variantsFor(mood, brightAccent(scheme));
  const variant = variants[Math.min(options.variant, variants.length - 1)];
  const pool = content ? captionPool(options.mood, options.language, content.result) : [];
  const captionNumber = pool.length ? wrapIndex(options.captionIndex, pool.length) + 1 : 0;
  // The user's own caption wins once they've typed something.
  const caption = options.ownCaption?.trim() || (pool.length ? pool[captionNumber - 1] : "");
  const text = content
    ? buildShareText(content, { appName: APP_NAME, appUrl: APP_URL, caption, showHonor: options.show.honor, exact: options.show.exact })
    : "";
  const fileName = content ? imageFileName(content, options.mood, options.style) : "gwa-calculator.png";
  // The trading card's moves: the three hardest badges earned (they're listed easiest first).
  const badges = useMemo(
    () => evaluateBadges(subjects, semesters).filter((s) => s.earned).map((s) => s.badge).slice(-3).reverse(),
    [subjects, semesters],
  );

  const update = (patch: Partial<ShareOptions>) => setOptions((prev) => ({ ...prev, ...patch }));
  const toggle = (key: keyof ShareShow) => setOptions((prev) => ({ ...prev, show: { ...prev.show, [key]: !prev.show[key] } }));
  // A new mood starts on its first colors and caption, the same as tapping its chip.
  const chooseMood = (mood: ShareOptions["mood"]) => update({ mood, variant: 0, captionIndex: 0 });
  const stepMood = (delta: number) => chooseMood(steppedMood(moods, options.mood, delta).id);
  const surprise = () => {
    update(surpriseOptions(options, moods));
    buzz("tap");
  };
  // The last caption the user wrote is kept on this device for next time.
  const startOwnCaption = () => update({ ownCaption: savedCaption });
  const writeOwnCaption = (value: string) => {
    // One flowing line on the image: Enter becomes a space.
    const next = value.replace(/\s*\n\s*/g, " ").slice(0, OWN_CAPTION_MAX);
    update({ ownCaption: next });
    setSavedCaption(next);
  };

  const withImage = async (kind: "share" | "download", consume: (blob: Blob) => Promise<void> | void) => {
    if (!templateRef.current) return;
    setBusy(kind);
    try {
      await consume(await renderShareImage(templateRef.current, options.format));
    } catch (err) {
      console.error("[share] image failed:", err);
      toast.error("Couldn't create the image. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const share = () =>
    withImage("share", async (blob) => {
      const outcome = await shareImage(blob, fileName, text);
      if (outcome !== "unsupported") return;
      downloadBlob(blob, fileName);
      toast.success("Image downloaded", { description: "This browser can't share images directly. Post it from your downloads." });
    });

  const download = () => withImage("download", (blob) => downloadBlob(blob, fileName));

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Caption copied");
    } catch {
      toast.error("Couldn't copy the caption.");
    }
  };

  return {
    options,
    update,
    toggle,
    moods,
    chooseMood,
    stepMood,
    surprise,
    content,
    mood,
    variants,
    variant,
    caption,
    captionNumber,
    badges,
    captionCount: pool.length,
    startOwnCaption,
    writeOwnCaption,
    text,
    identity: { name: profile?.displayName ?? null, school: profile?.schoolName ?? null },
    busy,
    share,
    download,
    copyCaption,
  };
}

export type ShareStudio = ReturnType<typeof useShareStudio>;
