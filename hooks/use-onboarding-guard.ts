'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { getOnboardingStatus } from '@/lib/api/onboarding';

/**
 * Redirects authenticated users based on onboarding status:
 * - Not completed + on app pages → redirect to /onboarding
 * - Already completed + on /onboarding → redirect to /
 * Skips checks for auth pages and public routes.
 */
const PUBLIC_PATHS = ['/auth', '/terms', '/privacy'];

export function useOnboardingGuard() {
  const { session: authSession } = useAuthContext();
  const { data: session, isPending } = authSession;
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      setChecked(true);
      return;
    }

    // Don't check on public paths
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
      setChecked(true);
      return;
    }

    let cancelled = false;

    getOnboardingStatus()
      .then(status => {
        if (cancelled) return;

        if (status.completed && pathname.startsWith('/onboarding')) {
          // Already completed — don't let them redo onboarding
          router.replace('/');
        } else if (!status.completed && !pathname.startsWith('/onboarding')) {
          // Not completed — force them to onboarding
          router.replace('/onboarding');
        }

        if (!cancelled) setChecked(true);
      })
      .catch(() => {
        // If the API fails, don't block the user
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user, isPending, pathname, router]);

  return { isReady: checked };
}
