import {
  ArchiveIcon,
  AwardIcon,
  CrownIcon,
  FlagIcon,
  FlameIcon,
  FootprintsIcon,
  GraduationCapIcon,
  LayersIcon,
  MedalIcon,
  MountainIcon,
  RocketIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";

import { ACADEMIC_HONOR_BANDS } from "@/lib/academic";

export type BadgeId =
  | "first-steps"
  | "semester-one"
  | "full-load"
  | "survivor"
  | "on-the-list"
  | "top-band"
  | "scholar-streak"
  | "comeback"
  | "glow-up"
  | "uno"
  | "uno-collector"
  | "clean-sheet"
  | "steady"
  | "halfway"
  | "home-stretch"
  | "latin-track";

export interface Badge {
  id: BadgeId;
  name: string;
  /** How to earn it, shown on locked badges. */
  hint: string;
  icon: LucideIcon;
}

/** Every badge, in the order the page lists them. The rules are in lib/evaluate-badges.ts. */
export const BADGES: Badge[] = [
  { id: "first-steps", name: "First Steps", hint: "Add your first subject.", icon: FootprintsIcon },
  { id: "semester-one", name: "Semester One", hint: "Save your first semester.", icon: ArchiveIcon },
  { id: "uno", name: "Uno!", hint: "Get a 1.00 in a subject.", icon: StarIcon },
  { id: "on-the-list", name: "On the List", hint: "Earn a semester honor.", icon: MedalIcon },
  { id: "full-load", name: "Full Load", hint: "Save a semester with 21 or more counted units.", icon: LayersIcon },
  { id: "clean-sheet", name: "Clean Sheet", hint: "Pass every subject in a semester of 12 or more units.", icon: ShieldCheckIcon },
  { id: "comeback", name: "Comeback", hint: "Beat the term before by 0.25 or more.", icon: RocketIcon },
  { id: "top-band", name: "Top Band", hint: `Earn ${ACADEMIC_HONOR_BANDS[0].name} in a semester.`, icon: CrownIcon },
  { id: "survivor", name: "Survivor", hint: "Save a semester with 24 or more counted units.", icon: FlameIcon },
  { id: "uno-collector", name: "Uno Collector", hint: "Get a 1.00 in five subjects.", icon: SparklesIcon },
  { id: "steady", name: "Steady", hint: "Save 4 semesters.", icon: MountainIcon },
  { id: "scholar-streak", name: "Scholar Streak", hint: "Earn honors 3 semesters in a row.", icon: ZapIcon },
  { id: "glow-up", name: "Glow Up", hint: "Beat the term before, 3 terms in a row.", icon: TrendingUpIcon },
  { id: "halfway", name: "Halfway There", hint: "Reach 60 units across your semesters.", icon: FlagIcon },
  { id: "latin-track", name: "Latin Track", hint: "Reach a Latin honor with your overall GWA.", icon: AwardIcon },
  { id: "home-stretch", name: "Home Stretch", hint: "Reach 120 units across your semesters.", icon: GraduationCapIcon },
];
