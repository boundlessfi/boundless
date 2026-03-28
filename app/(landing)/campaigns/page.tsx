import React from 'react';
import CampaignPageHero from '@/features/projects/components/CampaignPageHero';
import ProjectsClient from '@/features/projects/components/ProjectsPage';

export default function CampaignsPage() {
  return (
    <div className='bg-background min-h-screen'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8'>
        <div className='space-y-12'>
          <CampaignPageHero />
          <ProjectsClient id='explore-campaigns' />
        </div>
      </div>
    </div>
  );
}
