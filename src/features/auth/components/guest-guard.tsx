'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { LoadingScreen } from '@/components/loading-screen';
import { DEFAULT_PRIVATE_ROUTE } from '@/config/routes';

/**
 * Wraps guest-only routes (/login, /register, /forgot-password).
 * Auth pages render immediately; once auth resolves and a user is signed in,
 * redirect to the original `?redirect=` destination or the account page.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      router.replace(redirect ?? DEFAULT_PRIVATE_ROUTE);
    }
  }, [user, loading, router]);

  if (!loading && user) {
    return <LoadingScreen message="Taking you in…" />;
  }

  return <>{children}</>;
}
