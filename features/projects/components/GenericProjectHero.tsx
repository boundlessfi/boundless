'use client';

import React from 'react';
import { Plus, Layout } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';
import PageHero from '@/components/shared/PageHero';

export default function GenericProjectHero() {
  return (
    <PageHero
      label='Projects'
      headline='Build once, collaborate everywhere'
      description="Create a project on Boundless and use it across Hackathons, Grants, Bounties, or Crowdfunding Campaigns when you're ready."
      actions={
        <>
          <BoundlessButton size='lg' className='group'>
            <span className='flex items-center gap-2'>
              Create New Project
              <Plus className='h-4 w-4' />
            </span>
          </BoundlessButton>
          <BoundlessButton variant='outline' size='lg'>
            <span className='flex items-center gap-2'>
              <Layout className='h-4 w-4' />
              Manage Projects
            </span>
          </BoundlessButton>
        </>
      }
    />
  );
}
