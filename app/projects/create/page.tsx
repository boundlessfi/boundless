'use client';

import React, { Suspense } from 'react';
import CreationLayout from '@/features/projects/components/CreationFlow/CreationLayout';

export default function CreateProjectPage() {
  return (
    <Suspense
      fallback={
        <div className='bg-background-main-bg flex h-screen w-full items-center justify-center text-white/20'>
          Loading...
        </div>
      }
    >
      <CreationLayout />
    </Suspense>
  );
}
