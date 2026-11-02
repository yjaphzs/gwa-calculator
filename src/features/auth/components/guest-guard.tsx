'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { LoadingScreen } from '@/components/layout/loading-screen';
import { safeRedirect } from '@/features/auth/lib/redirect';

/**
 * Wraps guest-only routes (/login, /register, /forgot-password).
 * Auth pages render immediately; once auth resolves and a user is signed in,
 * redirect to the original `?redirect=` destination (same-site paths only) or home.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const params = new URLSearchParams(window.location.search);
      router.replace(safeRedirect(params.get('redirect')));
    }
  }, [user, loading, router]);

  if (!loading && user) {
    return <LoadingScreen message="Taking you in…" />;
  }

  return <>{children}</>;
}
