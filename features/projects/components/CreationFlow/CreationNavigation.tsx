'use client';

import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreationStep } from '@/features/projects/hooks/use-project-creation';

interface CreationNavigationProps {
  activeTab: CreationStep;
  steps: { key: CreationStep; label: string }[];
  navigateToStep: (stepKey: CreationStep) => void;
  /** Set of steps that have been visited at least once */
  visitedSteps?: Set<CreationStep>;
  /** Map of steps that have been validated/completed successfully */
  completedSteps?: Set<CreationStep>;
}

export const CreationNavigation: React.FC<CreationNavigationProps> = ({
  activeTab,
  steps,
  navigateToStep,
  visitedSteps = new Set(),
  completedSteps = new Set(),
}) => {
  return (
    <div className='sticky top-0 z-10 border-b border-white/5 bg-[#050505]'>
      <div className='flex items-center'>
        <ScrollArea className='w-full'>
          <div className='flex w-max min-w-full items-center'>
            <TabsList className='inline-flex h-auto bg-transparent p-0'>
              {steps.map((step, index) => {
                const isActive = step.key === activeTab;
                const isCompleted = completedSteps.has(step.key);
                const wasVisited = visitedSteps.has(step.key);

                // A previously visited but NOT completed step should NOT
                // get the primary color border — only active or completed steps get it.
                const showPrimaryBorder = isActive || isCompleted;
                const showMutedBorder = wasVisited && !isActive && !isCompleted;

                return (
                  <TabsTrigger
                    key={step.key}
                    value={step.key}
                    onClick={() => navigateToStep(step.key)}
                    className={cn(
                      'group relative rounded-none border-b-2 bg-transparent px-6 pt-5 pb-4 text-[11px] font-black tracking-[0.15em] uppercase transition-all data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                      // Active step: primary border + white text
                      isActive && 'border-b-primary text-white',
                      // Completed (but not active): subtle white border + dimmed text
                      isCompleted &&
                        !isActive &&
                        'border-b-white/30 text-white/60',
                      // Visited but incomplete: very subtle red/white border indicating something's missing
                      showMutedBorder && 'border-b-red-500/20 text-white/30',
                      // Never visited (default)
                      !isActive &&
                        !wasVisited &&
                        !isCompleted &&
                        'border-b-transparent text-white/20',
                      // Hover state for non-active
                      !isActive && 'hover:text-white/70'
                    )}
                  >
                    <div className='flex items-center gap-2'>
                      {/* Step number / check indicator */}
                      <div
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black transition-all',
                          isActive && 'bg-primary text-black',
                          isCompleted && !isActive && 'bg-white/10 text-white',
                          showMutedBorder && 'bg-red-500/10 text-red-400',
                          !isActive &&
                            !wasVisited &&
                            !isCompleted &&
                            'bg-white/5 text-white/20'
                        )}
                      >
                        {isCompleted && !isActive ? (
                          <Check className='h-3 w-3' />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      <span>{step.label}</span>
                    </div>

                    {/* Active underline glow */}
                    {isActive && (
                      <div className='bg-primary absolute right-0 bottom-0 left-0 h-px opacity-40 blur-[2px]' />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          <ScrollBar orientation='horizontal' className='h-px opacity-0' />
        </ScrollArea>
      </div>
    </div>
  );
};
