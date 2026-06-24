/**
 * Crowdfunding milestone imperative client.
 */
import { apiClient, unwrapData } from '@/lib/api/client';

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
