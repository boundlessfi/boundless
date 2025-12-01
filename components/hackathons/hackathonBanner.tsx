'use client';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import {
  FileText,
  Users,
  ArrowRight,
  Calendar,
  Clock,
  Trophy,
} from 'lucide-react';
import { useAuthStatus } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useHackathonStatus } from '@/hooks/hackathon/use-hackathon-status';

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
  onLeaveClick?: () => void;
  isLeaving?: boolean;
}

export function HackathonBanner({
  title,
  tagline,
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
  isLeaving,
  onJoinClick,
  onSubmitClick,
  onViewSubmissionClick,
  onFindTeamClick,
  onLeaveClick,
}: HackathonBannerProps) {
  const { status, timeRemaining, formatCountdown } = useHackathonStatus(
    startDate,
    deadline
  );
  const { isAuthenticated } = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname();

  // Determine if registration is allowed
  const canRegister = useMemo(() => {
    const now = new Date();
    const policy = registrationDeadlinePolicy || 'before_submission_deadline';

    switch (policy) {
      case 'before_start':
        if (startDate) {
          return now < new Date(startDate);
        }
        return false;
      case 'before_submission_deadline':
        if (deadline) {
          return now < new Date(deadline);
        }
        return false;
      case 'custom':
        if (registrationDeadline) {
          return now < new Date(registrationDeadline);
        }
        return false;
      default:
        return false;
    }
  }, [registrationDeadlinePolicy, startDate, deadline, registrationDeadline]);

  // Get appropriate register button text
  const getRegisterButtonText = useMemo(() => {
    if (!canRegister) return null;

    const now = new Date();
    const isBeforeStart = startDate && now < new Date(startDate);

    switch (registrationDeadlinePolicy || 'before_submission_deadline') {
      case 'before_start':
        return 'Register Before Start';
      case 'before_submission_deadline':
        return isBeforeStart ? 'Early Register' : 'Join Hackathon';
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

  // Redirect to auth screen
  const handleRedirectToAuthScreen = () => {
    const callbackUrl = encodeURIComponent(pathname);
    router.push(`/auth?mode=signin&callbackUrl=${callbackUrl}`);
  };

  // Get status color based on hackathon status
  const getStatusColor = () => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'ongoing':
        return 'Live Now';
      case 'upcoming':
        return 'Upcoming';
      case 'ended':
        return 'Ended';
      default:
        return 'Upcoming';
    }
  };

  // Format date with fallback
  // const formatDateWithFallback = (dateString?: string) => {
  //   if (!dateString) return "N/A"
  //   try {
  //     return formatDate(new Date(dateString))
  //   } catch {
  //     return new Date(dateString).toLocaleDateString("en-US", {
  //       month: "short",
  //       day: "numeric",
  //       year: "numeric",
  //     })
  //   }
  // }

  // Render registration button based on various conditions
  const renderRegistrationButton = () => {
    // Hackathon has ended
    if (status === 'ended') {
      return (
        <Button
          disabled
          className='w-full cursor-not-allowed border border-gray-700 bg-gray-800 text-gray-500 hover:bg-gray-800'
        >
          <Calendar className='mr-2 h-4 w-4' />
          Hackathon Ended
        </Button>
      );
    }

    // User is already registered
    if (isRegistered) {
      return (
        <Button
          onClick={onLeaveClick}
          disabled={isLeaving}
          variant='outline'
          className='w-full border-red-600 bg-transparent text-red-500 hover:bg-red-950 hover:text-red-400'
        >
          {isLeaving ? 'Leaving...' : 'Leave Hackathon'}
        </Button>
      );
    }

    // Registration is closed
    if (!canRegister) {
      return (
        <Button
          disabled
          className='w-full cursor-not-allowed border border-gray-700 bg-gray-800 text-gray-500 hover:bg-gray-800'
        >
          <Calendar className='mr-2 h-4 w-4' />
          Registration Closed
        </Button>
      );
    }

    // Registration is open
    const buttonText = getRegisterButtonText || 'Join Hackathon';
    return (
      <Button
        onClick={!isAuthenticated ? handleRedirectToAuthScreen : onJoinClick}
        className='w-full bg-[#a7f950] py-5 text-base font-bold text-black hover:bg-[#8fd93f]'
      >
        <Calendar className='mr-2 h-4 w-4' />
        {buttonText}
        <ArrowRight className='ml-2 h-4 w-4' />
      </Button>
    );
  };

  return (
    <div className='mb-6 w-full'>
      <div className='relative overflow-hidden rounded-xl border border-[#a7f950]/30 bg-gradient-to-br from-[#a7f950]/10 to-transparent'>
        {/* Wave Background */}
        <div className='absolute right-0 bottom-0 h-full w-full overflow-hidden rounded-xl opacity-5'>
          <Image
            src='/wave.svg'
            alt=''
            fill
            className='object-cover'
            priority={false}
          />
        </div>

        {/* Gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-[#a7f950]/5 via-transparent to-[#a7f950]/5' />

        <div className='relative z-10 p-5 lg:p-6'>
          {/* Status Badge */}
          <div className='mb-3 flex items-center gap-2'>
            <div
              className={`h-2 w-2 rounded-full ${getStatusColor()} animate-pulse`}
            />
            <span className='text-xs font-semibold tracking-wide text-white uppercase'>
              {getStatusText()}
            </span>
          </div>

          {/* Title & Tagline */}
          <div className='mb-4'>
            <h1 className='mb-2 text-2xl leading-tight font-black text-white lg:text-3xl'>
              {title}
            </h1>
            {tagline && (
              <p className='max-w-2xl text-sm leading-snug text-gray-300'>
                {tagline}
              </p>
            )}
          </div>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className='mb-4 flex flex-wrap gap-1.5'>
              {categories.map((cat, i) => (
                <span
                  key={i}
                  className='rounded-full border border-[#a7f950]/30 bg-[#a7f950]/20 px-3 py-1 text-xs font-medium text-[#a7f950]'
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Stats Row */}
          <div className='mb-5 grid grid-cols-2 gap-3'>
            {/* Countdown Timer */}
            {timeRemaining.total > 0 && (
              <div className='rounded-lg border border-gray-800 bg-gray-900/60 p-3 backdrop-blur-sm'>
                <div className='mb-1 flex items-center gap-1.5'>
                  <Clock className='h-3.5 w-3.5 text-gray-400' />
                  <span className='text-xs tracking-wide text-gray-400 uppercase'>
                    {status === 'ongoing' ? 'Ends In' : 'Starts In'}
                  </span>
                </div>
                <div className='text-lg font-bold text-white'>
                  {formatCountdown(timeRemaining)}
                </div>
              </div>
            )}

            {/* Participants Count */}
            {participants !== undefined && (
              <div className='rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-4 backdrop-blur-sm'>
                <div className='mb-1 flex items-center gap-1.5'>
                  <Users className='h-3.5 w-3.5 text-gray-400' />
                  <span className='text-xs tracking-wide text-gray-400 uppercase'>
                    Participants
                  </span>
                </div>
                <div className='text-lg font-bold text-white'>
                  {participants.toLocaleString()}
                </div>
              </div>
            )}

            {/* Prize Pool */}
            {totalPrizePool && (
              <div className='col-span-2 block rounded-lg border border-gray-800 bg-gray-900/60 p-3 backdrop-blur-sm lg:hidden'>
                <div className='mb-1 flex items-center gap-1.5'>
                  <Trophy className='h-3.5 w-3.5 text-[#a7f950]' />
                  <span className='text-xs tracking-wide text-gray-400 uppercase'>
                    Total Prize Pool
                  </span>
                </div>
                <div className='text-lg font-bold text-[#a7f950]'>
                  ${totalPrizePool}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Mobile Only */}
          <div className='mt-5 flex flex-col gap-2.5 lg:hidden'>
            {renderRegistrationButton()}

            {status === 'ongoing' &&
              isRegistered &&
              !hasSubmitted &&
              onSubmitClick && (
                <Button
                  onClick={onSubmitClick}
                  className='w-full bg-[#a7f950] py-5 font-bold text-black hover:bg-[#8fd93f]'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  Submit Project
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              )}

            {status === 'ongoing' &&
              isRegistered &&
              hasSubmitted &&
              onViewSubmissionClick && (
                <Button
                  onClick={onViewSubmissionClick}
                  variant='outline'
                  className='w-full border-gray-700 bg-transparent py-5 text-gray-300 hover:bg-gray-900'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  View Submission
                </Button>
              )}

            {status === 'ongoing' &&
              isRegistered &&
              isTeamFormationEnabled &&
              onFindTeamClick && (
                <Button
                  onClick={onFindTeamClick}
                  variant='outline'
                  className='w-full border-blue-600 bg-transparent py-5 text-blue-400 hover:bg-blue-950'
                >
                  <Users className='mr-2 h-4 w-4' />
                  Find Team
                </Button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
