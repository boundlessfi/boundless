import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LottieAnimation from '@/components/LottieAnimation';

const NotFound = () => {
  return (
    <div className='bg-background-main-bg flex min-h-[80vh] items-center justify-center'>
      <div className='mx-auto max-w-md px-6 text-center'>
        <div className='mb-8 flex flex-col items-center justify-center'>
          <LottieAnimation />

          <h1 className='mb-4 text-4xl font-bold text-white md:text-6xl'>
            404
          </h1>
          <h2 className='mb-4 text-xl font-semibold text-white md:text-2xl'>
            Page Not Found
          </h2>
          <p className='mb-8 text-[#B5B5B5]'>
            The page you are looking for does not exist.
          </p>
          <Button
            variant='outline'
            className='bg-background flex w-full items-center gap-2 border-[#ffffff]/24 px-3 text-white md:w-fit'
            asChild
          >
            <Link href='/'>
              <ArrowLeft className='size-4' />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
