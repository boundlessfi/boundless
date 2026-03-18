import React from 'react';
import GenericProjectHero from '@/features/projects/components/GenericProjectHero';
import GenericProjectsClient from '@/features/projects/components/GenericProjectsClient';

export default function ProjectsPage() {
  return (
    <div className='bg-background min-h-screen'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8'>
        <div className='space-y-12'>
          <GenericProjectHero />
          <GenericProjectsClient />
        </div>
      </div>
    </div>
  );
}
