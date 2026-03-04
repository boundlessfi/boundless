'use client';

import ProfileHeader from './ProfileHeader';
import OrganizationsList from './OrganizationsList';
import {
  UserProfile,
  UserStats as UserStatsType,
  Organization,
} from '@/types/profile';
import { User } from '@/types/user';

interface ProfileOverviewProps {
  username: string;
  user: User;
  isAuthenticated?: boolean;
  isOwnProfile?: boolean;
}

export default function ProfileOverview({
  user,
  isAuthenticated,
  isOwnProfile,
}: ProfileOverviewProps) {
  const nameParts = user.name?.split(' ') || [];
  const profileData: UserProfile = {
    username: user.username,
    displayName: `${nameParts[0] || ''} ${nameParts.slice(1).join(' ')}`.trim(),
    bio: user.profile?.bio || 'No bio available',
    avatarUrl: user.image || '/',
    socialLinks: user.profile?.socialLinks || {},
  };

  const statsData: UserStatsType = {
    organizations: user.members?.length || 0,
    projects: user.projects?.length || 0,
    following: user.stats?.following || 0,
    followers: user.stats?.followers || 0,
  };

  const organizationsData: Organization[] =
    user.members?.map(org => {
      return {
        name: org.organization?.name || 'Unknown Organization',
        avatarUrl: org.organization?.logo || '/blog1.jpg',
        id: org.organizationId,
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
