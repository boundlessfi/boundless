'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface JoinHackathonBannerProps {
  onJoinClick?: () => void;
  participants?: number;
  prizePool?: string;
  isEnded?: boolean;
}

export function JoinHackathonBanner({
  onJoinClick,
  participants = 342,
  prizePool = '1,000',
  isEnded = false,
}: JoinHackathonBannerProps) {
  const titles = useMemo(
    () => [
      'Ready to Build Something Amazing?',
      'Show Your Coding Superpowers!',
      'Build. Compete. Win Big!',
      'Hack the Future with Us!',
      'Your Next Great Project Starts Here!',
      'Push the Limits of Innovation!',
      'Create. Collaborate. Conquer!',
      'Turn Your Ideas into Impact!',
      'Join the Ultimate Dev Challenge!',
      'Code Today, Lead Tomorrow!',
    ],
    []
  );

  const [currentTitle, setCurrentTitle] = useState(
    titles[Math.floor(Math.random() * titles.length)]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * titles.length);
      setCurrentTitle(titles[randomIndex]);
    }, 3000 * 5); // every 15 seconds

    return () => clearInterval(interval);
  }, [titles]);

  return (
    <div className='relative w-full overflow-hidden'>
      <div className='border-primary/30 from-primary/20 to-primary/20 relative border-y bg-gradient-to-r via-[#1ec78d]/20 backdrop-blur-sm'>
        {/* Animated gradient background */}
        <div className='via-primary/10 absolute inset-0 animate-pulse bg-gradient-to-r from-transparent to-transparent' />

        <div className='relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8'>
          {/* Text content */}
          <div className='text-center'>
            <h2 className='mb-2 text-center text-2xl font-bold text-white transition-all duration-500 ease-in-out md:text-3xl'>
              {currentTitle}
            </h2>
            <p className='text-center text-sm text-gray-300 md:text-base'>
              Join {participants}+ developers competing for ${prizePool}+ in
              prizes
            </p>
          </div>

          {/* Join Button */}
          <Button
            onClick={onJoinClick}
            disabled={isEnded}
            className='border-primary/50 from-primary shadow-primary/30 hover:shadow-primary/50 relative cursor-pointer rounded-lg border-2 bg-gradient-to-r to-[#1ec78d] px-8 py-5 text-base font-bold whitespace-nowrap text-black shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:from-[#1ec78d] hover:to-[#16a875] hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 disabled:hover:scale-100 md:text-lg'
          >
            <span className='relative z-10 flex items-center gap-2'>
              {isEnded ? 'Hackathon Ended' : 'Join Now'}
              {!isEnded && <ArrowRight className='h-5 w-5' />}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
