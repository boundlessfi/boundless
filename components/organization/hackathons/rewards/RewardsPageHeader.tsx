'use client';

import React from 'react';

export const RewardsPageHeader: React.FC = () => {
  return (
    <div className='mb-8'>
      <h1 className='text-2xl font-semibold text-white sm:text-3xl'>
        Hackathon Rewards
      </h1>
      <p className='mt-2 text-sm text-gray-400'>
        Manage winners, prize distribution, and escrow status
      </p>
    </div>
  );
};
