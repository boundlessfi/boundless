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
  visitedSteps?: Set<CreationStep>;
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
    <div className='shrink-0 overflow-hidden border-b border-white/6'>
      <ScrollArea className='w-full overflow-x-auto'>
        <div className='flex w-max min-w-full'>
          <TabsList className='inline-flex h-auto bg-transparent p-0'>
            {steps.map((step, index) => {
              const isActive = step.key === activeTab;
              const isCompleted = completedSteps.has(step.key);
              const wasVisited = visitedSteps.has(step.key);

              return (
                <TabsTrigger
                  key={step.key}
                  value={step.key}
                  onClick={() => navigateToStep(step.key)}
                  className={cn(
                    'group relative flex items-center gap-1.5 rounded-none border-b-2 bg-transparent px-2.5 py-2.5 text-xs font-medium transition-all data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:gap-2 sm:px-5 sm:py-3 sm:text-sm',
                    isActive && 'border-b-primary text-white',
                    isCompleted &&
                      !isActive &&
                      'border-b-white/20 text-white/50',
                    wasVisited &&
                      !isActive &&
                      !isCompleted &&
                      'border-b-transparent text-white/35',
                    !isActive &&
                      !wasVisited &&
                      !isCompleted &&
                      'border-b-transparent text-white/25',
                    !isActive && 'hover:text-white/60'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold transition-colors',
                      isActive && 'bg-primary text-black',
                      isCompleted && !isActive && 'bg-white/10 text-white/60',
                      !isActive && !isCompleted && 'bg-white/6 text-white/30'
                    )}
                  >
                    {isCompleted && !isActive ? (
                      <Check className='h-3 w-3' />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className='hidden sm:inline'>{step.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        <ScrollBar orientation='horizontal' className='h-px opacity-0' />
      </ScrollArea>
    </div>
  );
};
