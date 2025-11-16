'use client';

import React from 'react';
import { Loader2, Megaphone, ArrowRight } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';

interface WizardFooterProps {
  currentStepIndex: number;
  totalSteps: number;
  isPublishing: boolean;
  canGoNext: boolean;
  onCancel: () => void;
  onBack: () => void;
  onNext: () => void;
  onPublish: () => void;
}

export const WizardFooter: React.FC<WizardFooterProps> = ({
  currentStepIndex,
  totalSteps,
  isPublishing,
  canGoNext,
  onCancel,
  onBack,
  onNext,
  onPublish,
}) => {
  return (
    <div className='flex justify-between gap-3 border-t border-gray-900 p-6'>
      <BoundlessButton
        variant='outline'
        onClick={currentStepIndex === 0 ? onCancel : onBack}
        disabled={isPublishing}
        className='border-gray-700 text-white hover:bg-gray-800'
      >
        {currentStepIndex === 0 ? 'Cancel' : 'Back'}
      </BoundlessButton>

      <div className='flex gap-3'>
        {currentStepIndex < totalSteps - 1 ? (
          <BoundlessButton
            variant='default'
            onClick={onNext}
            disabled={!canGoNext || isPublishing}
            className='gap-2'
          >
            Next
            <ArrowRight className='h-4 w-4' />
          </BoundlessButton>
        ) : (
          <BoundlessButton
            variant='default'
            onClick={onPublish}
            disabled={isPublishing}
            className='bg-primary hover:bg-primary/90 gap-2'
          >
            {isPublishing ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Publishing...
              </>
            ) : (
              <>
                <Megaphone className='h-4 w-4' />
                Publish Winners
              </>
            )}
          </BoundlessButton>
        )}
      </div>
    </div>
  );
};
