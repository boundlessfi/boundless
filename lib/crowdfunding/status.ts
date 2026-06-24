/**
 * Plain-language status labels for crowdfunding campaigns and milestones.
 *
 * Single source of truth so the public page, builder dashboard, status banner,
 * and data table all show the same jargon-free wording. NEVER surface raw
 * `v2Status` / `reviewStatus` enum values to users.
 */
import type { CrowdfundingV2Status } from '@/features/crowdfunding';

export type StatusTone =
  | 'neutral'
  | 'info'
  | 'warning'
  | 'success'
  | 'danger'
  | 'live';

export interface StatusMeta {
  /** Short pill label, plain English. */
  label: string;
  tone: StatusTone;
  /** One plain sentence a non-technical person understands. */
  description: string;
}

const CAMPAIGN_STATUS: Record<CrowdfundingV2Status, StatusMeta> = {
  DRAFT: {
    label: 'Draft',
    tone: 'neutral',
    description: 'Still being put together.',
  },
  SUBMITTED_FOR_REVIEW: {
    label: 'In review',
    tone: 'info',
    description:
      'The Boundless team is checking this campaign before it opens to the community.',
  },
  REVIEW_REJECTED: {
    label: 'Changes requested',
    tone: 'warning',
    description: 'The team asked for some changes before this can go ahead.',
  },
  REVIEW_APPROVED: {
    label: 'Ready to launch',
    tone: 'success',
    description: 'Approved. Launch it to start accepting support.',
  },
  VOTING: {
    label: 'Community vote',
    tone: 'info',
    description: 'The community is deciding whether this campaign goes live.',
  },
  VOTE_FAILED: {
    label: 'Not approved',
    tone: 'danger',
    description: 'The community vote did not pass.',
  },
  VOTE_PASSED: {
    label: 'Ready to launch',
    tone: 'success',
    description:
      'Passed the community vote and is getting ready to accept support.',
  },
  PUBLISHING: {
    label: 'Launching',
    tone: 'info',
    description: 'Setting things up. Support opens in a moment.',
  },
  FUNDING: {
    label: 'Live',
    tone: 'live',
    description: 'Open for support right now.',
  },
  COMPLETED: {
    label: 'Completed',
    tone: 'success',
    description: 'Fully delivered and closed.',
  },
  CANCELLED: {
    label: 'Cancelled',
    tone: 'danger',
    description: 'This campaign was cancelled and supporters were refunded.',
  },
  PAUSED: {
    label: 'Paused',
    tone: 'warning',
    description: 'Temporarily on hold. Support is paused.',
  },
  FAILED: {
    label: 'Needs attention',
    tone: 'danger',
    description: 'Something went wrong setting this up.',
  },
};

export function campaignStatus(v2Status?: string | null): StatusMeta {
  return (
    CAMPAIGN_STATUS[v2Status as CrowdfundingV2Status] ?? CAMPAIGN_STATUS.DRAFT
  );
}

/** Pill/badge classes per tone. */
export const TONE_PILL: Record<StatusTone, string> = {
  neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  live: 'bg-primary/15 text-primary border-primary/30',
};

// ── Milestones ────────────────────────────────────────────────────────────────

export interface MilestoneStateMeta {
  label: string;
  tone: StatusTone;
}

/**
 * Map a milestone's review status (+ whether it's been paid) to a plain state.
 * Hides backend values like SUBMITTED / UNDER_REVIEW / RESUBMISSION_REQUIRED.
 */
export function milestoneState(
  reviewStatus?: string | null,
  claimedAt?: string | null
): MilestoneStateMeta {
  if (claimedAt) return { label: 'Paid out', tone: 'success' };
  switch ((reviewStatus ?? '').toUpperCase()) {
    case 'APPROVED':
      return { label: 'Approved', tone: 'success' };
    case 'COMPLETED':
      return { label: 'Delivered', tone: 'success' };
    case 'SUBMITTED':
    case 'IN_REVIEW':
    case 'UNDER_REVIEW':
      return { label: 'In review', tone: 'info' };
    case 'REJECTED':
    case 'RESUBMISSION_REQUIRED':
    case 'NEEDS_REVISION':
      return { label: 'Changes requested', tone: 'warning' };
    case 'PENDING':
    default:
      return { label: 'Upcoming', tone: 'neutral' };
  }
}
