// When the seasonal moods (and the Wrapped banner) are around, on the
// Philippine calendar. Windows are inclusive and may run past New Year.
export type SeasonId = "pasko" | "valentines" | "recognition" | "spooky";

/** [month, day] pairs, months 1–12. */
const WINDOWS: Record<SeasonId, { from: [number, number]; to: [number, number] }> = {
  // The "ber months" through Three Kings.
  pasko: { from: [9, 1], to: [1, 6] },
  valentines: { from: [2, 1], to: [2, 14] },
  // Recognition Day and graduation season.
  recognition: { from: [3, 1], to: [6, 30] },
  // Halloween through Undas.
  spooky: { from: [10, 15], to: [11, 2] },
};

const key = ([month, day]: [number, number]) => month * 100 + day;

export function inSeason(season: SeasonId, date: Date): boolean {
  const today = (date.getMonth() + 1) * 100 + date.getDate();
  const from = key(WINDOWS[season].from);
  const to = key(WINDOWS[season].to);
  return from <= to ? today >= from && today <= to : today >= from || today <= to;
}
