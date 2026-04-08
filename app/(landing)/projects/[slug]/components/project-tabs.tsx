'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ProjectViewModel } from '@/features/projects/types/view-model';

export type ProjectTabValue =
  | 'details'
  | 'team'
  | 'milestones'
  | 'voters'
  | 'backers'
  | 'comments';

interface ProjectTab {
  value: ProjectTabValue;
  label: string;
  count?: number;
}

interface ProjectTabsProps {
  tabs: ProjectTab[];
  defaultValue?: ProjectTabValue;
  value?: ProjectTabValue;
  onValueChange?: (value: ProjectTabValue) => void;
}

/**
 * Build the tab list for a project, respecting its type.
 * - generic: Details, Team, Voters, Comments
 * - campaign: Details, Team, Milestones, Voters, Backers, Comments
 * - submission: Details, Team, Timeline, Voters, Comments
 */
export function buildProjectTabs(
  vm: ProjectViewModel,
  counts?: Partial<Record<ProjectTabValue, number>>
): ProjectTab[] {
  const base: ProjectTab[] = [
    { value: 'details', label: 'Details' },
    { value: 'team', label: 'Team', count: counts?.team ?? vm.team?.length },
  ];

  if (vm.projectType === 'campaign') {
    base.push(
      {
        value: 'milestones',
        label: 'Milestones',
        count: counts?.milestones ?? vm.campaign?.milestones?.length,
      },
      {
        value: 'voters',
        label: 'Voters',
        count: counts?.voters ?? vm.voteCount,
      },
      {
        value: 'backers',
        label: 'Backers',
        count: counts?.backers ?? vm.campaign?.contributors?.length,
      }
    );
  } else if (vm.projectType === 'submission') {
    base.push(
      {
        value: 'milestones',
        label: 'Timeline',
        count: counts?.milestones ?? vm.submission?.milestones?.length,
      },
      {
        value: 'voters',
        label: 'Voters',
        count: counts?.voters ?? vm.voteCount,
      }
    );
  } else {
    base.push({
      value: 'voters',
      label: 'Voters',
      count: counts?.voters ?? vm.voteCount,
    });
  }

  base.push({
    value: 'comments',
    label: 'Comments',
    count: counts?.comments,
  });

  return base;
}

export function ProjectTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
}: ProjectTabsProps) {
  const fallback = defaultValue ?? tabs[0]?.value ?? 'details';
  const [internal, setInternal] = useState<ProjectTabValue>(fallback);
  const active = value ?? internal;

  const handleClick = (next: ProjectTabValue) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <div className='border-stepper-border w-full border-b'>
      <nav
        className='scrollbar-hide flex items-center gap-8 overflow-x-auto sm:gap-10'
        role='tablist'
        aria-label='Project sections'
      >
        {tabs.map(tab => {
          const isActive = tab.value === active;
          return (
            <button
              key={tab.value}
              type='button'
              role='tab'
              aria-selected={isActive}
              onClick={() => handleClick(tab.value)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 pb-3 text-sm font-medium whitespace-nowrap transition-colors',
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={cn(
                    'inline-flex min-w-6 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-medium',
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'bg-inactive text-gray-400'
                  )}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className='bg-primary absolute right-0 -bottom-px left-0 h-[2px] rounded-full' />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
