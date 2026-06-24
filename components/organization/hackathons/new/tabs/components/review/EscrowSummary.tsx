'use client';

import React from 'react';
import { Lock, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format-utils';
import { PLATFORM_FEE } from '@/lib/utils/hackathon-escrow';
import type { RewardsFormData } from '../../schemas/rewardsSchema';

interface EscrowSummaryProps {
  rewards: RewardsFormData;
  totalPrizePool: number;
  platformFee: number;
  totalFunding: number;
}

export const EscrowSummary: React.FC<EscrowSummaryProps> = ({
  rewards,
  totalPrizePool,
  platformFee,
  totalFunding,
}) => {
  return (
    <div className='bg-background-card rounded-xl border border-gray-900 p-6'>
      <div className='flex items-start gap-4'>
        <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
          <Lock className='text-primary h-5 w-5' />
        </div>
        <div className='flex-1'>
          <h3 className='mb-2 text-lg font-semibold text-white'>
            Escrow & Prize Pool
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-400'>Total Prize Pool</span>
              <span className='text-lg font-semibold text-white'>
                {formatCurrency(totalPrizePool)}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-400'>
                Platform Fee ({PLATFORM_FEE}%)
              </span>
              <span className='text-sm font-medium text-gray-300'>
                {formatCurrency(platformFee)}
              </span>
            </div>
            <div className='flex items-center justify-between border-t border-gray-800 pt-3'>
              <span className='text-sm font-medium text-gray-400'>
                Total to Fund
              </span>
              <span className='text-primary text-xl font-bold'>
                {formatCurrency(totalFunding)}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-400'>Prize Tiers</span>
              <span className='text-sm font-medium text-white'>
                {rewards.prizeTiers.length}
              </span>
            </div>
            <div className='mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3'>
              <div className='flex items-start gap-2'>
                <Info className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400' />
                <div className='text-xs text-blue-300'>
                  <p className='mb-1'>
                    Funds will be locked in escrow when you publish. A
                    placeholder milestone will be created initially.
                  </p>
                  <p>
                    Winner milestones will be added after judging is complete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
