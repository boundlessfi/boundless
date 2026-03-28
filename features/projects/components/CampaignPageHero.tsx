'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';
import PageHero from '@/components/shared/PageHero';

export default function CampaignPageHero() {
  const scrollToCampaigns = () => {
    document
      .getElementById('explore-campaigns')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PageHero
      label='Crowdfunding'
      headline='Campaigns powering the next wave of Stellar innovation'
      description='Support the projects you believe in. Milestone-based funding ensures accountability — funds release only when real progress is made.'
      actions={
        <BoundlessButton
          onClick={scrollToCampaigns}
          size='lg'
          className='group'
        >
          <span className='flex items-center gap-2'>
            Explore Campaigns
            <ArrowDown className='h-4 w-4 transition-transform group-hover:translate-y-0.5' />
          </span>
        </BoundlessButton>
      }
    />
  );
}
