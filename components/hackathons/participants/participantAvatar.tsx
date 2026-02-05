'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileCard } from './profileCard';
import type { ParticipantDisplay } from '@/lib/api/hackathons/index';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useParticipants } from '@/hooks/hackathon/use-participants';
import { useAuthStatus } from '@/hooks/use-auth';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { InviteUserModal } from '../team-formation/InviteUserModal';

interface ParticipantAvatarProps {
  participant: ParticipantDisplay;
}

export function ParticipantAvatar({ participant }: ParticipantAvatarProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { allParticipants } = useParticipants();
  const { user } = useAuthStatus();
  const { currentHackathon } = useHackathonData();

  const currentUserParticipant = useMemo(() => {
    if (!user) return null;
    const currentUsername = user.username || (user.profile as any)?.username;
    const currentUserId = user.id || (user as any).userId;

    return allParticipants.find(
      p =>
        (currentUsername && p.username === currentUsername) ||
        (currentUserId && p.userId === currentUserId)
    );
  }, [user, allParticipants]);

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='group inline-flex cursor-pointer items-center gap-2'>
              <div className='relative flex-shrink-0'>
                <Avatar className='h-12 w-12 border-2 border-gray-700 transition-all duration-300 group-hover:scale-110 group-hover:border-[#a7f950]'>
                  <AvatarImage
                    src={participant.avatar}
                    alt={participant.username}
                    className='object-cover'
                  />
                  {/* <AvatarFallback className="bg-gray-800 text-gray-400 text-xs"> */}
                  {/* {participant.username.slice(0, 2).toUpperCase()} */}
                  <AvatarFallback className='bg-zinc-800 text-xs text-zinc-400'>
                    {participant.name?.charAt(0) ||
                      participant.username?.charAt(0) ||
                      'U'}
                  </AvatarFallback>
                </Avatar>

                {/* Green status dot if submitted */}
                {participant.hasSubmitted && (
                  <div
                    className='bg-primary/45 absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-gray-900'
                    title='Project submitted'
                  />
                )}
              </div>

              <span className='text-sm text-gray-200 transition-colors group-hover:text-[#a7f950]'>
                {participant.username
                  ? participant.username.slice(0, 1).toUpperCase() +
                    participant.username.slice(1)
                  : participant.name || 'User'}
              </span>
            </div>
          </TooltipTrigger>

          <TooltipContent
            side='right'
            align='start'
            className='border-0 bg-transparent p-0 shadow-none'
            sideOffset={10}
          >
            <ProfileCard
              participant={participant}
              onInviteClick={() => setIsInviteModalOpen(true)}
            />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isInviteModalOpen &&
        currentUserParticipant?.teamId &&
        currentHackathon?.id && (
          <InviteUserModal
            open={isInviteModalOpen}
            onOpenChange={setIsInviteModalOpen}
            hackathonId={currentHackathon.id}
            teamId={currentUserParticipant.teamId}
            inviteeId={participant.username}
            inviteeName={participant.name}
          />
        )}
    </>
  );
}
