import type { ReactNode } from "react";

/** Centered title + subtitle at the top of every auth form. */
export function AuthFormHeader({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-balance text-muted-foreground">{children}</p>
    </div>
  );
}
