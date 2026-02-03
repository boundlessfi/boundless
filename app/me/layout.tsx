'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStatus } from '@/hooks/use-auth';
import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStatus();

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <LoadingSpinner size='xl' color='white' />
      </div>
    );
  }

  const { name = '', email = '', profile, image: userImage = '' } = user || {};

  const userData = {
    name: name || '',
    email,
    image: profile?.image || userImage,
  };

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar user={userData} variant='inset' />
      <SidebarInset className='bg-[#0e0c0c]'>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
