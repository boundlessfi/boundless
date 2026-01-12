'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Search, Grid3x3, List, RefreshCw } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SubmissionsList } from './SubmissionsList';
import type { ParticipantSubmission } from '@/lib/api/hackathons';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type SubmissionStatus =
  | 'SUBMITTED'
  | 'SHORTLISTED'
  | 'DISQUALIFIED'
  | 'WITHDRAWN';

type SubmissionType = 'INDIVIDUAL' | 'TEAM';

interface SubmissionFilters {
  status?: SubmissionStatus;
  type?: SubmissionType;
  search?: string;
}

interface SubmissionsManagementProps {
  submissions: ParticipantSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: SubmissionFilters;
  loading: boolean;
  onFilterChange: (filters: SubmissionFilters) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export function SubmissionsManagement({
  submissions,
  pagination,
  filters,
  loading,
  onFilterChange,
  onPageChange,
  onRefresh,
}: SubmissionsManagementProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState(filters.search ?? '');

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchTerm });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value === 'all' ? undefined : (value as SubmissionStatus),
    });
  };

  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      type: value === 'all' ? undefined : (value as SubmissionType),
    });
  };

  return (
    <div className='space-y-6'>
      {/* Filters and Controls */}
      <div className='flex flex-col gap-4 rounded-xl border border-gray-800/50 bg-gray-900/20 p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between'>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className='flex-1 md:max-w-md'>
          <div className='relative'>
            <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <Input
              type='text'
              placeholder='Search submissions...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='focus:border-primary focus:ring-primary border-gray-700/50 bg-gray-900/50 pl-10 text-white placeholder:text-gray-500'
            />
          </div>
        </form>

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-2'>
          {/* Status Filter */}
          <Select
            value={filters.status ?? 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className='w-[160px] border-gray-700/50 bg-gray-900/50 text-white'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='SUBMITTED'>Submitted</SelectItem>
              <SelectItem value='SHORTLISTED'>Shortlisted</SelectItem>
              <SelectItem value='DISQUALIFIED'>Disqualified</SelectItem>
              <SelectItem value='WITHDRAWN'>Withdrawn</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select
            value={filters.type ?? 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className='w-[160px] border-gray-700/50 bg-gray-900/50 text-white'>
              <SelectValue placeholder='Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value='INDIVIDUAL'>Individual</SelectItem>
              <SelectItem value='TEAM'>Team</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className='flex rounded-lg border border-gray-700/50 bg-gray-900/50 p-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setViewMode('grid')}
              className={
                viewMode === 'grid'
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white'
              }
            >
              <Grid3x3 className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setViewMode('table')}
              className={
                viewMode === 'table'
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white'
              }
            >
              <List className='h-4 w-4' />
            </Button>
          </div>

          {/* Refresh */}
          <Button
            variant='ghost'
            size='sm'
            onClick={onRefresh}
            disabled={loading}
            className='border border-gray-700/50 bg-gray-900/50 text-gray-300 hover:bg-gray-800 hover:text-white'
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className='text-sm text-gray-400'>
        Showing{' '}
        <span className='font-medium text-white'>{submissions.length}</span> of{' '}
        <span className='font-medium text-white'>{pagination.total}</span>{' '}
        submissions
      </div>

      {/* Submissions List */}
      <SubmissionsList
        submissions={submissions}
        viewMode={viewMode}
        loading={loading}
        onRefresh={onRefresh}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
            className='border-gray-700/50 bg-gray-900/50 text-white hover:bg-gray-800'
          >
            Previous
          </Button>
          <span className='text-sm text-gray-400'>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
            className='border-gray-700/50 bg-gray-900/50 text-white hover:bg-gray-800'
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
