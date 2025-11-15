'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { TeamSection } from './TeamSection';

interface Submission {
  id: string;
  projectName: string;
  category: string;
  description: string;
  votes: number;
  comments: number;
  logo?: string;
  teamMembers?: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
    username?: string;
  }>;
}

interface SubmissionInfoProps {
  submission: Submission;
}

export const SubmissionInfo: React.FC<SubmissionInfoProps> = ({
  submission,
}) => {
  return (
    <div className='w-1/2 overflow-y-auto px-4'>
      <div className='mb-4 flex items-center gap-3'>
        <div className='h-16 w-16'>
          <Image
            src={submission.logo || '/bitmed.png'}
            alt={submission.projectName}
            width={64}
            height={64}
            className='h-full w-full rounded-lg object-cover'
          />
        </div>
        <div className='flex-1'>
          <div className='mb-1 flex items-center gap-2'>
            <h3 className='text-lg font-medium text-white'>
              {submission.projectName}
            </h3>
            <Badge className='bg-office-brown text-office-brown-darker border-office-brown-darker rounded-[4px] border px-2 py-0.5 text-xs font-medium'>
              {submission.category}
            </Badge>
          </div>
          <div className='flex items-center gap-2 text-sm text-gray-400'>
            <span>{submission.votes} Votes</span>
            <div className='h-4 w-px bg-gray-900' />
            <span>{submission.comments.toLocaleString()}+ Comments</span>
          </div>
        </div>
      </div>

      <p className='mb-6 text-sm text-gray-500'>{submission.description}</p>

      {submission.teamMembers && submission.teamMembers.length > 0 && (
        <TeamSection teamMembers={submission.teamMembers} />
      )}
    </div>
  );
};
