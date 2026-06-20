/** A normalized academic term derived from free-text school year + semester. */
export interface NormalizedTerm {
  /** Stable, sortable key (e.g. "2024-1") used as the per-term board id. */
  key: string;
  /** Tidy display label (e.g. "AY 2024–2025 · 1st Sem"). */
  label: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Best-effort normalization of a free-text school year + semester into a stable
 * key and a clean label, so per-term leaderboards group reliably across users
 * who spell the same term differently ("2024-2025" vs "2024-25"). Falls back to
 * a slug of the raw text when it can't be confidently parsed.
 */
export function normalizeTerm(
  schoolYear: string,
  semester: string,
): NormalizedTerm {
  const yearMatch = (schoolYear || "").match(/\d{4}/);
  const startYear = yearMatch ? parseInt(yearMatch[0], 10) : null;

  const s = (semester || "").toLowerCase();
  let ord = 0;
  let ordLabel = "";
  if (/summer|mid[\s-]?year/.test(s)) {
    ord = 3;
    ordLabel = "Midyear";
  } else if (/(^|\D)(2(nd)?|second)(\D|$)|\bii\b/.test(s)) {
    ord = 2;
    ordLabel = "2nd Sem";
  } else if (/(^|\D)(3(rd)?|third)(\D|$)|\biii\b/.test(s)) {
    ord = 3;
    ordLabel = "3rd Term";
  } else if (/(^|\D)(1(st)?|first)(\D|$)|\bi\b/.test(s)) {
    ord = 1;
    ordLabel = "1st Sem";
  }

  if (startYear && ord) {
    return {
      key: `${startYear}-${ord}`,
      label: `AY ${startYear}–${startYear + 1} · ${ordLabel}`,
    };
  }

  // Couldn't parse confidently — group by the raw text instead.
  const raw = `${schoolYear} ${semester}`.trim();
  return {
    key: slugify(`${schoolYear}_${semester}`) || "unspecified",
    label: raw || "Unspecified term",
  };
}
