'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { crowdfundingKeys } from './keys';
import {
  fetchMilestones,
  fetchMilestone,
  validateMilestoneSubmission,
  updateMilestone,
} from './milestone-client';

// ── Queries ───────────────────────────────────────────────────────────────────

/** All milestones for a campaign. Disabled until campaignId is present. */
export function useMilestones(campaignId: string | null | undefined) {
  return useQuery({
    queryKey: campaignId
      ? crowdfundingKeys.milestones(campaignId)
      : [...crowdfundingKeys.all, 'milestones', 'idle'],
    enabled: Boolean(campaignId),
    queryFn: () => fetchMilestones(campaignId!),
    staleTime: 30_000,
  });
}

/** Single milestone. Disabled until both IDs are present. */
export function useMilestone(
  campaignId: string | null | undefined,
  milestoneId: string | null | undefined
) {
  return useQuery({
    queryKey:
      campaignId && milestoneId
        ? crowdfundingKeys.milestone(campaignId, milestoneId)
        : [...crowdfundingKeys.all, 'milestone', 'idle'],
    enabled: Boolean(campaignId && milestoneId),
    queryFn: () => fetchMilestone(campaignId!, milestoneId!),
    staleTime: 15_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useSubmitMilestoneEvidence(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      milestoneId,
      submissionNotes,
      proofOfWorkLinks,
      proofOfWorkFiles,
    }: {
      milestoneId: string;
      submissionNotes: string;
      proofOfWorkLinks: string[];
      proofOfWorkFiles: string[];
    }) => {
      const validation = await validateMilestoneSubmission(
        campaignId,
        milestoneId,
        {
          submissionNotes,
          proofOfWorkLinks,
          proofOfWorkFiles,
        }
      );
      if (!validation.validated) {
        throw new Error(validation.error ?? 'Validation failed');
      }
      return updateMilestone(campaignId, milestoneId, {
        submissionNotes,
        proofOfWorkLinks,
        proofOfWorkFiles,
      });
    },
    onSuccess: (_data, { milestoneId }) => {
      queryClient.invalidateQueries({
        queryKey: crowdfundingKeys.milestone(campaignId, milestoneId),
      });
      queryClient.invalidateQueries({
        queryKey: crowdfundingKeys.campaign(campaignId),
      });
    },
  });
}
