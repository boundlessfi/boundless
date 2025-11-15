'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const ReviewHeader: React.FC = () => {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h2 className='text-2xl font-bold text-white'>Review & Publish</h2>
        <p className='mt-1 text-sm text-gray-400'>
          Review all your hackathon details before publishing
        </p>
      </div>
      <div className='flex items-center gap-2 text-sm text-green-400'>
        <CheckCircle2 className='h-5 w-5' />
        <span>All sections complete</span>
      </div>
    </div>
  );
};
