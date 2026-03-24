'use client';

import { ReactNode } from 'react';
import { useOnboardingGuard } from '@/hooks/use-onboarding-guard';

/**
 * Silently checks onboarding status and redirects if needed.
 * Does NOT block rendering — the redirect happens async so
 * there's no flash of loading state for completed users.
 */
export function OnboardingGuardProvider({ children }: { children: ReactNode }) {
  useOnboardingGuard();
  return <>{children}</>;
}
