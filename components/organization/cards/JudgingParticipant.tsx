'use client';

import React, { useState } from 'react';
import { ArrowUpRight, Mail } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import TeamModal from './TeamModal';
import GradeSubmissionModal from './GradeSubmissionModal';

const JudgingParticipant = ({ isSubmitted }: { isSubmitted: boolean }) => {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  return (
    <div
      className={cn(
        'bg-background/8 grid grid-cols-2 rounded-[8px] border border-gray-900',
        isSubmitted ? 'grid-cols-2' : 'grid-cols-1'
      )}
    >
      <div className='flex flex-row items-center justify-start p-5'>
        <div className='flex-1'>
          <Avatar className='h-10.5 w-10.5'>
            <AvatarImage src='https://github.com/shadcn.png' />
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
          <h4 className='text-sm text-white'>Participant Name</h4>
          <p className='text-xs text-gray-400'>@participant</p>
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-5'>
            <span>
              <Image
                src='/footer/telegram.svg'
                alt='Telegram'
                width={24}
                height={24}
                className='h-6 w-6'
              />
            </span>
            <span>
              <Image
                src='/footer/github.svg'
                alt='Github'
                width={24}
                height={24}
                className='h-6 w-6'
              />
            </span>
            <span>
              <Mail className='h-4 w-4' />
            </span>
          </div>
          <div className='flex gap-6'>
            <Button
              variant='link'
              className='p-0 text-sm text-white underline'
              onClick={() => setIsTeamModalOpen(true)}
            >
              Team
            </Button>
          </div>
        </div>
      </div>
      {isSubmitted && (
        <div className='bg-background-card flex flex-col gap-4 rounded-r-[8px] border-l border-gray-900 p-5'>
          <div className='flex items-center gap-3'>
            <div className='h-12.75 w-12.75'>
              <Image
                src='/bitmed.png'
                alt='Telegram'
                width={50}
                height={50}
                className='h-auto w-full object-cover'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <h5 className='text-sm text-white'>Project Name</h5>
                <Badge className='bg-office-brown text-office-brown-darker border-office-brown-darker rounded-[4px] border px-1 py-0.5 text-xs font-medium'>
                  Category
                </Badge>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500'>200 Votes</span>
                <div className='h-4 w-px bg-gray-900' />
                <span className='text-xs text-gray-500'>1k+ Comments</span>
              </div>
            </div>
          </div>
          <p className='line-clamp-3 text-sm text-white'>
            To build a secure, transparent, and trusted digital health ecosystem
            powered by Sonic blockchain for 280M lives in Indonesia.
          </p>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-sm text-gray-500'>12 Oct, 2025</span>
            <Button
              variant='link'
              className='text-primary p-0 text-sm'
              onClick={() => setIsGradeModalOpen(true)}
            >
              Grade Submission <ArrowUpRight />
            </Button>
          </div>
        </div>
      )}

      {/* Team Modal */}
      <TeamModal
        open={isTeamModalOpen}
        onOpenChange={setIsTeamModalOpen}
        participationType={isSubmitted ? 'team' : 'no-submission'}
        onTeamClick={() => {
          // TODO: Navigate to team details page or show team information
        }}
      />

      {/* Grade Submission Modal */}
      <GradeSubmissionModal
        open={isGradeModalOpen}
        onOpenChange={setIsGradeModalOpen}
        submission={{
          id: '1',
          projectName: 'Project Name',
          category: 'Category',
          description:
            'To build a secure, transparent, and trusted digital health ecosystem powered by Sonic blockchain for 280M lives in Indonesia.',
          votes: 200,
          comments: 1000,
          logo: '/bitmed.png',
        }}
        onGrade={(submissionId, scores) => {
          // TODO: Implement API call to submit grades
          void submissionId;
          void scores;
        }}
      />
    </div>
  );
};

export default JudgingParticipant;
