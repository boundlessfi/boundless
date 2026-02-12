'use client';

import React from 'react';
import { Participant } from '@/lib/api/hackathons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Eye,
  Star,
  Award,
  Users,
  User,
  CheckCircle2,
  Clock,
  Circle,
  Trophy,
  XCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

interface ParticipantsGridProps {
  data: Participant[];
  onReview?: (participant: Participant) => void;
  onViewTeam?: (participant: Participant) => void;
  onGrade?: (participant: Participant) => void;
  loading?: boolean;
}

export const ParticipantsGrid: React.FC<ParticipantsGridProps> = ({
  data,
  onReview,
  onViewTeam,
  onGrade,
  loading,
}) => {
  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className='h-[280px] animate-pulse rounded-lg border border-gray-900 bg-gray-950/20'
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='flex h-40 items-center justify-center rounded-lg border border-gray-900 bg-gray-950/20 text-gray-500'>
        No participants found.
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {data.map(participant => {
        const user = participant.user;
        const submission = participant.submission;
        const hasSubmission = !!submission;
        const isShortlisted = submission?.status === 'shortlisted';
        const isDisqualified = submission?.status === 'disqualified';
        const isTeam = participant.participationType === 'team';

        const votesCount = Array.isArray(submission?.votes)
          ? submission?.votes.length
          : typeof submission?.votes === 'number'
            ? submission.votes
            : 0;

        // Status configuration
        let statusColor = 'bg-gray-700';
        let statusText = 'Registered';
        let statusIcon = <Circle className='h-3 w-3 text-gray-400' />;
        let dotColor = 'bg-gray-500';

        if (isDisqualified) {
          statusColor = 'bg-red-500';
          statusText = 'Disqualified';
          statusIcon = <XCircle className='h-3 w-3 text-red-400' />;
          dotColor = 'bg-red-500';
        } else if (isShortlisted) {
          statusColor = 'bg-green-500';
          statusText = 'Shortlisted';
          statusIcon = <CheckCircle2 className='h-3 w-3 text-green-400' />;
          dotColor = 'bg-green-500';
        } else if (hasSubmission) {
          statusColor = 'bg-yellow-500';
          statusText = 'Submitted';
          statusIcon = <Clock className='h-3 w-3 text-yellow-400' />;
          dotColor = 'bg-yellow-500';
        }

        return (
          <Card
            key={participant.id}
            className='bg-background-card group relative flex flex-col overflow-hidden border border-gray-900/40 p-0 text-white transition-all hover:border-gray-800'
          >
            {/* Status Accent Bar */}
            <div className={cn('h-1 w-full shrink-0', statusColor)} />

            <CardHeader className='shrink-0 space-y-4 p-4'>
              <div className='flex items-center gap-4'>
                <div className='relative shrink-0'>
                  <Avatar className='h-16 w-16 border-2 border-gray-800 transition-transform group-hover:scale-105'>
                    <AvatarImage
                      src={user.profile.image || '/placeholder.svg'}
                      alt={user.profile.name}
                    />
                    <AvatarFallback className='bg-background-card text-lg'>
                      {user.profile.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status Indicator Dot */}
                  {(isShortlisted || hasSubmission || isDisqualified) && (
                    <div
                      className={cn(
                        'absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-950',
                        dotColor
                      )}
                    >
                      {isDisqualified ? (
                        <XCircle className='h-3 w-3 text-white' />
                      ) : isShortlisted ? (
                        <CheckCircle2 className='h-3 w-3 text-white' />
                      ) : (
                        <Clock className='h-3 w-3 text-white' />
                      )}
                    </div>
                  )}
                </div>

                <div className='min-w-0 flex-1 space-y-1'>
                  <div className='flex items-center justify-between gap-2'>
                    <Badge
                      variant='outline'
                      className={cn(
                        'w-fit px-2 py-0.5 text-[10px] font-medium capitalize',
                        isTeam
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                          : 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                      )}
                    >
                      {isTeam ? (
                        <Users className='mr-1 h-3 w-3' />
                      ) : (
                        <User className='mr-1 h-3 w-3' />
                      )}
                      {participant.participationType}
                    </Badge>
                  </div>
                  <h4 className='truncate text-base font-bold text-white'>
                    {user.profile.name}
                  </h4>
                  <p className='truncate text-xs font-medium text-gray-500'>
                    @{user.profile.username}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className='flex-1 px-4 pt-0 pb-4'>
              <div className='grid grid-cols-2 gap-3'>
                {/* Status Card */}
                <div className='bg-background/40 flex flex-col gap-1.5 rounded-lg border border-gray-900/50 p-2.5'>
                  <span className='text-[10px] font-bold tracking-widest text-gray-500 uppercase'>
                    Status
                  </span>
                  <div className='flex items-center gap-1.5'>
                    {statusIcon}
                    <span
                      className={cn(
                        'text-[11px] font-semibold',
                        isDisqualified
                          ? 'text-red-400'
                          : isShortlisted
                            ? 'text-green-400'
                            : hasSubmission
                              ? 'text-yellow-400'
                              : 'text-gray-400'
                      )}
                    >
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* Votes Card */}
                <div className='bg-background/40 flex flex-col gap-1.5 rounded-lg border border-gray-900/50 p-2.5'>
                  <span className='text-[10px] font-bold tracking-widest text-gray-500 uppercase'>
                    Votes
                  </span>
                  <div className='flex items-center gap-1.5'>
                    <Star
                      className={cn(
                        'h-3 w-3',
                        votesCount > 0
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-500'
                      )}
                    />
                    <span className='text-[11px] font-bold text-white'>
                      {votesCount}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Footer Section */}
            <CardFooter className='bg-background/20 mt-auto flex gap-2 border-t border-gray-900/60 p-3'>
              {isTeam && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='bg-background/50 h-9 flex-1 text-[11px] font-semibold text-gray-400 hover:bg-gray-800 hover:text-white'
                  onClick={() => onViewTeam?.(participant)}
                >
                  <Eye className='mr-1.5 h-3.5 w-3.5' />
                  Team
                </Button>
              )}

              {isShortlisted ? (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-9 flex-1 bg-green-500/10 text-[11px] font-semibold text-green-400 hover:bg-green-500/20 hover:text-green-300'
                  onClick={() => onGrade?.(participant)}
                >
                  <Trophy className='mr-1.5 h-3.5 w-3.5' />
                  Grade
                </Button>
              ) : hasSubmission ? (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-9 flex-1 bg-blue-500/10 text-[11px] font-semibold text-blue-400 hover:bg-blue-500/20 hover:text-blue-300'
                  onClick={() => onReview?.(participant)}
                >
                  <Star className='mr-1.5 h-3.5 w-3.5' />
                  Review
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
