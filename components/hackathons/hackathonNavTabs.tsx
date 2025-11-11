'use client';

import { useState } from 'react';

interface HackathonNavTab {
  id: string;
  label: string;
  badge?: number;
}

interface HackathonNavTabsProps {
  tabs: HackathonNavTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function HackathonNavTabs({
  tabs,
  activeTab,
  onTabChange,
}: HackathonNavTabsProps) {
  const [active, setActive] = useState(activeTab || tabs[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    setActive(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className='w-full border-b border-[#a7f950]/20'>
      <div className='mx-auto max-w-7xl px-6'>
        <div className='flex items-center gap-1 overflow-x-auto'>
          {tabs.map(tab => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${isActive ? 'text-[#a7f950]' : 'text-gray-400 hover:text-white'} `}
              >
                <div className='flex items-center gap-2'>
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className='rounded-full bg-[#a7f950]/20 px-2 py-1 text-xs text-[#a7f950]'>
                      {tab.badge}
                    </span>
                  )}
                </div>
                {isActive && (
                  <div className='absolute right-0 bottom-0 left-0 h-0.5 bg-[#a7f950]' />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
