"use client";

import { OptionChips } from "@/features/share/components/option-chips";
import type { ShareStudio } from "@/features/share/hooks/use-share-studio";
import type { ShareFormat, ShareStyle } from "@/features/share/lib/share-options";

const STYLES: { value: ShareStyle; emoji: string; label: string }[] = [
  { value: "classic", emoji: "🖼️", label: "Classic" },
  { value: "receipt", emoji: "🧾", label: "Receipt" },
  { value: "card", emoji: "🃏", label: "Trading card" },
  { value: "pass", emoji: "🎫", label: "Boarding pass" },
];

/** The studio's Look tab: the image's format and style. */
export function LookTab({ studio }: { studio: ShareStudio }) {
  const { options, update } = studio;

  return (
    <div className="flex flex-col gap-5">
      <OptionChips<ShareFormat>
        label="Format"
        value={options.format}
        onChange={(format) => update({ format })}
        options={[
          { value: "post", label: "Post (4:5)" },
          { value: "story", label: "Story (9:16)" },
        ]}
      />
      <OptionChips<ShareStyle>
        label="Style"
        value={options.style}
        onChange={(style) => update({ style })}
        options={STYLES.map(({ value, emoji, label }) => ({
          value,
          label: (
            <>
              <span aria-hidden>{emoji}</span>
              {label}
            </>
          ),
        }))}
      />
    </div>
  );
}
