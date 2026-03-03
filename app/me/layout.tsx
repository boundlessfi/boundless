'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStatus } from '@/hooks/use-auth';
import React, { useMemo } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStatus();

  const { name = '', email = '', profile, image: userImage = '' } = user || {};

  const userData = {
    name: name || '',
    email,
    image:
      (profile as any)?.user?.image || (profile as any)?.image || userImage,
  };

  const hackathonsCount = useMemo(() => {
    if (!profile) return 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const joined = (profile as any)?.user?.joinedHackathons || [];
    return joined.length;
  }, [profile]);

  const submissionsCount = useMemo(() => {
    if (!profile) return 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fromUser =
      (profile as any)?.user?.hackathonSubmissionsAsParticipant || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fromProfile =
      (profile as any)?.hackathonSubmissionsAsParticipant || [];
    // Deduplicate by id before counting
    const merged = [...fromUser, ...fromProfile];
    const seen = new Set<string>();
    return merged.filter((s: any) => {
      const id = s?.id || s?._id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    }).length;
  }, [profile]);

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
}
