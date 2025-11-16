'use client';

import ProfileHeader from './ProfileHeader';
import OrganizationsList from './OrganizationsList';
import { GetMeResponse } from '@/lib/api/types';
import {
  UserProfile,
  UserStats as UserStatsType,
  Organization,
} from '@/types/profile';

interface ProfileOverviewProps {
  username: string;
  user: GetMeResponse;
}

export default function ProfileOverview({ user }: ProfileOverviewProps) {
  const profileData: UserProfile = {
    username: user.profile.username,
    displayName: `${user.profile.firstName} ${user.profile.lastName}`,
    bio: (user as unknown as { bio?: string }).bio || 'No bio available',
    avatarUrl:
      user.profile.avatar || '/landing/explore/project-placeholder-2.png',
    socialLinks:
      (user as unknown as { socialLinks?: Record<string, string> })
        .socialLinks || {},
  };

  const statsData: UserStatsType = {
    organizations: user.organizations?.length || 0,
    projects: user.projects?.length || 0,
    following: user.following?.length || 0,
    followers: user.followers?.length || 0,
  };

  const organizationsData: Organization[] =
    user.organizations?.map(org => ({
      name: org.name,
      avatarUrl: (org as unknown as { logo?: string }).logo || '/blog1.jpg',
    })) || [];

  return (
    <article className='flex w-full max-w-[500px] flex-col gap-11 text-white'>
      <ProfileHeader profile={profileData} stats={statsData} user={user} />

      {/* Organizations hidden on mobile - moved to tab */}
      <div className='hidden md:block'>
        <OrganizationsList organizations={organizationsData} />
      </div>
    </article>
  );
}
