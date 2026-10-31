import type { ShareContent, ShareScope, ShareSubject } from "@/features/share/lib/share-content";
import type { MoodId } from "@/features/share/lib/moods";

export type ShareFormat = "post" | "story";

/** Instagram/Facebook feed portrait (4:5) and stories (9:16), in pixels. */
export const FORMAT_SIZE: Record<ShareFormat, { width: number; height: number }> = {
  post: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

export type SubjectFilter = "all" | "best3" | "best5" | "choose";
export type CaptionLanguage = "en" | "tl";

/** What appears on the image. Personal details and individual grades are opt-in. */
export interface ShareShow {
  /** The GWA's decimals; off shows only the whole number ("1.**"). */
  exact: boolean;
  honor: boolean;
  units: boolean;
  subjects: boolean;
  grades: boolean;
  /** Subject titles; off shows the codes instead. */
  titles: boolean;
  name: boolean;
  school: boolean;
  trend: boolean;
}

export interface ShareOptions {
  scope: ShareScope;
  format: ShareFormat;
  mood: MoodId;
  /** Index into the mood's color variants. */
  variant: number;
  language: CaptionLanguage;
  /** Which of the mood's captions (wraps around). */
  captionIndex: number;
  show: ShareShow;
  filter: SubjectFilter;
  /** Subject ids, for the "choose" filter. */
  chosen: string[];
  sort: "best" | "original";
}

export const DEFAULT_SHOW: ShareShow = {
  exact: true,
  honor: true,
  units: false,
  subjects: false,
  grades: true,
  titles: true,
  name: false,
  school: false,
  trend: true,
};

export function defaultOptions(preset: Partial<ShareOptions> = {}): ShareOptions {
  return {
    scope: { kind: "current" },
    format: "post",
    mood: "proud",
    variant: 0,
    language: "en",
    captionIndex: 0,
    filter: "all",
    chosen: [],
    sort: "best",
    ...preset,
    show: { ...DEFAULT_SHOW, ...preset.show },
  };
}

/** Counted subjects first, best grade (lowest number) first; more units break ties. */
function bestFirst(subjects: ShareSubject[]): ShareSubject[] {
  return [...subjects].sort((a, b) => Number(b.counted) - Number(a.counted) || a.grade - b.grade || b.units - a.units);
}

/**
 * The subjects for the image after filtering and sorting. How many of them
 * fit is up to the layout (share-layout.ts); the rest show as "+N more".
 */
export function chosenSubjects(content: ShareContent, options: ShareOptions): ShareSubject[] {
  if (!options.show.subjects) return [];
  let list = content.subjects;
  if (options.filter === "best3" || options.filter === "best5") {
    list = bestFirst(list.filter((s) => s.counted)).slice(0, options.filter === "best3" ? 3 : 5);
  } else if (options.filter === "choose") {
    const chosen = new Set(options.chosen);
    list = list.filter((s) => chosen.has(s.id));
  }
  return options.sort === "best" ? bestFirst(list) : list;
}
