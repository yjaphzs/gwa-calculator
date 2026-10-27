import { escapeHtml } from "@/features/reports/lib/format";
import { REPORT_STYLES } from "@/features/reports/lib/styles";

interface RenderOptions {
  /** Also the browser's default file name when saving as PDF. */
  title: string;
  body: string;
  footer: string;
}

/** A complete, self-contained HTML document: inline styles, no external requests. */
export function renderDocument({ title, body, footer }: RenderOptions): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${REPORT_STYLES}</style>
  </head>
  <body>
    <div class="doc">
      <table class="frame" role="presentation">
        <tbody><tr><td>${body}</td></tr></tbody>
        <tfoot><tr><td><div class="frame-foot-space"></div></td></tr></tfoot>
      </table>
      ${footer}
    </div>
  </body>
</html>`;
}
