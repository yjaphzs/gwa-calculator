import { DEFAULT_PRIVATE_ROUTE } from "@/config/routes";

// Browsers drop tabs and newlines from URLs, so "/\t/evil.example" would turn into "//evil.example".
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/**
 * Where to go after signing in: the `?redirect=` path when it stays on this
 * site, otherwise the default. Rejects other sites ("//host", "/\host",
 * "https://…") so a crafted link can't send people elsewhere.
 */
export function safeRedirect(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return DEFAULT_PRIVATE_ROUTE;
  if (CONTROL_CHARS.test(value)) return DEFAULT_PRIVATE_ROUTE;
  return value;
}

/** `path` carrying a pending destination along, e.g. from the login page to register. */
export function withRedirect(path: string, redirect: string | null): string {
  return redirect ? `${path}?redirect=${encodeURIComponent(safeRedirect(redirect))}` : path;
}
