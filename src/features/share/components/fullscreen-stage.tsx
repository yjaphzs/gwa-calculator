"use client";

import { useRef, type ReactNode } from "react";
import { XIcon } from "lucide-react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SharePreview } from "@/features/share/components/share-preview";
import { FORMAT_SIZE, type ShareFormat } from "@/features/share/lib/share-options";
import { useSwipe } from "@/hooks/use-swipe";
import { useViewportSize } from "@/hooks/use-viewport-size";

interface FullscreenStageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** For screen readers. */
  title: string;
  description: string;
  format: ShareFormat;
  /** Laid over the image's top edge, left of the close button (progress bars, the mood). */
  top: ReactNode;
  /** One row of actions under the image. */
  bottom: ReactNode;
  /** Swipe left or right (and the arrow keys) step by one. */
  onStep: (delta: number) => void;
  /** Story-style taps: the left third goes back, the rest goes forward. */
  tapZones?: boolean;
  stepLabels: [previous: string, next: string];
  closeLabel: string;
  /** The image at full size. */
  children: ReactNode;
}

const GUTTER = 8;
// The bottom row: 44px buttons with padding, plus room for the phone's home indicator.
const BAR = 80;
const PHONE = 640;

/**
 * An image as big as the screen allows, Instagram Stories style: edge to edge
 * on phones with the controls on the image's top edge and the actions in one
 * row within thumb reach; a centered card on bigger screens.
 */
export function FullscreenStage(props: FullscreenStageProps) {
  const { open, onOpenChange, title, description, format, top, bottom, onStep, tapZones, stepLabels, closeLabel, children } = props;
  const stage = useRef<HTMLDivElement>(null);
  const viewport = useViewportSize();
  const size = FORMAT_SIZE[format];
  const phone = viewport.width < PHONE;
  const maxWidth = phone ? viewport.width - 2 * GUTTER : 620;
  const maxHeight = Math.max(240, phone ? viewport.height - BAR - 2 * GUTTER : Math.min(viewport.height * 0.85, 1000) - BAR);
  const width = Math.floor(Math.min(maxWidth, (maxHeight * size.width) / size.height));

  const swipe = useSwipe((direction) => onStep(direction === "left" ? 1 : -1), {
    onTap: tapZones
      ? (e) => {
          const box = stage.current?.getBoundingClientRect();
          if (box) onStep(e.clientX - box.left < box.width / 3 ? -1 : 1);
        }
      : undefined,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="dark flex h-dvh w-screen max-w-none flex-col items-center gap-0 rounded-none border-0 bg-neutral-950 p-0 text-white sm:h-auto sm:w-auto sm:max-w-none sm:rounded-2xl sm:p-4"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") onStep(1);
          if (e.key === "ArrowLeft") onStep(-1);
        }}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <div className="flex min-h-0 w-full flex-1 items-center justify-center pt-[env(safe-area-inset-top)]" style={{ padding: GUTTER }}>
          <div
            ref={stage}
            data-stage
            className="relative cursor-grab select-none active:cursor-grabbing"
            style={{ width, ...swipe.style }}
            onPointerDown={swipe.onPointerDown}
            onPointerUp={swipe.onPointerUp}
            onPointerCancel={swipe.onPointerCancel}
          >
            <SharePreview format={format} maxHeight={maxHeight}>
              {children}
            </SharePreview>
            <div className="pointer-events-none absolute inset-x-0 top-0 rounded-t-xl bg-gradient-to-b from-black/60 via-black/25 to-transparent px-3 pt-2.5 pb-10">
              <div className="pointer-events-auto flex items-center gap-2">
                <div className="min-w-0 flex-1">{top}</div>
                <DialogClose
                  className="-mr-1.5 flex size-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                  aria-label={closeLabel}
                >
                  <XIcon className="size-6" />
                </DialogClose>
              </div>
            </div>
            {/* Taps and swipes are for pointers; these are for screen readers and keyboards. */}
            <button type="button" className="sr-only" onClick={() => onStep(-1)}>
              {stepLabels[0]}
            </button>
            <button type="button" className="sr-only" onClick={() => onStep(1)}>
              {stepLabels[1]}
            </button>
          </div>
        </div>
        <div data-stage-bar className="w-full shrink-0 px-3 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]" style={{ maxWidth: width + 2 * GUTTER }}>
          {bottom}
        </div>
      </DialogContent>
    </Dialog>
  );
}
