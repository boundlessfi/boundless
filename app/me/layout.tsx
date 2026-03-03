'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStatus } from '@/hooks/use-auth';
import React, { useMemo } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface MeLayoutProps {
  children: React.ReactNode;
}

/** Item with optional id or _id for join/submission arrays from profile API. */
interface ProfileItemWithId {
  id?: string;
  _id?: string;
}

/** Profile shape used by layout: user + optional root-level submission list. */
interface MeLayoutProfile {
  user?: {
    image?: string;
    joinedHackathons?: ProfileItemWithId[];
    hackathonSubmissionsAsParticipant?: ProfileItemWithId[];
  };
  image?: string;
  hackathonSubmissionsAsParticipant?: ProfileItemWithId[];
}

const getId = (item: ProfileItemWithId): string | undefined =>
  item.id ?? item._id;

const MeLayout = ({ children }: MeLayoutProps): React.ReactElement => {
  const { user, isLoading } = useAuthStatus();

  const { name = '', email = '', profile, image: userImage = '' } = user || {};
  const typedProfile = profile as MeLayoutProfile | null | undefined;

  const userData = {
    name: name || '',
    email,
    image: typedProfile?.user?.image ?? typedProfile?.image ?? userImage ?? '',
  };

  const hackathonsCount = useMemo(() => {
    if (!typedProfile?.user?.joinedHackathons) return 0;
    return typedProfile.user.joinedHackathons.length;
  }, [typedProfile]);

  const submissionsCount = useMemo(() => {
    if (!typedProfile) return 0;
    const fromUser = typedProfile.user?.hackathonSubmissionsAsParticipant ?? [];
    const fromProfile = typedProfile.hackathonSubmissionsAsParticipant ?? [];
    const merged: ProfileItemWithId[] = [...fromUser, ...fromProfile];
    const seen = new Set<string>();
    return merged.filter(s => {
      const id = getId(s);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    }).length;
  }, [typedProfile]);

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <LoadingSpinner size='xl' color='white' />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar
        user={userData}
        counts={{
          participating: hackathonsCount,
          submissions: submissionsCount,
        }}
        variant='inset'
      />
      <SidebarInset className='bg-[#0e0c0c]'>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MeLayout;
