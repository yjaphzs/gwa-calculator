import { FONT_SANS, PRINT } from "@/features/reports/lib/theme";

/**
 * Print rules. No fixed paper size — the layout fits A4, Letter, and long bond.
 * Page numbers use @page margin boxes (Chromium 131+); defining one also stops
 * Chromium from printing its own about:blank header/footer. Browsers without
 * margin-box support simply omit the numbers.
 */
export const PRINT_STYLES = `
@page {
  margin: 12mm 13mm 12mm;
  @bottom-right {
    content: "Page " counter(page) " of " counter(pages);
    font-family: ${FONT_SANS};
    font-size: 7.5pt;
    color: ${PRINT.muted};
  }
}

@media print {
  /* Keep the band, tiles, zebra rows, and stripe even with "Background graphics" off. */
  html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { padding: 0; }
  .doc { max-width: none; }

  .running-footer { position: fixed; left: 0; right: 0; bottom: 0; margin: 0; background: ${PRINT.white}; }

  .band, .meta, .tiles, .panel, .chart, .disclaimer, .data-table tr { break-inside: avoid; }
  /* Start a semester on a fresh page when it would otherwise split; longer
     ones still break, with the header row repeated. */
  .term { break-inside: avoid; }
  .section-head { break-after: avoid; }
  .data-table thead { display: table-header-group; }
  /* Totals print once, at the end — not repeated under a partial page. */
  .data-table tfoot { display: table-row-group; }
}
`;
