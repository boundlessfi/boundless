'use client';

import React from 'react';
import { Plus, Delete } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';

interface SubmissionActionButtonsProps {
  onDisqualify: () => void;
  onShortlist: () => void;
}

export default function SubmissionActionButtons({
  onDisqualify,
  onShortlist,
}: SubmissionActionButtonsProps) {
  return (
    <div className='flex justify-between gap-3'>
      <BoundlessButton
        size='xl'
        onClick={onDisqualify}
        className='text-error-75 bg-error-900 hover:bg-error-600/10 gap-2'
      >
        Disqualify
        <Delete className='h-4 w-4' />
      </BoundlessButton>
      <BoundlessButton
        variant='default'
        size='xl'
        onClick={onShortlist}
        className=''
      >
        Shortlist
        <Plus className='h-4 w-4' />
      </BoundlessButton>
    </div>
  );
}
