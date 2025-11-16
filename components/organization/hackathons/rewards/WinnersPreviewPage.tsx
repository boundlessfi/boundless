'use client';

import React from 'react';
import WinnersHeader from './WinnersHeader';
import WinnersTitle from './WinnersTitle';
import WinnersGrid from './WinnersGrid';
import AnnouncementSection from './AnnouncementSection';
import { Submission } from './types';

interface WinnersPreviewPageProps {
  submissions: Submission[];
  announcement: string;
  prizeTiers: Array<{
    rank: number;
    prizeAmount: string;
    currency: string;
  }>;
  onBack: () => void;
  onEdit: () => void;
  onPublish: () => void;
}

export default function WinnersPreviewPage({
  submissions,
  announcement,
  prizeTiers,
  onBack,
  onEdit,
  onPublish,
}: WinnersPreviewPageProps) {
  const maxRank = prizeTiers.length;
  const winners = submissions
    .filter(s => s.rank && s.rank <= maxRank)
    .sort((a, b) => (a.rank || 0) - (b.rank || 0));

  const getPrizeForRank = (rank: number) => {
    const tier = prizeTiers.find(t => t.rank === rank);
    if (tier) {
      const amount = parseFloat(tier.prizeAmount).toLocaleString('en-US');
      return `${amount} ${tier.currency}`;
    }
    return rank === 1
      ? '10,000 USDC'
      : rank === 2
        ? '5,000 USDC'
        : '8,000 USDC';
  };

  return (
    <div className='bg-background min-h-screen text-white'>
      <WinnersHeader onBack={onBack} onPublish={onPublish} />

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8'>
        <WinnersTitle />

        <WinnersGrid
          prizeTiers={prizeTiers}
          winners={winners}
          getPrizeForRank={getPrizeForRank}
        />

        <AnnouncementSection announcement={announcement} onEdit={onEdit} />
      </div>
    </div>
  );
}
