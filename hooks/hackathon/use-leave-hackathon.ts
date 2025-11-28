'use client';

import { useState, useCallback } from 'react';
import { leaveHackathon } from '@/lib/api/hackathons';
import { useAuthStatus } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface UseLeaveHackathonOptions {
  hackathonSlugOrId: string;
  organizationId?: string;
}

export function useLeaveHackathon({
  hackathonSlugOrId,
  organizationId,
}: UseLeaveHackathonOptions) {
  const { isAuthenticated } = useAuthStatus();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leave = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to leave hackathons');
      throw new Error('Authentication required');
    }

    if (!hackathonSlugOrId) {
      toast.error('Hackathon ID is required');
      throw new Error('Hackathon ID is required');
    }

    setIsLeaving(true);
    setError(null);

    try {
      const response = await leaveHackathon(hackathonSlugOrId, organizationId);

      if (response.success) {
        toast.success('Successfully left the hackathon');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to leave hackathon');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to leave hackathon';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLeaving(false);
    }
  }, [hackathonSlugOrId, organizationId, isAuthenticated]);

  return {
    isLeaving,
    error,
    leave,
  };
}
