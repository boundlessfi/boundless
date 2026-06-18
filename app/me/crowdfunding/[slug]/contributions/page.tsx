'use client';

import { use } from 'react';

import { useCampaign } from '@/features/crowdfunding';
import { ContributionsDataTable } from './contributions-data-table';
import { ContributionsMetrics } from '@/components/crowdfunding/contributions-metrics';

interface ContributionsPageProps {
  params: Promise<{ slug: string }>;
}

export default function ContributionsPage({ params }: ContributionsPageProps) {
  const { slug } = use(params);
  const { data: campaign, isLoading, error } = useCampaign(slug);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent' />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className='text-muted-foreground py-20 text-center'>
        Failed to load contributions
      </div>
    );
  }

  const contributors = campaign.contributors ?? [];

  return (
    <div className='space-y-6'>
      <ContributionsMetrics contributors={contributors} currencySymbol='USDC' />
      <ContributionsDataTable data={contributors} loading={false} />
    </div>
  );
}
