import React from 'react';
import Image from 'next/image';

const Logo = ({ logo, title }: { logo: string; title: string }) => {
  return (
    <div className='flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#111111]'>
      {logo ? (
        <Image
          src={logo}
          alt={title || 'Logo'}
          width={80}
          height={80}
          className='h-full w-full object-cover'
        />
      ) : null}
    </div>
  );
};

export default Logo;
