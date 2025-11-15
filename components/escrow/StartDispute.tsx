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
import { useStartDispute, useSendTransaction } from '@trustless-work/escrow';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  MultiReleaseStartDisputePayload,
  EscrowType,
  EscrowRequestResponse,
  Status,
  MultiReleaseEscrow,
  MultiReleaseMilestone,
} from '@trustless-work/escrow';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

/**
 * Component to start disputes for milestones in a multi-release escrow
 */
export const StartDispute = () => {
  const { walletAddress } = useWalletContext();
  const { contractId, escrow, updateEscrow } = useEscrowContext();
  const { startDispute } = useStartDispute();
  const { sendTransaction } = useSendTransaction();
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [disputedMilestones, setDisputedMilestones] = useState<Set<number>>(
    new Set()
  );

  if (!contractId || !escrow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Start Dispute</CardTitle>
          <CardDescription>
            Please initialize an escrow first before starting a dispute.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!escrow.milestones || escrow.milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Start Dispute</CardTitle>
          <CardDescription>
            This escrow does not have milestones.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleStartDispute = async (milestoneIndex: number) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    const milestone = escrow.milestones[milestoneIndex];
    if (!milestone) {
      toast.error('Milestone not found');
      return;
    }

    // Check if milestone is already in dispute
    if (milestone.flags?.disputed) {
      toast.error('This milestone is already in dispute');
      return;
    }

    setIsLoading(milestoneIndex);

    try {
      // Step 1: Prepare the payload according to MultiReleaseStartDisputePayload type
      const payload: MultiReleaseStartDisputePayload = {
        contractId: contractId,
        milestoneIndex: milestoneIndex.toString(),
        signer: walletAddress,
      };

      // Step 2: Execute function from Trustless Work
      const disputeResponse: EscrowRequestResponse = await startDispute(
        payload,
        'multi-release' as EscrowType
      );

      // Type guard: Check if response is successful
      if (
        disputeResponse.status !== ('SUCCESS' as Status) ||
        !disputeResponse.unsignedTransaction
      ) {
        const errorMessage =
          'message' in disputeResponse &&
          typeof disputeResponse.message === 'string'
            ? disputeResponse.message
            : 'Failed to start dispute';
        throw new Error(errorMessage);
      }

      const { unsignedTransaction } = disputeResponse;

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
              disputed: true,
            },
          };
        }

        const updatedEscrow: MultiReleaseEscrow = {
          ...escrow,
          milestones: updatedMilestones,
        };

        updateEscrow(updatedEscrow);
      }

      // Add to disputed milestones set
      setDisputedMilestones(prev => new Set(prev).add(milestoneIndex));

      // Display confirmation message
      toast.success(
        `Dispute for Milestone ${milestoneIndex + 1} has been started successfully!`,
        {
          duration: 5000,
        }
      );
    } catch {
      toast.error('Failed to start dispute');
    } finally {
      setIsLoading(null);
    }
  };

  const formatAmount = (amount: number): string => {
    return amount.toString();
  };

  const isMilestoneDisputed = (
    milestone: MultiReleaseMilestone,
    index: number
  ): boolean => {
    return milestone.flags?.disputed === true || disputedMilestones.has(index);
  };

  const canStartDispute = (milestone: MultiReleaseMilestone): boolean => {
    return (
      milestone.flags?.disputed !== true && milestone.flags?.released !== true
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start Dispute</CardTitle>
        <CardDescription>
          Start a dispute for milestones in your multi-release escrow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {escrow.milestones.map(
            (milestone: MultiReleaseMilestone, index: number) => {
              const isDisputed = isMilestoneDisputed(milestone, index);
              const canDispute = canStartDispute(milestone);
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
                        {milestone.flags?.approved && (
                          <Badge
                            variant='default'
                            className='flex items-center gap-1 bg-green-600'
                          >
                            <CheckCircle2 className='h-3 w-3' />
                            Approved
                          </Badge>
                        )}
                        {isDisputed && (
                          <Badge
                            variant='default'
                            className='flex items-center gap-1 bg-orange-600'
                          >
                            <AlertTriangle className='h-3 w-3' />
                            In Dispute
                          </Badge>
                        )}
                        {milestone.flags?.released && (
                          <Badge
                            variant='default'
                            className='flex items-center gap-1 bg-blue-600'
                          >
                            <CheckCircle2 className='h-3 w-3' />
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

                  {isDisputed && (
                    <div className='mt-4 rounded border border-orange-200 bg-orange-50 p-3'>
                      <div className='flex items-center gap-2 text-sm text-orange-800'>
                        <AlertTriangle className='h-4 w-4' />
                        <span className='font-medium'>
                          This milestone is currently in dispute
                        </span>
                      </div>
                    </div>
                  )}

                  {!isDisputed && canDispute && (
                    <div className='mt-4'>
                      <Button
                        variant='default'
                        size='sm'
                        onClick={() => handleStartDispute(index)}
                        disabled={isMilestoneLoading || !walletAddress}
                        className='bg-orange-600 text-white hover:bg-orange-700'
                      >
                        {isMilestoneLoading ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Starting Dispute...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className='mr-2 h-4 w-4' />
                            Start Dispute
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {!isDisputed && !canDispute && (
                    <div className='mt-4 rounded border border-yellow-200 bg-yellow-50 p-3'>
                      <div className='flex items-center gap-2 text-sm text-yellow-800'>
                        <XCircle className='h-4 w-4' />
                        <span className='font-medium'>
                          This milestone cannot be disputed (funds already
                          released)
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
