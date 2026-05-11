'use client';

import React, { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useHackathon,
  useHackathonParticipants,
} from '@/hooks/hackathon/use-hackathon-queries';
import { useDebounce } from '@/hooks/use-debounce';
import { TabsContent } from '@/components/ui/tabs';
import { ChevronDown, Search, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ParticipantCard from './participants/ParticipantCard';
import { Participant } from '@/types/hackathon/participant';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMessages } from '@/components/messages/MessagesProvider';
import { createConversation } from '@/lib/api/messages';
import { toast } from 'sonner';
import type { ApiError } from '@/lib/api/api';

const isApiError = (e: unknown): e is ApiError =>
  e !== null &&
  typeof e === 'object' &&
  'message' in e &&
  typeof (e as ApiError).message === 'string';

const Participants = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: hackathon } = useHackathon(slug);
  const { openMessages } = useMessages();

  const handleMessageParticipant = useCallback(
    async (userId: string, trigger: HTMLElement) => {
      try {
        const { conversation } = await createConversation(userId);
        openMessages({ conversationId: conversation.id, trigger });
      } catch (err) {
        const msg = isApiError(err)
          ? err.message
          : 'Failed to start conversation';
        toast.error(msg);
      }
    },
    [openMessages]
  );

  // State for filtering and pagination
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'submitted' | 'in_progress'
  >('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [participationType, setParticipationType] = useState<
    'all' | 'individual' | 'team'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [page, setPage] = useState(1);
  const [accumulatedParticipants, setAccumulatedParticipants] = useState<
    Participant[]
  >([]);
  const limit = 12;

  const {
    data: participantsData,
    isLoading,
    isFetching,
  } = useHackathonParticipants(slug, {
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
    skill: skillFilter === 'all' ? undefined : skillFilter,
    type: participationType === 'all' ? undefined : participationType,
    search: debouncedSearch || undefined,
  });

  // Reset page and list when filters change
  React.useEffect(() => {
    setPage(1);
    setAccumulatedParticipants([]);
  }, [statusFilter, skillFilter, participationType, debouncedSearch]);

  // Accumulate participants as they are fetched
  React.useEffect(() => {
    if (participantsData?.participants) {
      if (page === 1) {
        setAccumulatedParticipants(participantsData.participants);
      } else {
        setAccumulatedParticipants(prev => [
          ...prev,
          ...participantsData.participants,
        ]);
      }
    }
  }, [participantsData?.participants, page]);

  const availableSkills = participantsData?.availableSkills ?? [];

  if (!hackathon) return null;

  const totalBuilders = participantsData?.pagination?.total || 0;
  const hasNextPage = participantsData?.pagination?.hasNext || false;

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
        <div className='flex flex-1 flex-col gap-4'>
          <div>
            <h2 className='text-2xl font-bold text-white'>Participants</h2>
            <p className='mt-1 text-gray-500'>
              <span className='font-bold text-gray-300'>
                {totalBuilders.toLocaleString()}
              </span>{' '}
              builders competing in {hackathon.name}
            </p>
          </div>

          {/* Search Bar */}
          <div className='relative w-full max-w-md'>
            <input
              type='text'
              placeholder='Search by name, username, or project...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='hover:border-primary/20 focus:border-primary/30 h-10 w-full rounded-xl border border-white/5 bg-[#141517] pr-4 pl-10 text-sm text-white transition-all outline-none placeholder:text-gray-500'
            />
            <Search className='absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-500' />
          </div>
        </div>

        <div className='grid grid-cols-1 gap-2 sm:grid-cols-3 md:flex md:items-center md:gap-3'>
          {/* Skills Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='hover:border-primary/20 flex w-full items-center justify-between gap-2 rounded-xl border border-white/5 bg-[#141517] px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:text-white md:w-auto md:min-w-[140px]'>
                <div className='flex min-w-0 items-center gap-2'>
                  <Filter className='h-3.5 w-3.5 shrink-0' />
                  <span className='truncate'>
                    {skillFilter === 'all' ? 'All Skills' : skillFilter}
                  </span>
                </div>
                <ChevronDown className='h-4 w-4 shrink-0 opacity-50' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='max-h-[60vh] w-48 overflow-y-auto border-white/10 bg-[#141517] text-gray-300'
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

          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='hover:border-primary/20 flex w-full items-center justify-between gap-2 rounded-xl border border-white/5 bg-[#141517] px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:text-white md:w-auto md:min-w-[140px]'>
                <span className='truncate'>
                  {participationType === 'all'
                    ? 'Type: All'
                    : participationType === 'individual'
                      ? 'Type: Individual'
                      : 'Type: Team'}
                </span>
                <ChevronDown className='h-4 w-4 shrink-0 opacity-50' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-48 border-white/10 bg-[#141517] text-gray-300'
            >
              <DropdownMenuItem onClick={() => setParticipationType('all')}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setParticipationType('individual')}
              >
                Individual
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setParticipationType('team')}>
                Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='hover:border-primary/20 flex w-full items-center justify-between gap-2 rounded-xl border border-white/5 bg-[#141517] px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:text-white md:w-auto md:min-w-[140px]'>
                <span className='truncate'>
                  {statusFilter === 'all'
                    ? 'Status: All'
                    : statusFilter === 'submitted'
                      ? 'Status: Submitted'
                      : 'Status: In Progress'}
                </span>
                <ChevronDown className='h-4 w-4 shrink-0 opacity-50' />
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
        ) : accumulatedParticipants.length > 0 ? (
          accumulatedParticipants.map(p => (
            <ParticipantCard
              key={p.id}
              name={p.user.profile.name}
              username={p.user.profile.username}
              image={p.user.profile.image || undefined}
              submitted={!!p.submittedAt}
              skills={p.user.profile.skills}
              userId={p.userId ?? p.user?.id}
              onMessage={trigger =>
                handleMessageParticipant(p.userId ?? p.user.id, trigger)
              }
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
