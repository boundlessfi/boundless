'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Participant } from '@/types/hackathon';
import Image from 'next/image';
import { MessageCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import Link from 'next/link';

interface ProfileCardProps {
  participant: Participant;
}

export function ProfileCard({ participant }: ProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const { participants } = useHackathonData();
  const teamMembers = useMemo(() => {
    if (participant.role === 'leader' && participant.teamId) {
      return participants.filter(
        p => p.teamId === participant.teamId && p.id !== participant.id // Exclude the current participant (leader)
      );
    }
    return [];
  }, [participant, participants]);

  // Check if this participant is a team leader
  const isTeamLeader = participant.role === 'leader' && participant.teamId;

  // Check if this participant is a team member (but not leader)
  // const isTeamMember = participant.role === 'member' && participant.teamId;

  // Check if this is an individual participant
  // const isIndividual = !participant.teamId || participant.isIndividual;

  return (
    <div className='w-80 rounded-lg border border-gray-700 bg-black p-6 shadow-2xl'>
      {/* Header with avatar */}
      <div className='mb-4 flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          <div className='h-16 w-16 overflow-hidden rounded-full border-2 border-[#a7f950]'>
            <Image
              src={participant.avatar}
              alt={participant.username}
              className='h-full w-full object-cover'
              width={120}
              height={120}
            />
          </div>
          <div>
            <h3 className='flex items-center gap-2 text-xl font-bold text-white'>
              {participant.name}
              {participant.verified && (
                <svg
                  className='h-5 w-5 text-[#a7f950]'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707-9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
            </h3>
            <p className='text-sm text-gray-400'>@{participant.username}</p>
            <p className='text-xs text-gray-500'>
              Joined {format(new Date(participant.joinedDate!), 'MMM, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Team Info */}
      {participant.teamName && (
        <div className='mb-3 flex items-center gap-2 rounded-lg bg-gray-800/50 p-3'>
          <Users className='h-4 w-4 text-[#a7f950]' />
          <div className='flex-1'>
            <p className='text-sm font-semibold text-white'>
              {participant.teamName}
            </p>
            <p className='text-xs text-gray-400'>
              {isTeamLeader
                ? `${teamMembers.length + 1} member${teamMembers.length + 1 !== 1 ? 's' : ''} • Team Leader`
                : 'Team Member'}
            </p>
          </div>
        </div>
      )}

      <div className='mb-4 flex gap-2'>
        <Button
          onClick={() => setIsFollowing(!isFollowing)}
          className={`flex-1 rounded-lg px-4 py-2 font-semibold transition-all ${
            isFollowing
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
        <Button className='rounded-lg bg-gray-700 px-4 py-2 text-white transition-all hover:bg-gray-600'>
          <MessageCircle className='h-4 w-4' />
        </Button>
      </div>

      {isTeamLeader && teamMembers.length > 0 && (
        <div className='mb-4 flex items-center gap-2'>
          <div className='flex'>
            {teamMembers.map(member => (
              <Link
                href={`/profile/${member.username}`}
                key={member.id}
                target='_blank'
              >
                <div
                  className='relative -ml-2 h-8 w-8 overflow-hidden rounded-full border-2 border-black transition-colors first:ml-0 hover:border-[#a7f950]'
                  title={member.name}
                >
                  <Image
                    src={member.avatar || '/placeholder.svg'}
                    alt={member.username}
                    width={32}
                    height={32}
                    className='h-full w-full object-cover'
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {participant.description && (
        <p className='mb-4 line-clamp-3 text-sm text-gray-300'>
          {participant.description}
        </p>
      )}

      {/* Categories */}
      {participant.categories && participant.categories.length > 0 && (
        <div className='mb-4'>
          <p className='mb-2 text-xs font-semibold text-gray-400'>Interests</p>
          <div className='flex flex-wrap gap-2'>
            {participant.categories.map((category, index) => (
              <Badge
                key={index}
                className='rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300'
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4 border-t border-gray-700 pt-4'>
        <div className='text-center'>
          <p className='text-lg font-bold text-white'>
            {participant.projects || 0}
          </p>
          <p className='text-xs text-gray-400'>Projects</p>
        </div>
        <div className='text-center'>
          <p className='text-lg font-bold text-white'>
            {participant.followers || 0}
          </p>
          <p className='text-xs text-gray-400'>Followers</p>
        </div>
        <div className='text-center'>
          <p className='text-lg font-bold text-white'>
            {participant.following || 0}
          </p>
          <p className='text-xs text-gray-400'>Following</p>
        </div>
      </div>
    </div>
  );
}
