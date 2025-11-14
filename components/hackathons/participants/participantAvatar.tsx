'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileCard } from './profileCard';
import type { Participant } from '@/types/hackathon';
import Image from 'next/image';

interface ParticipantAvatarProps {
  participant: Participant;
}

export function ParticipantAvatar({ participant }: ParticipantAvatarProps) {
  return (
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
                <AvatarFallback>
                  <Image
                    src='https://i.pravatar.cc/150?img=10'
                    alt='avatar'
                    width={116}
                    height={22}
                    className='h-full w-full object-cover'
                  />
                </AvatarFallback>
                {/* </AvatarFallback> */}
              </Avatar>

              {/* Green status dot if submitted */}
              {participant.hasSubmitted && (
                <div
                  className='absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-gray-900 bg-[#a7f950]'
                  title='Project submitted'
                />
              )}
            </div>

            <span className='text-sm text-gray-200 transition-colors group-hover:text-[#a7f950]'>
              {participant.username}
            </span>
          </div>
        </TooltipTrigger>

        <TooltipContent
          side='right'
          align='start'
          className='border-0 bg-transparent p-0 shadow-none'
          sideOffset={10}
        >
          <ProfileCard participant={participant} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
