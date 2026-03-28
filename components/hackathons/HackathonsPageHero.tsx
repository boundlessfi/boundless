'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import { useRouter } from 'nextjs-toploader/app';
import PageHero from '@/components/shared/PageHero';

export default function HackathonsPageHero() {
  const router = useRouter();

  const scrollToHackathons = () => {
    document
      .getElementById('explore-hackathons')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PageHero
      label='Hackathons'
      headline='Discover hackathons shaping the future on Stellar'
      description='Join innovative hackathons, compete for prizes, and build the next generation of blockchain solutions.'
      actions={
        <>
          <BoundlessButton
            onClick={scrollToHackathons}
            size='lg'
            className='group'
          >
            <span className='flex items-center gap-2'>
              Start Exploring
              <ArrowDown className='h-4 w-4 transition-transform group-hover:translate-y-0.5' />
            </span>
          </BoundlessButton>
          <BoundlessButton
            onClick={() => router.push('/organizations')}
            variant='outline'
            size='lg'
          >
            Create Hackathon
          </BoundlessButton>
        </>
      }
    />
  );
}
