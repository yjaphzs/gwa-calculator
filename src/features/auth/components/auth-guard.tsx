'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { LoadingScreen } from '@/components/layout/loading-screen';
import { withRedirect } from '@/features/auth/lib/redirect';

/**
 * Wraps auth-only routes (/account, /leaderboard).
 * - Shows a loader while auth state resolves.
 * - Redirects to /login (with ?redirect=) when signed out. The query string
 *   comes along, so an invite link (/leaderboard/?join=…) survives sign-in.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(withRedirect('/login', pathname + window.location.search));
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <LoadingScreen message="Loading your account…" />;
  }

  // Redirect pending — don't flash protected content.
  if (!user) return null;

  return <>{children}</>;
}
