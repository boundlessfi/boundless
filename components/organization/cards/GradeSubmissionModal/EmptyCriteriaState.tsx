'use client';

import React from 'react';

export const EmptyCriteriaState: React.FC = () => {
  return (
    <div className='flex items-center justify-center py-12'>
      <div className='text-center'>
        <p className='text-sm text-gray-400'>
          No judging criteria found for this hackathon.
        </p>
        <p className='mt-2 text-xs text-gray-500'>
          Please configure judging criteria in hackathon settings.
        </p>
      </div>
    </div>
  );
};
