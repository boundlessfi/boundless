import { useState } from 'react';
import { toast } from 'sonner';
import { createWinnerMilestones } from '@/lib/api/hackathons';
import { validateStellarAddress } from '@/lib/utils/stellar-address-validation';
import { validatePrizeTiers } from '@/lib/utils/prize-tier-validation';
import { extractRankFromPosition } from '@/lib/utils/hackathon-escrow';
import type { Submission } from '@/components/organization/hackathons/rewards/types';
import type { PrizeTier } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import type { HackathonEscrowData } from '@/lib/api/hackathons';

interface UsePublishWinnersProps {
  winners: Submission[];
  prizeTiers: PrizeTier[];
  escrow: HackathonEscrowData | null;
  organizationId: string;
  hackathonId: string;
  walletAddresses: Record<string, string>;
  announcement: string;
  milestonesCreated: boolean;
  setMilestonesCreated: (value: boolean) => void;
  onSuccess?: () => void;
}

export const usePublishWinners = ({
  winners,
  prizeTiers,
  escrow,
  organizationId,
  hackathonId,
  walletAddresses,
  announcement,
  milestonesCreated,
  setMilestonesCreated,
  onSuccess,
}: UsePublishWinnersProps) => {
  const [isPublishing, setIsPublishing] = useState(false);

  const publishWinners = async () => {
    setIsPublishing(true);

    try {
      const tierValidation = validatePrizeTiers(winners, prizeTiers);
      if (!tierValidation.valid) {
        const ranksStr = tierValidation.missingRanks
          .map(
            r =>
              `${r}${r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th'}`
          )
          .join(', ');

        throw new Error(
          `No prize tier found for rank${tierValidation.missingRanks.length > 1 ? 's' : ''} ${ranksStr}. ` +
            `Please configure prize tiers in the Rewards tab before creating milestones. ` +
            `Go to the hackathon edit page and add prize tiers with positions matching the ranks you're assigning.`
        );
      }

      const shouldCreateMilestones = escrow?.canUpdate && escrow?.isFunded;

      if (shouldCreateMilestones && !milestonesCreated) {
        if (!escrow) {
          toast.error('Escrow not found');
          setIsPublishing(false);
          return;
        }

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

        const milestonesResponse = await createWinnerMilestones(
          organizationId,
          hackathonId,
          { winners: winnersData }
        );

        if (!milestonesResponse.success) {
          const errorMessage =
            milestonesResponse.message || 'Failed to create milestones';
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

        setMilestonesCreated(true);
        toast.success(
          `Successfully created ${milestonesResponse.data.milestonesCreated} milestone(s)`
        );
      } else if (shouldCreateMilestones && milestonesCreated) {
        toast.info('Milestones already created, proceeding to announcement...');
      } else {
        if (!escrow?.isFunded) {
          throw new Error(
            'Escrow is not funded. Please fund the escrow first.'
          );
        }
      }

      const { api } = await import('@/lib/api/api');
      await api.post(
        `/organizations/${organizationId}/hackathons/${hackathonId}/winners/announce`,
        {
          winners: winners.map(w => ({ submissionId: w.id, rank: w.rank })),
          announcement,
        }
      );

      toast.success('Winners published successfully!');
      if (onSuccess) {
        onSuccess();
      }
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to publish winners. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    isPublishing,
    publishWinners,
  };
};
