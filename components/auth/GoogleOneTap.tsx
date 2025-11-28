'use client';

import { useEffect, useRef } from 'react';
import { useAuthStatus } from '@/hooks/use-auth';
import { authClient } from '@/lib/auth-client';

export function GoogleOneTap() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated || isLoading) {
      return;
    }

    if (hasTriggeredRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      hasTriggeredRef.current = true;

      authClient
        .oneTap({
          callbackURL: window.location.href,
          fetchOptions: {
            onSuccess: () => {
              window.location.reload();
            },
            onError: () => {},
          },
          onPromptNotification: () => {},
        })
        .catch(() => {});
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [isAuthenticated, isLoading]);

  return null;
}
