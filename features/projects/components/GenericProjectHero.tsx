'use client';
import React from 'react';
import { Plus, Layout } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';

export default function GenericProjectHero() {
  return (
    <div className='bg-background-card relative overflow-hidden rounded-2xl px-6 py-10 text-white'>
      <div className='relative z-10'>
        <div className='mx-auto grid max-w-[1300px] items-center justify-baseline gap-6 md:grid-cols-2 md:gap-8 lg:gap-12'>
          {/* Left Text */}
          <div className='z-10 space-y-6 text-left md:space-y-6 lg:space-y-8'>
            <h1 className='text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-4xl lg:text-3xl'>
              <span className='bg-linear-to-r from-[#3AE6B2] to-[#A7F95080] bg-clip-text text-transparent'>
                Your Boundless Projects
              </span>{' '}
              build once, collaborate everywhere
            </h1>

            <p className='max-w-[400px] text-base font-normal text-white'>
              Create a project on Boundless and use it for Hackathons, Grants,
              Bounties, or Crowdfunding Campaigns when you're ready.
            </p>
          </div>

          {/* Buttons */}
          <div className='flex flex-col gap-4 sm:flex-row'>
            <BoundlessButton
              size='xl'
              className='group bg-primary hover:shadow-primary/25 relative transform rounded-lg px-6 py-3 text-sm font-semibold text-black transition-none duration-300 hover:scale-none! hover:shadow-lg md:px-7 md:py-3.5 md:text-base lg:px-8 lg:py-4 lg:text-base'
            >
              <span className='flex items-center gap-2'>
                Create New Project
                <Plus className='h-4 w-4 transition-transform group-hover:scale-110 md:h-4 md:w-4 lg:h-5 lg:w-5' />
              </span>
            </BoundlessButton>

            <BoundlessButton
              variant='outline'
              size='xl'
              className='rounded-lg border-white/20 bg-transparent px-6 py-3 text-sm font-medium text-white/90 transition-all hover:bg-white/5 md:px-7 md:py-3.5 md:text-base'
            >
              <span className='flex items-center gap-2'>
                <Layout className='h-4 w-4' />
                Manage Projects
              </span>
            </BoundlessButton>
          </div>
        </div>
      </div>
    </div>
  );
}
