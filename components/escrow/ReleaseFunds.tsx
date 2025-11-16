'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import { useReleaseFunds, useSendTransaction } from '@trustless-work/escrow';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  MultiReleaseReleaseFundsPayload,
  EscrowType,
  EscrowRequestResponse,
  Status,
  MultiReleaseEscrow,
  MultiReleaseMilestone,
} from '@trustless-work/escrow';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, DollarSign, XCircle } from 'lucide-react';

/**
 * Component to release funds for approved milestones in a multi-release escrow
 */
export const ReleaseFunds = () => {
  const { walletAddress } = useWalletContext();
  const { contractId, escrow, updateEscrow } = useEscrowContext();
  const { releaseFunds } = useReleaseFunds();
  const { sendTransaction } = useSendTransaction();
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [releasedMilestones, setReleasedMilestones] = useState<Set<number>>(
    new Set()
  );

  if (!contractId || !escrow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Release Funds</CardTitle>
          <CardDescription>
            Please initialize an escrow first before releasing funds.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!escrow.milestones || escrow.milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Release Funds</CardTitle>
          <CardDescription>
            This escrow does not have milestones.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!escrow.roles.releaseSigner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Release Funds</CardTitle>
          <CardDescription>
            Release signer address not found in escrow.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleReleaseFunds = async (milestoneIndex: number) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    const milestone = escrow.milestones[milestoneIndex];
    if (!milestone) {
      toast.error('Milestone not found');
      return;
    }

    // Check if milestone is approved
    if (!milestone.flags?.approved) {
      toast.error('Milestone must be approved before funds can be released');
      return;
    }

    setIsLoading(milestoneIndex);

    try {
      // Step 1: Prepare the payload according to MultiReleaseReleaseFundsPayload type
      const payload: MultiReleaseReleaseFundsPayload = {
        contractId: contractId,
        milestoneIndex: milestoneIndex.toString(),
        releaseSigner: escrow.roles.releaseSigner,
      };

      // Step 2: Execute function from Trustless Work
      const releaseResponse: EscrowRequestResponse = await releaseFunds(
        payload,
        'multi-release' as EscrowType
      );

      // Type guard: Check if response is successful
      if (
        releaseResponse.status !== ('SUCCESS' as Status) ||
        !releaseResponse.unsignedTransaction
      ) {
        const errorMessage =
          'message' in releaseResponse &&
          typeof releaseResponse.message === 'string'
            ? releaseResponse.message
            : 'Failed to release funds';
        throw new Error(errorMessage);
      }

      const { unsignedTransaction } = releaseResponse;

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

      // Update escrow data in context
      if (escrow) {
        const updatedMilestones = [...escrow.milestones];
        if (updatedMilestones[milestoneIndex]) {
          updatedMilestones[milestoneIndex] = {
            ...updatedMilestones[milestoneIndex],
            flags: {
              ...updatedMilestones[milestoneIndex].flags,
              released: true,
            },
          };
        }

        const updatedEscrow: MultiReleaseEscrow = {
          ...escrow,
          milestones: updatedMilestones,
        };

        updateEscrow(updatedEscrow);
      }

      // Add to released milestones set
      setReleasedMilestones(prev => new Set(prev).add(milestoneIndex));

      // Display success message
      toast.success(
        `Funds for Milestone ${milestoneIndex + 1} have been released successfully!`,
        {
          duration: 5000,
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to release funds';
      toast.error(errorMessage);
    } finally {
      setIsLoading(null);
    }
  };

  const formatAmount = (amount: number): string => {
    return amount.toString();
  };

  const isMilestoneReleased = (
    milestone: MultiReleaseMilestone,
    index: number
  ): boolean => {
    return milestone.flags?.released === true || releasedMilestones.has(index);
  };

  const canReleaseMilestone = (milestone: MultiReleaseMilestone): boolean => {
    return (
      milestone.flags?.approved === true && milestone.flags?.released !== true
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Release Funds</CardTitle>
        <CardDescription>
          Release funds for approved milestones in your multi-release escrow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {escrow.milestones.map(
            (milestone: MultiReleaseMilestone, index: number) => {
              const isReleased = isMilestoneReleased(milestone, index);
              const canRelease = canReleaseMilestone(milestone);
              const isMilestoneLoading = isLoading === index;

              return (
                <div
                  key={index}
                  className='rounded-lg border border-gray-200 bg-gray-50 p-4'
                >
                  <div className='mb-4 flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center gap-2'>
                        <Badge variant='outline' className='font-mono'>
                          Milestone {index + 1}
                        </Badge>
                        {milestone.flags?.approved ? (
                          <Badge
                            variant='default'
                            className='flex items-center gap-1 bg-green-600'
                          >
                            <CheckCircle2 className='h-3 w-3' />
                            Approved
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='flex items-center gap-1 border-gray-300 bg-gray-100 text-gray-800'
                          >
                            <XCircle className='h-3 w-3' />
                            Not Approved
                          </Badge>
                        )}
                        {isReleased && (
                          <Badge
                            variant='default'
                            className='flex items-center gap-1 bg-blue-600'
                          >
                            <DollarSign className='h-3 w-3' />
                            Funds Released
                          </Badge>
                        )}
                      </div>
                      <p className='mb-2 text-sm text-gray-700'>
                        {milestone.description}
                      </p>
                      <div className='flex items-center gap-4 text-xs text-gray-500'>
                        <span>
                          Amount:{' '}
                          <span className='font-mono'>
                            {formatAmount(milestone.amount)}
                          </span>
                        </span>
                        <span>
                          Receiver:{' '}
                          <span className='font-mono'>
                            {milestone.receiver.slice(0, 8)}...
                          </span>
                        </span>
                      </div>
                      {milestone.evidence && (
                        <div className='mt-2 rounded bg-white p-2 text-xs text-gray-600'>
                          <span className='font-medium'>Evidence:</span>{' '}
                          {milestone.evidence}
                        </div>
                      )}
                      {milestone.status && (
                        <div className='mt-2 text-xs text-gray-500'>
                          <span className='font-medium'>Status:</span>{' '}
                          {milestone.status}
                        </div>
                      )}
                    </div>
                  </div>

                  {isReleased && (
                    <div className='mt-4 rounded border border-blue-200 bg-blue-50 p-3'>
                      <div className='flex items-center gap-2 text-sm text-blue-800'>
                        <CheckCircle2 className='h-4 w-4' />
                        <span className='font-medium'>
                          Funds for this milestone have been released
                        </span>
                      </div>
                    </div>
                  )}

                  {!isReleased && canRelease && (
                    <div className='mt-4'>
                      <Button
                        variant='default'
                        size='sm'
                        onClick={() => handleReleaseFunds(index)}
                        disabled={isMilestoneLoading || !walletAddress}
                        className='bg-blue-600 text-white hover:bg-blue-700'
                      >
                        {isMilestoneLoading ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Releasing Funds...
                          </>
                        ) : (
                          <>
                            <DollarSign className='mr-2 h-4 w-4' />
                            Release Funds
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {!isReleased && !canRelease && (
                    <div className='mt-4 rounded border border-yellow-200 bg-yellow-50 p-3'>
                      <div className='flex items-center gap-2 text-sm text-yellow-800'>
                        <XCircle className='h-4 w-4' />
                        <span className='font-medium'>
                          This milestone must be approved before funds can be
                          released
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </CardContent>
    </Card>
  );
};
