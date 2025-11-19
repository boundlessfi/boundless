import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authClient } from '@/lib/auth-client';
import { refreshUserData } from '@/lib/api/auth';

// Enhanced auth hook that works with Zustand store and Better Auth
export function useAuth(requireAuth = true) {
  const {
    data: session,
    isPending: sessionPending,
    error: sessionError,
  } = authClient.useSession();
  const router = useRouter();

  // Get Zustand store state
  const {
    user,
    isAuthenticated,
    isLoading: storeLoading,
    error,
    refreshUser,
    clearAuth,
    syncWithSession,
  } = useAuthStore();

  // Sync with Better Auth session when available
  useEffect(() => {
    if (session && 'user' in session && session.user) {
      // Convert Better Auth session user to SessionUser format
      const sessionUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        username: undefined, // Better Auth doesn't include username by default
        role: 'USER', // Default role, can be extended if backend provides it
        accessToken: undefined, // Better Auth handles tokens via cookies
      };

      // Only sync if we don't already have user data in Zustand store
      if (!user || !isAuthenticated) {
        syncWithSession(sessionUser).catch(() => {
          // Silently handle sync failure
        });
      }
    }
  }, [session, syncWithSession, user, isAuthenticated]);

  // Memoize auth data to prevent unnecessary re-renders
  const shouldUseStore = useMemo(
    () => isAuthenticated || user,
    [isAuthenticated, user]
  );

  const authData = useMemo(() => {
    return shouldUseStore
      ? {
          user,
          isAuthenticated,
          isLoading: storeLoading,
          error,
          refreshUser,
          clearAuth,
        }
      : {
          user:
            session && 'user' in session && session.user
              ? {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.name || null,
                  image: session.user.image || null,
                  role: 'USER' as 'USER' | 'ADMIN', // Default role
                  username: null,
                }
              : null,
          isAuthenticated: !!(session && 'user' in session && session.user),
          isLoading: sessionPending,
          error: sessionError?.message || null,
          refreshUser: () => refreshUserData(),
          clearAuth: () => clearAuth(),
        };
  }, [
    shouldUseStore,
    session,
    user,
    isAuthenticated,
    storeLoading,
    error,
    refreshUser,
    clearAuth,
    sessionPending,
    sessionError,
  ]);

  useEffect(() => {
    if (requireAuth && !authData.isAuthenticated && !authData.isLoading) {
      router.push('/auth?mode=signin');
    }
  }, [requireAuth, authData.isAuthenticated, authData.isLoading, router]);

  // Auto-refresh user data on mount if authenticated
  useEffect(() => {
    if (shouldUseStore && isAuthenticated && !user) {
      refreshUser().catch(() => {});
    }
  }, [shouldUseStore, isAuthenticated, user, refreshUser]);

  return authData;
}

export function useRequireAuth() {
  return useAuth(true);
}

export function useOptionalAuth() {
  return useAuth(false);
}

// New hook for Zustand-only auth (when not using NextAuth)
export function useZustandAuth(requireAuth = true) {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    refreshUser,
    clearAuth,
    login,
    logout,
  } = useAuthStore();

  useEffect(() => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      router.push('/auth?mode=signin');
    }
  }, [requireAuth, isAuthenticated, isLoading, router]);

  // Auto-refresh user data on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshUser().catch(() => {});
    }
  }, [isAuthenticated, user, refreshUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    clearAuth,
  };
}

// Hook for checking auth status without redirecting
export function useAuthStatus() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { isAuthenticated, isLoading, user, syncWithSession } = useAuthStore();

  // Sync Better Auth session with Zustand store if needed
  useEffect(() => {
    if (
      session &&
      'user' in session &&
      session.user &&
      (!user || !isAuthenticated)
    ) {
      const sessionUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        username: undefined, // Better Auth doesn't include username by default
        role: 'USER', // Default role
        accessToken: undefined,
      };
      syncWithSession(sessionUser).catch(() => {
        // Silently handle sync failure
      });
    }
  }, [session, user, isAuthenticated, syncWithSession]);

  // Return Zustand store state (which should be synced with Better Auth)
  return {
    isAuthenticated,
    isLoading: isLoading || sessionPending,
    user,
  };
}

// Hook for auth actions
export function useAuthActions() {
  const { login, logout, refreshUser, clearAuth, setError } = useAuthStore();

  const unifiedLogout = useCallback(async () => {
    try {
      // Clear Better Auth session
      await authClient.signOut({
        fetchOptions: {
          onSuccess: async () => {
            // Clear Zustand store after Better Auth sign out
            try {
              await logout();
            } catch {
              clearAuth();
            }
            // Clear persisted storage using zustand's persist API
            if (typeof window !== 'undefined') {
              useAuthStore.persist.clearStorage();
            }
          },
          onError: () => {
            // Force clear local state even if API calls fail
            clearAuth();
            // Clear persisted storage using zustand's persist API
            if (typeof window !== 'undefined') {
              useAuthStore.persist.clearStorage();
            }
          },
        },
      });
    } catch {
      // Force clear local state even if API calls fail
      clearAuth();
      // Clear persisted storage using zustand's persist API
      if (typeof window !== 'undefined') {
        useAuthStore.persist.clearStorage();
      }
    }
  }, [logout, clearAuth]);

  return {
    login,
    logout: unifiedLogout,
    refreshUser,
    clearAuth,
    setError,
  };
}

// Hook for handling 401 errors
export function useAuthErrorHandler() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  const handleAuthError = (error: { status?: number; code?: string }) => {
    if (error?.status === 401 || error?.code === 'UNAUTHORIZED') {
      clearAuth();
      router.push('/auth?mode=signin');
      return true; // Error was handled
    }
    return false; // Error was not handled
  };

  return { handleAuthError };
}
