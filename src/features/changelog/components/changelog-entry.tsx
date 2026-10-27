import type { ChangelogEntry as Entry, ChangeType } from "@/config/changelog";
import { cn } from "@/lib/utils";

// Render order + styling for the change-type groups. One soft dot + label per
// group keeps the list calm instead of a colored pill on every single line.
const TYPE_ORDER: ChangeType[] = ["new", "improved", "fixed"];

// The dot carries the color (status tokens in globals.css); labels stay in
// text ink so they keep their contrast.
const TYPE_META: Record<ChangeType, { label: string; dot: string }> = {
  new: { label: "New", dot: "bg-status-new" },
  improved: { label: "Improved", dot: "bg-status-improved" },
  fixed: { label: "Fixed", dot: "bg-status-fixed" },
};

/** One release in the "What's new" list: version chip, title, date, grouped changes. */
export function ChangelogEntry({ entry }: { entry: Entry }) {
  const groups = TYPE_ORDER.map((type) => ({
    type,
    items: entry.changes.filter((c) => c.type === type).map((c) => c.text),
  })).filter((g) => g.items.length > 0);

  return (
    <section className="py-6">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
          v{entry.version}
        </span>
        {entry.title && <h3 className="text-sm font-semibold text-foreground">{entry.title}</h3>}
        <span className="ml-auto text-xs text-muted-foreground">{entry.date}</span>
      </div>

      <div className="space-y-3.5">
        {groups.map((group) => {
          const meta = TYPE_META[group.type];
          return (
            <div key={group.type} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className={cn("size-1.5 rounded-full", meta.dot)} />
                <span className="text-xs font-semibold text-foreground">
                  {meta.label}
                </span>
              </div>
              <ul className="space-y-1.5 pl-3.5 text-sm leading-relaxed text-muted-foreground">
                {group.items.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
