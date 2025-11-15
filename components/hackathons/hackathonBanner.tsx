'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface HackathonBannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  deadline?: string;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  status?: string;
  participants?: number;
  totalPrizePool?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(targetDate: string): TimeRemaining {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    total: difference,
  };
}

function formatCountdown(time: TimeRemaining): string {
  if (time.total <= 0) return 'Ended';

  if (time.days > 0) {
    return `${time.days} day${time.days !== 1 ? 's' : ''} left`;
  } else if (time.hours > 0) {
    return `${time.hours} hour${time.hours !== 1 ? 's' : ''} left`;
  } else if (time.minutes > 0) {
    return `${time.minutes} minute${time.minutes !== 1 ? 's' : ''} left`;
  } else {
    return `${time.seconds} second${time.seconds !== 1 ? 's' : ''} left`;
  }
}

export function HackathonBanner({
  title,
  subtitle,
  imageUrl,
  deadline,
  startDate,
  endDate,
  categories,
  status,
  participants,
  totalPrizePool,
}: HackathonBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  const getStatusColor = () => {
    switch (status) {
      case 'Ongoing':
      case 'ongoing':
        return 'text-blue-400 bg-blue-400/10';
      case 'Published':
      case 'upcoming':
        return 'text-primary bg-primary/10';
      case 'Completed':
      case 'ended':
        return 'text-green-400 bg-green-400/10';
      case 'Cancelled':
        return 'text-gray-500 bg-gray-700/20';
      default:
        return 'text-gray-400 bg-gray-800/20';
    }
  };

  const getDeadlineInfo = () => {
    const days = timeRemaining.days;

    if (timeRemaining.total <= 0)
      return { text: 'Ended', className: 'text-gray-500' };
    if (days <= 3)
      return {
        text: formatCountdown(timeRemaining),
        className: 'text-red-400',
      };
    if (days <= 15)
      return {
        text: formatCountdown(timeRemaining),
        className: 'text-yellow-400',
      };
    return {
      text: formatCountdown(timeRemaining),
      className: 'text-green-400',
    };
  };

  useEffect(() => {
    let targetDate: string | null = null;
    const statusLower = status?.toLowerCase();
    if (statusLower === 'ongoing' && deadline) {
      targetDate = deadline;
    } else if (statusLower === 'upcoming' && startDate) {
      targetDate = startDate;
    } else if (statusLower === 'ended' && endDate) {
      targetDate = endDate;
    } else if (deadline) {
      targetDate = deadline;
    }

    if (!targetDate) return;

    setTimeRemaining(calculateTimeRemaining(targetDate));

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate!));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, deadline, startDate, endDate]);

  const renderDateSection = () => {
    const statusLower = status?.toLowerCase();
    const deadlineInfo = getDeadlineInfo();

    if (statusLower === 'ongoing' && deadline) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm font-semibold text-blue-400'>Deadline:</span>
          <span className={`text-sm ${deadlineInfo.className}`}>
            {deadlineInfo.text}
          </span>
        </div>
      );
    } else if (statusLower === 'upcoming' && startDate) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-primary text-sm font-semibold'>Start:</span>
          <span className='text-sm text-gray-200'>
            {formatDate(new Date(startDate))}
          </span>
          {timeRemaining.total > 0 && (
            <span className={`text-sm ${deadlineInfo.className}`}>
              ({formatCountdown(timeRemaining)})
            </span>
          )}
        </div>
      );
    } else if (statusLower === 'ended' && endDate) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm font-semibold text-gray-500'>Ended:</span>
          <span className='text-sm text-gray-200'>
            {formatDate(new Date(endDate))}
          </span>
        </div>
      );
    }

    if (deadline) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm font-semibold text-[#a7f950]'>
            Deadline:
          </span>
          <span className='text-sm text-gray-200'>
            {formatDate(new Date(deadline))}
          </span>
          {timeRemaining.total > 0 && (
            <span className={`text-sm ${deadlineInfo.className}`}>
              ({deadlineInfo.text})
            </span>
          )}
        </div>
      );
    }

    return null;
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
        <div className='absolute inset-0 bg-black/50' />

        {/* Text content */}
        <div className='absolute inset-0 mx-auto flex w-full max-w-7xl flex-col justify-between px-6 py-6 md:px-12 md:py-8'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='flex flex-wrap items-center gap-3'>
              {status && (
                <Badge className={`${getStatusColor()} capitalize`}>
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

          <div className='flex flex-col gap-2 md:gap-3'>
            <h1 className='text-left text-3xl leading-tight font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl'>
              {title}
            </h1>
            {subtitle && (
              <p className='max-w-2xl text-left text-base text-gray-200 drop-shadow-md md:text-lg'>
                {subtitle.slice(3)}
              </p>
            )}
            {subtitle && (
              <div className='h-1 w-20 rounded-full bg-[#a7f950] md:w-24' />
            )}
          </div>

          {/* Bottom section: Deadline/Start/Ended and categories */}
          <div className='flex flex-col gap-2 md:gap-3'>
            {renderDateSection()}
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
