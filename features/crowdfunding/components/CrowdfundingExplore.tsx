'use client';

import { useMemo, useState } from 'react';

import EmptyState from '@/components/EmptyState';
import { BoundlessButton } from '@/components/buttons';
import ExploreHeader from '@/features/projects/components/ExploreHeader';
import ProjectCard from '@/features/projects/components/ProjectCard';

import { useCampaigns } from '../api/use-campaign';
import type { CrowdfundingCampaign } from '../types';

/**
 * Public crowdfunding explore: the projects-grid design (ExploreHeader filters
 * + ProjectCard grid) sourced from live campaigns. Cards link to the dedicated
 * crowdfunding detail page.
 */
export default function CrowdfundingExplore() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading, isError, refetch } = useCampaigns(1, 50);

  const campaigns = useMemo<CrowdfundingCampaign[]>(() => {
    const list = (data?.data ?? []) as CrowdfundingCampaign[];
    const q = search.trim().toLowerCase();
    return list.filter(c => {
      const p = c.project;
      const matchesSearch =
        !q ||
        p?.title?.toLowerCase().includes(q) ||
        p?.tagline?.toLowerCase().includes(q) ||
        p?.vision?.toLowerCase().includes(q);
      const matchesCategory = !category || p?.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [data, search, category]);

  const isFiltering = Boolean(search || category);

  return (
    <div className='flex flex-col gap-8' id='explore-campaigns'>
      <ExploreHeader
        onSearch={setSearch}
        onCategoryChange={c => setCategory(c === 'all' ? '' : c)}
      />

      <main className='min-h-[50vh]'>
        {isLoading ? (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-2'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className='h-80 animate-pulse rounded-xl border border-neutral-800 bg-[#0c0c0c]'
              />
            ))}
          </div>
        ) : isError ? (
          <div className='flex justify-center py-12'>
            <EmptyState
              title='Unable to load campaigns'
              description='Something went wrong while loading campaigns.'
              type='compact'
              action={
                <BoundlessButton onClick={() => refetch()} variant='outline'>
                  Try again
                </BoundlessButton>
              }
            />
          </div>
        ) : campaigns.length === 0 ? (
          <div className='flex justify-center py-12'>
            <EmptyState
              title={isFiltering ? 'No matching campaigns' : 'No campaigns yet'}
              description={
                isFiltering
                  ? 'Try adjusting your search or filters.'
                  : 'There are no campaigns to display right now.'
              }
              type='default'
            />
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-2'>
            {campaigns.map(c => (
              <ProjectCard
                key={c.id}
                data={c}
                basePath='/crowdfunding'
                isFullWidth
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
