'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { getCrowdfundingProject } from '@/features/projects/api';
import { Crowdfunding } from '@/features/projects/types';

import { MilestoneCard } from '@/components/crowdfunding/milestone-card';
import { MilestonesMetrics } from '@/components/crowdfunding/milestones-metrics';
import { MilestonesPagination } from '@/components/crowdfunding/milestones-pagination';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const ITEMS_PER_PAGE = 4;

export default function MilestonesPage({ params }: PageProps) {
  const [campaign, setCampaign] = useState<Crowdfunding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { slug } = await params;
        const data = await getCrowdfundingProject(slug);
        setCampaign(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [params]);

  if (loading) {
    return (
      <div className='container mx-auto max-w-7xl px-4 py-12'>
        <div className='text-muted-foreground text-center'>Loading...</div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className='container mx-auto max-w-7xl px-4 py-12'>
        <div className='text-muted-foreground text-center'>
          Campaign not found
        </div>
      </div>
    );
  }

  const milestones = campaign.milestones || [];
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const totalPages = Math.ceil(milestones.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMilestones = milestones.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className='container mx-auto max-w-7xl space-y-8 px-4 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' asChild className='h-8 w-8 p-0'>
            <Link href={`/me/crowdfunding/${campaign.slug}`}>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Milestones</h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}{' '}
              total
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      {milestones.length > 0 && <MilestonesMetrics milestones={milestones} />}

      {/* Milestones List */}
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

      {/* Pagination */}
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
