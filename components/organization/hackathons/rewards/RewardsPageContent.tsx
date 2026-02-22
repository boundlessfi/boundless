'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Info,
  Ban,
  ChevronRight,
} from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';
import PodiumSection from '@/components/organization/hackathons/rewards/PodiumSection';
import SubmissionsList from '@/components/organization/hackathons/rewards/SubmissionsList';
import EscrowStatusCard from '@/components/organization/hackathons/rewards/EscrowStatusCard';
import { RewardDistributionStatusBanner } from '@/components/organization/hackathons/rewards/RewardDistributionStatusBanner';
import BoundlessSheet from '@/components/sheet/boundless-sheet';
import { Submission } from '@/components/organization/hackathons/rewards/types';
import type {
  HackathonEscrowData,
  RewardDistributionStatusResponse,
  RewardDistributionStatusEnum,
} from '@/lib/api/hackathons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface RewardsPageContentProps {
  submissions: Submission[];
  escrow: HackathonEscrowData | null;
  isLoadingEscrow: boolean;
  isLoadingSubmissions: boolean;
  maxRank: number;
  hasWinners: boolean;
  onPublishClick: () => void;
  onRankChange: (submissionId: string, newRank: number | null) => Promise<void>;
  distributionStatus?: RewardDistributionStatusResponse | null;
  isLoadingDistributionStatus?: boolean;
  onRefreshDistributionStatus?: () => void;
  resultsPublished?: boolean;
  escrowAddress?: string;
}

export const RewardsPageContent: React.FC<RewardsPageContentProps> = ({
  submissions,
  escrow,
  isLoadingEscrow,
  isLoadingSubmissions,
  maxRank,
  hasWinners,
  onPublishClick,
  onRankChange,
  distributionStatus,
  isLoadingDistributionStatus,
  onRefreshDistributionStatus,
  resultsPublished,
  escrowAddress,
}) => {
  const [isStatusSheetOpen, setIsStatusSheetOpen] = useState(false);

  const status = distributionStatus?.status;
  const isNotTriggered = !distributionStatus || status === 'NOT_TRIGGERED';
  const isRejected = status === 'REJECTED' || status === 'FAILED';
  const isLocked =
    status &&
    ['PENDING_ADMIN_REVIEW', 'APPROVED', 'EXECUTING'].includes(status);

  const showTriggerButton = (isNotTriggered || isRejected) && !isLocked;
  const canTrigger = resultsPublished && !!escrowAddress;

  // Status color/icon mapping for the compact badge
  const STATUS_BADGE: Record<
    string,
    { color: string; icon: React.ReactNode; label: string }
  > = {
    NOT_TRIGGERED: {
      color: 'text-gray-400 border-gray-700 bg-gray-900/60',
      icon: <Info className='h-3 w-3' />,
      label: 'Not Triggered',
    },
    PENDING_ADMIN_REVIEW: {
      color: 'text-amber-400 border-amber-800/60 bg-amber-950/30',
      icon: <Clock className='h-3 w-3' />,
      label: 'Pending Review',
    },
    APPROVED: {
      color: 'text-green-400 border-green-800/60 bg-green-950/30',
      icon: <CheckCircle2 className='h-3 w-3' />,
      label: 'Approved',
    },
    REJECTED: {
      color: 'text-red-400 border-red-800/60 bg-red-950/30',
      icon: <Ban className='h-3 w-3' />,
      label: 'Rejected',
    },
    EXECUTING: {
      color: 'text-blue-400 border-blue-800/60 bg-blue-950/30',
      icon: <Loader2 className='h-3 w-3 animate-spin' />,
      label: 'Executing',
    },
    COMPLETED: {
      color: 'text-green-400 border-green-800/60 bg-green-950/30',
      icon: <CheckCircle2 className='h-3 w-3' />,
      label: 'Completed',
    },
    FAILED: {
      color: 'text-red-400 border-red-800/60 bg-red-950/30',
      icon: <XCircle className='h-3 w-3' />,
      label: 'Failed',
    },
    PARTIAL_SUCCESS: {
      color: 'text-orange-400 border-orange-800/60 bg-orange-950/30',
      icon: <AlertTriangle className='h-3 w-3' />,
      label: 'Partial Success',
    },
  };
  const badge = status ? STATUS_BADGE[status] : null;

  return (
    <div className='space-y-8'>
      {/* 1. Compact Status Badge + Sheet */}
      {distributionStatus && status !== 'NOT_TRIGGERED' && badge && (
        <>
          <button
            onClick={() => setIsStatusSheetOpen(true)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 ${badge.color}`}
          >
            {badge.icon}
            Distribution: {badge.label}
            <ChevronRight className='h-3 w-3 opacity-60' />
          </button>

          <BoundlessSheet
            open={isStatusSheetOpen}
            setOpen={setIsStatusSheetOpen}
            title='Distribution Status'
            minHeight='300px'
          >
            <div className='px-6 pb-6'>
              <RewardDistributionStatusBanner
                distributionStatus={distributionStatus}
                isLoading={isLoadingDistributionStatus}
                onRefresh={onRefreshDistributionStatus}
              />
            </div>
          </BoundlessSheet>
        </>
      )}

      {/* 2. Trigger Control Section / Requirements Alert */}
      {showTriggerButton && (
        <div className='flex flex-col gap-4'>
          {!canTrigger && (
            <Alert
              variant='destructive'
              className='border-amber-900/50 bg-amber-950/20 text-amber-200'
            >
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Distribution Requirements</AlertTitle>
              <AlertDescription>
                To trigger reward distribution, you must:
                <ul className='mt-2 list-disc pl-5 text-xs opacity-80'>
                  {!resultsPublished && (
                    <li>Publish the judging results in the Judging tab.</li>
                  )}
                  {!escrowAddress && (
                    <li>
                      Configure a valid Stellar Escrow address in Settings.
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className='flex justify-end'>
            <BoundlessButton
              variant='default'
              size='lg'
              onClick={onPublishClick}
              disabled={!canTrigger}
              className='gap-2'
            >
              <Megaphone className='h-4 w-4' />
              {isRejected
                ? 'Re-trigger Reward Distribution'
                : 'Trigger Reward Distribution'}
            </BoundlessButton>
          </div>
        </div>
      )}

      <section>
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-white'>Escrow Status</h2>
          <p className='mt-1 text-sm text-gray-400'>
            View escrow balance, milestones, and funding status
          </p>
        </div>
        <EscrowStatusCard escrow={escrow} isLoading={isLoadingEscrow} />
      </section>

      {submissions.length > 0 && (
        <section>
          <div className='mb-6'>
            <h2 className='text-xl font-semibold text-white'>
              Winners & Rankings
            </h2>
            <p className='mt-1 text-sm text-gray-400'>
              Assign ranks to submissions and view the winners podium
            </p>
          </div>
          <div className='space-y-6'>
            <PodiumSection submissions={submissions} maxRank={maxRank} />
            <div>
              <h3 className='mb-4 text-lg font-medium text-white'>
                All Submissions
              </h3>
              <SubmissionsList
                submissions={submissions}
                onRankChange={onRankChange}
                maxRank={maxRank}
              />
            </div>
          </div>
        </section>
      )}

      {submissions.length === 0 && !isLoadingSubmissions && (
        <section>
          <Alert className='border-gray-800 bg-gray-900/50'>
            <AlertCircle className='h-5 w-5 text-gray-400' />
            <AlertTitle className='text-white'>
              No Submissions Available
            </AlertTitle>
            <AlertDescription className='text-gray-300'>
              <p className='mb-2'>
                No judged submissions found. To assign winners and distribute
                prizes:
              </p>
              <ol className='ml-4 list-decimal space-y-1 text-sm'>
                <li>Ensure submissions have been shortlisted</li>
                <li>Complete the judging process</li>
                <li>Return here to assign ranks and publish winners</li>
              </ol>
            </AlertDescription>
          </Alert>
        </section>
      )}
    </div>
  );
};
