/**
 * Organizer operate-dashboard reads (boundless-nestjs #338).
 *
 * Types are aliased from the generated OpenAPI schema; calls go through the
 * typed openapi-fetch client, with the `{ success, data }` envelope unwrapped
 * by the apiClient middleware + `unwrapData`.
 */
import { apiClient, unwrapData, type Schemas } from '@/lib/api';

export type BountyOperateApplicationStats =
  Schemas['BountyApplicationStatsDto'];
export type BountyOperateSubmissionStats = Schemas['BountySubmissionStatsDto'];
export type BountyOperateContributionStats =
  Schemas['BountyContributionStatsDto'];
export type BountyOperateIntake = Schemas['BountyOperateIntakeDto'];
export type BountyOverviewPrizeTier = Schemas['BountyOverviewPrizeTierDto'];

/** One read that powers the management dashboard header + stats (#338). */
export type BountyOperateOverview = Schemas['BountyOperateOverviewDto'];

export const getBountyOverview = async (
  organizationId: string,
  bountyId: string
): Promise<BountyOperateOverview> =>
  unwrapData(
    await apiClient.GET(
      '/api/organizations/{organizationId}/bounties/{bountyId}/overview',
      { params: { path: { organizationId, bountyId } } }
    )
  );

// ── Organizer submissions review (#337 / #632) ────────────────────────────────

export type OrganizerBountySubmission = Schemas['OrganizerBountySubmissionDto'];
export type OrganizerBountySubmissionList =
  Schemas['OrganizerBountySubmissionListDto'];
export type OrganizerSubmissionUser = Schemas['OrganizerSubmissionUserDto'];

export interface OrganizerSubmissionsParams {
  status?: string;
  page?: number;
  limit?: number;
}

/** List the submitted work on a bounty for the reviewing organizer. */
export const listBountySubmissions = async (
  organizationId: string,
  bountyId: string,
  params: OrganizerSubmissionsParams = {}
): Promise<OrganizerBountySubmissionList> =>
  unwrapData(
    await apiClient.GET(
      '/api/organizations/{organizationId}/bounties/{bountyId}/submissions',
      { params: { path: { organizationId, bountyId }, query: params } }
    )
  );

/**
 * Every submission on a bounty, across all pages. The backend caps `limit`
 * at 50, so reads that need the COMPLETE set (winner selection must never
 * pick from a truncated pool) page until `total` is reached.
 */
export const listAllBountySubmissions = async (
  organizationId: string,
  bountyId: string
): Promise<OrganizerBountySubmission[]> => {
  const items: OrganizerBountySubmission[] = [];
  for (let page = 1; ; page++) {
    const res = await listBountySubmissions(organizationId, bountyId, {
      page,
      limit: 50,
    });
    items.push(...res.items);
    if (items.length >= res.total || res.items.length === 0) return items;
  }
};
