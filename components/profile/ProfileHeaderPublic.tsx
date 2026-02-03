'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicUserProfile } from '@/features/projects/types';
import { BoundlessButton } from '@/components/buttons';
import { BellPlus, Settings } from 'lucide-react';
import UserStats from './UserStats';
import FollowersModal from './FollowersModal';
import { toast } from 'sonner';
import { User } from '@/types/user';
import { TeamMember } from '@/components/ui/TeamList';
import { UserProfile, UserStats as UserStatsType } from '@/types/profile';

interface ProfileHeaderProps {
  profile: UserProfile;
  stats: UserStatsType;
  user: PublicUserProfile;
  isAuthenticated?: boolean;
  isOwnProfile?: boolean;
}

export default function ProfileHeaderPublic({
  profile,
  stats,
  user,
  isAuthenticated,
  isOwnProfile,
}: ProfileHeaderProps) {
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile/${profile.username}`;
  // Convert API user data to TeamMember format
  const convertToTeamMembers = (users: User[]): TeamMember[] => {
    return users.map(user => {
      return {
        id: user.id,
        name: user.name,
        role: 'MEMBER' as const,
        avatar: user.image,
        username: user.username,
        joinedAt: user.createdAt,
      };
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Share ${profile.username}'s profile`,
          url: profileUrl,
        });
      } catch {
        toast.error('Failed to share profile URL');
      }
    } else {
      try {
        await navigator.clipboard.writeText(profileUrl);
        toast.success('Profile URL copied to clipboard!');
      } catch {
        const errorMessage = 'Failed to copy URL';
        toast.error(errorMessage);
      }
    }
  };
  return (
    <main className='flex flex-col gap-6'>
      <header className='flex items-end gap-4'>
        <div className='relative aspect-square size-[150px] overflow-hidden rounded-full'>
          <Image
            src={user.image || '/avatar.png'}
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
        {Object.entries(profile?.socialLinks || {}).map(
          ([name, href], index) => (
            <div key={name} className='flex items-center'>
              <Link
                href={href as string}
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
                  className='h-4 w-4 fill-white'
                />
              </Link>
              {index < Object.keys(profile.socialLinks || {}).length - 1 && (
                <div
                  className='ml-4 h-6 w-[0.5px] bg-[#2B2B2B]'
                  aria-hidden='true'
                />
              )}
            </div>
          )
        )}
      </div>
      <UserStats
        isAuthenticated={isAuthenticated}
        isOwnProfile={isOwnProfile}
        stats={stats}
      />
      <div className='flex gap-4'>
        {/* Show Edit Profile only for own profile AND authenticated */}
        {isOwnProfile && isAuthenticated && (
          <Link href='/me/settings'>
            <BoundlessButton
              variant='outline'
              icon={<Settings className='h-4 w-4' />}
            >
              Edit Profile
            </BoundlessButton>
          </Link>
        )}

        {/* Show Follow button for others' profiles AND authenticated */}
        {!isOwnProfile && isAuthenticated && (
          <BoundlessButton icon={<BellPlus />} iconPosition='right' disabled>
            Follow
          </BoundlessButton>
        )}

        {/* Show sign in prompt for non-authenticated users */}
        {!isAuthenticated && (
          <Link href='/auth?mode=signin'>
            <BoundlessButton variant='outline'>
              Sign in to Follow
            </BoundlessButton>
          </Link>
        )}

        {/* Share button - available to everyone */}
        <BoundlessButton variant='outline' onClick={handleShare}>
          Share
          <Image src='/share.svg' alt='Share icon' width={16} height={16} />
        </BoundlessButton>
      </div>

      {/* Modals */}
      <FollowersModal
        open={followersModalOpen}
        setOpen={setFollowersModalOpen}
        type='followers'
        users={convertToTeamMembers([])}
      />

      <FollowersModal
        open={followingModalOpen}
        setOpen={setFollowingModalOpen}
        type='following'
        users={convertToTeamMembers([])}
        // projects={user.metadata?.projects || []}
      />
    </main>
  );
}
