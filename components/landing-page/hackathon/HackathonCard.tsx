'use client';
import Link from 'next/link';
import Image from 'next/image';
import { MapPinIcon } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Hackathon } from '@/lib/api/hackathons';
import { cn } from '@/lib/utils';

// type HackathonCardProps = {
//   id: string;
//   name: string;
//   slug: string;
//   tagline: string;
//   description: string;

//   banner: string;

//   organizationId: string;
//   organization: {
//     id: string;
//     name: string;
//     logo: string;
//   };

//   status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
//   isActive: boolean;

//   venueType: "VIRTUAL" | "PHYSICAL" | "HYBRID";
//   venueName: string;
//   venueAddress: string;
//   city: string;
//   state: string;
//   country: string;
//   timezone: string;

//   startDate: string; // ISO date
//   endDate: string; // ISO date
//   submissionDeadline: string; // ISO date
//   registrationDeadline: string; // ISO date
//   customRegistrationDeadline: string | null;

//   registrationOpen: boolean;
//   registrationDeadlinePolicy: "BEFORE_SUBMISSION_DEADLINE" | "CUSTOM";

//   daysUntilStart: number;
//   daysUntilEnd: number;

//   participantType: "INDIVIDUAL" | "TEAM";
//   teamMin: number;
//   teamMax: number;

//   categories: string[];

//   enabledTabs: Array<
//     | "detailsTab"
//     | "participantsTab"
//     | "resourcesTab"
//     | "submissionTab"
//     | "announcementsTab"
//     | "discussionTab"
//     | "winnersTab"
//     | "sponsorsTab"
//     | "joinATeamTab"
//     | "rulesTab"
//   >;

//   judgingCriteria: Array<{
//     id?: string;
//     title?: string;
//     description?: string;
//     weight?: number;
//   }>;

//   prizeTiers: Array<{
//     id?: string;
//     title?: string;
//     prizeAmount?: number;
//     description?: string;
//   }>;

//   phases: Array<{
//     id?: string;
//     name?: string;
//     startDate?: string;
//     endDate?: string;
//   }>;

//   resources: any[];

//   sponsorsPartners: any[];

//   submissions: any[];
//   followers: any[];

//   requireGithub: boolean;
//   requireDemoVideo: boolean;
//   requireOtherLinks: boolean;

//   contactEmail: string;
//   discord: string;
//   telegram: string;
//   socialLinks: string[];

//   publishedAt: string;
//   createdAt: string;
//   updatedAt: string;

//   _count: {
//     submissions: number;
//     followers: number;
//   };
//   isFullWidth?: boolean;
//   isListView?: boolean;
//   className?: string;

// };

const formatFullNumber = (num: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);

const MAX_VISIBLE_CATEGORIES = 3;

interface CategoriesDisplayProps {
  categoriesList?: string[];
}

const CategoriesDisplay = ({ categoriesList = [] }: CategoriesDisplayProps) => {
  const visible = categoriesList.slice(0, MAX_VISIBLE_CATEGORIES);
  const remainingCount = categoriesList.length - MAX_VISIBLE_CATEGORIES;

  return (
    <div className='relative flex items-center'>
      <div className='flex gap-1.5'>
        {visible.map((cat, i) => (
          <span
            key={i}
            className='rounded-md bg-neutral-800/70 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-gray-300'
          >
            {cat}
          </span>
        ))}

        {remainingCount > 0 && (
          <span className='rounded-md bg-neutral-800/70 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-gray-400'>
            +{remainingCount}
          </span>
        )}
      </div>
    </div>
  );
};

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

// function formatCountdown(time: TimeRemaining): string {
//   if (time.total <= 0) return 'Ended';

//   if (time.days > 0) {
//     return `${time.days} day${time.days !== 1 ? 's' : ''} left`;
//   } else if (time.hours > 0) {
//     return `${time.hours} hour${time.hours !== 1 ? 's' : ''} left`;
//   } else if (time.minutes > 0) {
//     return `${time.minutes} minute${time.minutes !== 1 ? 's' : ''} left`;
//   } else {
//     return `${time.seconds} second${time.seconds !== 1 ? 's' : ''} left`;
//   }
// }

interface HackathonCardProps extends Hackathon {
  isFullWidth?: boolean;
  className?: string;
  target?: string;
}

export const HackathonCard = ({
  id,
  slug,
  name,
  tagline,
  banner,

  organization,
  status,

  venueName,

  startDate,

  submissionDeadline,

  categories,
  prizeTiers,
  isFullWidth = false,
  className,
  target,
}: HackathonCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  // Determine top badge status using raw dates — memoised so it can safely
  // appear in the useEffect dependency array without triggering infinite loops.
  const getTopBadgeStatus = useCallback(() => {
    if (status === 'ARCHIVED') {
      return 'Archived';
    }

    const now = new Date().getTime();
    const start = startDate ? new Date(startDate).getTime() : null;
    const deadline = submissionDeadline
      ? new Date(submissionDeadline).getTime()
      : null;

    // Check if ended (submission deadline passed)
    if (deadline && now > deadline) {
      return 'Ended';
    }

    // Check if ongoing (started but submission deadline not passed)
    if (start && now >= start) {
      return 'Ongoing';
    }

    // Otherwise it's upcoming
    return 'Upcoming';
  }, [status, startDate, submissionDeadline]);

  const getTopBadgeColor = () => {
    const badgeStatus = getTopBadgeStatus();
    switch (badgeStatus) {
      case 'Ongoing':
        return 'text-green-400 bg-green-400/10';
      case 'Upcoming':
        return 'text-blue-400 bg-blue-400/10';
      case 'Ended':
        return 'text-gray-400 bg-gray-800/20';
      case 'Archived':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-800/20';
    }
  };

  // Determine bottom status text using real-time countdown
  const getBottomStatusInfo = () => {
    if (status === 'ARCHIVED') {
      return { text: 'Archived', className: 'text-red-400' };
    }

    const badgeStatus = getTopBadgeStatus();

    if (badgeStatus === 'Ended') {
      return { text: 'Ended', className: 'text-gray-500' };
    }

    if (badgeStatus === 'Ongoing' && submissionDeadline) {
      // Ongoing hackathon - show time until submission deadline
      if (timeRemaining.total <= 0) {
        return { text: 'Ended', className: 'text-gray-500' };
      }
      if (timeRemaining.days === 0) {
        return { text: 'Ending today', className: 'text-red-400' };
      }
      if (timeRemaining.days === 1) {
        return { text: 'Ending tomorrow', className: 'text-red-400' };
      }
      if (timeRemaining.days <= 3) {
        return {
          text: `Ending in ${timeRemaining.days} days`,
          className: 'text-red-400',
        };
      }
      if (timeRemaining.days <= 7) {
        return {
          text: `Ending in ${timeRemaining.days} days`,
          className: 'text-yellow-400',
        };
      }
      return {
        text: `Ending in ${timeRemaining.days} days`,
        className: 'text-green-400',
      };
    }

    if (badgeStatus === 'Upcoming' && startDate) {
      // Upcoming hackathon - show time until start
      if (timeRemaining.total <= 0) {
        return { text: 'Starting soon', className: 'text-gray-400' };
      }
      if (timeRemaining.days === 0) {
        return { text: 'Starting today', className: 'text-red-400' };
      }
      if (timeRemaining.days === 1) {
        return { text: 'Starting tomorrow', className: 'text-red-400' };
      }
      if (timeRemaining.days <= 3) {
        return {
          text: `Starting in ${timeRemaining.days} days`,
          className: 'text-red-400',
        };
      }
      if (timeRemaining.days <= 7) {
        return {
          text: `Starting in ${timeRemaining.days} days`,
          className: 'text-yellow-400',
        };
      }
      return {
        text: `Starting in ${timeRemaining.days} days`,
        className: 'text-blue-400',
      };
    }

    return { text: 'Starting soon', className: 'text-gray-400' };
  };

  // Update time remaining based on current status
  useEffect(() => {
    let targetDate: string | null = null;
    const badgeStatus = getTopBadgeStatus();

    if (badgeStatus === 'Ongoing' && submissionDeadline) {
      targetDate = submissionDeadline;
    } else if (badgeStatus === 'Upcoming' && startDate) {
      targetDate = startDate;
    } else if (badgeStatus === 'Ended' && submissionDeadline) {
      targetDate = submissionDeadline;
    }

    if (!targetDate) return;

    setTimeRemaining(calculateTimeRemaining(targetDate));

    // Update every second for ongoing/upcoming hackathons
    if (badgeStatus === 'Ongoing' || badgeStatus === 'Upcoming') {
      const interval = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining(targetDate!));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startDate, submissionDeadline, getTopBadgeStatus]);

  const bottomStatusInfo = getBottomStatusInfo();
  const topBadgeStatus = getTopBadgeStatus();
  const topBadgeColor = getTopBadgeColor();

  // const locationText = (() => {
  //   if (location) {
  //     return location;
  //   }
  //   if (venueType === 'VIRTUAL') {
  //     return 'Virtual';
  //   }
  //   if (venueType === 'PHYSICAL') {
  //     return 'Physical';
  //   }
  //   return undefined;
  // })();

  const href = `/hackathons/${slug || id || ''}`;

  return (
    <Link
      href={href}
      target={target === '_blank' ? '_blank' : undefined}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#0c0c0c] transition-all duration-300 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/40',
        isFullWidth ? 'w-full' : 'max-w-[400px]',
        className
      )}
      aria-label={`View hackathon: ${name}`}
    >
      {/* Image */}
      <div className='relative h-44 overflow-hidden sm:h-52'>
        <Image
          src={banner}
          alt={name}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          unoptimized
        />
        <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent' />

        <div className='absolute top-3 right-3 left-3 flex items-center justify-between'>
          <CategoriesDisplay categoriesList={categories} />
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold backdrop-blur-sm ${topBadgeColor}`}
          >
            {topBadgeStatus}
          </span>
        </div>

        <div className='absolute bottom-3 left-3 flex items-center gap-2'>
          {organization?.logo && (
            <div
              style={{ backgroundImage: `url(${organization.logo})` }}
              className='size-7 rounded-full border border-white/20 bg-white bg-cover bg-center'
            />
          )}
          {organization?.name && (
            <span className='text-xs font-medium text-white/90 drop-shadow-md'>
              {organization.name}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className='flex flex-col gap-3 pt-3'>
        <div className='px-4 sm:px-5'>
          <h2 className='line-clamp-2 text-base leading-tight font-semibold text-white sm:text-lg'>
            {name}
          </h2>
          <p className='mt-1 line-clamp-2 text-sm text-gray-400'>{tagline}</p>
        </div>

        <div className='flex flex-wrap items-center justify-between border-t border-neutral-800 px-4 pt-3 text-sm text-gray-400 sm:px-5'>
          {prizeTiers && (
            <div className='flex items-baseline gap-1'>
              <span className='text-primary text-base font-semibold'>
                $
                {formatFullNumber(
                  prizeTiers.reduce((acc, tier) => {
                    const amount = Number(tier.prizeAmount);
                    return acc + (Number.isFinite(amount) ? amount : 0);
                  }, 0)
                )}
              </span>
              <span className='text-xs'>Prize Pool</span>
            </div>
          )}
          {/* {participantsCount && (
            <div className='flex items-center gap-1'>
              <span className='text-white'>
                {formatNumber(participantsCount)}
                {participantsGoal && `/${formatNumber(participantsGoal)}`}
              </span>
              <span className='text-xs text-gray-500'>Participants</span>
            </div>
          )} */}
          {venueName && venueName !== 'TBD' && (
            <div className='flex items-center gap-1'>
              <MapPinIcon className='size-4 text-gray-500' />
              <span className='text-xs'>{venueName}</span>
            </div>
          )}
        </div>

        <div className='flex items-center justify-between border-t border-neutral-800 px-4 py-3 sm:px-5'>
          <span
            className={`text-xs font-medium capitalize ${bottomStatusInfo.className}`}
          >
            {bottomStatusInfo.text}
          </span>
          {/* {participants?.goal && (
            <Progress
              value={(participants.current / participants.goal) * 100}
              className='h-1.5 w-24 rounded-full sm:w-32'
            />
          )} */}
        </div>
      </div>
    </Link>
  );
};

export default HackathonCard;
