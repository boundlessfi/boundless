'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { authClient } from '@/lib/auth-client';
import { getMe } from '@/lib/api/auth';
import { GetMeResponse } from '@/lib/api/types';

type SessionData = ReturnType<typeof authClient.useSession>;

interface AuthContextValue {
  /** Raw session from Better Auth (data, isPending, error, refetch) */
  session: SessionData;
  /** Full user profile from /users/me */
  userProfile: GetMeResponse | null;
  /** Whether the profile is still loading */
  profileLoading: boolean;
  /** Re-fetch profile from /users/me */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession();
  const [userProfile, setUserProfile] = useState<GetMeResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Use a stable dependency — only refetch when user id changes
  const userId = session.data?.user?.id;

  useEffect(() => {
    if (!userId) {
      setUserProfile(null);
      return;
    }

    let cancelled = false;
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const profile = await getMe();
        if (!cancelled) setUserProfile(profile);
      } catch {
        // ignore — profile fetch failure is non-fatal
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getMe();
      setUserProfile(profile);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      userProfile,
      profileLoading,
      refreshProfile,
    }),
    [session, userProfile, profileLoading, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
