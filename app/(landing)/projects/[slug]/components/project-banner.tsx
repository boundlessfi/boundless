'use client';

import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface ProjectBannerProps {
  banner: string | null;
  title: string;
}

export function ProjectBanner({ banner, title }: ProjectBannerProps) {
  return (
    <div className='border-stepper-border bg-background-card relative aspect-16/10 w-full overflow-hidden rounded-2xl border lg:aspect-auto lg:h-full'>
      {banner ? (
        <Image
          src={banner}
          alt={`${title} banner`}
          fill
          priority
          className='object-cover'
          sizes='(min-width: 1024px) 60vw, 100vw'
        />
      ) : (
        <div className='from-background-card via-inactive to-background-main-bg absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br'>
          <div className='border-stepper-border bg-background-main-bg/60 flex h-16 w-16 items-center justify-center rounded-2xl border'>
            <ImageIcon className='h-7 w-7 text-gray-700' />
          </div>
          <p className='text-sm text-gray-700'>No banner provided</p>
        </div>
      )}
    </div>
  );
}
