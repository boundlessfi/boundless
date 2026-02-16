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

export interface PublishResponseData {
  id: string;
  slug: string;
  publishedAt: string;
  message: string;
  escrowAddress: string;
  transactionHash: string | null;
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
  const [publishResponse, setPublishResponse] =
    useState<PublishResponseData | null>(null);

  const publish = async (): Promise<PublishResponseData | null> => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return null;
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
      return null;
    }

    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return null;
    }

    if (
      !stepData.rewards.prizeTiers ||
      stepData.rewards.prizeTiers.length === 0
    ) {
      toast.error('Please add at least one prize tier before publishing');
      return null;
    }

    const totalPrizeAmount = getTotalPrizePoolForFunding(stepData.rewards);
    if (totalPrizeAmount === 0) {
      toast.error('Total prize amount must be greater than zero');
      return null;
    }

    if (!draftId) {
      toast.error('Draft ID is required');
      return null;
    }

    setIsPublishing(true);

    try {
      toast.info('Publishing hackathon...');
      // The backend now handles the custodial wallet and escrow logic
      const response = await publishDraftAction(draftId, organizationId);

      // Handle different response formats
      // Could be: { success, message, data: {...} } or direct Hackathon object
      let hackathon = response;

      if (!hackathon || !hackathon.id) {
        throw new Error('Invalid publish response: missing hackathon ID');
      }

      // Prepare response data from hackathon object
      const responseData: PublishResponseData = {
        id: hackathon.id,
        slug: hackathon.slug || '',
        publishedAt: hackathon.publishedAt || new Date().toISOString(),
        message: hackathon.message || 'Hackathon published successfully',
        escrowAddress: hackathon.escrowAddress || '',
        transactionHash: hackathon.transactionHash || null,
      };

      setPublishResponse(responseData);

      // Show success toast with hackathon ID
      toast.success(`Hackathon published! ID: ${responseData.id}`, {
        duration: 4000,
      });

      return responseData;
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
    publishResponse,
  };
};
