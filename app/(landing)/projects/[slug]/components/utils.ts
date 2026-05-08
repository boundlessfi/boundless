import {
  CampaignStatus,
  type CampaignStatusValue,
  normalizeCampaignStatus,
} from '@/features/projects/types';
import type { ProjectViewModel } from '@/features/projects/types/view-model';

export { CampaignStatus };
export type { CampaignStatusValue };

/**
 * Resolve the effective campaign status for a project.
 * If the campaign has met or exceeded its funding goal we treat it as FUNDED
 * regardless of the raw backend status — this matches the legacy behavior in
 * components/project-details/project-sidebar/utils.ts.
 */
export function getProjectStatus(vm: ProjectViewModel): CampaignStatusValue {
  if (
    vm.campaign &&
    vm.campaign.fundingRaised >= vm.campaign.fundingGoal &&
    vm.campaign.fundingGoal > 0
  ) {
    return CampaignStatus.FUNDED;
  }
  return normalizeCampaignStatus(vm.status);
}

/**
 * Returns true when the error from our axios wrapper represents an HTTP 404
 * (i.e. the resource really doesn't exist) versus any other transport, server,
 * or rate-limit error. The wrapper rejects with an `ApiError`-shaped object
 * that has a numeric `status` field — see lib/api/api.ts.
 *
 * The fetch flows in the project pages use this helper to decide when to fall
 * through to the next data source instead of swallowing every error as
 * "not found".
 */
export function isApiNotFound(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const status = (err as { status?: unknown }).status;
  return typeof status === 'number' && status === 404;
}

/**
 * Format an ISO date as a friendly relative time string ("2 hours ago",
 * "3 days ago", or a localized date for anything older than 30 days).
 * Shared between voter rows and backer cards.
 */
export function formatRelative(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    if (!Number.isFinite(then)) return '';
    const now = Date.now();
    const diffSec = Math.max(1, Math.round((now - then) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    const min = Math.round(diffSec / 60);
    if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
    const day = Math.round(hr / 24);
    if (day < 30) return `${day} day${day === 1 ? '' : 's'} ago`;
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}
