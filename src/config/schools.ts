import { SCHOOL_NAMES } from "@/config/school-names";
import type { SchoolType } from "@/types";

export interface School {
    /** Stable slug id — persisted on profiles and used as the leaderboard group key. */
    id: string;
    name: string;
    type: SchoolType;
}

/** Lowercase, strip diacritics/punctuation, and hyphenate into a stable slug. */
function slugify(name: string): string {
    return name
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** Universities say so in their name; everything else groups as a college. */
function inferType(name: string): SchoolType {
    return /\buniversit(y|ies)\b|\buniversidad\b/i.test(name)
        ? "university"
        : "college";
}

/**
 * The curated schools, plus an "Other (not listed)" catch-all, de-duplicated by
 * slug and sorted by display name.
 */
export const SCHOOLS: readonly School[] = (() => {
    const seen = new Set<string>();
    const list: School[] = [];
    for (const name of SCHOOL_NAMES) {
        const id = slugify(name);
        if (seen.has(id)) continue;
        seen.add(id);
        list.push({ id, name, type: inferType(name) });
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    list.push({ id: "other", name: "Other (not listed)", type: "college" });
    return list;
})();

/** Look up a curated school by id. Returns undefined for unknown ids. */
export function getSchoolById(id: string | null | undefined): School | undefined {
    if (!id) return undefined;
    return SCHOOLS.find((s) => s.id === id);
}
