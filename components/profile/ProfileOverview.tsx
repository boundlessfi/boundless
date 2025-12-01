'use client';

import ProfileHeader from './ProfileHeader';
import OrganizationsList from './OrganizationsList';
import { GetMeResponse } from '@/lib/api/types';
import {
  UserProfile,
  UserStats as UserStatsType,
  Organization,
} from '@/types/profile';
import { usePathname } from 'next/navigation';

interface ProfileOverviewProps {
  username: string;
  user: GetMeResponse;
  isAuthenticated?: boolean;
  isOwnProfile?: boolean;
}

export default function ProfileOverview({
  user,
  isAuthenticated,
  isOwnProfile,
}: ProfileOverviewProps) {
  const profileData: UserProfile = {
    username: user.profile.username,
    displayName: `${user.profile.firstName} ${user.profile.lastName}`,
    bio: (user as unknown as { bio?: string }).bio || 'No bio available',
    avatarUrl: user.profile.avatar || '',
    socialLinks:
      (user as unknown as { socialLinks?: Record<string, string> })
        .socialLinks || {},
  };
  const pathname = usePathname();
  const isProfileRoute = pathname.startsWith('/profile');
  const statsData: UserStatsType = {
    organizations: user.organizations?.length || 0,
    projects: user.projects?.length || 0,
    following: user.following?.length || 0,
    followers: user.followers?.length || 0,
  };

  const organizationsData: Organization[] =
    user.organizations?.map(org => {
      const avatarUrl = isProfileRoute
        ? (org as { avatar?: string }).avatar
        : (org as { logo?: string }).logo;

      return {
        name: org.name,
        avatarUrl: avatarUrl || '/blog1.jpg',
      };
    }) || [];

  return (
    <article className='flex w-full max-w-[500px] flex-col gap-11 text-white'>
      <ProfileHeader
        profile={profileData}
        stats={statsData}
        user={user}
        isAuthenticated={isAuthenticated}
        isOwnProfile={isOwnProfile}
      />

      {isAuthenticated && isOwnProfile && (
        <div className='hidden md:block'>
          <OrganizationsList
            organizations={organizationsData}
            isOwnProfile={isOwnProfile}
          />
        </div>
      )}
    </article>
  );
}
