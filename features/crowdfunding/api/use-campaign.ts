'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useWalletContext } from '@/components/providers/wallet-provider';
import { getTokenAddress } from '@/lib/config/tokens';

import type { CampaignListFilters, CrowdfundingCampaign } from '../types';
import { crowdfundingKeys } from './keys';
import {
  fetchCampaigns,
  fetchMyCampaigns,
  fetchCampaignBySlug,
  submitForReview,
  withdrawSubmission,
  reviseAndResubmit,
  publishCampaign,
  contributeV2,
  castVote,
  fetchMyVote,
} from './campaign-client';
import type { ContributeV2Body } from '../types';

/** Funding window opened at launch (admins can extend it afterward). */
const FUNDING_WINDOW_DAYS = 30;

// ── Queries ───────────────────────────────────────────────────────────────────

/** Public campaign listing. Enabled as long as called. */
export function useCampaigns(
  page = 1,
  limit = 10,
  filters?: CampaignListFilters
) {
  return useQuery({
    queryKey: crowdfundingKeys.list(
      page,
      limit,
      filters as Record<string, unknown>
    ),
    queryFn: () => fetchCampaigns(page, limit, filters),
    staleTime: 60_000,
  });
}

/** Authenticated user's own campaigns. */
export function useMyCampaigns(
  page = 1,
  limit = 10,
  filters?: CampaignListFilters
) {
  return useQuery({
    queryKey: crowdfundingKeys.mine(page, limit),
    queryFn: () => fetchMyCampaigns(page, limit, filters),
    staleTime: 30_000,
  });
}

/** Single campaign by slug or ID. Disabled until a value is provided. */
export function useCampaign(idOrSlug: string | null | undefined) {
  return useQuery({
    queryKey: idOrSlug
      ? crowdfundingKeys.campaign(idOrSlug)
      : [...crowdfundingKeys.all, 'campaign', 'idle'],
    enabled: Boolean(idOrSlug),
    queryFn: () => fetchCampaignBySlug(idOrSlug!),
    staleTime: 30_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useSubmitForReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => submitForReview(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: crowdfundingKeys.campaign(id),
      });
      queryClient.invalidateQueries({ queryKey: crowdfundingKeys.all });
    },
  });
}

export function useWithdrawSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawSubmission(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: crowdfundingKeys.campaign(id),
      });
      queryClient.invalidateQueries({ queryKey: crowdfundingKeys.all });
    },
  });
}

export function useReviseAndResubmit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviseAndResubmit(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: crowdfundingKeys.campaign(id),
      });
    },
  });
}

/**
 * Launch a VOTE_PASSED campaign on-chain. Uses the builder's Boundless managed
 * wallet (backend signs + submits) and opens a 30-day funding window. The
 * campaign moves to PUBLISHING, then FUNDING once the escrow settles.
 */
export function usePublishCampaign() {
  const queryClient = useQueryClient();
  const { walletAddress } = useWalletContext();
  return useMutation({
    mutationFn: async (campaign: CrowdfundingCampaign) => {
      if (!walletAddress) {
        throw new Error('Connect your Boundless wallet before launching.');
      }
      const tokenAddress = getTokenAddress('USDC');
      const fundingDeadline =
        Math.floor(Date.now() / 1000) + FUNDING_WINDOW_DAYS * 24 * 60 * 60;
      return publishCampaign(campaign.id, {
        builderAddress: walletAddress,
        tokenAddress,
        fundingGoal: String(campaign.fundingGoal ?? 0),
        nMilestones: campaign.milestones?.length ?? 0,
        fundingDeadline,
      });
    },
    onSuccess: (_data, campaign) => {
      queryClient.invalidateQueries({
        queryKey: crowdfundingKeys.campaign(campaign.slug),
      });
      queryClient.invalidateQueries({
        queryKey: crowdfundingKeys.campaign(campaign.id),
      });
      queryClient.invalidateQueries({ queryKey: crowdfundingKeys.all });
    },
  });
}

export function useContributeV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ContributeV2Body }) =>
      contributeV2(id, body),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: crowdfundingKeys.campaign(id),
      });
    },
  });
}

export function useCastVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, choice }: { id: string; choice: 'UP' | 'DOWN' }) =>
      castVote(id, choice),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: crowdfundingKeys.campaign(id),
      });
      queryClient.invalidateQueries({
        queryKey: [...crowdfundingKeys.campaign(id), 'my-vote'],
      });
    },
  });
}

/** The caller's current vote on a campaign (or null). */
export function useMyVote(id?: string) {
  return useQuery({
    queryKey: [...crowdfundingKeys.campaign(id ?? ''), 'my-vote'],
    queryFn: () => fetchMyVote(id as string),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}
