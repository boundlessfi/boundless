'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LucideIcon } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  badge?: number;
  icon?: LucideIcon;
}

interface ListsProps {
  tabs: TabItem[];
  isLoading?: boolean;
}

const SKELETON_TAB_WIDTHS = ['w-20', 'w-24', 'w-28', 'w-20', 'w-24'] as const;

export default function Lists({ tabs, isLoading = false }: ListsProps) {
  if (isLoading) {
    return (
      <div className='scrollbar-hide bg-background sticky top-14 z-50 w-full overflow-hidden overflow-x-auto border-b border-gray-900'>
        <div
          className='flex w-max min-w-full justify-start gap-6 rounded-none bg-transparent px-4 py-0 md:px-16'
          aria-busy='true'
          aria-label='Loading hackathon tabs'
        >
          {SKELETON_TAB_WIDTHS.map((width, i) => (
            <div key={i} className='flex h-14 shrink-0 items-center'>
              <div
                className={`h-4 ${width} animate-pulse rounded bg-white/10`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    // Outer wrapper handles the bottom border + horizontal scroll on mobile
    <div className='scrollbar-hide bg-background sticky top-14 z-50 w-full overflow-hidden overflow-x-auto border-b border-gray-900'>
      <TabsList className='flex w-max min-w-full justify-start gap-6 rounded-none bg-transparent px-4 py-0 md:px-16'>
        {tabs.map(({ id, label, badge, icon: Icon }) => (
          <TabsTrigger
            key={id}
            value={id}
            className={[
              'group',
              'relative shrink-0 rounded-none border-0 bg-transparent px-0! pt-0! pb-0!',
              'text-sm font-medium text-gray-400 transition-colors',
              'max-w-fit hover:text-white',
              'data-[state=active]:text-primary data-[state=active]:shadow-none',
              'data-[state=active]:border-primary data-[state=active]:border-b-2',
              'data-[state=active]:after:absolute data-[state=active]:after:bottom-0',
              'data-[state=active]:after:right-0 data-[state=active]:after:left-0',
              'data-[state=active]:after:bg-primary data-[state=active]:after:h-[2px]',
              "data-[state=active]:after:content-['']",
              'flex h-14 items-center gap-2',
            ].join(' ')}
          >
            {Icon && <Icon className='h-4 w-4' />}
            <span>{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className='group-data-[state=active]:bg-primary/20 group-data-[state=active]:text-primary rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-gray-400 transition-colors'>
                {badge}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
