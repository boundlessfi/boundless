'use client';
import React from 'react';
import { ArrowDown } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import { useRouter } from 'nextjs-toploader/app';

export default function HackathonsPageHero() {
  const router = useRouter();

  const scrollToHackathons = () => {
    const hackathonsSection = document.getElementById('explore-hackathons');
    if (hackathonsSection) {
      const targetPosition = hackathonsSection.offsetTop - 100;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000;
      let start: number | null = null;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = easeInOutQuad(
          timeElapsed,
          startPosition,
          distance,
          duration
        );
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      };

      const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      };

      requestAnimationFrame(animation);
    }
  };

  const handleCreateHackathon = () => {
    router.push('/hackathons/create');
  };

  return (
    <div className='bg-background-card relative overflow-hidden rounded-2xl px-6 py-10 text-white'>
      <div className='relative z-10'>
        <div className='mx-auto grid max-w-[1300px] items-center justify-baseline gap-6 md:grid-cols-2 md:gap-8 lg:gap-12'>
          <div className='z-10 space-y-6 text-left md:space-y-6 lg:space-y-8'>
            <h1 className='text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-4xl lg:text-3xl'>
              <span className='bg-gradient-to-r from-[#3AE6B2] to-[#A7F95080] bg-clip-text text-transparent'>
                Discover hackathons
              </span>{' '}
              that are shaping the future on Stellar
            </h1>

            <p className='max-w-[300px] text-base font-normal text-white md:max-w-[350px] lg:max-w-[400px]'>
              Join innovative hackathons, compete for prizes, and build the next
              generation of blockchain solutions.
            </p>
          </div>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <BoundlessButton
              onClick={scrollToHackathons}
              size='xl'
              className='group relative transform rounded-lg bg-[#A7F950] px-6 py-3 text-sm font-semibold text-black transition-none duration-300 hover:!scale-none hover:shadow-lg hover:shadow-[#A7F950]/25 md:px-7 md:py-3.5 md:text-base lg:px-8 lg:py-4 lg:text-base'
            >
              <span className='flex items-center gap-2'>
                Start Exploring Hackathons
                <ArrowDown className='h-4 w-4 transition-transform group-hover:translate-y-1 md:h-4 md:w-4 lg:h-5 lg:w-5' />
              </span>
            </BoundlessButton>

            <BoundlessButton
              onClick={handleCreateHackathon}
              size='xl'
              variant='outline'
              className='group border-primary text-primary hover:bg-primary/10 relative transform rounded-lg px-6 py-3 text-sm font-semibold transition-none duration-300 hover:!scale-none md:px-7 md:py-3.5 md:text-base lg:px-8 lg:py-4 lg:text-base'
            >
              Create Hackathon
            </BoundlessButton>
          </div>
        </div>
      </div>
    </div>
  );
}
