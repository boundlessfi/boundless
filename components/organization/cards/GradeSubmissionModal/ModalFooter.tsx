'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModalFooterProps {
  isLoading: boolean;
  isFetching: boolean;
  isFetchingCriteria: boolean;
  hasCriteria: boolean;
  existingScore: { scores: unknown[]; notes?: string } | null;
  onCancel: () => void;
  onSubmit: () => void;
}

export const ModalFooter = ({
  isLoading,
  isFetching,
  isFetchingCriteria,
  hasCriteria,
  existingScore,
  onCancel,
  onSubmit,
}: ModalFooterProps) => {
  return (
    <div className='flex flex-shrink-0 items-center justify-between'>
      <div className='text-sm text-gray-400'>
        Press{' '}
        <kbd className='rounded border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs'>
          Enter
        </kbd>{' '}
        to navigate •{' '}
        <kbd className='rounded border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs'>
          ↑↓
        </kbd>{' '}
        to adjust
      </div>
      <div className='flex gap-3'>
        <Button
          onClick={onCancel}
          disabled={isLoading}
          className='rounded-lg border border-gray-700 bg-gray-800 px-6 py-2.5 font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white'
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={
            isLoading || isFetching || isFetchingCriteria || !hasCriteria
          }
          className={cn(
            'rounded-lg px-6 py-2.5 font-medium text-white transition-all',
            'from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 bg-gradient-to-r',
            'disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500',
            'shadow-success-500/20 hover:shadow-success-500/30 shadow-lg'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 inline h-4 w-4 animate-spin' />
              {existingScore ? 'Updating...' : 'Submitting...'}
            </>
          ) : existingScore ? (
            'Update Grade'
          ) : (
            'Submit Grade'
          )}
        </Button>
      </div>
    </div>
  );
};
