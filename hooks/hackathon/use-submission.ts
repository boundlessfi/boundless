'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  createSubmission,
  updateSubmission,
  getMySubmission,
  type CreateSubmissionRequest,
  type ParticipantSubmission,
} from '@/lib/api/hackathons';
import { useAuthStatus } from '@/hooks/use-auth';
import { toast } from 'sonner';

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
      const response = await getMySubmission(hackathonSlugOrId, organizationId);

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
  }, [hackathonSlugOrId, organizationId, isAuthenticated]);

  const create = useCallback(
    async (data: CreateSubmissionRequest) => {
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
          data,
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
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated]
  );

  const update = useCallback(
    async (
      submissionId: string,
      data: Omit<CreateSubmissionRequest, 'projectName'>
    ) => {
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
        const response = await updateSubmission(
          hackathonSlugOrId,
          submissionId,
          data,
          organizationId
        );

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
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated]
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
    fetchMySubmission,
    hasSubmission: !!submission,
  };
}
