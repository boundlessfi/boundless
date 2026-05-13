'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Team, TeamMember } from '@/lib/api/hackathons/teams';
import GroupAvatar from '@/components/avatars/GroupAvatar';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import { MessageCircle } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  onJoin?: (team: Team) => void;
  onMessageLeader?: (team: Team, trigger: HTMLElement) => void;
}

const TeamCard = ({ team, onJoin, onMessageLeader }: TeamCardProps) => {
  const {
    teamName,
    description,
    lookingFor = [],
    memberCount,
    maxSize,
    members = [],
    isOpen,
  } = team;

  const status = isOpen ? 'ACTIVE' : 'CLOSED';
  const category = 'DEFI';

  const isTeamMember = (member: string | TeamMember): member is TeamMember => {
    return typeof member !== 'string';
  };

  return (
    <div className='group hover:border-primary/20 flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0A0B0D] p-8 transition-all hover:bg-[#0D0F12]'>
      <div className='mb-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex items-start gap-4'>
          <div className='text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#232B20] text-xl font-black'>
            {teamName.charAt(0).toUpperCase()}
          </div>
          <div className='pt-1'>
            <h3 className='group-hover:text-primary line-clamp-1 text-2xl font-bold text-white uppercase transition-colors'>
              {teamName}
            </h3>
            <div className='mt-2 flex flex-wrap items-center gap-2'>
              <span className='text-primary rounded border border-[#2B3026] bg-[#232B20]/50 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase'>
                {category}
              </span>
              <span
                className={cn(
                  'rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                  isOpen
                    ? 'border-[#2A3347] bg-[#1E232F]/50 text-[#5470B8]'
                    : 'border-white/10 bg-white/5 text-gray-500'
                )}
              >
                {status}
              </span>
              <span className='ml-1 text-[10px] font-bold text-gray-600 uppercase'>
                {memberCount}/{maxSize} BUILDERS
              </span>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className='flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap'>
            {onMessageLeader && team.leader?.id && (
              <BoundlessButton
                variant='outline'
                size='sm'
                className='h-11 shrink-0 rounded-xl border-white/10 bg-white/5 px-4 text-sm font-bold text-white transition-all hover:bg-white/10'
                onClick={e => onMessageLeader(team, e.currentTarget)}
                aria-label='Message team leader'
              >
                <MessageCircle className='mr-2 h-4 w-4' />
                Message
              </BoundlessButton>
            )}
            <BoundlessButton
              variant='outline'
              size='sm'
              className='border-primary/20 text-primary hover:bg-primary h-11 w-full rounded-xl bg-[#232B20]/30 px-6 text-sm font-bold transition-all hover:text-black sm:w-auto'
              onClick={() => onJoin?.(team)}
              disabled={memberCount >= maxSize}
            >
              Join Team
            </BoundlessButton>
          </div>
        )}
      </div>

      {/* Description */}
      <p className='mb-8 line-clamp-2 min-h-[48px] text-base leading-relaxed text-[#9BA1A6]'>
        {description}
      </p>

      {/* Bottom Section */}
      <div className='mt-auto border-t border-white/5 pt-6'>
        <p className='mb-4 text-[10px] font-black tracking-[0.2em] text-[#555555] uppercase'>
          ROLES NEEDED
        </p>
        <div className='flex items-center justify-between'>
          <div className='flex flex-wrap gap-2'>
            {lookingFor.slice(0, 3).map((role, idx) => (
              <span
                key={idx}
                className='rounded-xl border border-[#232B35] bg-[#14191F] px-4 py-2 text-[11px] font-bold text-[#E0E0E0]'
              >
                {typeof role === 'string' ? role : role.role}
              </span>
            ))}
            {lookingFor.length > 3 && (
              <span className='rounded-xl border border-[#232B35] bg-[#14191F] px-3 py-2 text-[11px] font-bold text-[#E0E0E0]'>
                +{lookingFor.length - 3}
              </span>
            )}
            {lookingFor.length === 0 && (
              <span className='text-[10px] font-bold text-gray-700 uppercase italic'>
                Full Team
              </span>
            )}
          </div>
          <GroupAvatar
            members={members.map(m => (isTeamMember(m) ? (m.image ?? '') : ''))}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
