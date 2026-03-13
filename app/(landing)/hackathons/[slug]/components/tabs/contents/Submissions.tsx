'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useHackathon,
  useExploreSubmissions,
} from '@/hooks/hackathon/use-hackathon-queries';
import { ExploreSubmissionsResponse } from '@/lib/api/hackathons';
import { TabsContent } from '@/components/ui/tabs';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import SubmissionCard from './submissions/SubmissionCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Submissions = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: hackathon } = useHackathon(slug);

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState('All Projects');
  const [statusFilter, setStatusFilter] = useState('Status');
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: submissionsData, isLoading } = useExploreSubmissions(
    hackathon?.id || '',
    {
      page,
      limit,
      search: searchQuery,
      category: trackFilter === 'All Projects' ? undefined : trackFilter,
      status: statusFilter === 'Status' ? undefined : statusFilter,
    },
    !!hackathon?.id
  );

  const submissions = submissionsData?.submissions || [];
  const pagination = submissionsData?.pagination || {
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  if (!hackathon) return null;

  const tracks = ['All Projects', ...(hackathon.categories || [])];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top of tab content if needed
  };

  return (
    <TabsContent
      value='submissions'
      className='mt-0 w-full space-y-8 outline-none'
    >
      <div className='mb-10'>
        <h2 className='text-2xl font-bold text-white'>Explore Submissions</h2>
        <p className='mt-1 text-gray-400'>
          Browse projects submitted by our community of builders.
        </p>
      </div>

      {/* Header with Search and Filters */}
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center'>
        {/* Search Bar */}
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500' />
          <input
            type='text'
            placeholder='Search projects by name, tech, or creator...'
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to page 1 on search
            }}
            className='focus:border-primary/20 h-12 w-full rounded-xl border border-white/5 bg-[#141517] pr-4 pl-12 text-sm text-white placeholder-gray-500 transition-all outline-none focus:bg-[#1a1b1e]'
          />
        </div>

        {/* Filters */}
        <div className='flex items-center gap-3'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='hover:border-primary/20 text-primary flex items-center gap-2 rounded-xl border border-white/5 bg-[#232B20]/30 px-5 py-3 text-sm font-bold transition-all'>
                {trackFilter} <ChevronDown className='h-4 w-4' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-48 border-white/10 bg-[#141517] text-gray-300'
            >
              {tracks.map(track => (
                <DropdownMenuItem
                  key={track}
                  onClick={() => {
                    setTrackFilter(track);
                    setPage(1);
                  }}
                  className='cursor-pointer hover:bg-white/5'
                >
                  {track}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='hover:border-primary/20 text-primary flex items-center gap-2 rounded-xl border border-white/5 bg-[#232B20]/30 px-5 py-3 text-sm font-bold transition-all'>
                {statusFilter} <ChevronDown className='h-4 w-4' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-48 border-white/10 bg-[#141517] text-gray-300'
            >
              {['Status', 'Submitted', 'Shortlisted'].map(status => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className='cursor-pointer hover:bg-white/5'
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid of Submission Cards */}
      {isLoading ? (
        <div className='flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-3xl border border-white/5 bg-[#0D0E10] py-20 opacity-50'>
          <Loader2 className='text-primary h-10 w-10 animate-spin' />
          <p className='text-sm font-medium tracking-widest text-gray-500 uppercase'>
            Loading Submissions...
          </p>
        </div>
      ) : submissions.length > 0 ? (
        <>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {submissions.map((sub: ExploreSubmissionsResponse) => (
              <SubmissionCard key={sub.id} submission={sub} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 pt-8'>
              <button
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(page - 1)}
                className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-[#141517] text-gray-400 transition-all hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
              >
                <ChevronLeft className='h-5 w-5' />
              </button>

              {Array.from({ length: Math.min(pagination.totalPages, 5) }).map(
                (_, i) => {
                  // Simplistic pagination display logic
                  const pageNum = i + 1;
                  const isActive = pageNum === page;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        'h-10 w-10 rounded-xl border text-sm font-bold transition-all',
                        isActive
                          ? 'border-primary bg-primary text-black'
                          : 'border-white/5 bg-[#141517] text-gray-400 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              {pagination.totalPages > 5 && (
                <span className='mx-2 text-gray-600'>...</span>
              )}

              {pagination.totalPages > 5 && (
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  className={cn(
                    'h-10 w-10 rounded-xl border text-sm font-bold transition-all',
                    page === pagination.totalPages
                      ? 'border-primary bg-primary text-black'
                      : 'border-white/5 bg-[#141517] text-gray-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {pagination.totalPages}
                </button>
              )}

              <button
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(page + 1)}
                className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-[#141517] text-gray-400 transition-all hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
              >
                <ChevronRight className='h-5 w-5' />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className='flex flex-col items-center justify-center space-y-6 rounded-3xl border border-white/5 bg-[#0D0E10] py-24 text-center'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-white/5'>
            <Sparkles className='h-10 w-10 text-gray-600' />
          </div>
          <div className='space-y-2'>
            <h3 className='text-2xl font-bold text-white'>
              No Submissions Found
            </h3>
            <p className='text-gray-500'>
              Try adjusting your search or filters to find projects.
            </p>
          </div>
        </div>
      )}
    </TabsContent>
  );
};

export default Submissions;
