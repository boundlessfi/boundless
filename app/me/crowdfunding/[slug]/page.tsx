'use client';

import { use } from 'react';

import { useCampaign } from '@/features/crowdfunding';

import {
  ProjectDetails,
  CampaignTabs,
  ProjectLinks,
  TagsSection,
} from './components';
import { CampaignStatusBanner } from '@/components/crowdfunding/CampaignStatusBanner';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CampaignOverviewPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data: campaign, isLoading, error, refetch } = useCampaign(slug);

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

  const project = campaign.project;

  return (
    <div className='space-y-8'>
      {campaign.v2Status && (
        <CampaignStatusBanner
          campaign={campaign}
          onStatusChange={() => refetch()}
        />
      )}

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
        <div className='space-y-6 lg:col-span-3'>
          <ProjectDetails campaign={campaign} project={project} />
          <CampaignTabs campaign={campaign} />
        </div>

        <div className='space-y-6'>
          <ProjectLinks project={project} />
          <TagsSection project={project} />
        </div>
      </div>
    </div>
  );
}
