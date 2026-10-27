import { FONT_MONO, FONT_SANS, PRINT } from "@/features/reports/lib/theme";

/** Reset, page frame, and the running footer that repeats on every printed page. */
export const BASE_STYLES = `
* { box-sizing: border-box; }
html, body { margin: 0; background: ${PRINT.white}; }
body {
  font-family: ${FONT_SANS};
  color: ${PRINT.ink};
  font-size: 10pt;
  line-height: 1.45;
  padding: 24px;
}
.doc { max-width: 760px; margin: 0 auto; }
.mono, .num { font-family: ${FONT_MONO}; font-variant-numeric: tabular-nums; }
.muted { color: ${PRINT.muted}; }

/* The whole document sits in one table so its <tfoot> spacer repeats on every
   printed page, reserving room for the fixed running footer below it. */
.frame { width: 100%; border-collapse: collapse; }
.frame > tbody > tr > td, .frame > tfoot > tr > td { padding: 0; border: 0; }
.frame-foot-space { height: 13mm; }

.running-footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  padding-top: 6px;
  border-top: 1px solid ${PRINT.hairline};
  font-size: 7.5pt;
  color: ${PRINT.muted};
}
.running-footer strong { color: ${PRINT.inkSoft}; font-weight: 600; margin-right: 6px; }

@media screen {
  .frame-foot-space { display: none; }
}
`;
