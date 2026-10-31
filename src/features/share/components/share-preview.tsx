"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { FORMAT_SIZE, type ShareFormat } from "@/features/share/lib/share-options";

interface SharePreviewProps {
  format: ShareFormat;
  /** Tallest the preview may be, in CSS pixels (keeps the controls in view on phones). */
  maxHeight: number;
  children: ReactNode;
}

/**
 * Shows the full-size template scaled to fit. Only this wrapper is scaled, so
 * the template element itself stays at image size for the export.
 */
export function SharePreview({ format, maxHeight, children }: SharePreviewProps) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const size = FORMAT_SIZE[format];

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = width ? Math.min(width / size.width, maxHeight / size.height) : 0;

  return (
    <div ref={box} className="flex w-full justify-center">
      <div
        className="relative overflow-hidden rounded-xl shadow-lg ring-1 ring-border"
        style={{ width: size.width * scale, height: size.height * scale }}
        aria-label="Preview of the image"
        role="img"
      >
        <div style={{ position: "absolute", top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
