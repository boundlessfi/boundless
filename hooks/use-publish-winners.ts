import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { triggerRewardDistribution } from '@/lib/api/hackathons';
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
  announcement: string;
  onSuccess?: () => void;
}

export const usePublishWinners = ({
  winners,
  prizeTiers,
  escrow,
  organizationId,
  hackathonId,
  announcement,
  onSuccess,
}: UsePublishWinnersProps) => {
  const [isPublishing, setIsPublishing] = useState(false);

  // Keep the idempotency key consistent across retries even if the page reloads
  const idempotencyKeyRef = useRef<string | null>(null);

  if (!idempotencyKeyRef.current) {
    if (typeof window !== 'undefined') {
      const storageKey = `publish-idempotency-${hackathonId}`;
      let key = sessionStorage.getItem(storageKey);
      if (!key) {
        key = uuidv4();
        sessionStorage.setItem(storageKey, key);
      }
      idempotencyKeyRef.current = key;
    } else {
      idempotencyKeyRef.current = uuidv4();
    }
  }

  const publishWinners = async () => {
    setIsPublishing(true);

    try {
      // 1. Initial Local Validations
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
            `Please configure prize tiers in the Rewards tab before publishing winners.`
        );
      }

      if (!escrow?.isFunded) {
        throw new Error('Escrow is not funded. Please fund the escrow first.');
      }

      // 2. Trigger Reward Distribution
      await triggerRewardDistribution(organizationId, hackathonId, {
        idempotencyKey: idempotencyKeyRef.current || uuidv4(),
        organizerNote: announcement || undefined,
      });

      toast.success(
        'Reward distribution successfully triggered! Pending admin review.'
      );

      // Cleanup idempotency key since distribution succeeded
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`publish-idempotency-${hackathonId}`);
      }

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
