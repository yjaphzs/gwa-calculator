/** Two-letter avatar initials: first letters of the first two words, else the first two characters. */
export function initials(source: string): string {
  const text = source.trim();
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return text.slice(0, 2).toUpperCase();
}
