import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { getMe } from '@/lib/api/auth';
import { GetMeResponse } from '@/lib/api/types';

export function useAuth(requireAuth = true) {
  const {
    data: session,
    isPending: sessionPending,
    error: sessionError,
  } = authClient.useSession();

  const router = useRouter();
  const [userProfile, setUserProfile] = useState<GetMeResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const user = useMemo(() => {
    if (session && 'user' in session && session.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
        role: 'USER' as 'USER' | 'ADMIN',
        username: null,
        profile: userProfile,
      };
    }
    return null;
  }, [session, userProfile]);

  const isAuthenticated = !!(session && 'user' in session && session.user);
  const isLoading = sessionPending || profileLoading;
  const error = sessionError?.message || null;

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (
        session &&
        'user' in session &&
        session.user &&
        !userProfile &&
        !profileLoading
      ) {
        try {
          setProfileLoading(true);
          const profile = await getMe();
          setUserProfile(profile);
        } catch {
          // ignore error
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();
  }, [session, userProfile, profileLoading]);

  // Redirect if required and unauthenticated
  useEffect(() => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      router.push('/auth?mode=signin');
    }
  }, [requireAuth, isAuthenticated, isLoading, router]);

  // refreshUser does not need useless try/catch
  const refreshUser = useCallback(async () => {
    const profile = await getMe();
    setUserProfile(profile);
  }, []);

  // clearAuth — same fix
  const clearAuth = useCallback(async () => {
    setUserProfile(null);
    await authClient.signOut();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    refreshUser,
    clearAuth,
  };
}

export function useRequireAuth() {
  return useAuth(true);
}

export function useOptionalAuth() {
  return useAuth(false);
}

export function useAuthStatus() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [userProfile, setUserProfile] = useState<GetMeResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const user = useMemo(() => {
    if (session && 'user' in session && session.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
        role: 'USER' as 'USER' | 'ADMIN',
        username: null,
        profile: userProfile,
      };
    }
    return null;
  }, [session, userProfile]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (
        session &&
        'user' in session &&
        session.user &&
        !userProfile &&
        !profileLoading
      ) {
        try {
          setProfileLoading(true);
          const profile = await getMe();
          setUserProfile(profile);
        } catch {
          // ignore
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();
  }, [session, userProfile]);

  return {
    isAuthenticated: !!(session && 'user' in session && session.user),
    isLoading: sessionPending || profileLoading,
    user,
  };
}

export function useAuthActions() {
  const router = useRouter();

  // remove useless catch
  const logout = useCallback(async () => {
    await authClient.signOut();
    router.push('/');
  }, []);

  return {
    logout,
  };
}

export function useRequireAuthEnhanced(redirectTo = '/auth?mode=signin') {
  const router = useRouter();
  const { data: session, isPending, error, refetch } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push(redirectTo);
    }
  }, [session, isPending, router, redirectTo]);

  return {
    session,
    isPending,
    error,
    refetch,
    isAuthenticated: !!session,
  };
}
