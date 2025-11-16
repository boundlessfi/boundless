'use client';

import { ChevronDown, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface FilterControlsProps {
  sortFilter: string;
  setSortFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  showAllFilters?: boolean;
}

export function FilterControls({
  sortFilter,
  setSortFilter,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  showAllFilters = true,
}: FilterControlsProps) {
  return (
    <div className='mb-6 flex gap-4'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className='flex items-center gap-2 rounded-lg border border-white/24 px-3 py-2 text-sm text-white transition-colors hover:border-gray-500'>
            <Filter className='h-4 w-4' />
            {sortFilter}
            <ChevronDown className='h-4 w-4' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setSortFilter('Default')}>
            Default
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortFilter('Newest')}>
            Newest
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortFilter('Oldest')}>
            Oldest
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showAllFilters && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-2 rounded-lg border border-white/24 px-3 py-2 text-sm text-white transition-colors hover:border-gray-500'>
                {statusFilter}
                <ChevronDown className='h-4 w-4' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('Status')}>
                Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Funding')}>
                Funding
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Approved')}>
                Approved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Completed')}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-2 rounded-lg border border-white/24 px-3 py-2 text-sm text-white transition-colors hover:border-gray-500'>
                {categoryFilter}
                <ChevronDown className='h-4 w-4' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setCategoryFilter('Category')}>
                Category
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('Health')}>
                Health
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('Finance')}>
                Finance
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setCategoryFilter('Environment')}
              >
                Environment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('Education')}>
                Education
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('Technology')}>
                Technology
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
