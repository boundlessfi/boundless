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
      <div className='relative border-y border-[#a7f950]/30 bg-gradient-to-r from-[#a7f950]/20 via-[#8fd93f]/20 to-[#a7f950]/20 backdrop-blur-sm'>
        {/* Animated gradient background */}
        <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-[#a7f950]/10 to-transparent' />

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
            className='relative cursor-pointer rounded-lg border-2 border-[#a7f950]/50 bg-gradient-to-r from-[#a7f950] to-[#8fd93f] px-8 py-5 text-base font-bold whitespace-nowrap text-black shadow-lg shadow-[#a7f950]/30 transition-all duration-300 ease-in-out hover:scale-105 hover:from-[#8fd93f] hover:to-[#7bc92d] hover:shadow-xl hover:shadow-[#a7f950]/50 active:scale-95 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 disabled:hover:scale-100 md:text-lg'
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
