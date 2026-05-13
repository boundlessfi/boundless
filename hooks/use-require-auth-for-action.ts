'use client';

import { useCallback } from 'react';
import { useOptionalAuth } from '@/hooks/use-auth';
import { useAuthModal } from '@/components/auth/AuthModalProvider';

interface RequireAuthOptions {
  redirectTo?: string;
  /**
   * Run after the user successfully authenticates via the modal, INSTEAD
   * of the modal's default hard redirect to `redirectTo`. The modal closes
   * automatically after this fires. Use this when you'd rather keep the
   * current page interactive (e.g. open a different route in a new tab)
   * than reload onto `redirectTo`.
   *
   * `redirectTo` is still passed through as the underlying callbackUrl so
   * provider-redirect flows (Google sign-in) land somewhere sensible.
   */
  onAuthSuccess?: () => void | Promise<void>;
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

          openAuthModal({
            redirectTo,
            onAuthSuccess: options?.onAuthSuccess,
          });
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
