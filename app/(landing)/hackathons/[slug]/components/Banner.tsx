import Image from 'next/image';
import React from 'react';

const Banner = ({ banner, title }: { banner: string; title?: string }) => {
  return (
    <div className='relative h-[200px] w-full bg-gray-200 md:h-[360px]'>
      <Image
        src={banner}
        alt={`${title || 'hackathon'} banner`}
        fill
        className='object-cover'
        priority
      />
    </div>
  );
};

export default Banner;
