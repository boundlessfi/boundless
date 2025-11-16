'use client';

import { Check } from 'lucide-react';

interface SuccessOverlayProps {
  show: boolean;
}

export const SuccessOverlay = ({ show }: SuccessOverlayProps) => {
  if (!show) return null;

  return (
    <div className='absolute inset-0 z-50 flex items-center justify-center bg-gray-950/95 backdrop-blur-sm'>
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20'>
          <Check className='h-8 w-8 text-emerald-500' />
        </div>
        <h3 className='text-xl font-semibold text-white'>Grade Submitted!</h3>
        <p className='mt-2 text-sm text-gray-400'>
          Your evaluation has been saved
        </p>
      </div>
    </div>
  );
};
