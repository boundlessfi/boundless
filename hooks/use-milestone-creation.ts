import { useState } from 'react';
import { toast } from 'sonner';
import { createWinnerMilestones } from '@/lib/api/hackathons';
import { extractRankFromPosition } from '@/lib/utils/prize-tier-matcher';
import { validateStellarAddress } from '@/lib/utils/stellar-address-validation';
import type { Submission } from '@/components/organization/hackathons/rewards/types';
import type { PrizeTier } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import type { HackathonEscrowData } from '@/lib/api/hackathons';

interface UseMilestoneCreationProps {
  winners: Submission[];
  prizeTiers: PrizeTier[];
  escrow: HackathonEscrowData | null;
  organizationId: string;
  hackathonId: string;
  walletAddresses: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSuccess?: () => void;
}

export const useMilestoneCreation = ({
  winners,
  prizeTiers,
  escrow,
  organizationId,
  hackathonId,
  walletAddresses,
  setErrors,
  onSuccess,
}: UseMilestoneCreationProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const validatePrizeTiers = (): {
    valid: boolean;
    missingRanks: number[];
  } => {
    const missingRanks: number[] = [];

    winners.forEach(winner => {
      if (!winner.rank) return;

      const hasTier = prizeTiers.some(tier => {
        const tierRank = extractRankFromPosition(tier.place);
        return tierRank === winner.rank;
      });

      if (!hasTier) {
        missingRanks.push(winner.rank);
      }
    });

    return {
      valid: missingRanks.length === 0,
      missingRanks: [...new Set(missingRanks)].sort((a, b) => a - b),
    };
  };

  const validateBeforeSubmit = (): boolean => {
    const newErrors: Record<string, string> = {};

    const tierValidation = validatePrizeTiers();
    if (!tierValidation.valid) {
      const ranksStr = tierValidation.missingRanks
        .map(
          r => `${r}${r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th'}`
        )
        .join(', ');

      toast.error(
        `No prize tier found for rank${tierValidation.missingRanks.length > 1 ? 's' : ''} ${ranksStr}. ` +
          `Please configure prize tiers in the Rewards tab before creating milestones.`
      );
      return false;
    }

    winners.forEach(winner => {
      const address = walletAddresses[winner.id]?.trim();
      if (!address) {
        newErrors[winner.id] = 'Wallet address is required';
      } else if (!validateStellarAddress(address)) {
        newErrors[winner.id] = 'Invalid Stellar address format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMilestones = async () => {
    if (!validateBeforeSubmit()) {
      return;
    }

    if (!escrow) {
      toast.error('Escrow not found');
      return;
    }

    setIsLoading(true);

    try {
      const winnersData = winners
        .filter(winner => winner.rank !== undefined && winner.rank !== null)
        .map(winner => {
          const participantId = winner.participantId || winner.id;
          if (!participantId || participantId.trim() === '') {
            throw new Error(`Participant ID missing for ${winner.name}`);
          }

          const rank = winner.rank!;
          if (rank < 1) {
            throw new Error(`Invalid rank for ${winner.name}`);
          }

          const walletAddress = walletAddresses[winner.id]?.trim();
          if (!walletAddress || walletAddress === '') {
            throw new Error(`Wallet address missing for ${winner.name}`);
          }

          if (!validateStellarAddress(walletAddress)) {
            throw new Error(
              `Invalid Stellar wallet address format for ${winner.name}. Address must be 56 characters and start with 'G'.`
            );
          }

          const prizeTier = prizeTiers.find(tier => {
            const tierRank = extractRankFromPosition(tier.place);
            return tierRank === rank;
          });
          if (!prizeTier) {
            throw new Error(
              `No prize tier found for rank ${rank} (${winner.name}). Please ensure a prize tier with position matching rank ${rank} exists (e.g., "${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'} Place").`
            );
          }

          const prizeAmount = prizeTier.prizeAmount
            ? parseFloat(prizeTier.prizeAmount)
            : 0;

          if (prizeAmount <= 0) {
            throw new Error(
              `Invalid prize amount for rank ${rank} (${winner.name}). Prize amount must be greater than 0.`
            );
          }

          const currency = prizeTier.currency || 'USDC';

          return {
            participantId: participantId.trim(),
            rank: rank,
            walletAddress: walletAddress.trim(),
            amount: prizeAmount,
            currency: currency,
          };
        });

      if (winnersData.length === 0) {
        throw new Error(
          'No winners selected. Please assign ranks to submissions first.'
        );
      }

      const response = await createWinnerMilestones(
        organizationId,
        hackathonId,
        {
          winners: winnersData,
        }
      );

      if (response.success) {
        toast.success(
          `Successfully created ${response.data.milestonesCreated} milestone(s)`
        );
        if (onSuccess) {
          onSuccess();
        }
        return true;
      } else {
        const errorMessage = response.message || 'Failed to create milestones';
        if (
          errorMessage.includes('prize tier') ||
          errorMessage.includes('rank')
        ) {
          throw new Error(
            `${errorMessage} Please go to the hackathon edit page and add prize tiers in the Rewards tab. ` +
              `The position field in prize tiers must match the ranks you're assigning (e.g., "1" for rank 1).`
          );
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create milestones. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createMilestones,
  };
};
