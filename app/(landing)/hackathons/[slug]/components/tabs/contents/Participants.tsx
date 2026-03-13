'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  useHackathon,
  useHackathonParticipants,
} from '@/hooks/hackathon/use-hackathon-queries';
import { TabsContent } from '@/components/ui/tabs';
import { ChevronDown, Search, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ParticipantCard from './participants/ParticipantCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Participants = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: hackathon } = useHackathon(slug);

  // State for filtering and pagination
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'submitted' | 'in_progress'
  >('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 12;

  const {
    data: participantsData,
    isLoading,
    isFetching,
  } = useHackathonParticipants(slug, {
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  if (!hackathon) return null;

  const participants = participantsData?.participants || [];
  const totalBuilders = participantsData?.pagination?.total || 0;
  const hasNextPage = participantsData?.pagination?.hasNext || false;

  // Mock skills for the filter dropdown
  const availableSkills = [
    'Solidity',
    'Rust',
    'React',
    'TypeScript',
    'Python',
    'Go',
    'Design',
  ];

  const handleLoadMore = () => {
    if (hasNextPage) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <TabsContent
      value='participants'
      className='mt-0 w-full space-y-8 outline-none'
    >
      {/* Header with Count and Filters */}
      <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-white'>Participants</h2>
          <p className='mt-1 text-gray-500'>
            <span className='font-bold text-gray-300'>
              {totalBuilders.toLocaleString()}
            </span>{' '}
            builders competing in {hackathon.name}
          </p>
        </div>

        <div className='flex items-center gap-3'>
          {/* Skills Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='hover:border-primary/20 flex min-w-[140px] items-center justify-between gap-2 rounded-xl border border-white/5 bg-[#141517] px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:text-white'>
                <div className='flex items-center gap-2'>
                  <Filter className='h-3.5 w-3.5' />
                  <span>
                    {skillFilter === 'all' ? 'All Skills' : skillFilter}
                  </span>
                </div>
                <ChevronDown className='h-4 w-4 opacity-50' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-48 border-white/10 bg-[#141517] text-gray-300'
            >
              <DropdownMenuItem onClick={() => setSkillFilter('all')}>
                All Skills
              </DropdownMenuItem>
              {availableSkills.map(skill => (
                <DropdownMenuItem
                  key={skill}
                  onClick={() => setSkillFilter(skill)}
                >
                  {skill}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='hover:border-primary/20 flex min-w-[140px] items-center justify-between gap-2 rounded-xl border border-white/5 bg-[#141517] px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:text-white'>
                <span>
                  {statusFilter === 'all'
                    ? 'Status: All'
                    : statusFilter === 'submitted'
                      ? 'Status: Submitted'
                      : 'Status: In Progress'}
                </span>
                <ChevronDown className='h-4 w-4 opacity-50' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-48 border-white/10 bg-[#141517] text-gray-300'
            >
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('submitted')}>
                Submitted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('in_progress')}>
                In Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid of Participant Cards */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
        {isLoading && page === 1 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='h-[200px] animate-pulse rounded-xl bg-white/5'
            />
          ))
        ) : participants.length > 0 ? (
          participants.map(p => (
            <ParticipantCard
              key={p.id}
              name={p.user.profile.name}
              username={p.user.profile.username}
              image={p.user.profile.image}
              submitted={!!p.submittedAt}
              skills={p.user.profile.skills}
            />
          ))
        ) : (
          <div className='col-span-full flex flex-col items-center justify-center py-20 text-center opacity-50'>
            <Search className='mb-4 h-12 w-12 text-gray-700' />
            <p className='text-lg font-bold text-gray-400'>No builders found</p>
            <p className='text-sm text-gray-600'>
              Try adjusting your filters to find more participants.
            </p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className='flex justify-center pt-8'>
          <button
            onClick={handleLoadMore}
            disabled={isFetching}
            className='hover:border-primary/20 flex items-center gap-3 rounded-xl border border-white/5 bg-[#141517] px-10 py-4 text-sm font-bold text-gray-400 transition-all hover:bg-[#18181B] hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isFetching ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load More Builders</span>
                <ChevronDown className='h-4 w-4' />
              </>
            )}
          </button>
        </div>
      )}
    </TabsContent>
  );
};

export default Participants;
