'use client';

import { useState } from 'react';
import { BoundlessButton } from '../buttons';
import Newsletter from '../overview/Newsletter';

const NewsLetter = () => {
  const [open, setOpen] = useState(false);

  const handleSubscribeClick = () => {
    setOpen(true);
  };

  return (
    <section
      className='relative my-[98px] h-full w-full'
      aria-labelledby='newsletter-heading'
    >
      <div
        className='flex flex-col items-center justify-between gap-4 rounded-[10px] p-8 shadow-[0_1px_4px_0_rgba(46,237,170,0.14)] transition-shadow hover:shadow-[0_4px_12px_0_rgba(46,237,170,0.25)] lg:flex-row'
        style={{
          background:
            'linear-gradient(315deg, rgba(147,229,60,0.14) 3.33%, rgba(117,199,30,0.00) 21.54%, rgba(107,185,20,0.14) 87.82%), #2EEDAA',
          backgroundBlendMode: 'soft-light,normal',
        }}
      >
        <h2
          id='newsletter-heading'
          className='text-center text-2xl leading-[120%] font-medium tracking-[-0.48px] text-[#020502] lg:text-left'
        >
          Never miss updates on grants, hackathons, and projects...
        </h2>
        <div className='flex-shrink-0'>
          <BoundlessButton
            variant='secondary'
            className='bg-background hover:text-background transition-colors'
            size='xl'
            onClick={handleSubscribeClick}
            aria-label='Subscribe to newsletter for updates on grants, hackathons, and projects'
          >
            Subscribe to Our Newsletter
          </BoundlessButton>
        </div>
      </div>
      <Newsletter open={open} onOpenChange={setOpen} />
    </section>
  );
};

export default NewsLetter;
