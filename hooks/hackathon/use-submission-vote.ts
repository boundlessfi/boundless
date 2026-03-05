import { useState, useEffect, useCallback } from 'react';
import {
  voteOnHackathonSubmission,
  deleteVote,
  getMyVote,
  getVoteCounts,
} from '@/lib/api/votes';
import { VoteEntityType } from '@/types/votes';
import { reportError } from '@/lib/error-reporting';

interface UseSubmissionVoteReturn {
  voteCount: number;
  hasVoted: boolean;
  isLoading: boolean;
  error: string | null;
  toggleVote: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSubmissionVote(
  submissionId: string
): UseSubmissionVoteReturn {
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVoteData = useCallback(async () => {
    if (!submissionId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch vote counts and user's vote status in parallel
      const [countsResponse, myVoteResponse] = await Promise.all([
        getVoteCounts(submissionId, VoteEntityType.HACKATHON_SUBMISSION),
        getMyVote(submissionId, VoteEntityType.HACKATHON_SUBMISSION).catch(
          () => null
        ), // User might not be authenticated
      ]);

      // VoteCountResponse is directly the data, no wrapper
      if (countsResponse) {
        setVoteCount(countsResponse.upvotes || 0);
      }

      // GetMyVoteResponse has success and data properties
      if (myVoteResponse?.success && myVoteResponse.data) {
        setHasVoted(true); // If vote exists, user has voted
      } else {
        setHasVoted(false);
      }
    } catch (err) {
      reportError(err, { context: 'submission-vote-fetch', submissionId });
      setError(err instanceof Error ? err.message : 'Failed to fetch votes');
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  const toggleVote = useCallback(async () => {
    if (!submissionId || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      if (hasVoted) {
        // Remove vote
        const response = await deleteVote(
          submissionId,
          VoteEntityType.HACKATHON_SUBMISSION
        );

        if (response.success) {
          setHasVoted(false);
          setVoteCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Add upvote
        const response = await voteOnHackathonSubmission(
          submissionId,
          'UPVOTE'
        );

        if (response.success) {
          setHasVoted(true);
          setVoteCount(prev => prev + 1);
        }
      }

      // Refresh to get accurate counts from server
      await fetchVoteData();
    } catch (err) {
      reportError(err, { context: 'submission-vote-toggle', submissionId });
      setError(err instanceof Error ? err.message : 'Failed to update vote');
      // Revert optimistic update on error
      await fetchVoteData();
    } finally {
      setIsLoading(false);
    }
  }, [submissionId, hasVoted, isLoading, fetchVoteData]);

  const refresh = useCallback(async () => {
    await fetchVoteData();
  }, [fetchVoteData]);

  useEffect(() => {
    fetchVoteData();
  }, [fetchVoteData]);

  return {
    voteCount,
    hasVoted,
    isLoading,
    error,
    toggleVote,
    refresh,
  };
}
