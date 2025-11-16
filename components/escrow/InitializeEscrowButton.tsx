'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import {
  useInitializeEscrow,
  useSendTransaction,
} from '@trustless-work/escrow';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  InitializeMultiReleaseEscrowPayload,
  EscrowType,
  InitializeMultiReleaseEscrowResponse,
  EscrowRequestResponse,
  Status,
  MultiReleaseEscrow,
} from '@trustless-work/escrow';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

/**
 * Component to initialize a multi-release escrow using Trustless Work
 */
export const InitializeEscrowButton = () => {
  const { walletAddress } = useWalletContext();
  const { setEscrowData } = useEscrowContext();
  const { deployEscrow } = useInitializeEscrow();
  const { sendTransaction } = useSendTransaction();
  const [isLoading, setIsLoading] = useState(false);

  const handleInitializeEscrow = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Prepare the payload according to InitializeMultiReleaseEscrowPayload type
      // Based on: Omit<MultiReleaseEscrow, "contractId" | "balance" | "milestones"> & { milestones: MultiReleaseMilestonePayload[] }
      // MultiReleaseEscrow = Omit<SingleReleaseEscrow, "milestones" | "flags" | "amount" | "roles"> & { roles: Omit<Roles, "receiver"> }
      const payload: InitializeMultiReleaseEscrowPayload = {
        // Required fields from SingleReleaseEscrow (not omitted in MultiReleaseEscrow)
        signer: walletAddress, // Address of the user signing the contract transaction
        engagementId: 'mock-engagement-id-123',
        title: 'Mock Escrow Project',
        description: 'This is a mock escrow project for testing purposes',
        platformFee: 4, // Commission that the platform will receive (4%)
        trustline: {
          // USDC trustline address
          address: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
        },
        // Roles for multi-release (Omit<Roles, "receiver">)
        roles: {
          approver: walletAddress, // Address of the entity requiring the service
          serviceProvider: walletAddress, // Address of the entity providing the service
          platformAddress: walletAddress, // Address of the entity that owns the escrow
          releaseSigner: walletAddress, // Address in charge of releasing the escrow funds
          disputeResolver: walletAddress, // Address in charge of resolving disputes
          // Note: receiver is omitted in multi-release escrow roles
        },
        // Milestones as MultiReleaseMilestonePayload[]
        milestones: [
          {
            description: 'Complete initial setup and configuration',
            amount: 10000000, // Amount using decimals value (10000000 = 1 USDC if decimals is 7)
            receiver: walletAddress, // Address where milestone proceeds will be sent
          },
          {
            description: 'Implement core features and functionality',
            amount: 20000000, // 2 USDC equivalent
            receiver: walletAddress,
          },
          {
            description: 'Final testing and deployment',
            amount: 30000000, // 3 USDC equivalent
            receiver: walletAddress,
          },
        ],
      };

      // Step 2: Execute function from Trustless Work
      const escrowResponse: EscrowRequestResponse = await deployEscrow(
        payload,
        'multi-release' as EscrowType
      );

      // Type guard: Check if response is successful
      if (
        escrowResponse.status !== ('SUCCESS' as Status) ||
        !escrowResponse.unsignedTransaction
      ) {
        const errorMessage =
          'message' in escrowResponse &&
          typeof escrowResponse.message === 'string'
            ? escrowResponse.message
            : 'Failed to initialize escrow';
        throw new Error(errorMessage);
      }

      const { unsignedTransaction } = escrowResponse;

      // Step 3: Sign transaction with wallet
      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress,
      });

      // Step 4: Send transaction
      const sendResponse = await sendTransaction(signedXdr);

      // Type guard: Check if response is successful and has contractId
      if (
        'status' in sendResponse &&
        sendResponse.status !== ('SUCCESS' as Status)
      ) {
        const errorMessage =
          'message' in sendResponse && typeof sendResponse.message === 'string'
            ? sendResponse.message
            : 'Failed to send transaction';
        throw new Error(errorMessage);
      }

      // Type assertion: Response should be InitializeMultiReleaseEscrowResponse after successful send
      if (!('contractId' in sendResponse) || !('escrow' in sendResponse)) {
        throw new Error('Response does not contain contractId or escrow');
      }

      const responseData = sendResponse as InitializeMultiReleaseEscrowResponse;
      const contractIdValue = responseData.contractId;
      const escrowData = responseData.escrow as MultiReleaseEscrow;

      if (contractIdValue && escrowData) {
        // Log escrow data for debugging
        // Validate that escrow has milestones
        if (!escrowData.milestones || escrowData.milestones.length === 0) {
          throw new Error(
            'Escrow initialized without milestones. Please try again.'
          );
        }

        // Store the full escrow object and contractId in context
        setEscrowData(contractIdValue, escrowData);
        toast.success('Escrow initialized successfully!');
      } else {
        throw new Error('Missing contractId or escrow in response');
      }
    } catch {
      toast.error('Failed to initialize escrow');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleInitializeEscrow}
      disabled={isLoading || !walletAddress}
      className='min-w-[200px]'
    >
      {isLoading ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Initializing Escrow...
        </>
      ) : (
        'Initialize Multi-Release Escrow'
      )}
    </Button>
  );
};
