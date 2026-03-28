'use client';

import * as React from 'react';
import {
  IconBell,
  IconChartBar,
  IconCurrencyDollar,
  IconDashboard,
  IconFileText,
  IconFolder,
  IconMessageCircle,
  IconSettings,
  IconShieldCheck,
  IconTrophy,
  IconUserCircle,
  IconUsers,
  IconWallet,
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
import { useNotificationStore } from '@/lib/stores/notification-store';
import { Logo } from './landing-page/navbar';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthContext } from '@/components/providers/AuthProvider';

const getNavigationData = (counts?: {
  participating?: number;
  unreadNotifications?: number;
  submissions?: number;
  projects?: number;
}) => ({
  main: [
    {
      title: 'Overview',
      url: '/me',
      icon: IconDashboard,
    },
    {
      title: 'Analytics',
      url: '/me/analytics',
      icon: IconChartBar,
    },
    {
      title: 'Earnings',
      url: '/me/earnings',
      icon: IconCurrencyDollar,
    },
  ],
  projects: [
    {
      title: 'My Projects',
      url: '/me/projects',
      icon: IconFolder,
      badge: (counts?.projects ?? 0) > 0 ? String(counts?.projects) : undefined,
    },
    {
      title: 'Create Project',
      url: '/me/projects/create',
      icon: IconFileText,
    },
  ],
  hackathons: [
    {
      title: 'Participating',
      url: '/me/participating',
      icon: IconTrophy,
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
  crowdfunding: [
    {
      title: 'Campaigns',
      url: '/me/crowdfunding',
      icon: IconShieldCheck,
    },
  ],
  account: [
    {
      title: 'Profile',
      url: '/me/profile',
      icon: IconUserCircle,
    },
    {
      title: 'Messages',
      url: '/me/messages',
      icon: IconMessageCircle,
    },
    {
      title: 'Wallet',
      url: '/me/wallet',
      icon: IconWallet,
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
  counts?: { participating?: number; submissions?: number; projects?: number };
} & React.ComponentProps<typeof Sidebar>) {
  const { session: authSession } = useAuthContext();
  const userId = authSession.data?.user?.id;

  useNotifications({ enabled: !!userId });

  const unreadNotifications = useNotificationStore(state => state.unreadCount);

  const navigationData = React.useMemo(
    () => getNavigationData({ ...counts, unreadNotifications }),
    [counts, unreadNotifications]
  );

  return (
    <Sidebar collapsible='icon' {...props}>
      {/* Header */}
      <SidebarHeader className='border-b border-white/6 px-3 py-3'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size='lg'
              className='hover:bg-transparent'
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className='gap-0 px-2 py-3'>
        <NavMain items={navigationData.main} />
        <NavMain items={navigationData.projects} label='Projects' />
        <NavMain items={navigationData.crowdfunding} label='Crowdfunding' />
        <NavMain items={navigationData.hackathons} label='Hackathons' />
        <NavMain items={navigationData.account} label='Account' />
      </SidebarContent>

      {/* User */}
      <SidebarFooter className='border-t border-white/6 p-2'>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
