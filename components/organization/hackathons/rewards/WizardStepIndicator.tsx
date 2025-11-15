'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardStep } from '@/hooks/use-wizard-steps';

interface Step {
  id: WizardStep;
  name: string;
}

interface WizardStepIndicatorProps {
  steps: Step[];
  currentStep: WizardStep;
  currentStepIndex: number;
}

export const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({
  steps,
  currentStep,
  currentStepIndex,
}) => {
  return (
    <div className='border-b border-gray-900 px-6 py-4'>
      <div className='flex items-center justify-around'>
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.id} className='flex w-fit items-center'>
              <div className='flex flex-col items-center'>
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    isActive && 'border-primary bg-primary/10 text-primary',
                    isCompleted && 'border-primary bg-primary text-white',
                    isUpcoming && 'border-gray-700 bg-gray-800 text-gray-500'
                  )}
                >
                  {isCompleted ? (
                    <Check className='h-5 w-5' />
                  ) : (
                    <span className='text-sm font-semibold'>{index + 1}</span>
                  )}
                </div>
                <div className='mt-2 text-center'>
                  <p
                    className={cn(
                      'text-xs font-medium',
                      isActive && 'text-white',
                      isCompleted && 'text-primary',
                      isUpcoming && 'text-gray-500'
                    )}
                  >
                    {step.name}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
