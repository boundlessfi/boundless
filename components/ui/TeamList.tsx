'use client';

import React from 'react';
import Image from 'next/image';

export interface TeamMember {
  id: string;
  name: string;
  role: 'OWNER' | 'MEMBER';
  avatar?: string;
  joinedAt?: string;
  username?: string;
}

interface TeamListProps {
  members: TeamMember[];
  onMemberClick?: (member: TeamMember) => void;
  showEmptyState?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  className?: string;
}

export function TeamList({
  members,
  onMemberClick,
  showEmptyState = true,
  emptyStateTitle = 'No Team Members',
  emptyStateDescription = "This project doesn't have any team members yet.",
  className = '',
}: TeamListProps) {
  const getRoleColor = (role: 'OWNER' | 'MEMBER') => {
    return role === 'OWNER' ? 'text-[#DBF936]' : 'text-[#B5B5B5]';
  };

  const handleMemberClick = (member: TeamMember) => {
    if (onMemberClick) {
      onMemberClick(member);
    }
  };

  // Show empty state if no team members
  if (members.length === 0 && showEmptyState) {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <div className='mb-4 rounded-full bg-gray-800 p-4'>
          <svg
            className='h-8 w-8 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
            />
          </svg>
        </div>
        <h3 className='mb-2 text-lg font-medium text-white'>
          {emptyStateTitle}
        </h3>
        <p className='text-sm text-gray-400'>{emptyStateDescription}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className='space-y-2'>
        {members.map(member => (
          <div
            key={member.id}
            className='flex cursor-pointer items-center justify-between rounded px-3 py-2 transition-colors hover:bg-gray-900/30'
            onClick={() => handleMemberClick(member)}
          >
            <div className='flex items-center space-x-4'>
              {/* Avatar */}
              <div className='relative'>
                <div className='h-12 w-12 overflow-hidden rounded-full border-[0.5px] border-[#2B2B2B]'>
                  {member.avatar ? (
                    <Image
                      width={48}
                      height={48}
                      src={member.avatar}
                      alt={member.name}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <Image
                      width={48}
                      height={48}
                      src='/avatar.png'
                      alt='Default avatar'
                      className='h-full w-full object-cover'
                    />
                  )}
                </div>
                {/* Role indicator */}
                {member.role === 'OWNER' && (
                  <div className='absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-gray-900 bg-[#DBF936]' />
                )}
              </div>

              {/* Member Info */}
              <div className='flex flex-col space-y-0.5'>
                <span className='text-base font-normal text-white'>
                  {member.name}
                </span>
                <div className='flex items-center space-x-2'>
                  <span className={`text-sm ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                  {member.username && (
                    <span className='text-xs text-gray-500'>
                      @{member.username}
                    </span>
                  )}
                </div>
                {member.joinedAt && (
                  <span className='text-xs text-gray-500'>
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Chevron */}
            <svg
              width='20'
              height='20'
              viewBox='0 0 20 20'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M7.5 15L12.5 10L7.5 5'
                stroke='white'
                strokeWidth='1.4'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
