'use client';

import { useEffect, useRef } from 'react';
import { useAuthStatus } from '@/hooks/use-auth';
import { authClient } from '@/lib/auth-client';

export function GoogleOneTap() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Don't trigger if user is authenticated or still loading
    if (isAuthenticated || isLoading) {
      return;
    }

    // Only trigger once per component mount
    if (hasTriggeredRef.current) {
      return;
    }

    // Small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      hasTriggeredRef.current = true;

      // Call One Tap to show the popup
      authClient
        .oneTap({
          callbackURL: window.location.href,
          fetchOptions: {
            onSuccess: () => {
              // On success, reload the page to reflect auth state
              // Better Auth will handle the redirect via callbackURL
              window.location.reload();
            },
            onError: () => {
              // Silently handle errors - user may have dismissed the prompt
            },
          },
          onPromptNotification: () => {
            // Called when max attempts are reached
            // User has dismissed/skipped the prompt multiple times
            // You could show an alternative sign-in button here if needed
          },
        })
        .catch(() => {
          // Silently handle errors in calling oneTap
        });
    }, 1000); // 1 second delay for better UX

    return () => {
      clearTimeout(timer);
    };
  }, [isAuthenticated, isLoading]);

  // This component doesn't render anything visible
  // Google One Tap handles its own UI in the top-right corner
  return null;
}
