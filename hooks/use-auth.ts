import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { getMe } from '@/lib/api/auth';
import { GetMeResponse } from '@/lib/api/types';

const AUTH_PROFILE_QUERY_KEY = ['auth', 'me'] as const;

function useAuthProfileQuery(sessionUserId: string | null | undefined) {
  return useQuery<GetMeResponse | null>({
    queryKey: [...AUTH_PROFILE_QUERY_KEY, sessionUserId ?? null],
    queryFn: getMe,
    enabled: !!sessionUserId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function invalidateAuthProfileCache() {
  // Kept for backward compatibility. Components that need to force a refetch
  // should call `useAuth().refreshUser()` (or invalidate via QueryClient directly).
  // We can't access QueryClient from a non-hook context here, so this is a no-op.
}

export function useAuth(requireAuth = true) {
  const {
    data: session,
    isPending: sessionPending,
    error: sessionError,
  } = authClient.useSession();

  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionUserId =
    session && 'user' in session ? (session.user?.id ?? null) : null;

  const { data: userProfile, isFetching: profileLoading } =
    useAuthProfileQuery(sessionUserId);

  const user = useMemo(() => {
    if (session && 'user' in session && session.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
        role: 'USER' as 'USER' | 'ADMIN',
        username: null,
        profile: userProfile ?? null,
      };
    }
    return null;
  }, [session, userProfile]);

  const isAuthenticated = !!(session && 'user' in session && session.user);
  const isLoading = sessionPending || profileLoading;
  const error = sessionError?.message || null;

  // Redirect if required and unauthenticated
  useEffect(() => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      router.push('/auth?mode=signin');
    }
  }, [requireAuth, isAuthenticated, isLoading, router]);

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: AUTH_PROFILE_QUERY_KEY });
  }, [queryClient]);

  const clearAuth = useCallback(async () => {
    queryClient.removeQueries({ queryKey: AUTH_PROFILE_QUERY_KEY });
    await authClient.signOut();
  }, [queryClient]);

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
  const sessionUserId =
    session && 'user' in session ? (session.user?.id ?? null) : null;

  const { data: userProfile, isFetching: profileLoading } =
    useAuthProfileQuery(sessionUserId);

  const user = useMemo(() => {
    if (session && 'user' in session && session.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
        role: 'USER' as 'USER' | 'ADMIN',
        username: null,
        profile: userProfile ?? null,
      };
    }
    return null;
  }, [session, userProfile]);

  return {
    isAuthenticated: !!(session && 'user' in session && session.user),
    isLoading: sessionPending || profileLoading,
    user,
  };
}

export function useAuthActions() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    queryClient.removeQueries({ queryKey: AUTH_PROFILE_QUERY_KEY });
    await authClient.signOut();
    router.push('/');
  }, [queryClient, router]);

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
