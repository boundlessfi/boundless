'use client';

import OrganizationsList from './OrganizationsList';
import { PublicUserProfile } from '@/features/projects/types';
import ProfileHeaderPublic from './ProfileHeaderPublic';

interface ProfileOverviewProps {
  username: string;
  user: PublicUserProfile;
  isAuthenticated?: boolean;
  isOwnProfile?: boolean;
}

export default function ProfileOverviewPublic({
  user,
  isAuthenticated,
  isOwnProfile,
}: ProfileOverviewProps) {
  // Create profile data structure for existing components
  const profileData = {
    username: user.username,
    displayName: user.name,
    bio: 'Member of the Boundless community',
    avatarUrl: user.image || '/',
    socialLinks: {},
  };

  const statsData = {
    organizations: user.organizations?.length || 0,
    projects: user.projects?.length || 0,
    following: user.followStats?.following || 0,
    followers: user.followStats?.followers || 0,
  };

  const organizationsData =
    user.organizations?.map(org => ({
      name: org.name || 'Organization',
      avatarUrl: org.logo || '/blog1.jpg',
    })) || [];

  return (
    <article className='flex w-full max-w-[500px] flex-col gap-11 text-white'>
      <ProfileHeaderPublic
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
