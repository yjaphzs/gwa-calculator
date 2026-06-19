'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { onAuthChange, type User } from '@/lib/firebase/auth';
import {
  ensureUserProfile,
  userProfileRef,
} from '@/lib/firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import type { UserProfile } from '@/types';

interface AuthContextValue {
  /** The Firebase Auth user, or null when signed out. */
  user: User | null;
  /** Live profile document from `users/{uid}`, or null. */
  profile: UserProfile | null;
  /** True while the initial auth state is being resolved. */
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const unsubProfileRef = useRef<(() => void) | null>(null);

  function subscribeToProfile(uid: string) {
    return onSnapshot(
      userProfileRef(uid),
      (snap) => {
        setProfile(snap.exists() ? ({ uid, ...snap.data() } as UserProfile) : null);
      },
      (err) => console.error('[AuthProvider] profile snapshot error:', err),
    );
  }

  useEffect(() => {
    const unsubAuth = onAuthChange(async (firebaseUser) => {
      setLoading(true);

      // Tear down the previous user's profile subscription.
      unsubProfileRef.current?.();
      unsubProfileRef.current = null;

      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Make sure the profile doc exists (covers first Google sign-in and
          // any account created before this code shipped). Idempotent.
          await ensureUserProfile(firebaseUser);
        } catch (err) {
          console.error('[AuthProvider] ensureUserProfile failed:', err);
        }
        unsubProfileRef.current = subscribeToProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubProfileRef.current?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Access auth state in Client Components: `{ user, profile, loading }`. */
export function useAuth() {
  return useContext(AuthContext);
}
