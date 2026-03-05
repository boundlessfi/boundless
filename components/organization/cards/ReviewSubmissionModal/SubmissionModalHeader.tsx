'use client';

import React from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

import { toast } from 'sonner';
import { reportError } from '@/lib/error-reporting';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    } catch (err) {
      reportError(err, { context: 'submission-copyLink' });
      toast.error('Failed to copy link to clipboard');
    }
  };

  const handleReport = () => {
    // TODO: Implement report submission functionality
    console.log('Report submission not implemented yet');
  };

  return (
    <div className='bg-background/80 flex h-20 shrink-0 items-center justify-between border-b border-gray-900/60 px-6 backdrop-blur-md'>
      {/* Left side: Navigation / Branding */}
      <div className='flex items-center gap-6'>
        <Button
          variant='ghost'
          size='icon'
          className='bg-background-card h-10 w-10 border border-gray-800 text-gray-400 transition-all hover:bg-gray-800 hover:text-white'
          onClick={onClose}
        >
          <X className='h-5 w-5' />
        </Button>

        <div className='h-8 w-px bg-gray-900' />

        <div className='flex items-center gap-2'>
          <div className='bg-background-card flex h-8 items-center rounded-full border border-gray-800 px-3'>
            <span className='text-[10px] font-bold tracking-widest text-gray-500 uppercase'>
              Reviewing
            </span>
            <span className='mx-2 h-3 w-px bg-gray-800' />
            <span className='text-xs font-bold text-white'>
              {currentIndex + 1} <span className='text-gray-500'>/</span>{' '}
              {totalSubmissions}
            </span>
          </div>
        </div>
      </div>

      {/* Middle side: Main Navigation */}
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={e => {
            e.stopPropagation();
            onPrev();
          }}
          disabled={!canGoPrev}
          className='bg-background-card h-9 border border-gray-900 px-2 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 md:h-10 md:px-3'
        >
          <ChevronLeft className='h-4 w-4 md:mr-1.5' />
          <span className='hidden md:inline'>Previous</span>
        </Button>

        <div className='flex gap-0.5 md:gap-1'>
          {(() => {
            const visibleCount = Math.min(totalSubmissions, 5);
            const clampedIndex = Math.min(currentIndex, visibleCount - 1);

            return Array.from({ length: visibleCount }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  'h-1 rounded-full transition-all',
                  i === clampedIndex
                    ? 'bg-primary w-4 md:w-8'
                    : 'w-2 bg-gray-800 md:w-4'
                )}
              />
            ));
          })()}
        </div>

        <Button
          variant='ghost'
          size='sm'
          onClick={e => {
            e.stopPropagation();
            onNext();
          }}
          disabled={!canGoNext}
          className='bg-background-card h-9 border border-gray-900 px-2 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 md:h-10 md:px-3'
        >
          <span className='hidden md:inline'>Next</span>
          <ChevronRight className='h-4 w-4 md:ml-1.5' />
        </Button>
      </div>

      {/* Right side: Utility Actions */}
      <div className='flex items-center gap-3'>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleShare}
          className='bg-background-card h-10 w-10 border border-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
        >
          <Share2 className='h-4 w-4' />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='bg-background-card h-10 w-10 border border-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
            >
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-48 border-gray-800 bg-gray-950 text-white'
          >
            <DropdownMenuItem
              onClick={handleShare}
              className='cursor-pointer focus:bg-gray-900'
            >
              <Share2 className='mr-2 h-4 w-4' />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled
              className='cursor-not-allowed text-gray-500 focus:bg-transparent'
            >
              <span className='flex items-center'>
                Report Submission (Coming Soon)
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
