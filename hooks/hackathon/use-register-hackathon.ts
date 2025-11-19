'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  registerForHackathon,
  checkRegistrationStatus,
  type RegisterForHackathonRequest,
  type Participant,
} from '@/lib/api/hackathons';
import { useAuthStatus } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface UseRegisterHackathonOptions {
  hackathonSlugOrId: string;
  organizationId?: string;
  autoCheck?: boolean;
}

export function useRegisterHackathon({
  hackathonSlugOrId,
  organizationId,
  autoCheck = true,
}: UseRegisterHackathonOptions) {
  const { isAuthenticated } = useAuthStatus();
  const [isRegistered, setIsRegistered] = useState(false);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!isAuthenticated || !hackathonSlugOrId) {
      setIsRegistered(false);
      setParticipant(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await checkRegistrationStatus(
        hackathonSlugOrId,
        organizationId
      );

      if (response.success && response.data) {
        setIsRegistered(true);
        setParticipant(response.data);
      } else {
        setIsRegistered(false);
        setParticipant(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to check registration status';
      setError(errorMessage);
      setIsRegistered(false);
      setParticipant(null);
    } finally {
      setIsChecking(false);
    }
  }, [hackathonSlugOrId, organizationId, isAuthenticated]);

  const register = useCallback(
    async (data: RegisterForHackathonRequest) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to register for hackathons');
        throw new Error('Authentication required');
      }

      if (!hackathonSlugOrId) {
        toast.error('Hackathon ID is required');
        throw new Error('Hackathon ID is required');
      }

      setIsRegistering(true);
      setError(null);

      try {
        const response = await registerForHackathon(
          hackathonSlugOrId,
          data,
          organizationId
        );

        if (response.success && response.data) {
          setIsRegistered(true);
          setParticipant(response.data);
          toast.success('Successfully registered for hackathon!');
          return response.data;
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to register for hackathon';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsRegistering(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated]
  );

  // Auto-check registration status on mount and when dependencies change
  useEffect(() => {
    if (autoCheck && isAuthenticated && hackathonSlugOrId) {
      checkStatus();
    } else if (!isAuthenticated) {
      setIsRegistered(false);
      setParticipant(null);
    }
  }, [autoCheck, isAuthenticated, hackathonSlugOrId, checkStatus]);

  return {
    isRegistered,
    participant,
    isRegistering,
    isChecking,
    error,
    register,
    checkStatus,
    hasSubmitted: participant?.submission?.status === 'submitted',
  };
}
