'use client';
import Newsletter from '@/components/overview/Newsletter';
import { useState } from 'react';

function BlogHero() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className='relative mx-auto flex min-h-[500px] flex-col justify-center gap-6 overflow-hidden pb-[50px] md:gap-[52px] md:px-0'>
        <div className='flex flex-col items-start justify-between gap-6 md:flex-row md:items-end md:gap-0'>
          <h1 className='text-[32px] font-normal text-white md:text-5xl'>
            <span className='mb-1 bg-gradient-to-r from-[#3AE6B2] to-[#2EEDAA80] bg-clip-text text-transparent'>
              Insights That Matter
            </span>
            <br />
            Stories From Boundless
          </h1>

          <div className='w-full md:w-[429px]'>
            <p className='text-base font-normal text-white'>
              {' '}
              News, updates, and thought pieces crafted to keep you ahead in the
              Boundless ecosystem.
            </p>
          </div>
        </div>
        <div className='bg-primary flex flex-col items-center justify-between gap-2 rounded-[10px] py-2.5 pr-2.5 pl-6 md:w-[570px] md:flex-row'>
          <p className='text-background w-full text-base font-medium'>
            Never miss important updates
          </p>
          <button
            type='button'
            onClick={() => setOpen(true)}
            className='bg-background w-full rounded-[10px] px-6 py-2 text-base font-medium text-white transition hover:opacity-90'
          >
            Subscribe to Our Newsletter
          </button>
        </div>
      </section>
      <Newsletter open={open} onOpenChange={setOpen} />
    </>
  );
}

export default BlogHero;
