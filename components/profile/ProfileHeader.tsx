'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile, UserStats as UserStatsType } from '@/types/profile';
import { GetMeResponse } from '@/lib/api/types';
import { TeamMember } from '@/components/ui/TeamList';
import { BoundlessButton } from '@/components/buttons';
import { BellPlus } from 'lucide-react';
import { ProfileSocialLinks } from '@/lib/config';
import UserStats from './UserStats';
import FollowersModal from './FollowersModal';

interface ProfileHeaderProps {
  profile: UserProfile;
  stats: UserStatsType;
  user: GetMeResponse;
}

export default function ProfileHeader({
  profile,
  stats,
  user,
}: ProfileHeaderProps) {
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);

  // Convert API user data to TeamMember format
  const convertToTeamMembers = (
    users: GetMeResponse['followers']
  ): TeamMember[] => {
    return users.map(user => ({
      id: user._id,
      name:
        `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() ||
        'Unknown User',
      role: 'MEMBER' as const,
      avatar: user.profile?.avatar || '/avatar.png',
      username: user.profile?.username || user._id,
      joinedAt:
        typeof user.createdAt === 'string'
          ? user.createdAt
          : new Date().toISOString(),
    }));
  };

  const handleFollowersClick = () => {
    setFollowersModalOpen(true);
  };

  const handleFollowingClick = () => {
    setFollowingModalOpen(true);
  };

  return (
    <main className='flex flex-col gap-6'>
      <header className='flex items-end gap-4'>
        <div className='relative aspect-square size-[150px] overflow-hidden rounded-full'>
          <Image
            src={profile.avatarUrl}
            alt={`${profile.displayName} avatar`}
            layout='fill'
            objectFit='cover'
          />
        </div>
        <div className='flex flex-col gap-3 py-3'>
          <h3 className='text-2xl font-medium'>{profile.displayName}</h3>
          <p className='text-base font-normal'>@{profile.username}</p>
        </div>
      </header>
      <p className='text-base font-normal'>{profile.bio}</p>
      <div className='flex items-center space-x-4'>
        {Object.entries(ProfileSocialLinks).map(([name, href], index) => (
          <div key={name} className='flex items-center'>
            <Link
              href={href}
              className='rounded transition-opacity hover:opacity-80 focus:ring-2 focus:ring-white/50 focus:outline-none'
              target='_blank'
              rel='noopener noreferrer'
              aria-label={`Follow us on ${name}`}
            >
              <Image
                src={`/footer/${name}.svg`}
                alt={`${name} icon`}
                width={24}
                height={24}
                className='h-6 w-6 fill-white'
              />
            </Link>
            {index < Object.keys(ProfileSocialLinks).length - 1 && (
              <div
                className='ml-4 h-6 w-[0.5px] bg-[#2B2B2B]'
                aria-hidden='true'
              />
            )}
          </div>
        ))}
      </div>
      <UserStats
        stats={stats}
        onFollowersClick={handleFollowersClick}
        onFollowingClick={handleFollowingClick}
      />
      <div className='flex gap-4'>
        <BoundlessButton icon={<BellPlus />} iconPosition='right'>
          Follow
        </BoundlessButton>
        <BoundlessButton variant='outline'>
          Share
          <Image src='/share.svg' alt='Share icon' width={16} height={16} />
        </BoundlessButton>
      </div>

      {/* Modals */}
      <FollowersModal
        open={followersModalOpen}
        setOpen={setFollowersModalOpen}
        type='followers'
        users={convertToTeamMembers(user.followers || [])}
      />

      <FollowersModal
        open={followingModalOpen}
        setOpen={setFollowingModalOpen}
        type='following'
        users={convertToTeamMembers(user.following || [])}
        projects={user.projects || []}
      />
    </main>
  );
}
