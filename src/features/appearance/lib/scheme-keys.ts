// Storage contract between scheme-store.ts and the inline pre-paint script
// (scheme-script.ts). Raw strings, not JSON, so the script stays tiny. Kept
// free of React so the server-rendered root layout can import it.
export const SCHEME_KEY = "gwa_scheme";
export const ACCENT_KEY = "gwa_scheme_accent";
export const SCHEME_CSS_KEY = "gwa_scheme_css";
export const SCHEME_STYLE_ID = "gwa-scheme";
