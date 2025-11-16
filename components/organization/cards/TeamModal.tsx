'use client';

import React from 'react';
import { ChevronRight, XIcon } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

type ParticipationType = 'team' | 'individual' | 'no-submission';

interface TeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName?: string;
  submissionDate?: string;
  members?: TeamMember[];
  participationType?: ParticipationType;
  teamId?: string;
  organizationId?: string;
  hackathonId?: string;
  onTeamClick?: () => void;
}

export default function TeamModal({
  open,
  onOpenChange,
  teamName = 'Bitmed',
  submissionDate = '03 Sep, 2025',
  members = [
    {
      id: '1',
      name: 'Participant Name',
      role: 'Team Lead',
      avatar: 'https://github.com/shadcn.png',
    },
    {
      id: '2',
      name: 'Member Name',
      role: 'UI/UX Designer',
      avatar: 'https://github.com/shadcn.png',
    },
    {
      id: '3',
      name: 'Member Name',
      role: 'Front-end Developer',
      avatar: 'https://github.com/shadcn.png',
    },
    {
      id: '4',
      name: 'Member Name',
      role: 'Back-end Developer',
      avatar: 'https://github.com/shadcn.png',
    },
  ],
  participationType = 'team',
  teamId,
  organizationId,
  hackathonId,
  onTeamClick,
}: TeamModalProps) {
  const handleTeamClick = () => {
    if (onTeamClick) {
      onTeamClick();
    } else if (teamId && organizationId && hackathonId) {
      // Navigate to team details page if available
      // router.push(`/organizations/${organizationId}/hackathons/${hackathonId}/teams/${teamId}`);
    }
  };

  const getParticipationTypeBadge = () => {
    switch (participationType) {
      case 'team':
        return (
          <Badge className='bg-primary/20 text-primary border-primary/30 rounded-[4px] px-2 py-0.5 text-xs font-medium'>
            Team
          </Badge>
        );
      case 'individual':
        return (
          <Badge className='rounded-[4px] border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400'>
            Individual
          </Badge>
        );
      case 'no-submission':
        return (
          <Badge className='rounded-[4px] border-gray-500/30 bg-gray-500/20 px-2 py-0.5 text-xs font-medium text-gray-400'>
            No submission
          </Badge>
        );
      default:
        return null;
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-background-card max-w-md border-gray-900 p-0'
        showCloseButton={false}
      >
        <DialogHeader className='flex flex-row items-center justify-between p-6 pb-4'>
          <DialogTitle className='font-regular text-left text-base text-white'>
            Team Name
          </DialogTitle>
          <DialogClose className=''>
            <XIcon className='h-5 w-5 text-white' />
          </DialogClose>
        </DialogHeader>

        <div className='px-6 pb-4'>
          {/* Team Information */}
          <div
            className='flex cursor-pointer items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition-colors hover:bg-gray-900'
            onClick={handleTeamClick}
          >
            <div className='h-12.75 w-12.75'>
              <Image
                src='/bitmed.png'
                alt='Team'
                width={50}
                height={50}
                className='h-auto w-full object-cover'
              />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 flex items-center gap-2'>
                <h3 className='text-base font-medium text-white'>{teamName}</h3>
                {getParticipationTypeBadge()}
              </div>
              {participationType !== 'no-submission' && (
                <p className='text-sm text-gray-400'>
                  Submitted on: {submissionDate}
                </p>
              )}
              {participationType === 'no-submission' && (
                <p className='text-sm text-gray-400'>Registered participant</p>
              )}
            </div>
            <ChevronRight className='h-5 w-5 flex-shrink-0 text-white' />
          </div>

          {/* Members Section - Only show for team participation */}
          {participationType === 'team' && members.length > 0 && (
            <div className='mt-6'>
              <h4 className='mb-4 text-sm font-semibold text-gray-500 uppercase'>
                MEMBERS
              </h4>
              <ScrollArea className='h-[300px] pr-4'>
                <div className='space-y-2'>
                  {members.map(member => (
                    <div
                      key={member.id}
                      className='group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-900/50'
                    >
                      <Avatar className='h-10 w-10 flex-shrink-0'>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium text-white'>
                          {member.name}
                        </p>
                        <p
                          className={cn(
                            'text-xs',
                            member.role.toLowerCase() === 'team lead'
                              ? 'text-warning-600'
                              : 'text-gray-500'
                          )}
                        >
                          {member.role}
                        </p>
                      </div>
                      <ChevronRight className='h-5 w-5 flex-shrink-0 text-white opacity-0 transition-opacity group-hover:opacity-100' />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Individual Participant Info */}
          {participationType === 'individual' && (
            <div className='mt-6'>
              <p className='text-sm text-gray-400'>
                This participant is working individually.
              </p>
            </div>
          )}

          {/* No Submission Info */}
          {participationType === 'no-submission' && (
            <div className='mt-6'>
              <p className='text-sm text-gray-400'>
                This participant has registered but has not submitted a project.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
