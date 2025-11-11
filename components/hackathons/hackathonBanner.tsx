'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HackathonBannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  deadline?: string;
  categories?: string[];
  status?: 'upcoming' | 'ongoing' | 'ended';
  participants?: number;
  totalPrizePool?: string;
}

export function HackathonBanner({
  title,
  subtitle,
  imageUrl,
  deadline,
  categories,
  status,
  participants,
  totalPrizePool,
}: HackathonBannerProps) {
  const statusColors = {
    upcoming: 'bg-blue-500',
    ongoing: 'bg-green-500',
    ended: 'bg-gray-500',
  };

  return (
    <Card className='relative w-full overflow-hidden rounded-none border-0 p-0 shadow-none'>
      <div
        className='relative h-64 md:h-80 lg:h-96'
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className='absolute inset-0 bg-black/50' />

        {/* Text content */}
        <div className='absolute inset-0 mx-auto flex w-full max-w-7xl flex-col justify-between px-6 py-6 md:px-12 md:py-8'>
          {/* Top section: Status, participants, and prize pool */}
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='flex flex-wrap items-center gap-3'>
              {status && (
                <Badge
                  className={`${statusColors[status]} text-white capitalize`}
                >
                  {status}
                </Badge>
              )}
              {participants !== undefined && (
                <span className='text-sm text-gray-200'>
                  {participants.toLocaleString()} participants
                </span>
              )}
            </div>
            {totalPrizePool && (
              <div className='flex items-center gap-2 rounded-lg border border-[#a7f950]/50 bg-gradient-to-r from-[#a7f950]/20 to-[#a7f950]/10 px-4 py-2'>
                <span className='text-xs font-semibold tracking-widest text-[#a7f950] uppercase'>
                  Prize Pool
                </span>
                <span className='text-xl font-black text-[#a7f950] drop-shadow-lg md:text-2xl lg:text-3xl'>
                  ${totalPrizePool}
                </span>
              </div>
            )}
          </div>

          {/* Middle section: Title and subtitle */}
          <div className='flex flex-col gap-2 md:gap-3'>
            <h1 className='text-left text-3xl leading-tight font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl'>
              {title}
            </h1>
            {subtitle && (
              <p className='max-w-2xl text-left text-base text-gray-200 drop-shadow-md md:text-lg'>
                {subtitle}
              </p>
            )}
            {subtitle && (
              <div className='h-1 w-20 rounded-full bg-[#a7f950] md:w-24' />
            )}
          </div>

          {/* Bottom section: Deadline and categories */}
          <div className='flex flex-col gap-2 md:gap-3'>
            {deadline && (
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-sm font-semibold text-[#a7f950]'>
                  Deadline:
                </span>
                <span className='text-sm text-gray-200'>{deadline}</span>
              </div>
            )}
            {categories && categories.length > 0 && (
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-sm font-semibold text-[#a7f950]'>
                  Categories:
                </span>
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant='outline'
                    className='border-gray-400 text-xs text-gray-100'
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
