import { extractRankFromPosition } from '@/lib/utils/hackathon-escrow';
import type { PrizeTier } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import type { Submission } from '@/components/organization/hackathons/rewards/types';

export interface PrizeTierValidationResult {
  valid: boolean;
  missingRanks: number[];
}

export const validatePrizeTiers = (
  winners: Submission[],
  prizeTiers: PrizeTier[]
): PrizeTierValidationResult => {
  const missingRanks: number[] = [];

  winners.forEach(winner => {
    const rank = winner.rank;
    if (!rank) return;

    const hasTier = prizeTiers.some(tier => {
      const tierRank = extractRankFromPosition(tier.place);
      return tierRank === rank;
    });

    if (!hasTier) {
      missingRanks.push(rank);
    }
  });

  return {
    valid: missingRanks.length === 0,
    missingRanks: [...new Set(missingRanks)].sort((a, b) => a - b),
  };
};
