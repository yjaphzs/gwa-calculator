import type { ReactNode } from "react";

/** A titled guide section; the id doubles as an anchor for deep links. */
export function GuideSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-20">
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}
