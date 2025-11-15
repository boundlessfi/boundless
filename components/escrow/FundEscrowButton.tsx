'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import { useFundEscrow, useSendTransaction } from '@trustless-work/escrow';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  FundEscrowPayload,
  EscrowType,
  EscrowRequestResponse,
  Status,
  MultiReleaseEscrow,
} from '@trustless-work/escrow';
import { toast } from 'sonner';

// Extended type to include balance property that may exist at runtime
// Using intersection type to avoid type conflicts with required balance property
type MultiReleaseEscrowWithBalance = MultiReleaseEscrow & {
  balance?: number;
};
import { Loader2, CheckCircle2, DollarSign } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Component to fund an existing multi-release escrow using Trustless Work
 */
export const FundEscrowButton = () => {
  const { walletAddress } = useWalletContext();
  const { contractId, escrow, updateEscrow } = useEscrowContext();
  const { fundEscrow } = useFundEscrow();
  const { sendTransaction } = useSendTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [fundingStatus, setFundingStatus] = useState<{
    success: boolean;
    message: string;
    transactionHash?: string;
  } | null>(null);

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
      toast.error(
        'No escrow contract found. Please initialize an escrow first.'
      );
      return;
    }

    if (!escrow) {
      toast.error('No escrow data found. Please initialize an escrow first.');
      return;
    }

    // Validate that escrow has milestones
    if (!escrow.milestones || escrow.milestones.length === 0) {
      toast.error(
        'Escrow does not have milestones. Please initialize an escrow with milestones first.'
      );
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

      // Log payload for debugging
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

      // Update escrow balance in context
      if (escrow) {
        // Balance may not be in the type, so we use type assertion
        const escrowWithBalance = escrow as MultiReleaseEscrowWithBalance;
        const currentBalance = escrowWithBalance.balance || 0;
        const updatedEscrow: MultiReleaseEscrowWithBalance = {
          ...escrow,
          balance: currentBalance + totalAmount,
        };
        updateEscrow(updatedEscrow as MultiReleaseEscrow);
      }

      // Display success status
      const successMessage =
        'message' in sendResponse && typeof sendResponse.message === 'string'
          ? sendResponse.message
          : 'Escrow funded successfully!';

      setFundingStatus({
        success: true,
        message: successMessage,
      });

      toast.success('Escrow funded successfully!');
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
    // Display amount as-is without conversion
    return amount.toString();
  };

  const totalAmount = calculateTotalAmount();

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
              <Loader2 className='h-5 w-5 text-red-600' />
            )}
            <CardTitle
              className={
                fundingStatus.success ? 'text-green-800' : 'text-red-800'
              }
            >
              {fundingStatus.success
                ? 'Escrow Funded Successfully!'
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
        {fundingStatus.success && escrow && (
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  Previous Balance:
                </span>
                <span className='font-mono text-sm'>
                  {formatAmount(
                    ((escrow as MultiReleaseEscrowWithBalance).balance || 0) -
                      totalAmount
                  )}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  Funded Amount:
                </span>
                <span className='font-mono text-sm text-green-700'>
                  +{formatAmount(totalAmount)}
                </span>
              </div>
              <div className='flex items-center justify-between border-t border-gray-200 pt-2'>
                <span className='text-sm font-bold text-gray-900'>
                  New Balance:
                </span>
                <span className='font-mono text-sm font-bold text-green-700'>
                  {formatAmount(
                    (escrow as MultiReleaseEscrowWithBalance).balance || 0
                  )}
                </span>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setFundingStatus(null)}
              className='mt-4'
            >
              Fund Again
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  if (!contractId || !escrow) {
    return (
      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
        <p className='text-sm text-gray-600'>
          Please initialize an escrow first before funding.
        </p>
      </div>
    );
  }

  // Check if escrow has milestones
  if (!escrow.milestones || escrow.milestones.length === 0) {
    return (
      <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
        <p className='text-sm font-medium text-red-800'>
          Error: Escrow initialized without milestones
        </p>
        <p className='mt-2 text-xs text-red-600'>
          This escrow was initialized without milestones. Please initialize a
          new escrow with milestones.
        </p>
      </div>
    );
  }

  return (
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
        className='min-w-[200px]'
        size='lg'
      >
        {isLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Funding Escrow...
          </>
        ) : (
          <>
            <DollarSign className='mr-2 h-4 w-4' />
            Fund Escrow
          </>
        )}
      </Button>
    </div>
  );
};
