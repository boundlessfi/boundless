'use client';

import { useQuery } from '@tanstack/react-query';

import { bountyKeys } from './keys';
import {
  getBountyOverview,
  listAllBountySubmissions,
  listBountySubmissions,
  type BountyOperateOverview,
  type OrganizerBountySubmission,
  type OrganizerBountySubmissionList,
  type OrganizerSubmissionsParams,
} from './organizer-dashboard-client';

/**
 * Operate-dashboard overview for the organizer management surface (#338 / #630).
 * Global query defaults apply: 4xx never retries, transient errors retry twice;
 * the shell renders an error/empty state on failure.
 */
export function useBountyOverview(
  organizationId: string | undefined,
  bountyId: string | undefined
) {
  return useQuery<BountyOperateOverview>({
    queryKey: bountyKeys.overview(organizationId ?? '', bountyId ?? ''),
    queryFn: () =>
      getBountyOverview(organizationId as string, bountyId as string),
    enabled: !!organizationId && !!bountyId,
  });
}

/**
 * Submitted work on a bounty, for the reviewing organizer (#337 / #632).
 * Organizers always see submissions regardless of submissionVisibility —
 * HIDDEN_UNTIL_DEADLINE only hides peer work from other participants, and
 * the API returns the organizer's submissions at all times.
 */
export function useBountySubmissions(
  organizationId: string | undefined,
  bountyId: string | undefined,
  options: { params?: OrganizerSubmissionsParams } = {}
) {
  const params = options.params ?? {};
  return useQuery<OrganizerBountySubmissionList>({
    queryKey: bountyKeys.orgSubmissions(
      organizationId ?? '',
      bountyId ?? '',
      params
    ),
    queryFn: () =>
      listBountySubmissions(
        organizationId as string,
        bountyId as string,
        params
      ),
    enabled: !!organizationId && !!bountyId,
  });
}

/**
 * The COMPLETE submission set for a bounty (pages through the capped list
 * endpoint). Winner selection reads this so the payout pool is never a
 * truncated page. Same organizer-visibility rule as useBountySubmissions.
 */
export function useAllBountySubmissions(
  organizationId: string | undefined,
  bountyId: string | undefined
) {
  return useQuery<OrganizerBountySubmission[]>({
    queryKey: bountyKeys.orgSubmissionsAll(
      organizationId ?? '',
      bountyId ?? ''
    ),
    queryFn: () =>
      listAllBountySubmissions(organizationId as string, bountyId as string),
    enabled: !!organizationId && !!bountyId,
  });
}
