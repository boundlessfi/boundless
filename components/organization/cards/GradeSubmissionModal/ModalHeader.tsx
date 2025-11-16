'use client';

import { X, ArrowUpRight } from 'lucide-react';
import { DialogClose, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ModalHeaderProps {
  existingScore: { scores: unknown[]; notes?: string } | null;
}

export const ModalHeader = ({ existingScore }: ModalHeaderProps) => {
  return (
    <DialogHeader className='flex flex-shrink-0 flex-row items-center justify-between'>
      <div className='flex items-center gap-4'>
        <DialogClose asChild>
          <Button
            variant='ghost'
            size='icon'
            className='h-9 w-9 rounded-lg border border-gray-700 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white'
          >
            <X className='h-5 w-5' />
          </Button>
        </DialogClose>

        <div className='flex items-center gap-2'>
          <div className='text-sm font-medium text-white'>
            {existingScore ? 'Update Grade' : 'Grade Submission'}
          </div>
        </div>
      </div>

      <Button
        variant='outline'
        className='gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white'
      >
        View Project
        <ArrowUpRight className='h-4 w-4' />
      </Button>
    </DialogHeader>
  );
};
