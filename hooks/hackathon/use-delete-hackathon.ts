'use client';

import { useState, useCallback } from 'react';
import { deleteHackathon } from '@/lib/api/hackathons';
import { deleteDraft } from '@/lib/api/hackathons/draft';
import { useAuthStatus } from '@/hooks/use-auth';
import { toast } from 'sonner';

type DeleteType = 'draft' | 'hackathon';

interface UseDeleteHackathonOptions {
  organizationId: string;
  hackathonId: string;
  type: DeleteType;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  suppressToast?: boolean;
}

export function useDeleteHackathon({
  organizationId,
  hackathonId,
  type,
  onSuccess,
  onError,
  suppressToast = false,
}: UseDeleteHackathonOptions) {
  const { isAuthenticated } = useAuthStatus();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteHackathonAction = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to delete hackathons');
      throw new Error('Authentication required');
    }

    if (!organizationId || !hackathonId) {
      toast.error('Organization ID and Hackathon ID are required');
      throw new Error('Organization ID and Hackathon ID are required');
    }

    setIsDeleting(true);
    setError(null);

    try {
      let response;

      if (type === 'draft') {
        response = await deleteDraft(hackathonId, organizationId);
      } else {
        response = await deleteHackathon(hackathonId);
      }

      if (response.success) {
        if (!suppressToast) {
          toast.success('Hackathon deleted successfully');
        }
        onSuccess?.();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete hackathon');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete hackathon';
      setError(errorMessage);
      if (!suppressToast) {
        toast.error(errorMessage);
      }
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [organizationId, hackathonId, isAuthenticated, type, onSuccess, onError]);

  return {
    isDeleting,
    error,
    deleteHackathon: deleteHackathonAction,
  };
}
