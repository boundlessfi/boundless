import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useCallback } from 'react';
import { authClient } from '@/lib/auth-client';
import { useAuthContext } from '@/components/providers/AuthProvider';

export function useAuth(requireAuth = true) {
  const { session, userProfile, profileLoading, refreshProfile } =
    useAuthContext();
  const {
    data: sessionData,
    isPending: sessionPending,
    error: sessionError,
  } = session;

  const router = useRouter();

  const user = useMemo(() => {
    if (sessionData && 'user' in sessionData && sessionData.user) {
      return {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name || null,
        image: sessionData.user.image || null,
        role: 'USER' as 'USER' | 'ADMIN',
        username: null,
        profile: userProfile,
      };
    }
    return null;
  }, [sessionData, userProfile]);

  const isAuthenticated = !!(
    sessionData &&
    'user' in sessionData &&
    sessionData.user
  );
  const isLoading = sessionPending || profileLoading;
  const error = sessionError?.message || null;

  // Redirect if required and unauthenticated
  useEffect(() => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      router.push('/auth?mode=signin');
    }
  }, [requireAuth, isAuthenticated, isLoading, router]);

  const refreshUser = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);

  const clearAuth = useCallback(async () => {
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
  const { session, userProfile, profileLoading } = useAuthContext();
  const { data: sessionData, isPending: sessionPending } = session;

  const user = useMemo(() => {
    if (sessionData && 'user' in sessionData && sessionData.user) {
      return {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name || null,
        image: sessionData.user.image || null,
        role: 'USER' as 'USER' | 'ADMIN',
        username: null,
        profile: userProfile,
      };
    }
    return null;
  }, [sessionData, userProfile]);

  return {
    isAuthenticated: !!(
      sessionData &&
      'user' in sessionData &&
      sessionData.user
    ),
    isLoading: sessionPending || profileLoading,
    user,
  };
}

export function useAuthActions() {
  const router = useRouter();

  const logout = useCallback(async () => {
    await authClient.signOut();
    router.push('/');
  }, [router]);

  return {
    logout,
  };
}

export function useRequireAuthEnhanced(redirectTo = '/auth?mode=signin') {
  const router = useRouter();
  const { session } = useAuthContext();
  const { data: sessionData, isPending, error } = session;

  useEffect(() => {
    if (!isPending && !sessionData) {
      router.push(redirectTo);
    }
  }, [sessionData, isPending, router, redirectTo]);

  return {
    session: sessionData,
    isPending,
    error,
    isAuthenticated: !!sessionData,
  };
}

// Keep invalidation API for backward compat — now triggers context refresh
export { useAuthContext } from '@/components/providers/AuthProvider';
