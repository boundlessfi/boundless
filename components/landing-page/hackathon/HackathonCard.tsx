'use client';
import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils';
import { useRouter } from 'nextjs-toploader/app';
import Image from 'next/image';
import { MapPinIcon } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

type HackathonCardProps = {
  hackathonId?: string;
  organizationName: string;
  hackathonSlug?: string;
  organizerName: string;
  organizerLogo: string;
  hackathonImage: string;
  hackathonTitle: string;
  hackathonDescription: string;
  status: 'Published' | 'Ongoing' | 'Completed' | 'Cancelled';
  deadlineInDays: number;
  categories: string[];
  location?: string;
  venueType?: 'virtual' | 'physical';
  participantType?: 'individual' | 'team' | 'team_or_individual';
  participants?: {
    current: number;
    goal?: number;
  };
  prizePool?: {
    total: number;
    currency: string;
  };
  isFullWidth?: boolean;
  isListView?: boolean;
  className?: string;
};

const formatFullNumber = (num: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);

function HackathonCard({
  hackathonId,
  // organizationName,
  hackathonSlug,
  organizerName,
  organizerLogo,
  hackathonImage,
  hackathonTitle,
  hackathonDescription,
  status,
  deadlineInDays,
  categories,
  location,
  venueType,
  participants,
  prizePool,
  isFullWidth = false,
  className,
}: HackathonCardProps) {
  const router = useRouter();

  const handleClick = () => {
    const slug = hackathonSlug || hackathonId || '';
    router.push(`/hackathons/${slug}`);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'Ongoing':
        return 'text-blue-400 bg-blue-400/10';
      case 'Published':
        return 'text-primary bg-primary/10';
      case 'Completed':
        return 'text-green-400 bg-green-400/10';
      case 'Cancelled':
        return 'text-gray-500 bg-gray-700/20';
      default:
        return 'text-gray-400 bg-gray-800/20';
    }
  };

  const getDeadlineInfo = () => {
    // Handle completed or cancelled status
    if (status === 'Completed') {
      return { text: 'Ended', className: 'text-gray-500' };
    }
    if (status === 'Cancelled') {
      return { text: 'Cancelled', className: 'text-gray-500' };
    }

    // Handle cases where deadline has passed
    if (deadlineInDays <= 0) {
      if (status === 'Ongoing') {
        return { text: 'Ending soon', className: 'text-red-400' };
      }
      return { text: 'Started', className: 'text-gray-500' };
    }

    // Handle different statuses with contextual messages
    if (status === 'Published') {
      // Upcoming hackathons - show "starting in X days"
      if (deadlineInDays <= 3) {
        return {
          text: `starting in ${deadlineInDays} day${deadlineInDays !== 1 ? 's' : ''}`,
          className: 'text-red-400',
        };
      }
      if (deadlineInDays <= 15) {
        return {
          text: `starting in ${deadlineInDays} days`,
          className: 'text-yellow-400',
        };
      }
      return {
        text: `starting in ${deadlineInDays} days`,
        className: 'text-green-400',
      };
    }

    if (status === 'Ongoing') {
      // Ongoing hackathons - show "ending in X days"
      if (deadlineInDays <= 3) {
        return {
          text: `ending in ${deadlineInDays} day${deadlineInDays !== 1 ? 's' : ''}`,
          className: 'text-red-400',
        };
      }
      if (deadlineInDays <= 15) {
        return {
          text: `ending in ${deadlineInDays} days`,
          className: 'text-yellow-400',
        };
      }
      return {
        text: `ending in ${deadlineInDays} days`,
        className: 'text-green-400',
      };
    }

    // Fallback for any other status
    if (deadlineInDays <= 3) {
      return {
        text: `${deadlineInDays} day${deadlineInDays !== 1 ? 's' : ''} left`,
        className: 'text-red-400',
      };
    }
    if (deadlineInDays <= 15) {
      return {
        text: `${deadlineInDays} days left`,
        className: 'text-yellow-400',
      };
    }
    return {
      text: `${deadlineInDays} days left`,
      className: 'text-green-400',
    };
  };

  const deadlineInfo = getDeadlineInfo();
  const locationText = (() => {
    // If location is provided (from transform hook), use it
    if (location) {
      return location;
    }
    // Otherwise, fall back to venueType
    if (venueType === 'virtual') {
      return 'Virtual';
    }
    if (venueType === 'physical') {
      return 'Physical';
    }
    return undefined;
  })();

  const CategoriesDisplay = ({
    categoriesList,
  }: {
    categoriesList: string[];
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [showEllipsis, setShowEllipsis] = useState(false);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const check = () => setShowEllipsis(el.scrollWidth > el.clientWidth);
      check();
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }, [categoriesList]);

    return (
      <div
        className={`relative flex items-center overflow-hidden ${className}`}
      >
        <div ref={ref} className='scrollbar-hide flex gap-1.5 overflow-x-auto'>
          {categoriesList.map((cat, i) => (
            <span
              key={i}
              className='rounded-md bg-neutral-800/70 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-gray-300'
            >
              {cat}
            </span>
          ))}
        </div>
        {showEllipsis && (
          <div className='pointer-events-none absolute top-0 right-0 bottom-0 flex w-6 items-center justify-end bg-gradient-to-l from-[#030303] via-[#030303]/80 to-transparent pr-1'>
            <span className='text-xs font-medium text-gray-500'>...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={handleClick}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#0c0c0c] transition-all duration-300 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/40 ${
        isFullWidth ? 'w-full' : 'max-w-[400px]'
      }`}
    >
      {/* Image */}
      <div className='relative h-44 overflow-hidden sm:h-52'>
        <Image
          src={hackathonImage}
          alt={hackathonTitle}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          unoptimized
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent' />

        <div className='absolute top-3 right-3 left-3 flex items-center justify-between'>
          <CategoriesDisplay categoriesList={categories} />
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold backdrop-blur-sm ${getStatusColor()}`}
          >
            {status}
          </span>
        </div>

        <div className='absolute bottom-3 left-3 flex items-center gap-2'>
          <div
            style={{ backgroundImage: `url(${organizerLogo})` }}
            className='size-7 rounded-full border border-white/20 bg-white bg-cover bg-center'
          />
          <span className='text-xs font-medium text-white/90 drop-shadow-md'>
            {organizerName}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className='flex flex-col gap-3 pt-3'>
        <div className='px-4 sm:px-5'>
          <h2 className='line-clamp-2 text-base leading-tight font-semibold text-white sm:text-lg'>
            {hackathonTitle}
          </h2>
          <p className='mt-1 line-clamp-2 text-sm text-gray-400'>
            {hackathonDescription}
          </p>
        </div>

        <div className='flex flex-wrap items-center justify-between border-t border-neutral-800 px-4 pt-3 text-sm text-gray-400 sm:px-5'>
          {prizePool && (
            <div className='flex items-baseline gap-1'>
              <span className='text-primary text-base font-semibold'>
                ${formatFullNumber(prizePool.total)}
              </span>
              <span className='text-xs'>{prizePool.currency}</span>
            </div>
          )}
          {participants && (
            <div className='flex items-center gap-1'>
              <span className='text-white'>
                {formatNumber(participants.current)}
                {participants.goal && `/${formatNumber(participants.goal)}`}
              </span>
              <span className='text-xs text-gray-500'>Participants</span>
            </div>
          )}
          {locationText && locationText !== 'TBD' && (
            <div className='flex items-center gap-1'>
              <MapPinIcon className='size-4 text-gray-500' />
              <span className='text-xs'>{locationText}</span>
            </div>
          )}
        </div>

        <div className='flex items-center justify-between border-t border-neutral-800 px-4 py-3 sm:px-5'>
          <span
            className={`text-xs font-medium capitalize ${deadlineInfo.className}`}
          >
            {deadlineInfo.text}
          </span>
          {participants?.goal && (
            <Progress
              value={(participants.current / participants.goal) * 100}
              className='h-1.5 w-24 rounded-full sm:w-32'
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default HackathonCard;
