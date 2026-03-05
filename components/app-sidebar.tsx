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
  IconUserCircle,
  IconUsers,
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
import Link from 'next/link';
import { useNotificationStore } from '@/lib/stores/notification-store';

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
      badge: '3',
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
      title: 'Settings',
      url: '/me/settings',
      icon: IconSettings,
    },
    {
      title: 'Notifications',
      url: '/me/notifications',
      icon: IconBell,
      badge:
        counts?.unreadNotifications && counts.unreadNotifications > 0
          ? counts.unreadNotifications.toString()
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
              <Link href='/dashboard' className='flex items-center gap-3'>
                <div className='flex items-center justify-center rounded-lg'>
                  <Image
                    width={24}
                    height={24}
                    className='h-auto w-4/5 object-contain'
                    src='/logo.svg'
                    alt='Boundless Logo'
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className='gap-4 px-2 py-4'>
        <NavMain items={navigationData.main} />
        <NavMain items={navigationData.projects} label='Projects' />
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
