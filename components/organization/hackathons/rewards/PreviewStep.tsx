'use client';

import React from 'react';
import WinnersGrid from './WinnersGrid';
import AnnouncementSection from './AnnouncementSection';
import type { Submission } from './types';

interface PreviewStepProps {
  winners: Submission[];
  prizeTiers: Array<{
    rank: number;
    prizeAmount: string;
    currency: string;
  }>;
  announcement: string;
  onEditAnnouncement: () => void;
  getPrizeForRank: (rank: number) => {
    amount: string;
    currency: string;
    label: string;
  };
}

export const PreviewStep: React.FC<PreviewStepProps> = ({
  winners,
  prizeTiers,
  announcement,
  onEditAnnouncement,
  getPrizeForRank,
}) => {
  return (
    <div className='space-y-4'>
      <div className='text-center'>
        <p className='text-xs text-gray-500'>
          Review winners and announcement before triggering distribution.
        </p>
      </div>

      <WinnersGrid
        prizeTiers={prizeTiers}
        winners={winners}
        getPrizeForRank={getPrizeForRank}
      />

      <AnnouncementSection
        announcement={announcement}
        onEdit={onEditAnnouncement}
      />
    </div>
  );
};
