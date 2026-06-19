/**
 * Route definitions shared by guards and navigation.
 *
 * Note: the calculator at `/` is PUBLIC — login is optional. The only guarded
 * routes are the auth pages (guest-only) and `/account` (auth-only).
 */

/** Guest-only routes — redirect to the app if already signed in. */
export const GUEST_ROUTES = ["/login", "/register", "/forgot-password"] as const;

/** Where to send a signed-in user who lands on a guest route (after login,
 * unless a `?redirect=` target was set). The calculator is the home view. */
export const DEFAULT_PRIVATE_ROUTE = "/" as const;

/** Where to send a signed-out user who hits an auth-only route. */
export const DEFAULT_PUBLIC_ROUTE = "/login" as const;
