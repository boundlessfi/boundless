'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  username?: string;
}

interface TeamSectionProps {
  teamMembers: TeamMember[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({ teamMembers }) => {
  return (
    <div>
      <h4 className='mb-4 text-sm font-semibold text-gray-500 uppercase'>
        TEAM
      </h4>
      <ScrollArea className='h-[400px] pr-4'>
        <div className='space-y-3'>
          {teamMembers.map(member => (
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
                <p className='text-sm font-medium text-white'>{member.name}</p>
                {member.username && (
                  <p className='text-xs text-gray-400'>@{member.username}</p>
                )}
                <p
                  className={cn(
                    'mt-1 text-xs',
                    member.role.toLowerCase() === 'team lead'
                      ? 'text-warning-600 font-medium'
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
  );
};
