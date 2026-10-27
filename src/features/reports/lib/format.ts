// Formatting for the printable reports. Everything user-entered must pass
// through escapeHtml — the documents are raw HTML strings.

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatGrade(grade: number): string {
  return grade.toFixed(2);
}

/** Whole units as-is; decimal units (possible via import) to one place. */
export function formatUnits(units: number): string {
  return Number.isInteger(units) ? String(units) : units.toFixed(1);
}

export function formatGwa(gwa: number | null): string {
  return gwa === null ? "N/A" : gwa.toFixed(3);
}

/** e.g. "October 28, 2026" in the viewer's locale. */
export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/** "https://gwa-calculator.yjaphzs.xyz/" → "gwa-calculator.yjaphzs.xyz" */
export function displayHost(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}
