'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, LayoutGrid, List, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface ParticipantToolbarProps {
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onViewChange: (view: 'grid' | 'table') => void;
  currentView: 'grid' | 'table';
}

export const ParticipantToolbar: React.FC<ParticipantToolbarProps> = ({
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onViewChange,
  currentView,
}) => {
  const [searchValue, setSearchValue] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const debouncedSearch = useDebounce(searchValue, 500);

  React.useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const handleReset = () => {
    setSearchValue('');
    onSearchChange('');
    setStatusFilter('all');
    setTypeFilter('all');
    onStatusFilterChange('all');
    onTypeFilterChange('all');
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onStatusFilterChange(value);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    onTypeFilterChange(value);
  };

  return (
    <div className='bg-background-card flex flex-col gap-4 rounded-lg border border-gray-900/40 p-4 md:flex-row md:items-center md:justify-between'>
      <div className='relative max-w-sm flex-1'>
        <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
        <Input
          placeholder='Search participants...'
          className='bg-background-card border-gray-800 pl-9 text-white focus:ring-gray-700'
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <div className='w-[140px]'>
          <Select onValueChange={handleStatusChange} value={statusFilter}>
            <SelectTrigger className='bg-background-card border-gray-800 text-xs text-white'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent className='bg-background-card border-gray-800 text-white'>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='submitted'>Submitted</SelectItem>
              <SelectItem value='not_submitted'>Not Submitted</SelectItem>
              <SelectItem value='shortlisted'>Shortlisted</SelectItem>
              <SelectItem value='disqualified'>Disqualified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='w-[140px]'>
          <Select onValueChange={handleTypeChange} value={typeFilter}>
            <SelectTrigger className='bg-background-card border-gray-800 text-xs text-white'>
              <SelectValue placeholder='Type' />
            </SelectTrigger>
            <SelectContent className='bg-background-card border-gray-800 text-white'>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value='individual'>Individual</SelectItem>
              <SelectItem value='team'>Team</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant='ghost'
          size='sm'
          className='h-9 text-gray-400 hover:bg-gray-900 hover:text-white'
          onClick={handleReset}
        >
          <FilterX className='mr-2 h-4 w-4' />
          Reset
        </Button>

        <div className='mx-1 hidden h-6 w-px bg-gray-800 min-[400px]:block' />

        <div className='flex items-center gap-1 rounded-md bg-gray-900 p-1'>
          <Button
            variant='ghost'
            size='icon'
            className={cn(
              'h-7 w-7 rounded-sm',
              currentView === 'table'
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300'
            )}
            onClick={() => onViewChange('table')}
          >
            <List className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className={cn(
              'h-7 w-7 rounded-sm',
              currentView === 'grid'
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300'
            )}
            onClick={() => onViewChange('grid')}
          >
            <LayoutGrid className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
};
