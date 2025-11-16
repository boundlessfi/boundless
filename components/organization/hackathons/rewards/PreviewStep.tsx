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
  getPrizeForRank: (rank: number) => string;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({
  winners,
  prizeTiers,
  announcement,
  onEditAnnouncement,
  getPrizeForRank,
}) => {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='mb-2 text-lg font-semibold text-white'>Preview</h3>
        <p className='text-sm text-gray-400'>
          Review winners and announcement before publishing
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
