'use client';

import { useCallback } from 'react';
import { useOptionalAuth } from '@/hooks/use-auth';
import { useAuthModal } from '@/components/auth/AuthModalProvider';

interface RequireAuthOptions {
  redirectTo?: string;
}

export const useRequireAuthForAction = () => {
  const { isAuthenticated, isLoading } = useOptionalAuth();
  const { openAuthModal } = useAuthModal();

  const withAuth = useCallback(
    <Args extends unknown[]>(
      action: (...args: Args) => void | Promise<void>,
      options?: RequireAuthOptions
    ) => {
      return async (...args: Args) => {
        if (isLoading) return;

        if (!isAuthenticated) {
          const redirectTo =
            options?.redirectTo ??
            (typeof window !== 'undefined'
              ? `${window.location.pathname}${window.location.search}`
              : undefined);

          openAuthModal({ redirectTo });
          return;
        }

        await action(...args);
      };
    },
    [isAuthenticated, isLoading, openAuthModal]
  );

  return {
    withAuth,
    isAuthenticated,
    isLoading,
  };
};
