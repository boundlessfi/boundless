import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  useInitializeEscrow,
  useFundEscrow,
  useSendTransaction,
} from '@trustless-work/escrow';
import {
  EscrowType,
  EscrowRequestResponse,
  Status,
  InitializeMultiReleaseEscrowResponse,
  FundEscrowPayload,
} from '@trustless-work/escrow';
import {
  createHackathonEscrow,
  getTotalPrizePoolForFunding,
} from '@/lib/utils/hackathon-escrow';
import { transformToApiFormat } from '@/lib/utils/hackathon-form-transforms';
import type { PublishHackathonRequest } from '@/lib/api/hackathons';
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
  publishHackathonAction: (
    data: PublishHackathonRequest
  ) => Promise<{ _id: string }>;
}

export const useHackathonPublish = ({
  organizationId,
  stepData,
  draftId,
  publishHackathonAction,
}: UseHackathonPublishProps) => {
  const router = useRouter();
  const { walletAddress } = useWalletContext();
  const { deployEscrow } = useInitializeEscrow();
  const { fundEscrow } = useFundEscrow();
  const { sendTransaction } = useSendTransaction();
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

    setIsPublishing(true);
    let contractId: string | undefined;

    try {
      toast.info('Creating escrow contract...');
      const escrowPayload = createHackathonEscrow({
        signer: 'GA2XHHR6RMQXPYQGUGXMOAGC5N5RFPM4HPUPOZJCHOO6LINM7DJIQFFJ',
        organizationAddress:
          'GA2XHHR6RMQXPYQGUGXMOAGC5N5RFPM4HPUPOZJCHOO6LINM7DJIQFFJ',
        hackathonTitle: stepData.information.name || 'Hackathon',
        hackathonDescription: stepData.information.description || '',
        rewards: stepData.rewards,
      });

      const escrowResponse: EscrowRequestResponse = await deployEscrow(
        escrowPayload,
        'multi-release' as EscrowType
      );

      if (
        escrowResponse.status !== ('SUCCESS' as Status) ||
        !escrowResponse.unsignedTransaction
      ) {
        const errorMessage =
          'message' in escrowResponse &&
          typeof escrowResponse.message === 'string'
            ? escrowResponse.message
            : 'Failed to create escrow';
        throw new Error(errorMessage);
      }

      toast.info('Please sign the escrow deployment transaction...');
      const signedEscrowXdr = await signTransaction({
        unsignedTransaction: escrowResponse.unsignedTransaction,
        address: walletAddress,
      });

      const escrowSendResponse = await sendTransaction(signedEscrowXdr);

      if (
        'status' in escrowSendResponse &&
        escrowSendResponse.status !== ('SUCCESS' as Status)
      ) {
        const errorMessage =
          'message' in escrowSendResponse &&
          typeof escrowSendResponse.message === 'string'
            ? escrowSendResponse.message
            : 'Failed to deploy escrow';
        throw new Error(errorMessage);
      }

      const escrowData =
        escrowSendResponse as InitializeMultiReleaseEscrowResponse;
      contractId = escrowData.contractId;
      const escrowAddress = escrowData.contractId;
      const transactionHash = escrowData.contractId;

      toast.info('Funding escrow with prize pool...');
      const fundPayload: FundEscrowPayload = {
        contractId: contractId,
        signer: 'GA2XHHR6RMQXPYQGUGXMOAGC5N5RFPM4HPUPOZJCHOO6LINM7DJIQFFJ',
        amount: totalPrizeAmount,
      };

      const fundResponse: EscrowRequestResponse = await fundEscrow(
        fundPayload,
        'multi-release' as EscrowType
      );

      if (
        fundResponse.status !== ('SUCCESS' as Status) ||
        !fundResponse.unsignedTransaction
      ) {
        const errorMessage =
          'message' in fundResponse && typeof fundResponse.message === 'string'
            ? fundResponse.message
            : 'Failed to fund escrow';
        throw new Error(errorMessage);
      }

      toast.info('Please sign the funding transaction...');
      const signedFundXdr = await signTransaction({
        unsignedTransaction: fundResponse.unsignedTransaction,
        address: 'GA2XHHR6RMQXPYQGUGXMOAGC5N5RFPM4HPUPOZJCHOO6LINM7DJIQFFJ',
      });

      const fundSendResponse = await sendTransaction(signedFundXdr);

      if (
        'status' in fundSendResponse &&
        fundSendResponse.status !== ('SUCCESS' as Status)
      ) {
        const errorMessage =
          'message' in fundSendResponse &&
          typeof fundSendResponse.message === 'string'
            ? fundSendResponse.message
            : 'Failed to fund escrow';
        throw new Error(errorMessage);
      }

      toast.info('Publishing hackathon...');
      const apiData = transformToApiFormat(stepData) as PublishHackathonRequest;
      if (draftId) {
        apiData.draftId = draftId;
      }
      apiData.contractId = contractId;
      apiData.escrowAddress = escrowAddress;
      apiData.transactionHash = transactionHash;
      apiData.escrowDetails = {
        totalPrizeAmount: totalPrizeAmount,
        placeholderMilestone: true,
        winnerMilestonesToBeAdded: true,
      };

      const hackathon = await publishHackathonAction(apiData);
      toast.success('Hackathon published successfully!');

      if (organizationId && hackathon._id) {
        setTimeout(() => {
          router.push(
            `/organizations/${organizationId}/hackathons/${hackathon._id}`
          );
        }, 1500);
      }
    } catch {
      toast.error('Failed to publish hackathon');

      throw new Error('Failed to publish hackathon');
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    isPublishing,
    publish,
  };
};
