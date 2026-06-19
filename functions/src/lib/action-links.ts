/**
 * Firebase's `generate*Link` returns a URL like
 *   https://<project>.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=ABC&apiKey=...&continueUrl=...
 * Rewrite it to point at our in-app handler, preserving mode + oobCode. The
 * client SDK uses its own apiKey (from initializeApp), so apiKey/lang aren't
 * needed. The trailing slash matches the static-export route (`/auth/action/`).
 */
export function buildInAppActionUrl(firebaseLink: string, appUrl: string): string {
  try {
    const url = new URL(firebaseLink);
    const mode = url.searchParams.get("mode");
    const oobCode = url.searchParams.get("oobCode");
    if (!mode || !oobCode) return firebaseLink;

    const base = appUrl.replace(/\/$/, "");
    const target = new URL(`${base}/auth/action/`);
    target.searchParams.set("mode", mode);
    target.searchParams.set("oobCode", oobCode);
    return target.toString();
  } catch {
    // Defensive fallback — return the original link so the user still has a path.
    return firebaseLink;
  }
}
