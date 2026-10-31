"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { toast } from "sonner";

import { APP_NAME, APP_URL } from "@/config/app";
import { useAuth } from "@/context/auth-provider";
import { brightAccent } from "@/features/appearance/lib/favicon";
import { useScheme } from "@/features/appearance/lib/scheme-store";
import { captionFor } from "@/features/share/lib/captions";
import { moodById, variantsFor } from "@/features/share/lib/moods";
import { renderShareImage } from "@/features/share/lib/render-image";
import { buildShareContent } from "@/features/share/lib/share-content";
import { defaultOptions, type ShareOptions, type ShareShow } from "@/features/share/lib/share-options";
import { shareImage } from "@/features/share/lib/share-targets";
import { buildShareText, imageFileName } from "@/features/share/lib/share-text";
import { downloadBlob } from "@/features/transfer/lib/file-io";
import type { Semester, Subject } from "@/types";

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
  const caption = content ? captionFor(options.mood, options.language, content.result, options.captionIndex) : "";
  const text = content
    ? buildShareText(content, { appName: APP_NAME, appUrl: APP_URL, caption, showHonor: options.show.honor })
    : "";
  const fileName = content ? imageFileName(content, options.mood) : "gwa-calculator.png";

  const update = (patch: Partial<ShareOptions>) => setOptions((prev) => ({ ...prev, ...patch }));
  const toggle = (key: keyof ShareShow) => setOptions((prev) => ({ ...prev, show: { ...prev.show, [key]: !prev.show[key] } }));

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
    content,
    mood,
    variants,
    variant,
    caption,
    text,
    identity: { name: profile?.displayName ?? null, school: profile?.schoolName ?? null },
    busy,
    share,
    download,
    copyCaption,
  };
}

export type ShareStudio = ReturnType<typeof useShareStudio>;
