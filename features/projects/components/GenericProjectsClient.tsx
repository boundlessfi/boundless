'use client';

import { useMemo, useCallback, useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDownIcon,
  RefreshCwIcon,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Layout,
  Plus,
} from 'lucide-react';
import { useInfinitePublicProjects } from '@/features/projects/hooks/use-project-queries';
import ProjectListCard from './ProjectListCard';
import { BoundlessButton } from '@/components/buttons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import type { PublicProjectsQuery } from '@/features/projects/types';

// ─── Filter config ───────────────────────────────────────────────────────────

interface FilterOption {
  label: string;
  value: string;
}

const SORT_OPTIONS: FilterOption[] = [
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' },
  { label: 'Title A–Z', value: 'title:asc' },
  { label: 'Title Z–A', value: 'title:desc' },
  { label: 'Recently Updated', value: 'updatedAt:desc' },
];

const CATEGORY_OPTIONS: FilterOption[] = [
  { label: 'All Categories', value: '' },
  { label: 'Technology', value: 'technology' },
  { label: 'Art & Creative', value: 'art_creative' },
  { label: 'Environment', value: 'environment' },
  { label: 'Education', value: 'education' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Community', value: 'community' },
  { label: 'DeFi', value: 'defi' },
  { label: 'NFT', value: 'nft' },
  { label: 'Web3', value: 'web3' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function FilterDropdown({
  label,
  options,
  onSelect,
}: {
  label: string;
  options: FilterOption[];
  onSelect: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='justify-between rounded-lg border-[#2B2B2B] bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
        >
          {label}
          <ChevronDown className='ml-2 h-4 w-4 text-gray-500' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='border-[#2B2B2B] bg-black text-white'
      >
        {options.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSelect(option.value)}
            className='cursor-pointer hover:bg-gray-800'
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className='flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#0c0c0c]'>
      <Skeleton className='h-36 w-full sm:h-40 lg:h-44' />
      <div className='flex flex-col gap-2 px-4 pt-3 sm:px-5'>
        <Skeleton className='h-5 w-3/4' />
        <Skeleton className='h-3 w-full' />
        <Skeleton className='h-3 w-2/3' />
      </div>
      <div className='mt-auto flex items-center justify-between border-t border-neutral-800 px-4 py-3 sm:px-5'>
        <Skeleton className='h-3 w-20' />
        <Skeleton className='h-3 w-16' />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface GenericProjectsClientProps {
  className?: string;
}

export default function GenericProjectsClient({
  className,
}: GenericProjectsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortLabel, setSortLabel] = useState('Newest First');
  const [sortBy, setSortBy] =
    useState<PublicProjectsQuery['sortBy']>('createdAt');
  const [sortOrder, setSortOrder] =
    useState<PublicProjectsQuery['sortOrder']>('desc');
  const [category, setCategory] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('All Categories');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [, startTransition] = useTransition();

  const debouncedSearch = useDebounce(searchTerm, 400);

  const filters = useMemo<Omit<PublicProjectsQuery, 'page'>>(
    () => ({
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(category ? { category } : {}),
      sortBy,
      sortOrder,
    }),
    [debouncedSearch, category, sortBy, sortOrder]
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfinitePublicProjects(filters);

  const projects = useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data]
  );

  const totalCount = data?.pages[0]?.pagination.total ?? 0;

  const handleSort = useCallback((value: string) => {
    const [field, order] = value.split(':') as [
      PublicProjectsQuery['sortBy'],
      PublicProjectsQuery['sortOrder'],
    ];
    const option = SORT_OPTIONS.find(o => o.value === value);
    startTransition(() => {
      setSortBy(field);
      setSortOrder(order);
      setSortLabel(option?.label ?? 'Newest First');
    });
  }, []);

  const handleCategory = useCallback((value: string) => {
    const option = CATEGORY_OPTIONS.find(o => o.value === value);
    startTransition(() => {
      setCategory(value);
      setCategoryLabel(option?.label ?? 'All Categories');
    });
  }, []);

  const clearSearch = useCallback(() => setSearchTerm(''), []);

  const isFiltering = !!debouncedSearch || !!category;

  const activeFilterCount = [
    category !== '',
    sortBy !== 'createdAt' || sortOrder !== 'desc',
  ].filter(Boolean).length;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* ── Header / Filters ── */}
      <div className='w-full text-white'>
        <h2
          id='explore-project'
          className='font-inter mb-6 text-2xl text-white md:text-4xl lg:text-5xl'
        >
          Explore Boundless Projects
        </h2>

        {/* Desktop filters */}
        <div className='hidden flex-col items-start gap-6 md:flex lg:flex-row lg:items-center lg:gap-8'>
          <div className='flex flex-wrap items-center gap-3 lg:gap-4'>
            <FilterDropdown
              label={sortLabel}
              options={SORT_OPTIONS}
              onSelect={handleSort}
            />
            <FilterDropdown
              label={categoryLabel}
              options={CATEGORY_OPTIONS}
              onSelect={handleCategory}
            />
          </div>

          <div className='relative ml-auto w-full max-w-sm'>
            <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500' />
            <Input
              type='text'
              placeholder='Search projects...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='bg-background w-full rounded-lg border-[#2B2B2B] py-3 pr-10 pl-10 text-base text-white placeholder-gray-500 focus:border-gray-600'
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-white'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
        </div>

        {/* Mobile filters */}
        <div className='space-y-3 md:hidden'>
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500' />
            <Input
              type='text'
              placeholder='Search projects...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='bg-background w-full rounded-lg border-[#2B2B2B] py-3 pr-10 pl-10 text-base text-white placeholder-gray-500'
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-white'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileFiltersOpen(prev => !prev)}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-[#2B2B2B] px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white',
              mobileFiltersOpen && 'bg-gray-900 text-white'
            )}
          >
            <SlidersHorizontal className='h-4 w-4' />
            Filters
            {activeFilterCount > 0 && (
              <span className='bg-primary ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-black'>
                {activeFilterCount}
              </span>
            )}
          </button>

          {mobileFiltersOpen && (
            <div className='flex flex-wrap gap-2'>
              <FilterDropdown
                label={sortLabel}
                options={SORT_OPTIONS}
                onSelect={handleSort}
              />
              <FilterDropdown
                label={categoryLabel}
                options={CATEGORY_OPTIONS}
                onSelect={handleCategory}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Results summary ── */}
      {!isLoading && !error && projects.length > 0 && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-gray-400'>
            Showing{' '}
            <span className='font-medium text-white'>{projects.length}</span> of{' '}
            <span className='font-medium text-white'>{totalCount}</span> project
            {totalCount !== 1 && 's'}
            {debouncedSearch && (
              <>
                {' '}
                matching{' '}
                <span className='font-medium text-white'>
                  &quot;{debouncedSearch}&quot;
                </span>
              </>
            )}
          </p>
          {debouncedSearch && (
            <button
              onClick={clearSearch}
              className='flex items-center gap-1 text-xs text-gray-500 hover:text-white'
            >
              <X className='h-3 w-3' />
              Clear search
            </button>
          )}
        </div>
      )}

      {/* ── Content ── */}
      <main className='min-h-[50vh]'>
        <AnimatePresence mode='wait'>
          {isLoading ? (
            <motion.div
              key='loading'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key='error'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex flex-col items-center justify-center py-20'
            >
              <p className='mb-4 text-gray-400'>
                Failed to load projects. Please try again.
              </p>
              <BoundlessButton
                onClick={() => refetch()}
                variant='outline'
                icon={<RefreshCwIcon className='h-4 w-4' />}
              >
                Try Again
              </BoundlessButton>
            </motion.div>
          ) : projects.length === 0 ? (
            <motion.div
              key='empty'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-20 text-center'
            >
              <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10'>
                <Layout className='h-8 w-8 text-white/40' />
              </div>
              <h3 className='mb-2 text-2xl font-semibold text-white'>
                {isFiltering ? 'No matching projects' : 'No Projects Yet'}
              </h3>
              <p className='mb-8 max-w-sm text-white/60'>
                {isFiltering
                  ? "We couldn't find any projects matching your filters. Try adjusting them."
                  : 'Create your first project on Boundless to get started.'}
              </p>
              {isFiltering ? (
                <BoundlessButton
                  variant='outline'
                  onClick={() => {
                    setSearchTerm('');
                    setCategory('');
                    setCategoryLabel('All Categories');
                    setSortBy('createdAt');
                    setSortOrder('desc');
                    setSortLabel('Newest First');
                  }}
                >
                  Clear all filters
                </BoundlessButton>
              ) : (
                <BoundlessButton
                  variant='default'
                  className='flex items-center gap-2'
                >
                  <Plus className='h-4 w-4' />
                  Create New Project
                </BoundlessButton>
              )}
            </motion.div>
          ) : (
            <motion.div
              key='content'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
                {projects.map(project => (
                  <ProjectListCard key={project.id} project={project} />
                ))}
              </div>

              {hasNextPage && (
                <div className='mt-12 flex justify-center'>
                  <BoundlessButton
                    onClick={() => fetchNextPage()}
                    variant='outline'
                    disabled={isFetchingNextPage}
                    className='min-w-[200px]'
                    icon={
                      isFetchingNextPage ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <ArrowDownIcon className='h-4 w-4' />
                      )
                    }
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Load More'}
                  </BoundlessButton>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
