'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ParticipantSocialLinks } from './ParticipantSocialLinks';
import type { Participant as ParticipantType } from '@/lib/api/hackathons';

interface ParticipantInfoProps {
  participant: ParticipantType;
  onTeamClick: () => void;
}

export const ParticipantInfo: React.FC<ParticipantInfoProps> = ({
  participant,
  onTeamClick,
}) => {
  const userName = `${participant.user.profile.firstName} ${participant.user.profile.lastName}`;
  const userAvatar = participant.user.profile.avatar;
  const username = participant.user.profile.username;
  const hasTeam =
    participant.participationType === 'team' || participant.teamMembers;

  return (
    <div className='flex flex-row items-center justify-start p-5'>
      <div className='flex-1'>
        <Avatar className='h-10.5 w-10.5'>
          <AvatarImage src={userAvatar} />
          <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h4 className='text-sm text-white'>{userName}</h4>
        <p className='text-xs text-gray-400'>@{username}</p>
      </div>
      <div className='flex-1'>
        <ParticipantSocialLinks socialLinks={participant.socialLinks} />
        <div className='flex gap-6'>
          {hasTeam && (
            <Button
              variant='link'
              className='p-0 text-sm text-white underline'
              onClick={onTeamClick}
            >
              Team
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
