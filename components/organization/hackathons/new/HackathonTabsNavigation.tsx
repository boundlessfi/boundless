'use client';

import React from 'react';
import { Menu, ArrowUpRight } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { StepKey, StepData } from './constants';
import { STEP_ORDER } from './constants';

interface HackathonTabsNavigationProps {
  activeTab: StepKey;
  steps: Record<StepKey, StepData>;
  canAccessStep: (stepKey: StepKey) => boolean;
  navigateToStep: (stepKey: StepKey) => void;
  onPreview?: () => void;
}

export const HackathonTabsNavigation: React.FC<
  HackathonTabsNavigationProps
> = ({ activeTab, steps, canAccessStep, navigateToStep, onPreview }) => {
  return (
    <div className='border-b border-zinc-800 pl-6 md:pl-8'>
      <div className='flex items-center gap-4'>
        <button
          className='rounded-lg p-2 transition-colors hover:bg-zinc-800 md:hidden'
          aria-label='Open menu'
        >
          <Menu className='h-5 w-5' />
        </button>
        <div className='h-[50px] w-[0.5px] bg-gray-900 md:hidden' />

        <ScrollArea className='w-full'>
          <div className='flex w-max min-w-full items-center justify-between'>
            <TabsList className='inline-flex h-auto bg-transparent p-0'>
              {STEP_ORDER.filter(stepKey => stepKey !== 'review').map(
                stepKey => {
                  const step = steps[stepKey];
                  const isActive = stepKey === activeTab;
                  const isCompleted = step.isCompleted;
                  const canAccess = canAccessStep(stepKey);

                  return (
                    <TabsTrigger
                      key={stepKey}
                      value={stepKey}
                      onClick={() => navigateToStep(stepKey)}
                      disabled={!canAccess}
                      className={cn(
                        'data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-5 pt-4 pb-3 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-none',
                        !canAccess && 'cursor-not-allowed opacity-50',
                        isActive && 'border-b-primary text-white',
                        isCompleted && 'border-b-primary text-white',
                        !isActive && !isCompleted && 'text-zinc-400'
                      )}
                    >
                      <div className='flex items-center space-x-2'>
                        <span>
                          {stepKey.charAt(0).toUpperCase() + stepKey.slice(1)}
                        </span>
                        <div>
                          {isActive && !isCompleted && (
                            <svg
                              width='16'
                              height='17'
                              viewBox='0 0 16 17'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M15.3337 8.50002C15.3337 12.5501 12.0504 15.8334 8.00033 15.8334C3.95024 15.8334 0.666992 12.5501 0.666992 8.50002C0.666992 4.44993 3.95024 1.16669 8.00033 1.16669C12.0504 1.16669 15.3337 4.44993 15.3337 8.50002Z'
                                fill='white'
                              />
                              <path
                                d='M13.1064 12.7855C12.3645 13.6696 11.4058 14.3459 10.3241 14.7483C9.24248 15.1507 8.07488 15.2654 6.93559 15.0812C5.7963 14.897 4.72434 14.4202 3.82459 13.6974C2.92485 12.9746 2.22815 12.0307 1.80265 10.9579C1.37716 9.88511 1.23744 8.72024 1.39718 7.57726C1.55691 6.43428 2.01063 5.35234 2.71393 4.43731C3.41723 3.52227 4.34603 2.80549 5.40945 2.35709C6.47287 1.90868 7.63447 1.74402 8.78062 1.87921L7.99968 8.49998L13.1064 12.7855Z'
                                fill='#030303'
                              />
                            </svg>
                          )}
                          {isCompleted && (
                            <svg
                              width='16'
                              height='17'
                              viewBox='0 0 16 17'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M0.666992 8.50002C0.666992 4.44993 3.95024 1.16669 8.00033 1.16669C12.0504 1.16669 15.3337 4.44993 15.3337 8.50002C15.3337 12.5501 12.0504 15.8334 8.00033 15.8334C3.95024 15.8334 0.666992 12.5501 0.666992 8.50002Z'
                                fill='white'
                              />
                              <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M11.5448 5.76964C11.672 5.88626 11.6806 6.08394 11.564 6.21117L6.98069 11.2112C6.92309 11.274 6.84233 11.3106 6.75711 11.3124C6.6719 11.3143 6.58962 11.2812 6.52935 11.221L4.44602 9.13764C4.32398 9.0156 4.32398 8.81774 4.44602 8.6957C4.56806 8.57366 4.76592 8.57366 4.88796 8.6957L6.74051 10.5482L11.1033 5.78884C11.2199 5.66161 11.4176 5.65302 11.5448 5.76964Z'
                                fill='#030303'
                                stroke='#030303'
                                strokeWidth='0.833333'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          )}
                          {!isActive && !isCompleted && (
                            <div className='h-4 w-4 rounded-full border-2 border-zinc-400' />
                          )}
                        </div>
                      </div>
                    </TabsTrigger>
                  );
                }
              )}
            </TabsList>
            {steps.collaboration?.isCompleted && (
              <Button
                onClick={() => navigateToStep('review')}
                className='bg-primary/10 text-primary hover:bg-primary/20 flex h-[50px] items-center gap-2 rounded-none border-l border-gray-900'
              >
                Review
                <ArrowUpRight className='h-5 w-5' />
              </Button>
            )}
            <Button
              onClick={onPreview}
              className='bg-active-bg text-primary flex h-[50px] items-center gap-2 rounded-none border-l border-gray-900'
            >
              Preview Hackathon
              <ArrowUpRight className='h-5 w-5' />
            </Button>
          </div>
          <ScrollBar orientation='horizontal' className='h-px' />
        </ScrollArea>
      </div>
    </div>
  );
};
