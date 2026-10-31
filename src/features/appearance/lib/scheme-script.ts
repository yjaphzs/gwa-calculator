import { SCHEME_CSS_KEY, SCHEME_KEY, SCHEME_STYLE_ID } from "@/features/appearance/lib/scheme-keys";

// Mirrors DEFAULT_SCHEME in schemes.ts (kept out to avoid pulling the color math into the layout).
const DEFAULT_SCHEME = "amber";

/**
 * Runs inline in <head>, before the first paint, so a saved color scheme never
 * flashes amber first. It only restores what scheme-store.ts saved: the
 * `data-scheme` attribute and the scheme's stylesheet. next-themes handles the
 * light/dark class the same way, with its own inline script.
 */
export const SCHEME_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(SCHEME_KEY)});if(!s||s===${JSON.stringify(
  DEFAULT_SCHEME,
)})return;var c=localStorage.getItem(${JSON.stringify(SCHEME_CSS_KEY)});if(!c)return;var e=document.createElement("style");e.id=${JSON.stringify(
  SCHEME_STYLE_ID,
)};e.textContent=c;document.head.appendChild(e);document.documentElement.setAttribute("data-scheme",s)}catch(e){}})();`;
