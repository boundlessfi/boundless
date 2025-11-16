'use client';

import React from 'react';
import Image from 'next/image';

export default function WinnersTitle() {
  return (
    <div className='mb-8 flex flex-col items-center justify-center gap-2'>
      <h2 className='text-3xl font-medium text-white sm:text-4xl md:text-5xl'>
        Congratulati
        <Image
          src='/star.svg'
          alt='Star'
          width={32}
          height={32}
          className='fill-primary text-primary inline h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12'
        />
        ns
      </h2>
      <h2 className='text-primary text-3xl sm:text-4xl md:text-5xl'>Winners</h2>
    </div>
  );
}
