'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useEffect, useState, useRef, useMemo } from 'react';
import { FileText, Users, ArrowRight, Calendar } from 'lucide-react';
import { useAuthStatus } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface HackathonBannerProps {
  title: string;
  imageUrl?: string;
  tagline?: string;
  deadline?: string;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  status?: string;
  participants?: number;
  totalPrizePool?: string;
  isRegistered?: boolean;
  hasSubmitted?: boolean;
  isEnded?: boolean;
  isTeamFormationEnabled?: boolean;
  registrationDeadlinePolicy?:
    | 'before_start'
    | 'before_submission_deadline'
    | 'custom';
  registrationDeadline?: string;
  onJoinClick?: () => void;
  onSubmitClick?: () => void;
  onViewSubmissionClick?: () => void;
  onFindTeamClick?: () => void;
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
  if (time.days > 0)
    return `${time.days} day${time.days !== 1 ? 's' : ''} left`;
  if (time.hours > 0)
    return `${time.hours} hour${time.hours !== 1 ? 's' : ''} left`;
  if (time.minutes > 0)
    return `${time.minutes} minute${time.minutes !== 1 ? 's' : ''} left`;
  return `${time.seconds} second${time.seconds !== 1 ? 's' : ''} left`;
}

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
    <div className='relative flex items-center overflow-hidden'>
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

export function HackathonBanner({
  title,
  tagline,
  imageUrl,
  deadline,
  startDate,
  categories,
  participants,
  totalPrizePool,
  isRegistered = false,
  hasSubmitted = false,
  isTeamFormationEnabled = false,
  registrationDeadlinePolicy,
  registrationDeadline,
  onJoinClick,
  onSubmitClick,
  onViewSubmissionClick,
  onFindTeamClick,
}: HackathonBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  const { isAuthenticated } = useAuthStatus();
  const router = useRouter();

  const hackathonStatus = useRef<'upcoming' | 'ongoing' | 'ended'>('upcoming');

  // Determine status based on dates
  useEffect(() => {
    const now = new Date().getTime();
    const start = startDate ? new Date(startDate).getTime() : null;
    const submissionDeadline = deadline ? new Date(deadline).getTime() : null;

    if (submissionDeadline && now > submissionDeadline) {
      hackathonStatus.current = 'ended';
    } else if (start && now >= start) {
      hackathonStatus.current = 'ongoing';
    } else {
      hackathonStatus.current = 'upcoming';
    }
  }, [startDate, deadline]);

  // Check if registration is allowed based on registrationDeadlinePolicy
  const canRegister = useMemo(() => {
    const now = new Date();

    // If no policy is specified, default to 'before_submission_deadline'
    const policy = registrationDeadlinePolicy || 'before_submission_deadline';

    console.log('🔍 Registration Check:', {
      policy,
      now: now.toISOString(),
      startDate,
      deadline,
      registrationDeadline,
    });

    switch (policy) {
      case 'before_start':
        // Can register only before hackathon starts
        if (startDate) {
          const startDateObj = new Date(startDate);
          const canReg = now < startDateObj;
          console.log('before_start check:', {
            canReg,
            startDateObj: startDateObj.toISOString(),
          });
          return canReg;
        }
        return false;

      case 'before_submission_deadline':
        // Can register before submission deadline
        if (deadline) {
          const deadlineObj = new Date(deadline);
          const canReg = now < deadlineObj;
          console.log('before_submission_deadline check:', {
            canReg,
            deadlineObj: deadlineObj.toISOString(),
          });
          return canReg;
        }
        return false;

      case 'custom':
        // Can register before custom registration deadline
        if (registrationDeadline) {
          const registrationDeadlineObj = new Date(registrationDeadline);
          const canReg = now < registrationDeadlineObj;
          console.log('custom check:', {
            canReg,
            registrationDeadlineObj: registrationDeadlineObj.toISOString(),
          });
          return canReg;
        }
        return false;

      default:
        return false;
    }
  }, [registrationDeadlinePolicy, startDate, deadline, registrationDeadline]);

  // Determine button text based on registration policy and hackathon status
  const getRegisterButtonText = useMemo(() => {
    if (!canRegister) return null;

    const now = new Date();
    const isBeforeStart = startDate && now < new Date(startDate);

    switch (registrationDeadlinePolicy || 'before_submission_deadline') {
      case 'before_start':
        return 'Register Before Start';

      case 'before_submission_deadline':
        if (isBeforeStart) {
          return 'Early Register';
        } else {
          return 'Join Hackathon';
        }

      case 'custom':
        if (registrationDeadline) {
          const customDeadline = new Date(registrationDeadline);
          const isBeforeCustomDeadline = now < customDeadline;

          if (isBeforeStart && isBeforeCustomDeadline) {
            return 'Register Interest';
          } else if (!isBeforeStart && isBeforeCustomDeadline) {
            return 'Late Register';
          }
        }
        return 'Register Now';

      default:
        return 'Join Hackathon';
    }
  }, [
    registrationDeadlinePolicy,
    canRegister,
    startDate,
    registrationDeadline,
  ]);

  // Debug useEffect to track registration logic
  useEffect(() => {
    console.log('🔍 Debug Registration Logic:', {
      hackathonStatus: hackathonStatus.current,
      registrationDeadlinePolicy:
        registrationDeadlinePolicy || 'before_submission_deadline (default)',
      startDate,
      deadline,
      registrationDeadline,
      canRegister,
      isBeforeStart: startDate && new Date() < new Date(startDate),
      buttonText: getRegisterButtonText,
      isRegistered,
    });
  }, [
    registrationDeadlinePolicy,
    startDate,
    deadline,
    registrationDeadline,
    canRegister,
    getRegisterButtonText,
    isRegistered,
  ]);

  const handleRedirectToAuthScreen = () => {
    router.push('/auth?mode=signin');
  };

  const getStatusColor = () => {
    switch (hackathonStatus.current) {
      case 'ongoing':
        return 'text-green-400 bg-green-400/10';
      case 'upcoming':
        return 'text-blue-400 bg-blue-400/10';
      case 'ended':
        return 'text-gray-400 bg-gray-800/20';
      default:
        return '';
    }
  };

  const getStatusText = () => {
    switch (hackathonStatus.current) {
      case 'ongoing':
        return 'Live';
      case 'upcoming':
        return 'Upcoming';
      case 'ended':
        return 'Ended';
      default:
        return 'Upcoming';
    }
  };

  const getCountdownInfo = () => {
    if (timeRemaining.total <= 0)
      return { text: 'Ended', className: 'text-gray-500' };

    if (timeRemaining.days <= 3)
      return {
        text: formatCountdown(timeRemaining),
        className: 'text-red-400',
      };

    if (timeRemaining.days <= 15)
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

    if (hackathonStatus.current === 'ongoing' && deadline) {
      targetDate = deadline;
    } else if (hackathonStatus.current === 'upcoming' && startDate) {
      targetDate = startDate;
    }

    if (!targetDate) return;

    setTimeRemaining(calculateTimeRemaining(targetDate));

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate!));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, startDate]);

  const renderDateSection = () => {
    const countdownInfo = getCountdownInfo();

    if (hackathonStatus.current === 'ongoing' && deadline) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm font-semibold text-red-400'>Deadline:</span>
          <span className='text-sm text-gray-200'>
            {formatDate(new Date(deadline))}
          </span>
          {timeRemaining.total > 0 && (
            <span className={`text-sm ${countdownInfo.className}`}>
              ({countdownInfo.text})
            </span>
          )}
        </div>
      );
    }

    if (hackathonStatus.current === 'upcoming' && startDate) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm font-semibold text-blue-400'>Starts:</span>
          <span className='text-sm text-gray-200'>
            {formatDate(new Date(startDate))}
          </span>
          {timeRemaining.total > 0 && (
            <span className={`text-sm ${countdownInfo.className}`}>
              ({countdownInfo.text})
            </span>
          )}
        </div>
      );
    }

    if (hackathonStatus.current === 'ended' && deadline) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm font-semibold text-gray-500'>Ended:</span>
          <span className='text-sm text-gray-200'>
            {formatDate(new Date(deadline))}
          </span>
        </div>
      );
    }

    return null;
  };

  // Render registration button based on policy and status
  const renderRegistrationButton = () => {
    // If hackathon has ended, don't show registration button
    if (hackathonStatus.current === 'ended') {
      return (
        <Button
          disabled
          className='cursor-not-allowed bg-gray-600/50 text-gray-300 opacity-60'
        >
          <Calendar className='mr-2 h-4 w-4' />
          Ended
        </Button>
      );
    }

    // If user is already registered, show leave button
    if (isRegistered) {
      return (
        <Button
          onClick={onJoinClick}
          variant='outline'
          className='border-red-500/50 text-red-400 hover:bg-red-500/20'
        >
          Leave Hackathon
        </Button>
      );
    }

    // If registration is not allowed, show disabled button
    if (!canRegister) {
      return (
        <Button
          disabled
          className='cursor-not-allowed bg-gray-600/50 text-gray-300 opacity-60'
        >
          <Calendar className='mr-2 h-4 w-4' />
          Registration Closed
        </Button>
      );
    }

    // Show active registration button with appropriate text
    const buttonText = getRegisterButtonText || 'Join Hackathon';

    return (
      <Button
        onClick={!isAuthenticated ? handleRedirectToAuthScreen : onJoinClick}
        className='bg-[#a7f950] font-semibold text-black hover:bg-[#8fd93f]'
      >
        <Calendar className='mr-2 h-4 w-4' />
        {buttonText}
        <ArrowRight className='ml-2 h-4 w-4' />
      </Button>
    );
  };

  return (
    <Card className='relative w-full overflow-hidden rounded-none border-0 bg-transparent p-0 shadow-none'>
      <div
        className='relative h-64 rounded-4xl md:h-80 lg:h-96'
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='absolute inset-0 bg-black/50' />

        <div className='absolute inset-0 mx-auto flex w-full max-w-7xl flex-col justify-between px-6 py-6 md:px-12 md:py-8'>
          {/* Top section */}
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='flex flex-wrap items-center gap-3'>
              <Badge className={`${getStatusColor()} capitalize`}>
                {getStatusText()}
              </Badge>

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

          {/* Title & tagline */}
          <div className='flex flex-col gap-2 md:gap-3'>
            <h1 className='text-left text-3xl leading-tight font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl'>
              {title}
            </h1>

            {tagline && (
              <span className='max-w-2xl text-left text-base text-gray-200 drop-shadow-md md:text-lg'>
                {tagline}
              </span>
            )}

            {tagline && (
              <div className='h-1 w-20 rounded-full bg-[#a7f950] md:w-24' />
            )}
          </div>

          {/* Bottom section */}
          <div className='flex flex-col gap-2 md:gap-3'>
            {renderDateSection()}

            {categories && categories.length > 0 && (
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-sm font-semibold text-[#a7f950]'>
                  Categories:
                </span>
                <CategoriesDisplay categoriesList={categories} />
              </div>
            )}

            {/* Action Buttons */}
            <div className='mt-2 flex flex-wrap items-center gap-3'>
              {/* Registration Button */}
              {renderRegistrationButton()}

              {/* Submit */}
              {hackathonStatus.current === 'ongoing' &&
                isRegistered &&
                !hasSubmitted &&
                onSubmitClick && (
                  <Button
                    onClick={onSubmitClick}
                    className='bg-[#a7f950] font-semibold text-black hover:bg-[#8fd93f]'
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    Submit Project
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                )}

              {/* View Submission */}
              {hackathonStatus.current === 'ongoing' &&
                isRegistered &&
                hasSubmitted &&
                onViewSubmissionClick && (
                  <Button
                    onClick={onViewSubmissionClick}
                    className='bg-[#a7f950] font-semibold text-black hover:bg-[#8fd93f]'
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    View Submission
                  </Button>
                )}

              {/* Find Team */}
              {hackathonStatus.current === 'ongoing' &&
                isRegistered &&
                isTeamFormationEnabled &&
                onFindTeamClick && (
                  <Button
                    onClick={onFindTeamClick}
                    variant='outline'
                    className='border-blue-500/50 font-semibold text-blue-400 hover:bg-blue-500/20'
                  >
                    <Users className='mr-2 h-4 w-4' />
                    Find Team
                  </Button>
                )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
