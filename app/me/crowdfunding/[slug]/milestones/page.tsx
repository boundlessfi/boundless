'use client';

import { use, useState } from 'react';

import { useCampaign } from '@/features/crowdfunding';
import { MilestoneCard } from '@/components/crowdfunding/milestone-card';
import { MilestonesMetrics } from '@/components/crowdfunding/milestones-metrics';
import { MilestonesPagination } from '@/components/crowdfunding/milestones-pagination';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const ITEMS_PER_PAGE = 4;

export default function MilestonesPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data: campaign, isLoading, error } = useCampaign(slug);
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return (
      <div className='text-muted-foreground py-12 text-center'>Loading...</div>
    );
  }

  if (error || !campaign) {
    return (
      <div className='text-muted-foreground py-12 text-center'>
        Campaign not found
      </div>
    );
  }

  const milestones = campaign.milestones ?? [];
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const totalPages = Math.ceil(milestones.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMilestones = milestones.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className='space-y-8'>
      {milestones.length > 0 && <MilestonesMetrics milestones={milestones} />}

      {milestones.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {paginatedMilestones.map((milestone, index) => (
            <MilestoneCard
              key={milestone.id || index}
              milestone={milestone}
              index={startIndex + index}
              totalAmount={totalAmount}
              campaignSlug={`/me/crowdfunding/${campaign.slug}`}
            />
          ))}
        </div>
      ) : (
        <div className='py-12 text-center'>
          <p className='text-muted-foreground'>No milestones created yet</p>
        </div>
      )}

      {totalPages > 1 && (
        <MilestonesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
