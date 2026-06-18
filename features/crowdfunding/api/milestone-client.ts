/**
 * Crowdfunding milestone imperative client.
 */
import { apiClient, unwrapData } from '@/lib/api/client';
import type { ClaimMilestoneBody } from '../types';

// ── Queries ───────────────────────────────────────────────────────────────────

export const fetchMilestones = async (campaignId: string): Promise<unknown[]> =>
  (unwrapData(
    await apiClient.GET('/api/crowdfunding/{id}/milestones', {
      params: { path: { id: campaignId } },
    })
  ) as unknown as unknown[]) ?? [];

export const fetchMilestone = async (
  campaignId: string,
  milestoneId: string
): Promise<unknown> =>
  unwrapData(
    await apiClient.GET('/api/crowdfunding/{id}/milestones/{milestoneId}', {
      params: { path: { id: campaignId, milestoneId } },
    })
  );

// ── Mutations ─────────────────────────────────────────────────────────────────

export const validateMilestoneSubmission = async (
  campaignId: string,
  milestoneId: string,
  body: {
    status: 'submitted' | 'in_progress' | 'completed';
    proofOfWorkFiles: string[];
    proofOfWorkLinks: string[];
    submissionNotes: string;
  }
): Promise<{ validated: boolean; error?: string }> =>
  unwrapData(
    await apiClient.POST(
      '/api/crowdfunding/{id}/milestones/{milestoneId}/validate-submission',
      {
        params: { path: { id: campaignId, milestoneId } },
        body: body as never,
      }
    )
  ) as { validated: boolean; error?: string };

export const updateMilestone = async (
  campaignId: string,
  milestoneId: string,
  body: {
    submissionNotes?: string;
    proofOfWorkLinks?: string[];
    proofOfWorkFiles?: string[];
  }
): Promise<unknown> =>
  unwrapData(
    await apiClient.PUT('/api/crowdfunding/{id}/milestones/{milestoneId}', {
      params: { path: { id: campaignId, milestoneId } },
      body: body as never,
    })
  );

export const claimMilestone = async (
  campaignId: string,
  body: ClaimMilestoneBody
): Promise<unknown> =>
  unwrapData(
    await apiClient.POST(
      '/api/crowdfunding/campaigns/{id}/v2/escrow/claim-milestone',
      {
        params: { path: { id: campaignId } },
        body: body as never,
      }
    )
  );
