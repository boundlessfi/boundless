'use client';

import { useState, useCallback, useEffect } from 'react';
import { registerForHackathon, type Participant } from '@/lib/api/hackathons';
import { useAuthStatus } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface UseRegisterHackathonOptions {
  hackathon?: {
    id: string;
    slug: string;
    isParticipant: boolean;
  } | null;
  hackathonSlugOrId?: string;
  organizationId?: string;
  autoCheck?: boolean; // Kept for backward compatibility
}

export function useRegisterHackathon({
  hackathon,
  hackathonSlugOrId,
  organizationId,
  autoCheck = true,
}: UseRegisterHackathonOptions) {
  const { isAuthenticated } = useAuthStatus();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedInitially, setHasCheckedInitially] = useState(false);

  // Get registration status: prefer hackathon.isParticipant, fallback to manual checking
  const isRegistered = hackathon?.isParticipant ?? false;
  const hackathonId = hackathon?.id || hackathonSlugOrId;

  const checkStatus = useCallback(async () => {
    // Skip manual checking if we have hackathon.isParticipant
    if (hackathon || !isAuthenticated || !hackathonId) {
      if (!hackathon) {
        setHasCheckedInitially(true);
      }
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      // const response = await checkRegistrationStatus(
      //   hackathonId,
      //   organizationId
      // );

      // Note: This manual checking is now fallback only
      // The preferred way is to use hackathon.isParticipant from the API response
      setHasCheckedInitially(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to check registration status';
      setError(errorMessage);
      setHasCheckedInitially(true);
    } finally {
      setIsChecking(false);
    }
  }, [hackathonId, organizationId, isAuthenticated, hackathon]);

  const register = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to register for hackathons');
      throw new Error('Authentication required');
    }

    if (!hackathon?.id) {
      toast.error('Hackathon ID is required');
      throw new Error('Hackathon ID is required');
    }

    setIsRegistering(true);
    setError(null);

    try {
      const response = await registerForHackathon(hackathon.id, organizationId);

      if (response.success && response.data) {
        // Update participant data after successful registration
        setParticipant(response.data);
        toast.success('Successfully registered for hackathon!');
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to register for hackathon';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsRegistering(false);
    }
  }, [hackathon?.id, organizationId, isAuthenticated]);

  // Auto-check registration status on mount when we don't have hackathon.isParticipant
  useEffect(() => {
    if (!hackathon && autoCheck && isAuthenticated && hackathonId) {
      checkStatus();
    } else if (!hackathon && !isAuthenticated) {
      setHasCheckedInitially(true);
    }
  }, [autoCheck, isAuthenticated, hackathonId, checkStatus, hackathon]);

  return {
    isRegistered,
    participant,
    isRegistering,
    isChecking,
    error,
    register,
    checkStatus,
    hasCheckedInitially,
    // Expose setters for immediate updates
    setParticipant,
    hasSubmitted: participant?.submission?.status === 'submitted',
  };
}
