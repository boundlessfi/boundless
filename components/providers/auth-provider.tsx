'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import React, { useEffect, useState } from 'react';
import { reportError } from '@/lib/error-reporting';
import AuthLoadingState from '../auth/AuthLoadingState';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isAuthenticated, accessToken, refreshUser, clearAuth } =
    useAuthStore();

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
      return;
    }

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    const timeout = setTimeout(() => {
      setIsHydrated(true);
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const initializeAuth = async () => {
      try {
        // Only refresh if we have a token but no user data
        if (accessToken && !isAuthenticated) {
          try {
            await refreshUser();
          } catch (err) {
            reportError(err, { context: 'auth-refreshUser' });
            clearAuth();
          }
        }
      } catch (err) {
        reportError(err, { context: 'auth-initializeAuth' });
        clearAuth();
      }
    };

    initializeAuth();
  }, [isHydrated, accessToken, isAuthenticated, refreshUser, clearAuth]);

  if (!isHydrated) {
    return <AuthLoadingState message='Initializing...' />;
  }

  return <>{children}</>;
}

export function useAuthHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  return isHydrated;
}

export function AuthLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isHydrated = useAuthHydration();
  const { isLoading } = useAuthStore();

  if (!isHydrated || isLoading) {
    return <AuthLoadingState message='Loading...' />;
  }

  return <>{children}</>;
}
