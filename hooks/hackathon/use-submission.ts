'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getMySubmission,
  type CreateSubmissionRequest,
  type ParticipantSubmission,
} from '@/lib/api/hackathons';
import { useAuthStatus } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { reportError } from '@/lib/error-reporting';

// Type for submission data from form (without backend-specific fields)
export type SubmissionFormData = Omit<
  CreateSubmissionRequest,
  'hackathonId' | 'organizationId' | 'participationType'
> & {
  participationType?: 'INDIVIDUAL' | 'TEAM';
  teamName?: string;
  teamMembers?: Array<{
    userId?: string;
    email?: string;
    name: string;
    role: string;
    username?: string;
    avatar?: string;
  }>;
};

interface UseSubmissionOptions {
  hackathonSlugOrId: string;
  organizationId?: string;
  autoFetch?: boolean;
}

export function useSubmission({
  hackathonSlugOrId,
  organizationId,
  autoFetch = true,
}: UseSubmissionOptions) {
  const { isAuthenticated } = useAuthStatus();
  const [submission, setSubmission] = useState<ParticipantSubmission | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMySubmission = useCallback(async () => {
    if (!isAuthenticated || !hackathonSlugOrId) {
      setSubmission(null);
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const response = await getMySubmission(hackathonSlugOrId);

      if (response.success && response.data) {
        setSubmission(response.data);
      } else {
        setSubmission(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch submission';
      setError(errorMessage);
      setSubmission(null);
    } finally {
      setIsFetching(false);
    }
  }, [hackathonSlugOrId, isAuthenticated]);

  const create = useCallback(
    async (data: SubmissionFormData) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to submit a project');
        throw new Error('Authentication required');
      }

      if (!hackathonSlugOrId) {
        toast.error('Hackathon ID is required');
        throw new Error('Hackathon ID is required');
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const response = await createSubmission(
          hackathonSlugOrId,
          {
            ...data,
            participationType: data.participationType || 'INDIVIDUAL',
            links: data.links || [],
          },
          organizationId
        );

        if (response.success && response.data) {
          setSubmission(response.data);
          toast.success('Submission created successfully!');
          return response.data;
        } else {
          throw new Error(response.message || 'Submission creation failed');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create submission';
        setError(errorMessage);
        toast.error(errorMessage);
        reportError(err, {
          context: 'hackathon-createSubmission',
          hackathonSlugOrId,
        });
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [hackathonSlugOrId, isAuthenticated, organizationId]
  );

  const update = useCallback(
    async (submissionId: string, data: Partial<SubmissionFormData>) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to update your submission');
        throw new Error('Authentication required');
      }

      if (!hackathonSlugOrId || !submissionId) {
        toast.error('Hackathon ID and Submission ID are required');
        throw new Error('Hackathon ID and Submission ID are required');
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const response = await updateSubmission(submissionId, data);

        if (response.success && response.data) {
          setSubmission(response.data);
          toast.success('Submission updated successfully!');
          return response.data;
        } else {
          throw new Error(response.message || 'Submission update failed');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update submission';
        setError(errorMessage);
        toast.error(errorMessage);
        reportError(err, {
          context: 'hackathon-updateSubmission',
          submissionId,
        });
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [hackathonSlugOrId, isAuthenticated]
  );

  const remove = useCallback(
    async (submissionId: string) => {
      if (!isAuthenticated || !hackathonSlugOrId) {
        toast.error('Unable to delete submission');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await deleteSubmission(submissionId);
        setSubmission(null);
        toast.success('Submission deleted successfully');
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete submission';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [hackathonSlugOrId, isAuthenticated]
  );

  // Auto-fetch submission on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && isAuthenticated && hackathonSlugOrId) {
      fetchMySubmission();
    } else if (!isAuthenticated) {
      setSubmission(null);
    }
  }, [autoFetch, isAuthenticated, hackathonSlugOrId, fetchMySubmission]);

  return {
    submission,
    isSubmitting,
    isFetching,
    error,
    create,
    update,
    remove,
    fetchMySubmission,
    hasSubmission: !!submission,
  };
}
