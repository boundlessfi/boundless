'use client';

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Info,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import type {
  RewardDistributionStatusResponse,
  RewardDistributionStatusEnum,
} from '@/lib/api/hackathons';

interface RewardDistributionStatusBannerProps {
  distributionStatus: RewardDistributionStatusResponse;
  isLoading?: boolean;
  onRefresh?: () => void;
}

/**
 * Stellar stroop precision: 7 decimals
 */
const STROOP_FACTOR = 1e7;

const STATUS_CONFIG: Record<
  RewardDistributionStatusEnum,
  {
    icon: React.ReactNode;
    label: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    iconClass: string;
  }
> = {
  NOT_TRIGGERED: {
    icon: <Info className='h-5 w-5' />,
    label: 'Not Triggered',
    bgClass: 'bg-gray-900/60',
    borderClass: 'border-gray-800',
    textClass: 'text-gray-300',
    iconClass: 'text-gray-400',
  },
  PENDING_ADMIN_REVIEW: {
    icon: <Clock className='h-5 w-5' />,
    label: 'Pending Admin Review',
    bgClass: 'bg-amber-950/40',
    borderClass: 'border-amber-800/60',
    textClass: 'text-amber-300',
    iconClass: 'text-amber-400',
  },
  APPROVED: {
    icon: <CheckCircle2 className='h-5 w-5' />,
    label: 'Approved',
    bgClass: 'bg-green-950/40',
    borderClass: 'border-green-800/60',
    textClass: 'text-green-300',
    iconClass: 'text-green-400',
  },
  REJECTED: {
    icon: <Ban className='h-5 w-5' />,
    label: 'Rejected',
    bgClass: 'bg-red-950/40',
    borderClass: 'border-red-800/60',
    textClass: 'text-red-300',
    iconClass: 'text-red-400',
  },
  EXECUTING: {
    icon: <Loader2 className='h-5 w-5 animate-spin' />,
    label: 'Executing',
    bgClass: 'bg-blue-950/40',
    borderClass: 'border-blue-800/60',
    textClass: 'text-blue-300',
    iconClass: 'text-blue-400',
  },
  COMPLETED: {
    icon: <CheckCircle2 className='h-5 w-5' />,
    label: 'Completed',
    bgClass: 'bg-green-950/40',
    borderClass: 'border-green-800/60',
    textClass: 'text-green-300',
    iconClass: 'text-green-400',
  },
  FAILED: {
    icon: <XCircle className='h-5 w-5' />,
    label: 'Failed',
    bgClass: 'bg-red-950/50',
    borderClass: 'border-red-700/60',
    textClass: 'text-red-300',
    iconClass: 'text-red-400',
  },
  PARTIAL_SUCCESS: {
    icon: <AlertTriangle className='h-5 w-5' />,
    label: 'Partial Success',
    bgClass: 'bg-orange-950/40',
    borderClass: 'border-orange-800/60',
    textClass: 'text-orange-300',
    iconClass: 'text-orange-400',
  },
};

const formatDate = (val: string | null | undefined): string | null => {
  if (!val) return null;
  try {
    return formatInTimeZone(
      new Date(val),
      'UTC',
      "MMM d, yyyy 'at' HH:mm 'UTC'"
    );
  } catch {
    return val;
  }
};

export const RewardDistributionStatusBanner: React.FC<
  RewardDistributionStatusBannerProps
> = ({ distributionStatus, isLoading, onRefresh }) => {
  const { status } = distributionStatus;
  const cfg = STATUS_CONFIG[status];

  if (!cfg) return null;

  const triggeredAt = formatDate(distributionStatus.triggeredAt);
  const adminDecisionAt = formatDate(distributionStatus.adminDecisionAt);
  const updatedAt = formatDate(distributionStatus.updatedAt);

  return (
    <section>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-white'>
            Distribution Status
          </h2>
          <p className='mt-1 text-sm text-gray-400'>
            Current reward distribution state for this hackathon
          </p>
        </div>
        {onRefresh && (
          <Button
            variant='outline'
            size='sm'
            onClick={onRefresh}
            disabled={isLoading}
            className='gap-2 border-gray-800 text-gray-400 hover:text-white'
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        )}
      </div>

      <div
        className={`rounded-xl border p-5 ${cfg.bgClass} ${cfg.borderClass}`}
      >
        {/* Status Header */}
        <div className='flex items-center gap-3'>
          <span className={cfg.iconClass}>{cfg.icon}</span>
          <div>
            <p className={`text-sm font-semibold ${cfg.textClass}`}>
              {cfg.label}
            </p>
            {triggeredAt && (
              <p className='mt-0.5 text-xs text-gray-500'>
                Triggered: {triggeredAt}
              </p>
            )}
          </div>
        </div>

        {/* Detail Fields */}
        <div className='mt-4 grid grid-cols-1 gap-3 text-xs text-gray-400 sm:grid-cols-2 lg:grid-cols-3'>
          {distributionStatus.distributionId && (
            <div>
              <span className='font-medium text-gray-300'>Distribution ID</span>
              <p className='mt-0.5 font-mono text-[10px] break-all'>
                {distributionStatus.distributionId}
              </p>
            </div>
          )}

          {adminDecisionAt && (
            <div>
              <span className='font-medium text-gray-300'>Admin Decision</span>
              <p className='mt-0.5'>{adminDecisionAt}</p>
            </div>
          )}

          {updatedAt && (
            <div>
              <span className='font-medium text-gray-300'>Last Updated</span>
              <p className='mt-0.5'>{updatedAt}</p>
            </div>
          )}

          {distributionStatus.snapshot?.totalPrizePool != null &&
            distributionStatus.snapshot.totalPrizePool > 0 && (
              <div>
                <span className='font-medium text-gray-300'>
                  Total Prize Pool
                </span>
                <p className='mt-0.5'>
                  {(
                    distributionStatus.snapshot.totalPrizePool / STROOP_FACTOR
                  ).toLocaleString('en-US', { maximumFractionDigits: 2 })}{' '}
                  {distributionStatus.snapshot.currency}
                </p>
              </div>
            )}

          {distributionStatus.snapshot?.winners?.length > 0 && (
            <div>
              <span className='font-medium text-gray-300'>Winners</span>
              <p className='mt-0.5'>
                {distributionStatus.snapshot.winners.length} recipient(s)
              </p>
            </div>
          )}
        </div>

        {/* Rejection reason */}
        {distributionStatus.rejectionReason && (
          <div className='mt-4 rounded-lg border border-red-800/40 bg-red-950/30 px-4 py-3'>
            <p className='text-xs font-semibold text-red-400'>
              Rejection Reason
            </p>
            <p className='mt-1 text-sm text-red-300'>
              {distributionStatus.rejectionReason}
            </p>
          </div>
        )}

        {/* Admin note */}
        {distributionStatus.adminNote && (
          <div className='mt-3 rounded-lg border border-gray-700/40 bg-gray-800/30 px-4 py-3'>
            <p className='text-xs font-semibold text-gray-300'>Admin Note</p>
            <p className='mt-1 text-sm text-gray-300'>
              {distributionStatus.adminNote}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
