import { z } from 'zod';

/**
 * Bounty two-axis taxonomy (plain language, see boundless-nestjs #317). These
 * literal unions mirror the backend Prisma enums; once the bounties data layer
 * (#596) lands they can be re-exported from the generated client.
 */
export const ENTRY_TYPES = [
  'OPEN',
  'APPLICATION_LIGHT',
  'APPLICATION_FULL',
] as const;
export const CLAIM_TYPES = ['SINGLE_CLAIM', 'COMPETITION'] as const;
export const SUBMISSION_VISIBILITIES = [
  'ORGANIZER_ONLY',
  'HIDDEN_UNTIL_DEADLINE',
] as const;

export type BountyEntryType = (typeof ENTRY_TYPES)[number];
export type BountyClaimType = (typeof CLAIM_TYPES)[number];
export type BountySubmissionVisibility =
  (typeof SUBMISSION_VISIBILITIES)[number];

export const MAX_PRIZE_TIERS = 3;

/** Whether a contributor applies before working. */
export const isApplicationEntry = (entryType: BountyEntryType): boolean =>
  entryType === 'APPLICATION_LIGHT' || entryType === 'APPLICATION_FULL';

export const isCompetition = (claimType: BountyClaimType): boolean =>
  claimType === 'COMPETITION';

/**
 * Plain-language label for the configured mode, derived from
 * (entryType, claimType, winner count). Mirrors `computeBountyMode` in the
 * backend; a competition paying more than one tier is flagged "multiple
 * winners".
 */
export function computeBountyModeLabel(
  entryType: BountyEntryType,
  claimType: BountyClaimType,
  winnerCount = 1
): string {
  const claim = claimType === 'SINGLE_CLAIM' ? 'single claim' : 'competition';
  let base: string;
  if (entryType === 'OPEN') {
    base = claim === 'single claim' ? 'Open, single claim' : 'Open competition';
  } else {
    const entry =
      entryType === 'APPLICATION_LIGHT'
        ? 'Application (light)'
        : 'Application (full)';
    base =
      claim === 'single claim'
        ? `${entry}, single claim`
        : `${entry} competition`;
  }
  if (isCompetition(claimType) && winnerCount > 1) {
    return `${base} (multiple winners)`;
  }
  return base;
}

/**
 * Plain-language explanation of a bounty mode, shown in the detail-page tooltip
 * so participants understand how entry and payout work before engaging.
 */
export function computeBountyModeDescription(
  entryType: BountyEntryType,
  claimType: BountyClaimType
): string {
  const single = claimType === 'SINGLE_CLAIM';
  if (entryType === 'OPEN') {
    return single
      ? 'Anyone eligible can claim this bounty directly. The first to claim locks it, does the work, and gets paid. One worker, one reward.'
      : 'Anyone can join and work in parallel. Submissions stay hidden from other participants until the deadline, then the organizer picks the winner(s).';
  }
  const depth =
    entryType === 'APPLICATION_LIGHT'
      ? 'a short application'
      : 'a full application (proposal, portfolio, and more)';
  return single
    ? `Submit ${depth}. The organizer selects one applicant to do the work and get paid.`
    : `Submit ${depth}. The organizer shortlists several applicants who then compete, and picks the winner(s) at the deadline.`;
}

export type FieldRule = 'required' | 'optional' | 'hidden';

export interface ModeFields {
  /** Forced submission visibility for the mode (read-only in the UI). */
  submissionVisibility: BountySubmissionVisibility;
  submissionDeadline: FieldRule;
  reputationMinimum: FieldRule;
  applicationWindowCloseAt: FieldRule;
  maxApplicants: FieldRule;
  shortlistSize: FieldRule;
  /** Anti-spam knob; only meaningful for application entry types. */
  applicationCreditCost: FieldRule;
}

/**
 * The mode -> field matrix from the authoritative publish gate
 * (`validateTwoAxisMode` in boundless-nestjs). Derived functionally so it
 * cannot drift from the backend rules.
 */
export function getModeFields(
  entryType: BountyEntryType,
  claimType: BountyClaimType
): ModeFields {
  const application = isApplicationEntry(entryType);
  const competition = isCompetition(claimType);

  return {
    submissionVisibility: competition
      ? 'HIDDEN_UNTIL_DEADLINE'
      : 'ORGANIZER_ONLY',
    submissionDeadline: 'required',
    // Open + single claim gates on reputation (squat-guard).
    reputationMinimum: !application && !competition ? 'required' : 'hidden',
    applicationWindowCloseAt: application ? 'required' : 'hidden',
    // Open competition caps direct joins; application modes cap optionally.
    maxApplicants:
      entryType === 'OPEN' && competition
        ? 'required'
        : application
          ? 'optional'
          : 'hidden',
    // Application competition requires a shortlist; single-claim app is optional.
    shortlistSize:
      application && competition
        ? 'required'
        : application
          ? 'optional'
          : 'hidden',
    applicationCreditCost: application ? 'optional' : 'hidden',
  };
}

export const modeSchema = z
  .object({
    entryType: z.enum(ENTRY_TYPES),
    claimType: z.enum(CLAIM_TYPES),
    // Number of prize positions. 1 for single claim; 1-3 for a competition.
    winnerCount: z.number().int().min(1).max(MAX_PRIZE_TIERS).default(1),
  })
  .superRefine((data, ctx) => {
    if (data.claimType === 'SINGLE_CLAIM' && data.winnerCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A single-claim bounty pays exactly one winner',
        path: ['winnerCount'],
      });
    }
    if (
      data.claimType === 'COMPETITION' &&
      (data.winnerCount < 1 || data.winnerCount > MAX_PRIZE_TIERS)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A competition pays 1 to 3 winners',
        path: ['winnerCount'],
      });
    }
  });

export type ModeFormData = z.input<typeof modeSchema>;
export type ModeSelection = Pick<ModeFormData, 'entryType' | 'claimType'>;
