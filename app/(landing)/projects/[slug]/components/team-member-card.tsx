'use client';

import Image from 'next/image';
import { Mail, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TeamMemberCardData {
  id: string;
  name: string;
  role: string;
  isOwner: boolean;
  avatar?: string;
  username?: string;
  email?: string;
}

interface TeamMemberCardProps {
  member: TeamMemberCardData;
  onProfileClick?: (member: TeamMemberCardData) => void;
  className?: string;
}

export function TeamMemberCard({
  member,
  onProfileClick,
  className,
}: TeamMemberCardProps) {
  const hasProfile = !!member.username;
  const handleCardClick = () => {
    if (hasProfile) onProfileClick?.(member);
  };

  return (
    <div
      onClick={handleCardClick}
      role={hasProfile ? 'button' : undefined}
      tabIndex={hasProfile ? 0 : undefined}
      onKeyDown={
        hasProfile
          ? e => {
              // Only react when the card itself is focused — never steal
              // Enter/Space from inner interactive elements (the profile/email
              // links).
              if (e.target !== e.currentTarget) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onProfileClick?.(member);
              }
            }
          : undefined
      }
      className={cn(
        'border-stepper-border bg-background-card flex flex-col items-center gap-4 rounded-2xl border p-6 text-center transition-colors',
        hasProfile && 'hover:border-primary/40 cursor-pointer',
        className
      )}
    >
      <div className='ring-primary/40 bg-inactive ring-offset-background-card relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-offset-4'>
        {member.avatar ? (
          <Image
            src={member.avatar}
            alt={member.name}
            fill
            className='object-cover'
            sizes='96px'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-500'>
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className='space-y-1'>
        <h3 className='text-lg font-semibold text-white'>{member.name}</h3>
        <p className='text-primary text-sm font-medium'>
          {member.isOwner ? 'Owner' : member.role || 'Member'}
        </p>
      </div>

      <div className='flex items-center gap-2 pt-1'>
        {member.username && (
          <a
            href={`/profile/${member.username}`}
            target='_blank'
            rel='noopener noreferrer'
            onClick={e => e.stopPropagation()}
            aria-label={`${member.name} profile`}
            className='border-stepper-border bg-inactive/60 hover:border-primary/40 hover:text-primary flex h-9 w-9 items-center justify-center rounded-lg border text-gray-400 transition-colors'
          >
            <UserIcon className='h-4 w-4' />
          </a>
        )}
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            onClick={e => e.stopPropagation()}
            aria-label={`Email ${member.name}`}
            className='border-stepper-border bg-inactive/60 hover:border-primary/40 hover:text-primary flex h-9 w-9 items-center justify-center rounded-lg border text-gray-400 transition-colors'
          >
            <Mail className='h-4 w-4' />
          </a>
        )}
      </div>
    </div>
  );
}
