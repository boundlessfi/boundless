'use client';

import * as React from 'react';
import {
  IconBell,
  IconDashboard,
  IconSettings,
  IconShieldCheck,
  IconUserCircle,
  IconUsers,
  IconRocket,
} from '@tabler/icons-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { Logo } from './landing-page/navbar';
import { useNotifications } from '@/hooks/useNotifications';
import { authClient } from '@/lib/auth-client';

const getNavigationData = (counts?: {
  participating?: number;
  unreadNotifications?: number;
  submissions?: number;
}) => ({
  main: [
    {
      title: 'Overview',
      url: '/me',
      icon: IconDashboard,
    },
  ],
  crowdfunding: [
    {
      title: 'My Campaigns',
      url: '/me/crowdfunding',
      icon: IconRocket,
    },
  ],
  hackathons: [
    {
      title: 'Participating',
      url: '/me/participating',
      icon: IconShieldCheck,
      badge:
        (counts?.participating ?? 0) > 0
          ? String(counts?.participating)
          : undefined,
    },
    {
      title: 'Submissions',
      url: '/me/hackathons/submissions',
      icon: IconUsers,
      badge:
        (counts?.submissions ?? 0) > 0
          ? String(counts?.submissions)
          : undefined,
    },
  ],
  account: [
    {
      title: 'Profile',
      url: '/me/profile',
      icon: IconUserCircle,
    },
    {
      title: 'Settings',
      url: '/me/settings',
      icon: IconSettings,
    },
    {
      title: 'Notifications',
      url: '/me/notifications',
      icon: IconBell,
      badge:
        (counts?.unreadNotifications ?? 0) > 0
          ? String(counts?.unreadNotifications)
          : undefined,
    },
  ],
});

interface UserData {
  name: string;
  email: string;
  image: string | null;
}

export function AppSidebar({
  user,
  counts,
  ...props
}: {
  user: UserData;
  counts?: { participating?: number; submissions?: number };
} & React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  // Initialize notifications hook to ensure it fetches globally and syncs with store
  useNotifications({ enabled: !!userId });

  const unreadNotifications = useNotificationStore(state => state.unreadCount);

  const navigationData = React.useMemo(
    () => getNavigationData({ ...counts, unreadNotifications }),
    [counts, unreadNotifications]
  );

  return (
    <Sidebar collapsible='icon' {...props}>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute right-0 bottom-0 left-0 h-[300px] opacity-50'>
          <Image
            src='/wave.svg'
            alt='Background Pattern'
            width={300}
            height={300}
            className='h-full w-full object-cover'
          />
        </div>
      </div>

      {/* Header with Logo */}
      <SidebarHeader className='border-sidebar-border/50 border-b'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size='lg'
              className='group hover:bg-sidebar-accent/0 transition-all duration-200'
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className='gap-4 px-2 py-4'>
        <NavMain items={navigationData.main} />
        <NavMain items={navigationData.crowdfunding} label='Crowdfunding' />
        <NavMain items={navigationData.hackathons} label='Hackathons' />
        <NavMain items={navigationData.account} label='Account' />
      </SidebarContent>
      {/* Footer with User */}
      <SidebarFooter className='border-sidebar-border/50 border-t p-2 backdrop-blur-sm'>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
