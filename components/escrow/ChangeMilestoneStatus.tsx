'use client';

import React, { useState } from 'react';
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
  useChangeMilestoneStatus,
  useSendTransaction,
} from '@trustless-work/escrow';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  ChangeMilestoneStatusPayload,
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
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { BoundlessButton } from '../buttons/BoundlessButton';

/**
 * Possible milestone status values
 * Based on Trustless Work documentation and common escrow statuses
 */
type MilestoneStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'in_dispute';

/**
 * Status transition configuration
 * Maps current status to available next statuses
 */
const statusTransitions: Record<string, MilestoneStatus[]> = {
  pending: ['in_progress', 'rejected'],
  in_progress: ['submitted', 'rejected'],
  submitted: ['approved', 'rejected', 'in_dispute'],
  approved: ['completed'],
  rejected: ['in_progress', 'pending'],
  in_dispute: ['approved', 'rejected'],
  completed: [], // Final state, no transitions
};

/**
 * Status display configuration
 */
const statusConfig: Record<
  MilestoneStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: <Clock className='h-3 w-3' />,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: <Clock className='h-3 w-3' />,
  },
  submitted: {
    label: 'Submitted',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: <AlertCircle className='h-3 w-3' />,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: <CheckCircle2 className='h-3 w-3' />,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: <XCircle className='h-3 w-3' />,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: <CheckCircle2 className='h-3 w-3' />,
  },
  in_dispute: {
    label: 'In Dispute',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: <AlertCircle className='h-3 w-3' />,
  },
};

/**
 * Component to change milestone status in a multi-release escrow
 */
export const ChangeMilestoneStatus = () => {
  const { walletAddress } = useWalletContext();
  const { contractId, escrow, updateEscrow } = useEscrowContext();
  const { changeMilestoneStatus } = useChangeMilestoneStatus();
  const { sendTransaction } = useSendTransaction();
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(
    null
  );

  if (!contractId || !escrow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Change Milestone Status</CardTitle>
          <CardDescription>
            Please initialize an escrow first before changing milestone
            statuses.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!escrow.milestones || escrow.milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Change Milestone Status</CardTitle>
          <CardDescription>
            This escrow does not have milestones.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleChangeStatus = async (
    milestoneIndex: number,
    newStatus: MilestoneStatus,
    newEvidence?: string
  ) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!escrow.roles.serviceProvider) {
      toast.error('Service provider address not found in escrow');
      return;
    }

    setIsLoading(milestoneIndex);

    try {
      // Step 1: Prepare the payload according to ChangeMilestoneStatusPayload type
      const payload: ChangeMilestoneStatusPayload = {
        contractId: contractId,
        milestoneIndex: milestoneIndex.toString(),
        newStatus: newStatus,
        serviceProvider: escrow.roles.serviceProvider,
        ...(newEvidence && { newEvidence }),
      };

      // Step 2: Execute function from Trustless Work
      const changeResponse: EscrowRequestResponse = await changeMilestoneStatus(
        payload,
        'multi-release' as EscrowType
      );

      // Type guard: Check if response is successful
      if (
        changeResponse.status !== ('SUCCESS' as Status) ||
        !changeResponse.unsignedTransaction
      ) {
        const errorMessage =
          'message' in changeResponse &&
          typeof changeResponse.message === 'string'
            ? changeResponse.message
            : 'Failed to change milestone status';
        throw new Error(errorMessage);
      }

      const { unsignedTransaction } = changeResponse;

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
            status: newStatus,
            ...(newEvidence && { evidence: newEvidence }),
          };
        }

        const updatedEscrow: MultiReleaseEscrow = {
          ...escrow,
          milestones: updatedMilestones,
        };

        updateEscrow(updatedEscrow);
      }

      toast.success(
        `Milestone ${milestoneIndex + 1} status changed to ${newStatus}`
      );
      setSelectedMilestone(null);
    } catch {
      toast.error('Failed to change milestone status');
    } finally {
      setIsLoading(null);
    }
  };

  const getCurrentStatus = (
    milestone: MultiReleaseMilestone
  ): MilestoneStatus => {
    if (milestone.status) {
      return milestone.status as MilestoneStatus;
    }
    // Default to pending if no status is set
    return 'pending';
  };

  const getAvailableTransitions = (
    currentStatus: MilestoneStatus
  ): MilestoneStatus[] => {
    return statusTransitions[currentStatus] || [];
  };

  const formatAmount = (amount: number): string => {
    return amount.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Milestone Status</CardTitle>
        <CardDescription>
          Update the status of milestones in your multi-release escrow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {escrow.milestones.map(
            (milestone: MultiReleaseMilestone, index: number) => {
              const currentStatus = getCurrentStatus(milestone);
              const availableTransitions =
                getAvailableTransitions(currentStatus);
              const statusInfo = statusConfig[currentStatus];
              const isSelected = selectedMilestone === index;
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
                        <Badge
                          variant='outline'
                          className={`flex items-center gap-1 ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </Badge>
                        {milestone.flags?.approved && (
                          <Badge variant='default' className='bg-green-600'>
                            Approved
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
                    </div>
                  </div>

                  {availableTransitions.length > 0 && (
                    <div className='mt-4 space-y-2'>
                      {!isSelected ? (
                        <BoundlessButton
                          variant='outline'
                          size='sm'
                          onClick={() => setSelectedMilestone(index)}
                          disabled={isMilestoneLoading}
                        >
                          Change Status
                        </BoundlessButton>
                      ) : (
                        <div className='space-y-2'>
                          <div className='flex flex-wrap gap-2'>
                            {availableTransitions.map(transitionStatus => {
                              const transitionInfo =
                                statusConfig[transitionStatus];
                              return (
                                <BoundlessButton
                                  key={transitionStatus}
                                  variant='outline'
                                  size='sm'
                                  onClick={() =>
                                    handleChangeStatus(index, transitionStatus)
                                  }
                                  disabled={isMilestoneLoading}
                                  className={`${transitionInfo.color} border`}
                                >
                                  {transitionInfo.icon}
                                  <span className='ml-1'>
                                    Mark as {transitionInfo.label}
                                  </span>
                                </BoundlessButton>
                              );
                            })}
                          </div>
                          <BoundlessButton
                            variant='ghost'
                            size='sm'
                            onClick={() => setSelectedMilestone(null)}
                            disabled={isMilestoneLoading}
                          >
                            Cancel
                          </BoundlessButton>
                        </div>
                      )}
                    </div>
                  )}

                  {availableTransitions.length === 0 && (
                    <div className='mt-2 text-xs text-gray-500'>
                      This milestone is in a final state and cannot be changed.
                    </div>
                  )}

                  {isMilestoneLoading && (
                    <div className='mt-2 flex items-center gap-2 text-sm text-gray-600'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      <span>Updating status...</span>
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
