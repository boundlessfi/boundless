'use client';

import React from 'react';
import { ArrowUpRight, Award } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Participant as ParticipantType } from '@/lib/api/hackathons';

interface ParticipantSubmissionProps {
  participant: ParticipantType;
  isShortlisted: boolean;
  organizationId?: string;
  hackathonId?: string;
  isLoadingCriteria: boolean;
  onReviewClick: () => void;
  onGradeClick: () => void;
}

export const ParticipantSubmission: React.FC<ParticipantSubmissionProps> = ({
  participant,
  isShortlisted,
  organizationId,
  hackathonId,
  isLoadingCriteria,
  onReviewClick,
  onGradeClick,
}) => {
  if (!participant.submission) return null;

  const votesCount = Array.isArray(participant.submission.votes)
    ? participant.submission.votes.length
    : participant.submission.votes;
  const commentsCount = Array.isArray(participant.submission.comments)
    ? participant.submission.comments.length
    : participant.submission.comments || 0;

  return (
    <div className='bg-background-card flex flex-col gap-4 rounded-r-[8px] border-l border-gray-900 p-5'>
      <div className='flex items-center gap-3'>
        <div className='h-12.75 w-12.75'>
          <Image
            src={participant.submission.logo || '/bitmed.png'}
            alt={participant.submission.projectName}
            width={50}
            height={50}
            className='h-auto w-full object-cover'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <h5 className='text-sm text-white'>
              {participant.submission.projectName}
            </h5>
            <Badge className='bg-office-brown text-office-brown-darker border-office-brown-darker rounded-[4px] border px-1 py-0.5 text-xs font-medium'>
              {participant.submission.category}
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-gray-500'>{votesCount} Votes</span>
            <div className='h-4 w-px bg-gray-900' />
            <span className='text-xs text-gray-500'>
              {commentsCount.toLocaleString()}+ Comments
            </span>
          </div>
        </div>
      </div>
      <p className='line-clamp-3 text-sm text-white'>
        {participant.submission.description}
      </p>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-sm text-gray-500'>
          {new Date(participant.submission.submissionDate).toLocaleDateString(
            'en-US',
            {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }
          )}
        </span>
        <div className='flex items-center gap-2'>
          {isShortlisted && organizationId && hackathonId && (
            <Button
              variant='link'
              className='text-primary p-0 text-sm'
              onClick={onGradeClick}
              disabled={isLoadingCriteria}
            >
              <Award className='mr-1 h-4 w-4' />
              Grade Submission
            </Button>
          )}
          <Button
            variant='link'
            className='text-primary p-0 text-sm'
            onClick={onReviewClick}
          >
            Review Submission <ArrowUpRight />
          </Button>
        </div>
      </div>
    </div>
  );
};
