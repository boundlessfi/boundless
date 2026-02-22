'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { useAuthStatus } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useMemo } from 'react';
import {
  Calendar,
  ArrowRight,
  FileText,
  Users,
  Trophy,
  Plus,
} from 'lucide-react';
import { useHackathonStatus } from '@/hooks/hackathon/use-hackathon-status';
import { formatDate } from '@/lib/utils';

interface HackathonStickyCardProps {
  title: string;
  imageUrl?: string;
  deadline?: string;
  startDate?: string;
  totalPrizePool?: string;
  isRegistered?: boolean;
  hasSubmitted?: boolean;
  isTeamFormationEnabled?: boolean;
  registrationDeadlinePolicy?:
    | 'BEFORE_START'
    | 'BEFORE_SUBMISSION_DEADLINE'
    | 'CUSTOM';
  registrationDeadline?: string;
  isLeaving?: boolean;
  onJoinClick?: () => void;
  onSubmitClick?: () => void;
  onViewSubmissionClick?: () => void;
  onFindTeamClick?: () => void;
  onLeaveClick?: () => void;
  participantType?: 'INDIVIDUAL' | 'TEAM' | 'TEAM_OR_INDIVIDUAL';
}

export function HackathonStickyCard(props: HackathonStickyCardProps) {
  const {
    title,
    imageUrl,
    deadline,
    startDate,
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
    onLeaveClick,
    isLeaving,
    participantType,
  } = props;

  const { status } = useHackathonStatus(startDate, deadline);
  const { isAuthenticated } = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname();

  // Determine if registration is allowed
  const canRegister = useMemo(() => {
    const now = new Date();
    const policy = registrationDeadlinePolicy || 'before_submission_deadline';

    switch (policy) {
      case 'BEFORE_START':
        return startDate ? now < new Date(startDate) : false;
      case 'BEFORE_SUBMISSION_DEADLINE':
        return deadline ? now < new Date(deadline) : false;
      case 'CUSTOM':
        return registrationDeadline
          ? now < new Date(registrationDeadline)
          : false;
      default:
        return false;
    }
  }, [registrationDeadlinePolicy, startDate, deadline, registrationDeadline]);

  // Get appropriate register button text
  const getRegisterButtonText = useMemo(() => {
    if (!canRegister) return null;
    const now = new Date();
    const beforeStart = startDate && now < new Date(startDate);

    switch (registrationDeadlinePolicy || 'before_submission_deadline') {
      case 'BEFORE_START':
        return 'Register';
      case 'BEFORE_SUBMISSION_DEADLINE':
        return beforeStart ? 'Register' : 'Join';
      case 'CUSTOM':
        if (registrationDeadline) {
          const custom = new Date(registrationDeadline);
          const beforeCustom = now < custom;
          if (beforeStart && beforeCustom) return 'Register';
          if (!beforeStart && beforeCustom) return 'Register';
        }
        return 'Register';
      default:
        return 'Join';
    }
  }, [
    registrationDeadlinePolicy,
    canRegister,
    startDate,
    registrationDeadline,
  ]);

  // Redirect to auth if user not authenticated
  const redirectToAuth = () => {
    const callbackUrl = encodeURIComponent(pathname);
    router.push(`/auth?mode=signin&callbackUrl=${callbackUrl}`);
  };

  // Format date with fallback
  const formatDateWithFallback = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return formatDate(new Date(dateString));
    } catch {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  return (
    <div className='sticky top-18 hidden lg:block'>
      <Card className='overflow-hidden border border-[#a7f950]/30 bg-gradient-to-br from-[#a7f950]/10 to-transparent p-0'>
        {/* Image Section - UNCHANGED */}
        {imageUrl && (
          <div className='relative h-60 w-full'>
            <Image
              src={imageUrl}
              alt={title}
              fill
              className='object-cover'
              sizes='(max-width: 768px) 100vw, 400px'
            />
          </div>
        )}

        {/* Wave Background */}
        <div className='absolute right-0 bottom-0 -z-20 h-full w-full overflow-hidden rounded-2xl opacity-5'>
          <Image
            src='/wave.svg'
            alt=''
            fill
            className='object-cover'
            priority={false}
          />
        </div>

        <div className='m-0 space-y-3 p-4'>
          {/* Prize Pool Section */}
          {totalPrizePool && (
            <div className='rounded-lg border border-[#a7f950]/30 bg-[#a7f950]/10 py-2 text-center'>
              <div className='mb-0.5 flex items-center justify-center gap-1.5'>
                <Trophy className='h-3.5 w-3.5 text-[#a7f950]' />
                <span className='text-xs text-gray-400'>Prize Pool</span>
              </div>
              <div className='text-xl font-black text-[#a7f950]'>
                ${totalPrizePool}
              </div>
            </div>
          )}

          {/* Participation Type Section */}
          {participantType && (
            <div className='rounded-lg border border-gray-800 bg-gray-900/50 py-2 text-center'>
              <div className='mb-0.5 flex items-center justify-center gap-1.5'>
                <Users className='h-3.5 w-3.5 text-gray-400' />
                <span className='text-xs tracking-wide text-gray-400 uppercase'>
                  Participation
                </span>
              </div>
              <div className='text-base font-bold text-white uppercase'>
                {participantType === 'TEAM_OR_INDIVIDUAL'
                  ? 'Hybrid'
                  : participantType.toLowerCase()}
              </div>
            </div>
          )}

          {/* Countdown Timer */}
          {/* {timeRemaining.total > 0 && (
                        <div className="text-center py-2 rounded-lg bg-gray-900/50 border border-gray-800">
                            <div className="text-xs text-gray-400 mb-0.5 uppercase tracking-wide">
                                {status === "ongoing" ? "Ends In" : "Starts In"}
                            </div>
                            <div className="text-base font-bold text-white">
                                {formatCountdown(timeRemaining)}
                            </div>
                        </div>
                    )} */}

          {/* Date Info Section */}
          <div className='space-y-1.5 text-sm'>
            {status === 'ongoing' && deadline && (
              <div className='flex justify-between border-b border-gray-800 py-1'>
                <span className='text-xs text-gray-400'>Deadline</span>
                <span className='text-xs text-white'>
                  {formatDateWithFallback(deadline)}
                </span>
              </div>
            )}

            {status === 'upcoming' && startDate && (
              <div className='flex justify-between border-b border-gray-800 py-1'>
                <span className='text-xs text-gray-400'>Starts</span>
                <span className='text-xs text-white'>
                  {formatDateWithFallback(startDate)}
                </span>
              </div>
            )}

            {status === 'ended' && deadline && (
              <div className='flex justify-between border-b border-gray-800 py-1'>
                <span className='text-xs text-gray-400'>Ended</span>
                <span className='text-xs text-white'>
                  {formatDateWithFallback(deadline)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col gap-2'>
            {/* Register / Leave Button */}
            {status === 'ended' ? (
              <Button
                disabled
                className='w-full cursor-not-allowed border border-gray-700 bg-gray-800 py-4 text-sm text-gray-500'
              >
                <Calendar className='mr-1.5 h-3.5 w-3.5' />
                Hackathon Ended
              </Button>
            ) : !isRegistered ? (
              canRegister ? (
                <Button
                  onClick={!isAuthenticated ? redirectToAuth : onJoinClick}
                  className='w-full bg-[#a7f950] py-4 text-sm font-bold text-black hover:bg-[#8fd93f]'
                >
                  <Calendar className='mr-1.5 h-3.5 w-3.5' />
                  {getRegisterButtonText || 'Join'}
                  <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                </Button>
              ) : (
                <Button
                  disabled
                  className='w-full cursor-not-allowed border border-gray-700 bg-gray-800 py-4 text-sm text-gray-400'
                >
                  Closed
                </Button>
              )
            ) : (
              <Button
                onClick={onLeaveClick}
                disabled={isLeaving}
                variant='outline'
                className='w-full border-red-600 py-4 text-sm text-red-500 hover:bg-red-950 hover:text-white'
              >
                {isLeaving ? 'Leaving...' : 'Leave'}
              </Button>
            )}

            {/* Submit Project Button */}
            {status === 'ongoing' && isRegistered && !hasSubmitted && (
              <Button
                onClick={onSubmitClick}
                className='w-full bg-[#a7f950] py-4 text-sm text-black hover:bg-[#8fd93f]'
              >
                <Plus className='mr-1.5 h-3.5 w-3.5' />
                Submit Project
              </Button>
            )}

            {/* View Submission Button */}
            {status === 'ongoing' &&
              isRegistered &&
              hasSubmitted &&
              onViewSubmissionClick && (
                <Button
                  onClick={onViewSubmissionClick}
                  variant='outline'
                  className='w-full border-gray-700 py-4 text-sm text-gray-300 hover:bg-gray-900'
                >
                  <FileText className='mr-1.5 h-3.5 w-3.5' />
                  View Submission
                </Button>
              )}

            {/* Find Team Button */}
            {status === 'ongoing' &&
              isRegistered &&
              isTeamFormationEnabled &&
              onFindTeamClick && (
                <Button
                  onClick={onFindTeamClick}
                  variant='outline'
                  className='w-full border-blue-600 py-4 text-sm text-blue-400 hover:bg-blue-950'
                >
                  <Users className='mr-1.5 h-3.5 w-3.5' />
                  Find Team
                </Button>
              )}
          </div>
        </div>
      </Card>
    </div>
  );
}
