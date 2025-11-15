import { useMemo } from 'react';
import {
  getTotalPrizePoolForFunding,
  calculateTotalPrizeAmount,
  calculatePlatformFeeAmount,
  PLATFORM_FEE,
} from '@/lib/utils/hackathon-escrow';
import type { RewardsFormData } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';

export const usePrizePoolCalculations = (rewards?: RewardsFormData) => {
  const { totalPrizePool, platformFee, totalFunding } = useMemo(() => {
    if (!rewards) {
      return { totalPrizePool: 0, platformFee: 0, totalFunding: 0 };
    }
    const prizePool = calculateTotalPrizeAmount(rewards);
    const fee = calculatePlatformFeeAmount(prizePool, PLATFORM_FEE);
    const total = getTotalPrizePoolForFunding(rewards);
    return {
      totalPrizePool: prizePool,
      platformFee: fee,
      totalFunding: total,
    };
  }, [rewards]);

  return {
    totalPrizePool,
    platformFee,
    totalFunding,
  };
};
