'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Submission } from './types';
import type { PrizeTier } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import { extractRankFromPosition } from '@/lib/utils/prize-tier-matcher';

interface WinnerFormItemProps {
  winner: Submission;
  prizeTiers: PrizeTier[];
  walletAddress: string;
  error?: string;
  isLoading: boolean;
  isEscrowFunded: boolean;
  onWalletAddressChange: (submissionId: string, address: string) => void;
}

export const WinnerFormItem: React.FC<WinnerFormItemProps> = ({
  winner,
  prizeTiers,
  walletAddress,
  error,
  isLoading,
  isEscrowFunded,
  onWalletAddressChange,
}) => {
  const prizeTier = prizeTiers.find(tier => {
    const tierRank = extractRankFromPosition(tier.place);
    return tierRank === winner.rank;
  });
  const prizeAmount = prizeTier ? parseFloat(prizeTier.prizeAmount || '0') : 0;

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  return (
    <div className='rounded-lg border border-gray-800 bg-gray-900/50 p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <Label className='text-base font-semibold text-white'>
            {winner.name} - {winner.rank}
            {getRankSuffix(winner.rank!)} Place
          </Label>
          <p className='text-sm text-gray-400'>
            Prize: ${prizeAmount.toFixed(2)} USDC
          </p>
        </div>
      </div>
      <div className='space-y-2'>
        <Label htmlFor={`wallet-${winner.id}`} className='text-gray-400'>
          Winner Wallet Address
        </Label>
        <Input
          id={`wallet-${winner.id}`}
          type='text'
          placeholder='G...'
          value={walletAddress}
          onChange={e => onWalletAddressChange(winner.id, e.target.value)}
          disabled={isLoading || !isEscrowFunded}
          className='font-mono text-white'
        />
        {error && <p className='text-xs text-red-400'>{error}</p>}
        <p className='text-xs text-gray-500'>
          Stellar address starting with G (56 characters)
        </p>
      </div>
    </div>
  );
};
