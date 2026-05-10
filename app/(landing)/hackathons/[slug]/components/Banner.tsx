import Image from 'next/image';
import React from 'react';

const Banner = ({ banner, title }: { banner: string; title?: string }) => {
  return (
    <div className='relative aspect-[16/9] w-full bg-gray-200 md:aspect-[4/1]'>
      <Image
        src={banner}
        alt={`${title || 'hackathon'} banner`}
        fill
        className='object-cover'
        priority
        sizes='100vw'
      />
    </div>
  );
};

export default Banner;
