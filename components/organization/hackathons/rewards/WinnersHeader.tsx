'use client';

import React from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoundlessButton } from '@/components/buttons';

interface WinnersHeaderProps {
  onBack: () => void;
  onPublish: () => void;
}

export default function WinnersHeader({
  onBack,
  onPublish,
}: WinnersHeaderProps) {
  return (
    <div className='border-b border-gray-900 px-4 py-4 sm:px-6 md:px-8'>
      <div className='mx-auto flex max-w-7xl items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onBack}
            className='text-white hover:bg-gray-800'
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='text-lg font-medium text-white'>Announce Winners</h1>
        </div>
        <BoundlessButton
          variant='default'
          onClick={onPublish}
          className='bg-primary hover:bg-primary/90'
        >
          Publish
          <ArrowUpRight className='ml-2 h-4 w-4' />
        </BoundlessButton>
      </div>
    </div>
  );
}
