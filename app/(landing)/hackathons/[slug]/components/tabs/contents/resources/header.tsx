'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResourceHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = ['All', 'Technical', 'Design', 'Media'];

export const ResourceHeader = ({
  activeTab,
  setActiveTab,
}: ResourceHeaderProps) => {
  return (
    <div className='flex flex-col justify-between gap-6 md:flex-row md:items-end'>
      <div className='mb-10'>
        <h2 className='text-2xl font-bold text-white'>Developer Resources</h2>
        <p className='mt-1 text-gray-400'>
          Everything you need to build your project on Boundless.
        </p>
      </div>

      <div className='flex gap-1 rounded-xl border border-white/5 bg-black/40 p-1'>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 sm:px-6',
              activeTab === tab
                ? 'bg-primary shadow-[0_0_20px_rgba(46, 237, 170,0.2)] text-black'
                : 'text-gray-500 hover:bg-white/5 hover:text-white'
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};
