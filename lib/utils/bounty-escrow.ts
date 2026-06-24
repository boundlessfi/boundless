import type { RewardsFormData } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import type { RewardFormData } from '@/components/organization/bounties/new/tabs/schemas/rewardSchema';
import type { BountyWinnerDistributionEntry } from '@/features/bounties';
import {
  PLATFORM_FEE,
  buildWinnerDistribution,
  calculatePlatformFeeAmount,
  calculateTotalPrizeAmount,
  getTotalPrizePoolForFunding,
} from './hackathon-escrow';

export { PLATFORM_FEE };

/**
 * Adapt the bounty reward shape (`{ position, amount }`) to the hackathon
 * RewardsFormData the prize-pool helpers expect (`{ place, prizeAmount, rank,
 * kind: 'OVERALL' }`), so the configure + publish flows reuse one source of
 * prize-pool / fee / winner-distribution math (lib/utils/hackathon-escrow.ts)
 * instead of duplicating it.
 */
function toRewards(reward: RewardFormData | undefined): RewardsFormData {
  const tiers = reward?.prizeTiers ?? [];
  return {
    prizeTiers: tiers.map(tier => ({
      id: String(tier.position),
      place: String(tier.position),
      prizeAmount: tier.amount,
      rank: tier.position,
      passMark: tier.passMark ?? 0,
      kind: 'OVERALL' as const,
    })),
  };
}

/** Sum of the prize tiers (token-native units), excluding the platform fee. */
export const getBountyPrizePool = (
  reward: RewardFormData | undefined
): number => calculateTotalPrizeAmount(toRewards(reward));

/** The 2.5% platform fee charged on top of the prize pool at publish. */
export const getBountyPlatformFee = (
  reward: RewardFormData | undefined
): number => calculatePlatformFeeAmount(getBountyPrizePool(reward));

/** Total the funder is debited: prize pool + platform fee. */
export const getBountyTotalFunding = (
  reward: RewardFormData | undefined
): number => getTotalPrizePoolForFunding(toRewards(reward));

/**
 * On-chain winner distribution ([{position, percent}] summing to 100) derived
 * from the prize tiers. Used by the publish flow (#601); returns undefined when
 * there are no fundable tiers (the backend then defaults to 100% @ position 1).
 */
export const buildBountyWinnerDistribution = (
  reward: RewardFormData | undefined
): BountyWinnerDistributionEntry[] | undefined =>
  buildWinnerDistribution(toRewards(reward));
