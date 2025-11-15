'use client';

import React from 'react';
import { X, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { DialogClose, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SubmissionModalHeaderProps {
  currentIndex: number;
  totalSubmissions: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export const SubmissionModalHeader: React.FC<SubmissionModalHeaderProps> = ({
  currentIndex,
  totalSubmissions,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onClose,
}) => {
  return (
    <DialogHeader className='!psb-0 !msb-0 flex h-fit flex-row items-center justify-between p-6'>
      <div className='flex items-center gap-4'>
        <DialogClose asChild>
          <Button
            variant='ghost'
            size='icon'
            className='border border-gray-800 text-gray-500 hover:bg-gray-800'
            onClick={onClose}
          >
            <X className='h-5 w-5' />
          </Button>
        </DialogClose>
      </div>

      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onPrev}
            disabled={!canGoPrev}
            className='text-white hover:bg-gray-800 disabled:opacity-50'
          >
            <ChevronLeft className='h-5 w-5' />
          </Button>
          <span className='text-sm text-gray-400'>
            {currentIndex + 1} / {totalSubmissions}
          </span>
          <Button
            variant='ghost'
            size='icon'
            onClick={onNext}
            disabled={!canGoNext}
            className='text-white hover:bg-gray-800 disabled:opacity-50'
          >
            <ChevronRight className='h-5 w-5' />
          </Button>
        </div>

        <Button
          variant='outline'
          className='gap-2 border-gray-800 text-gray-500 hover:bg-gray-800'
        >
          Open
          <ArrowUpRight className='h-4 w-4' />
        </Button>
      </div>
    </DialogHeader>
  );
};
