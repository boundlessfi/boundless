'use client';

import { useMemo } from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';

export interface ProfileCompletenessResult {
  /** Whether the profile is fully complete */
  isComplete: boolean;
  /** Whether the check is still loading */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** List of missing profile fields */
  missingFields: string[];
}

export function useProfileCompleteness(): ProfileCompletenessResult {
  const { session, userProfile, profileLoading } = useAuthContext();
  const { data: sessionData, isPending: sessionPending } = session;

  const isAuthenticated = !!(
    sessionData &&
    'user' in sessionData &&
    sessionData.user
  );

  const isLoading = sessionPending || profileLoading;

  const { isComplete, missingFields } = useMemo(() => {
    if (!isAuthenticated || !userProfile) {
      return { isComplete: true, missingFields: [] as string[] };
    }

    const missing: string[] = [];
    const user = userProfile.user;

    if (!user?.image && !userProfile.image) {
      missing.push('profile photo');
    }

    const metadata = user?.metadata as
      | { profile?: { bio?: string; skills?: string[] } }
      | undefined;

    if (!metadata?.profile?.bio) {
      missing.push('bio');
    }

    if (!metadata?.profile?.skills || metadata.profile.skills.length === 0) {
      missing.push('skills');
    }

    return { isComplete: missing.length === 0, missingFields: missing };
  }, [isAuthenticated, userProfile]);

  return { isComplete, isLoading, isAuthenticated, missingFields };
}
