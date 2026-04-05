'use client';

import { AlertTriangle, Ban, ExternalLink, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  CampaignStatus,
  normalizeCampaignStatus,
} from '@/features/projects/types';
import { RefundStatusBadge } from '@/components/crowdfunding/refund-status-badge';
import { getTransactionExplorerUrl } from '@/lib/wallet-utils';
import { useOptionalAuth } from '@/hooks/use-auth';
import type { ProjectViewModel } from '@/features/projects/types/view-model';

interface CampaignEndBannerProps {
  vm: ProjectViewModel;
}

export function CampaignEndBanner({ vm }: CampaignEndBannerProps) {
  const { user } = useOptionalAuth();
  const status = normalizeCampaignStatus(vm.status);
  const isFailed = status === CampaignStatus.FAILED;
  const isCancelled = status === CampaignStatus.CANCELLED;

  if (!isFailed && !isCancelled) return null;

  const contributors = vm.campaign?.contributors ?? [];
  const refundedCount = contributors.filter(
    c => c.refundStatus === 'PROCESSED'
  ).length;
  const totalCount = contributors.length;
  const refundProgress =
    totalCount > 0 ? (refundedCount / totalCount) * 100 : 0;

  const myContribution = user
    ? contributors.find(c => c.userId === user.id)
    : undefined;

  const borderClass = isFailed
    ? 'border-red-500/30 bg-red-500/10'
    : 'border-white/10 bg-white/5';
  const iconClass = isFailed ? 'text-red-400' : 'text-white/40';
  const headingClass = isFailed ? 'text-red-400' : 'text-white/70';
  const headingText = isFailed ? 'Campaign Failed' : 'Campaign Cancelled';
  const bodyText = isFailed
    ? 'This campaign did not reach its funding goal. All backers are eligible for a full refund.'
    : 'This campaign was cancelled by the creator. All backers are eligible for a full refund.';

  return (
    <div className={`mb-6 rounded-xl border p-5 ${borderClass}`}>
      <div className='flex items-start gap-3'>
        {isFailed ? (
          <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} />
        ) : (
          <Ban className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} />
        )}

        <div className='flex-1 space-y-4'>
          <div>
            <h3 className={`font-semibold ${headingClass}`}>{headingText}</h3>
            <p className='mt-1 text-sm text-white/60'>{bodyText}</p>
          </div>

          {/* Aggregate refund progress */}
          {totalCount > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='flex items-center gap-1.5 text-white/60'>
                  <RefreshCw className='h-3.5 w-3.5' />
                  Refund progress
                </span>
                <span className='font-medium text-white'>
                  {refundedCount}/{totalCount} backers refunded
                </span>
              </div>
              <Progress value={refundProgress} className='h-2' />
              <p className='text-xs text-white/40'>
                {refundProgress.toFixed(0)}% of backers have received their
                refund
                {refundedCount < totalCount &&
                  ' — Pending refunds are processed automatically.'}
              </p>
            </div>
          )}

          {/* Logged-in backer's personal refund status */}
          {myContribution && (
            <div className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3'>
              <div>
                <p className='text-sm font-medium text-white'>
                  Your contribution
                </p>
                <p className='text-xs text-white/50'>
                  {vm.campaign?.fundingCurrency}{' '}
                  {myContribution.amount.toLocaleString()}
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <RefundStatusBadge
                  status={myContribution.refundStatus ?? 'PENDING'}
                />
                {myContribution.refundTransactionHash && (
                  <a
                    href={getTransactionExplorerUrl(
                      myContribution.refundTransactionHash
                    )}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-1 text-xs text-blue-400 transition-opacity hover:opacity-70'
                  >
                    View tx
                    <ExternalLink className='h-3 w-3' />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
