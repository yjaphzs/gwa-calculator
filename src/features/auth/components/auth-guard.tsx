'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { LoadingScreen } from '@/components/loading-screen';

/**
 * Wraps auth-only routes (/account).
 * - Shows a loader while auth state resolves.
 * - Redirects to /login (with ?redirect=) when signed out.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <LoadingScreen message="Loading your account…" />;
  }

  // Redirect pending — don't flash protected content.
  if (!user) return null;

  return <>{children}</>;
}
