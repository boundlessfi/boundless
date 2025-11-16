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
import {
  useApproveMilestone,
  useSendTransaction,
} from '@trustless-work/escrow';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  ApproveMilestonePayload,
  EscrowType,
  EscrowRequestResponse,
  Status,
  MultiReleaseEscrow,
  MultiReleaseMilestone,
} from '@trustless-work/escrow';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Component to approve milestones in a multi-release escrow
 */
export const ApproveMilestone = () => {
  const { walletAddress } = useWalletContext();
  const { contractId, escrow, updateEscrow } = useEscrowContext();
  const { approveMilestone } = useApproveMilestone();
  const { sendTransaction } = useSendTransaction();
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [approvedMilestones, setApprovedMilestones] = useState<Set<number>>(
    new Set()
  );

  if (!contractId || !escrow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approve Milestones</CardTitle>
          <CardDescription>
            Please initialize an escrow first before approving milestones.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!escrow.milestones || escrow.milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approve Milestones</CardTitle>
          <CardDescription>
            This escrow does not have milestones.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!escrow.roles.approver) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approve Milestones</CardTitle>
          <CardDescription>
            Approver address not found in escrow.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleApproveMilestone = async (
    milestoneIndex: number,
    newEvidence?: string
  ) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(milestoneIndex);

    try {
      // Step 1: Prepare the payload according to ApproveMilestonePayload type
      const payload: ApproveMilestonePayload = {
        contractId: contractId,
        milestoneIndex: milestoneIndex.toString(),
        approver: escrow.roles.approver,
        ...(newEvidence && { newEvidence }),
      };

      // Log payload for debugging

      // Step 2: Execute function from Trustless Work
      const approveResponse: EscrowRequestResponse = await approveMilestone(
        payload,
        'multi-release' as EscrowType
      );

      // Type guard: Check if response is successful
      if (
        approveResponse.status !== ('SUCCESS' as Status) ||
        !approveResponse.unsignedTransaction
      ) {
        const errorMessage =
          'message' in approveResponse &&
          typeof approveResponse.message === 'string'
            ? approveResponse.message
            : 'Failed to approve milestone';
        throw new Error(errorMessage);
      }

      const { unsignedTransaction } = approveResponse;

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
              approved: true,
            },
            ...(newEvidence && { evidence: newEvidence }),
          };
        }

        const updatedEscrow: MultiReleaseEscrow = {
          ...escrow,
          milestones: updatedMilestones,
        };

        updateEscrow(updatedEscrow);
      }

      // Add to approved milestones set
      setApprovedMilestones(prev => new Set(prev).add(milestoneIndex));

      // Display confirmation message
      toast.success(
        `Milestone ${milestoneIndex + 1} has been approved successfully!`,
        {
          duration: 5000,
        }
      );
    } catch {
      toast.error('Failed to approve milestone');
    } finally {
      setIsLoading(null);
    }
  };

  const formatAmount = (amount: number): string => {
    return amount.toString();
  };

  const isMilestoneApproved = (
    milestone: MultiReleaseMilestone,
    index: number
  ): boolean => {
    return milestone.flags?.approved === true || approvedMilestones.has(index);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approve Milestones</CardTitle>
        <CardDescription>
          Approve milestones in your multi-release escrow as the approver
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {escrow.milestones.map(
            (milestone: MultiReleaseMilestone, index: number) => {
              const isApproved = isMilestoneApproved(milestone, index);
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
                        {isApproved ? (
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

                  {!isApproved && (
                    <div className='mt-4'>
                      <Button
                        variant='default'
                        size='sm'
                        onClick={() => handleApproveMilestone(index)}
                        disabled={isMilestoneLoading || !walletAddress}
                        className='bg-green-600 text-white hover:bg-green-700'
                      >
                        {isMilestoneLoading ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className='mr-2 h-4 w-4' />
                            Approve Milestone
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {isApproved && (
                    <div className='mt-4 rounded border border-green-200 bg-green-50 p-3'>
                      <div className='flex items-center gap-2 text-sm text-green-800'>
                        <CheckCircle2 className='h-4 w-4' />
                        <span className='font-medium'>
                          This milestone has been approved
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
