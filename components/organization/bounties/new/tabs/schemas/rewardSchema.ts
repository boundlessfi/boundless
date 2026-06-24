import { z } from 'zod';

import { MAX_PRIZE_TIERS, type BountyClaimType } from './modeSchema';

/** A single prize position. `amount` is a positive decimal string (token units). */
export const prizeTierSchema = z.object({
  position: z.number().int().min(1, 'Position must be >= 1'),
  amount: z
    .string()
    .regex(/^\d+(?:\.\d+)?$/, 'Amount must be a positive decimal')
    .refine(s => Number(s) > 0, 'Amount must be greater than 0'),
  passMark: z.union([z.number().int().min(0).max(100), z.null()]).optional(),
});

const rewardBase = z.object({
  rewardCurrency: z.string().trim().min(1, 'Reward currency is required'),
  prizeTiers: z.array(prizeTierSchema).min(1, 'Add at least one prize tier'),
});

export type RewardFormData = z.input<typeof rewardBase>;

/** Shared default-export schema for the type only; use makeRewardSchema to validate. */
export const rewardSchema = rewardBase;

/**
 * Mode-aware reward schema. A single-claim bounty pays exactly one winner; a
 * competition pays 1 to {MAX_PRIZE_TIERS}. Positions must be unique and include
 * position 1, and every amount must be > 0 — matching the publish gate
 * (`deriveWinnerDistribution` in the backend).
 */
export function makeRewardSchema(claimType: BountyClaimType) {
  return rewardBase.superRefine((data, ctx) => {
    const tiers = data.prizeTiers ?? [];
    const count = tiers.length;

    if (claimType === 'SINGLE_CLAIM' && count !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prizeTiers'],
        message: 'A single-claim bounty has exactly one prize tier',
      });
    }
    if (claimType === 'COMPETITION' && (count < 1 || count > MAX_PRIZE_TIERS)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prizeTiers'],
        message: `A competition has 1 to ${MAX_PRIZE_TIERS} prize tiers`,
      });
    }

    const positions = new Set<number>();
    tiers.forEach((tier, index) => {
      if (positions.has(tier.position)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['prizeTiers', index, 'position'],
          message: `Duplicate position ${tier.position}`,
        });
      }
      positions.add(tier.position);
    });
    if (count > 0 && !positions.has(1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prizeTiers'],
        message: 'A prize tier at position 1 is required',
      });
    }
  });
}
