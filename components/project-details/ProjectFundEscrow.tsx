'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import {
  useFundEscrow,
  useSendTransaction,
  useGetEscrowFromIndexerByContractIds,
} from '@trustless-work/escrow';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  FundEscrowPayload,
  EscrowType,
  EscrowRequestResponse,
  Status,
  MultiReleaseEscrow,
  GetEscrowFromIndexerByContractIdsParams,
} from '@trustless-work/escrow';
import { toast } from 'sonner';

// Extended type to include balance property that may exist at runtime
// Using intersection type to avoid type conflicts with required balance property
type MultiReleaseEscrowWithBalance = MultiReleaseEscrow & {
  balance?: number;
};
import { Loader2, CheckCircle2, DollarSign, AlertCircle } from 'lucide-react';
import { fundCrowdfundingProject } from '@/lib/api/project';

interface ProjectFundEscrowProps {
  projectId: string;
  contractId: string;
  onSuccess?: () => void;
}

/**
 * Component to fund escrow for a specific project
 * Fetches escrow data and allows funding
 */
export const ProjectFundEscrow = ({
  projectId,
  contractId,
  onSuccess,
}: ProjectFundEscrowProps) => {
  const { walletAddress } = useWalletContext();
  const {
    escrow: contextEscrow,
    setEscrowData,
    updateEscrow,
  } = useEscrowContext();
  const { fundEscrow } = useFundEscrow();
  const { sendTransaction } = useSendTransaction();
  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEscrow, setIsFetchingEscrow] = useState(false);
  const [escrow, setEscrow] = useState<MultiReleaseEscrow | null>(null);
  const [fundingStatus, setFundingStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch escrow data if not in context
  useEffect(() => {
    const fetchEscrowData = async () => {
      // Check if escrow is already in context with matching contractId
      if (contextEscrow && contractId) {
        setEscrow(contextEscrow);
        return;
      }

      if (!contractId) {
        return;
      }

      setIsFetchingEscrow(true);
      try {
        const params: GetEscrowFromIndexerByContractIdsParams = {
          contractIds: [contractId],
        };

        const response = await getEscrowByContractIds(params);

        // Handle both array response and object with escrows property
        let escrows: MultiReleaseEscrow[] = [];

        if (Array.isArray(response)) {
          escrows = response as MultiReleaseEscrow[];
        } else if (
          response &&
          typeof response === 'object' &&
          'escrows' in response
        ) {
          escrows =
            (response as { escrows: MultiReleaseEscrow[] }).escrows || [];
        }

        if (escrows.length > 0) {
          const escrowData = escrows[0] as MultiReleaseEscrow;
          setEscrow(escrowData);
          // Also set in context for future use
          if (escrowData) {
            setEscrowData(contractId, escrowData);
          }
        }
      } catch {
        toast.error('Failed to fetch escrow data');
      } finally {
        setIsFetchingEscrow(false);
      }
    };

    fetchEscrowData();
  }, [contractId, contextEscrow, getEscrowByContractIds, setEscrowData]);

  // Calculate total amount from all milestones
  const calculateTotalAmount = (): number => {
    if (!escrow || !escrow.milestones) {
      return 0;
    }
    return escrow.milestones.reduce((total, milestone) => {
      return total + (milestone.amount || 0);
    }, 0);
  };

  const handleFundEscrow = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!contractId) {
      toast.error('No escrow contract found for this project.');
      return;
    }

    if (!escrow) {
      toast.error('No escrow data found. Please try again.');
      return;
    }

    // Validate that escrow has milestones
    if (!escrow.milestones || escrow.milestones.length === 0) {
      toast.error('Escrow does not have milestones.');
      return;
    }

    setIsLoading(true);
    setFundingStatus(null);

    try {
      // Calculate total amount from milestones
      const totalAmount = calculateTotalAmount();

      if (totalAmount === 0) {
        throw new Error(
          'Total amount is zero. Please check milestone amounts.'
        );
      }

      // Step 1: Prepare the payload according to FundEscrowPayload type
      const payload: FundEscrowPayload = {
        contractId: contractId,
        signer: walletAddress,
        amount: totalAmount,
      };

      // Step 2: Execute function from Trustless Work
      const fundResponse: EscrowRequestResponse = await fundEscrow(
        payload,
        'multi-release' as EscrowType
      );

      // Type guard: Check if response is successful
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

      const { unsignedTransaction } = fundResponse;

      // Step 3: Sign transaction with wallet
      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress,
      });

      // Step 4: Send transaction
      const sendResponse = await sendTransaction(signedXdr);

      // Type guard: Check if response is successful
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

      // Extract transaction hash
      const transactionHash = contractId; // Using contractId as identifier

      // Update escrow balance in context
      if (escrow) {
        const escrowWithBalance = escrow as MultiReleaseEscrowWithBalance;
        const currentBalance = escrowWithBalance.balance || 0;
        const updatedEscrow: MultiReleaseEscrowWithBalance = {
          ...escrow,
          balance: currentBalance + totalAmount,
        };
        updateEscrow(updatedEscrow as MultiReleaseEscrow);
        setEscrow(updatedEscrow);
      }

      // Notify backend about the funding
      try {
        await fundCrowdfundingProject(projectId, {
          amount: totalAmount,
          transactionHash,
        });
      } catch {
        // Don't fail the whole operation if backend notification fails
        toast.warning(
          'Escrow funded, but failed to update project. Please refresh the page.'
        );
      }

      // Display success status
      const successMessage = 'Escrow funded successfully!';
      setFundingStatus({
        success: true,
        message: successMessage,
      });

      toast.success('Project funded successfully!');

      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setFundingStatus({
        success: false,
        message: 'Failed to fund escrow',
      });

      toast.error('Failed to fund escrow');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number): string => {
    return amount.toString();
  };

  const totalAmount = calculateTotalAmount();

  if (isFetchingEscrow) {
    return (
      <Card>
        <CardContent className='py-6'>
          <div className='flex items-center justify-center gap-2'>
            <Loader2 className='h-5 w-5 animate-spin text-gray-400' />
            <span className='text-sm text-gray-400'>
              Loading escrow data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fundingStatus) {
    return (
      <Card
        className={
          fundingStatus.success
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        }
      >
        <CardHeader>
          <div className='flex items-center gap-2'>
            {fundingStatus.success ? (
              <CheckCircle2 className='h-5 w-5 text-green-600' />
            ) : (
              <AlertCircle className='h-5 w-5 text-red-600' />
            )}
            <CardTitle
              className={
                fundingStatus.success ? 'text-green-800' : 'text-red-800'
              }
            >
              {fundingStatus.success
                ? 'Project Funded Successfully!'
                : 'Funding Failed'}
            </CardTitle>
          </div>
          <CardDescription
            className={
              fundingStatus.success ? 'text-green-700' : 'text-red-700'
            }
          >
            {fundingStatus.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!escrow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fund Project</CardTitle>
          <CardDescription>
            Escrow data not found for this project.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!escrow.milestones || escrow.milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fund Project</CardTitle>
          <CardDescription>
            This project's escrow does not have milestones configured.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Fund Project Escrow</CardTitle>
          <CardDescription>
            Fund the escrow to support this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  Total Funding Amount:
                </span>
                <span className='font-mono text-lg font-semibold'>
                  {formatAmount(totalAmount)}
                </span>
              </div>
              <p className='text-xs text-gray-500'>
                This amount is the sum of all milestone amounts (
                {escrow.milestones.length} milestones)
              </p>
            </div>

            <Button
              onClick={handleFundEscrow}
              disabled={isLoading || !walletAddress || totalAmount === 0}
              className='w-full'
              size='lg'
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Funding Project...
                </>
              ) : (
                <>
                  <DollarSign className='mr-2 h-4 w-4' />
                  Fund Project
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
