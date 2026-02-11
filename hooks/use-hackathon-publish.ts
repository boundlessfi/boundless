import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { getTotalPrizePoolForFunding } from '@/lib/utils/hackathon-escrow';
import type { Hackathon } from '@/lib/api/hackathons';
import type { RewardsFormData } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import type { InfoFormData } from '@/components/organization/hackathons/new/tabs/schemas/infoSchema';
import type { TimelineFormData } from '@/components/organization/hackathons/new/tabs/schemas/timelineSchema';
import type { ParticipantFormData } from '@/components/organization/hackathons/new/tabs/schemas/participantSchema';
import type { JudgingFormData } from '@/components/organization/hackathons/new/tabs/schemas/judgingSchema';
import type { CollaborationFormData } from '@/components/organization/hackathons/new/tabs/schemas/collaborationSchema';

interface StepData {
  information?: InfoFormData;
  timeline?: TimelineFormData;
  participation?: ParticipantFormData;
  rewards?: RewardsFormData;
  judging?: JudgingFormData;
  collaboration?: CollaborationFormData;
}

interface UseHackathonPublishProps {
  organizationId: string;
  stepData: StepData;
  draftId?: string | null;
  publishDraftAction: (
    draftId: string,
    organizationId: string
  ) => Promise<Hackathon>;
}

export const useHackathonPublish = ({
  organizationId,
  stepData,
  draftId,
  publishDraftAction,
}: UseHackathonPublishProps) => {
  const router = useRouter();
  const { walletAddress } = useWalletContext();
  const [isPublishing, setIsPublishing] = useState(false);

  const publish = async () => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }

    if (
      !stepData.information ||
      !stepData.timeline ||
      !stepData.participation ||
      !stepData.rewards ||
      !stepData.judging ||
      !stepData.collaboration
    ) {
      toast.error('Please complete all steps before publishing');
      return;
    }

    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (
      !stepData.rewards.prizeTiers ||
      stepData.rewards.prizeTiers.length === 0
    ) {
      toast.error('Please add at least one prize tier before publishing');
      return;
    }

    const totalPrizeAmount = getTotalPrizePoolForFunding(stepData.rewards);
    if (totalPrizeAmount === 0) {
      toast.error('Total prize amount must be greater than zero');
      return;
    }

    if (!draftId) {
      toast.error('Draft ID is required');
      return;
    }

    setIsPublishing(true);

    try {
      toast.info('Publishing hackathon...');
      // The backend now handles the custodial wallet and escrow logic
      const hackathon = await publishDraftAction(draftId, organizationId);

      toast.success('Hackathon published successfully!');

      if (organizationId && hackathon.id) {
        setTimeout(() => {
          router.push(
            `/organizations/${organizationId}/hackathons/${hackathon.id}`
          );
        }, 1500);
      }
    } catch (error) {
      let errorMessage = 'Failed to publish hackathon';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      throw error;
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    isPublishing,
    publish,
  };
};
