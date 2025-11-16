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
import { useResolveDispute, useSendTransaction } from '@trustless-work/escrow';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  MultiReleaseResolveDisputePayload,
  EscrowType,
  EscrowRequestResponse,
  Status,
  MultiReleaseEscrow,
  MultiReleaseMilestone,
} from '@trustless-work/escrow';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scale,
} from 'lucide-react';

/**
 * Component to resolve disputes for milestones in a multi-release escrow
 */
export const ResolveDispute = () => {
  const { walletAddress } = useWalletContext();
  const { contractId, escrow, updateEscrow } = useEscrowContext();
  const { resolveDispute } = useResolveDispute();
  const { sendTransaction } = useSendTransaction();
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [resolvedMilestones, setResolvedMilestones] = useState<Set<number>>(
    new Set()
  );

  if (!contractId || !escrow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resolve Dispute</CardTitle>
          <CardDescription>
            Please initialize an escrow first before resolving disputes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!escrow.milestones || escrow.milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resolve Dispute</CardTitle>
          <CardDescription>
            This escrow does not have milestones.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!escrow.roles.disputeResolver) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resolve Dispute</CardTitle>
          <CardDescription>
            Dispute resolver address not found in escrow.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleResolveDispute = async (milestoneIndex: number) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    const milestone = escrow.milestones[milestoneIndex];
    if (!milestone) {
      toast.error('Milestone not found');
      return;
    }

    // Check if milestone is in dispute
    if (!milestone.flags?.disputed) {
      toast.error('This milestone is not in dispute');
      return;
    }

    // Check if dispute is already resolved
    if (milestone.flags?.resolved) {
      toast.error('This dispute has already been resolved');
      return;
    }

    setIsLoading(milestoneIndex);

    try {
      // Step 1: Prepare the payload according to MultiReleaseResolveDisputePayload type
      // Distributions must include the milestone receiver and amount
      const payload: MultiReleaseResolveDisputePayload = {
        contractId: contractId,
        milestoneIndex: milestoneIndex.toString(),
        disputeResolver: escrow.roles.disputeResolver,
        distributions: [
          {
            address: milestone.receiver,
            amount: milestone.amount,
          },
        ],
      };

      // Step 2: Execute function from Trustless Work
      const resolveResponse: EscrowRequestResponse = await resolveDispute(
        payload,
        'multi-release' as EscrowType
      );

      // Type guard: Check if response is successful
      if (
        resolveResponse.status !== ('SUCCESS' as Status) ||
        !resolveResponse.unsignedTransaction
      ) {
        const errorMessage =
          'message' in resolveResponse &&
          typeof resolveResponse.message === 'string'
            ? resolveResponse.message
            : 'Failed to resolve dispute';
        throw new Error(errorMessage);
      }

      const { unsignedTransaction } = resolveResponse;

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
              resolved: true,
            },
          };
        }

        const updatedEscrow: MultiReleaseEscrow = {
          ...escrow,
          milestones: updatedMilestones,
        };

        updateEscrow(updatedEscrow);
      }

      // Add to resolved milestones set
      setResolvedMilestones(prev => new Set(prev).add(milestoneIndex));

      // Display confirmation message
      toast.success(
        `Dispute for Milestone ${milestoneIndex + 1} has been resolved successfully!`,
        {
          duration: 5000,
        }
      );
    } catch {
      toast.error('Failed to resolve dispute');
    } finally {
      setIsLoading(null);
    }
  };

  const formatAmount = (amount: number): string => {
    return amount.toString();
  };

  const isMilestoneResolved = (
    milestone: MultiReleaseMilestone,
    index: number
  ): boolean => {
    return milestone.flags?.resolved === true || resolvedMilestones.has(index);
  };

  const canResolveDispute = (milestone: MultiReleaseMilestone): boolean => {
    return (
      milestone.flags?.disputed === true && milestone.flags?.resolved !== true
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resolve Dispute</CardTitle>
        <CardDescription>
          Resolve disputes for milestones in your multi-release escrow as the
          dispute resolver
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {escrow.milestones.map(
            (milestone: MultiReleaseMilestone, index: number) => {
              const isResolved = isMilestoneResolved(milestone, index);
              const canResolve = canResolveDispute(milestone);
              const isMilestoneLoading = isLoading === index;
              const isDisputed = milestone.flags?.disputed === true;

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
                        {isResolved && (
                          <Badge
                            variant='default'
                            className='flex items-center gap-1 bg-purple-600'
                          >
                            <Scale className='h-3 w-3' />
                            Dispute Resolved
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

                  {isResolved && (
                    <div className='mt-4 rounded border border-purple-200 bg-purple-50 p-3'>
                      <div className='flex items-center gap-2 text-sm text-purple-800'>
                        <Scale className='h-4 w-4' />
                        <span className='font-medium'>
                          This dispute has been resolved
                        </span>
                      </div>
                    </div>
                  )}

                  {!isResolved && canResolve && (
                    <div className='mt-4'>
                      <Button
                        variant='default'
                        size='sm'
                        onClick={() => handleResolveDispute(index)}
                        disabled={isMilestoneLoading || !walletAddress}
                        className='bg-purple-600 text-white hover:bg-purple-700'
                      >
                        {isMilestoneLoading ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Resolving Dispute...
                          </>
                        ) : (
                          <>
                            <Scale className='mr-2 h-4 w-4' />
                            Resolve Dispute
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {!isResolved && !canResolve && isDisputed && (
                    <div className='mt-4 rounded border border-yellow-200 bg-yellow-50 p-3'>
                      <div className='flex items-center gap-2 text-sm text-yellow-800'>
                        <XCircle className='h-4 w-4' />
                        <span className='font-medium'>
                          This milestone is in dispute but cannot be resolved
                          (may already be resolved)
                        </span>
                      </div>
                    </div>
                  )}

                  {!isDisputed && (
                    <div className='mt-4 rounded border border-gray-200 bg-gray-50 p-3'>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <CheckCircle2 className='h-4 w-4' />
                        <span className='font-medium'>
                          This milestone is not in dispute
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
