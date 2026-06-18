'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Users,
  Trophy,
  Clock,
  Lock,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Hackathon } from '@/lib/api/hackathons';
import { effectivePrizeTiers } from '@/lib/utils/effective-prize-tiers';
import { cn } from '@/lib/utils';
import GroupAvatar from '@/components/avatars/GroupAvatar';

const formatFullNumber = (num: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);

const MAX_VISIBLE_CATEGORIES = 2;

interface CategoriesDisplayProps {
  categoriesList?: string[];
}

const CategoriesDisplay = ({ categoriesList = [] }: CategoriesDisplayProps) => {
  const visible = categoriesList.slice(0, MAX_VISIBLE_CATEGORIES);
  const remainingCount = categoriesList.length - MAX_VISIBLE_CATEGORIES;

  if (!categoriesList.length) return null;

  return (
    <div className='z-10 flex flex-wrap gap-1.5'>
      {visible.map((cat, i) => (
        <span
          key={i}
          className='text-foreground rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium tracking-wide backdrop-blur-md'
        >
          {cat}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className='text-muted-foreground rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium tracking-wide backdrop-blur-md'>
          +{remainingCount}
        </span>
      )}
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

interface HackathonCardProps extends Omit<
  Hackathon,
  'organization' | '_count'
> {
  organization: {
    id: string;
    name: string;
    logo: string;
    slug?: string;
  };
  isFullWidth?: boolean;
  className?: string;
  target?: string;
  isPrivate?: boolean;
  isExtended?: boolean;
  _count?: {
    participants: number;
    submissions: number;
    followers: number;
  };
}

export const HackathonCard = ({
  id,
  slug,
  name,
  tagline,
  banner,
  organization,
  status,
  visibility,
  venueName,
  startDate,
  submissionDeadline,
  categories,
  prizeTiers,
  prizes,
  participants: participantMembers,
  isFullWidth = false,
  className,
  target,
  isPrivate = false,
  isExtended = false,
  _count: { participants: participantsCount, submissions, followers } = {
    participants: 0,
    submissions: 0,
    followers: 0,
  },
}: HackathonCardProps) => {
  const router = useRouter();
  // A private hackathon is listed (teased) but its detail page asks for a
  // password. Derive from visibility so every list surface shows the badge.
  const isPrivateHackathon = isPrivate || visibility === 'PRIVATE';
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  const participantAvatars = useMemo(() => {
    return (participantMembers || [])
      .map(p => p.user?.profile?.image || '')
      .filter(img => img !== '');
  }, [participantMembers]);

  const totalPrize = effectivePrizeTiers({ prizes, prizeTiers }).reduce(
    (acc, tier) => {
      const amount = Number(tier.prizeAmount);
      return acc + (Number.isFinite(amount) ? amount : 0);
    },
    0
  );

  const getTopBadgeStatus = useCallback(() => {
    if (status === 'ARCHIVED') return 'Archived';

    const now = new Date().getTime();
    const start = startDate ? new Date(startDate).getTime() : null;
    const deadline = submissionDeadline
      ? new Date(submissionDeadline).getTime()
      : null;

    if (deadline && now > deadline) return 'Ended';
    if (start && now >= start) return 'Ongoing';
    return 'Upcoming';
  }, [status, startDate, submissionDeadline]);

  const getTopBadgeColor = () => {
    switch (getTopBadgeStatus()) {
      case 'Ongoing':
        return 'text-success-400 bg-success-400/10 border-success-400/20';
      case 'Upcoming':
        return 'text-secondary-400 bg-secondary-400/10 border-secondary-400/20';
      case 'Ended':
      case 'Archived':
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  useEffect(() => {
    const badgeStatus = getTopBadgeStatus();
    let targetDate: string | null = null;

    if (badgeStatus === 'Ongoing' && submissionDeadline)
      targetDate = submissionDeadline;
    else if (badgeStatus === 'Upcoming' && startDate) targetDate = startDate;
    else if (badgeStatus === 'Ended' && submissionDeadline)
      targetDate = submissionDeadline;

    if (!targetDate) return;

    setTimeRemaining(calculateTimeRemaining(targetDate));

    if (badgeStatus === 'Ongoing' || badgeStatus === 'Upcoming') {
      const interval = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining(targetDate!));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startDate, submissionDeadline, getTopBadgeStatus]);

  const topBadgeStatus = getTopBadgeStatus();
  const href = `/hackathons/${slug || id || ''}`;

  const handleOrganizerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const orgSlug = organization?.slug;
    if (orgSlug) {
      router.push(`/org/${orgSlug}`);
    }
  };

  return (
    <Link
      href={href}
      target={target === '_blank' ? '_blank' : undefined}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className={cn(
        'group border-border bg-card flex flex-col overflow-hidden rounded-md border transition-all duration-300 hover:-translate-y-1 hover:border-gray-700 hover:shadow-xl hover:shadow-black/50',
        isFullWidth ? 'w-full' : 'max-w-[400px]',
        className
      )}
      aria-label={`View hackathon: ${name}`}
    >
      <div className='bg-muted relative h-44 w-full overflow-hidden sm:h-48'>
        {typeof banner === 'string' && banner.trim() !== '' ? (
          <Image
            src={banner}
            alt={name}
            fill
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            unoptimized
          />
        ) : null}
        <div className='to-background absolute inset-0 bg-linear-to-t from-black/0 via-black/10' />

        <div className='absolute top-4 right-4 left-4 flex items-start justify-between gap-2'>
          <CategoriesDisplay categoriesList={categories} />

          <div className='z-10 flex items-center gap-2'>
            {isPrivateHackathon && (
              <span className='border-error-400/30 bg-error-400/20 text-error-200 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wider whitespace-nowrap backdrop-blur-md'>
                <Lock className='size-3' /> Private
              </span>
            )}
            <span
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider whitespace-nowrap uppercase backdrop-blur-md',
                getTopBadgeColor()
              )}
            >
              {topBadgeStatus}
            </span>
          </div>
        </div>
      </div>

      <div className='flex flex-1 flex-col p-5 pt-2'>
        {organization &&
          (organization.slug ? (
            <button
              onClick={handleOrganizerClick}
              className='group/org bg-card border-border hover:bg-muted relative z-20 -mt-8 flex w-fit items-center gap-2 rounded-full border p-1 pr-3 transition-colors hover:border-gray-600'
            >
              {organization.logo ? (
                <div
                  style={{ backgroundImage: `url(${organization.logo})` }}
                  className='border-border bg-muted size-8 rounded-full border bg-cover bg-center shadow-md'
                />
              ) : (
                <div className='bg-muted border-border size-8 rounded-full border' />
              )}
              <span className='text-muted-foreground group-hover/org:text-foreground flex items-center gap-1 text-sm font-medium transition-colors'>
                {organization.name}
                <ArrowUpRight className='text-muted-foreground group-hover/org:text-foreground size-3 transition-colors' />
              </span>
            </button>
          ) : (
            <div className='bg-card border-border relative z-20 -mt-8 flex w-fit items-center gap-2 rounded-full border p-1 pr-3'>
              {organization.logo ? (
                <div
                  style={{ backgroundImage: `url(${organization.logo})` }}
                  className='border-border bg-muted size-8 rounded-full border bg-cover bg-center shadow-md'
                />
              ) : (
                <div className='bg-muted border-border size-8 rounded-full border' />
              )}
              <span className='text-muted-foreground flex items-center gap-1 text-sm font-medium'>
                {organization.name}
              </span>
            </div>
          ))}

        <div className='mt-3'>
          <h2 className='text-foreground group-hover:text-primary line-clamp-2 text-xl leading-tight font-semibold text-balance transition-colors'>
            {name}
          </h2>
          <p className='text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed'>
            {tagline}
          </p>
        </div>

        {totalPrize > 0 && (
          <div className='mt-4 flex items-center justify-between'>
            <span className='text-muted-foreground flex items-center gap-2 text-sm font-medium'>
              <Trophy className='text-primary size-4' />
              Prize Pool
            </span>
            <span className='text-primary text-xl font-bold tracking-tight'>
              ${formatFullNumber(totalPrize)}
            </span>
          </div>
        )}

        <div className='mt-4 flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <GroupAvatar members={participantAvatars} />
                <span className='text-muted-foreground text-xs font-medium'>
                  {formatFullNumber(participantsCount)} Participants
                </span>
              </div>
            </div>
          </div>

          {venueName && venueName !== 'TBD' && (
            <div className='border-border/50 flex flex-col gap-1 border-t pt-2'>
              <span className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
                <MapPin className='size-3.5' />
                <span
                  className='text-foreground truncate text-sm font-medium'
                  title={venueName}
                >
                  {venueName}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className='mt-auto flex items-center justify-between pt-5'>
          <div className='flex items-center gap-2'>
            <Clock className='text-muted-foreground size-4' />
            <span className='text-foreground text-sm font-medium'>
              {timeRemaining.days > 0
                ? `${topBadgeStatus === 'Upcoming' ? 'Starts' : 'Ends'} in ${timeRemaining.days}d ${timeRemaining.hours}h`
                : topBadgeStatus}
            </span>
          </div>

          {isExtended && (
            <span className='bg-warning-500/10 text-warning-500 flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold'>
              <AlertCircle className='size-3' />
              Extended
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HackathonCard;
