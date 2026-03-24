'use client';
import React from 'react';
import { Layout, Plus } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';

export default function GenericProjectsClient() {
  return (
    <div className='flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-20 text-center'>
      <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10'>
        <Layout className='h-8 w-8 text-white/40' />
      </div>
      <h2 className='mb-2 text-2xl font-semibold text-white'>
        No Projects Yet
      </h2>
      <p className='mb-8 max-w-sm text-white/60'>
        Create your first project on Boundless to get started. Your project can
        later be used for hackathons, grants, or crowdfunding campaigns.
      </p>
      <BoundlessButton variant='default' className='flex items-center gap-2'>
        <Plus className='h-4 w-4' />
        Create New Project
      </BoundlessButton>
    </div>
  );
}
