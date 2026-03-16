'use client';

import { cn } from '@/lib/utils';

interface HeaderProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { label: 'All', id: 'all' },
  { label: 'Technical', id: 'technical' },
  { label: 'Logistics', id: 'logistics' },
  { label: 'Socials', id: 'socials' },
];

export function AnnouncementsHeader({
  activeFilter,
  onFilterChange,
}: HeaderProps) {
  return (
    <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <h2 className='text-2xl font-bold text-white'>Announcements</h2>
        <p className='mt-1 text-gray-500'>Stay updated with the latest news.</p>
      </div>

      <div className='flex items-center rounded-lg bg-[#141517] p-1'>
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              'rounded-md px-4 py-1.5 text-xs font-semibold transition-all',
              activeFilter === filter.id
                ? 'bg-[#1C1E21] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
