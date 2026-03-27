'use client';

import React from 'react';
import {
  IconBell,
  IconLogout,
  IconSettings,
  IconChevronRight,
} from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuthActions } from '@/hooks/use-auth';
import { useNotificationStore } from '@/lib/stores/notification-store';

export interface NavUserProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const NavUser = ({ user }: NavUserProps): React.ReactElement => {
  const { isMobile } = useSidebar();
  const { logout } = useAuthActions();
  const { unreadCount: unreadNotifications, clearUnreadCount } =
    useNotificationStore();

  const handleLogout = () => {
    logout();
    clearUnreadCount();
  };

  const initials = getInitials(user.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='h-12 transition-colors hover:bg-white/4 data-[state=open]:bg-white/6'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className='bg-primary/10 text-primary rounded-lg text-xs font-semibold'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left leading-tight'>
                <span className='truncate text-sm font-medium text-white'>
                  {user.name}
                </span>
                <span className='truncate text-[11px] text-white/30'>
                  {user.email}
                </span>
              </div>
              <IconChevronRight className='ml-auto h-4 w-4 text-white/20' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-56 rounded-xl border-white/8 bg-zinc-900/95 text-white shadow-2xl backdrop-blur-xl'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={8}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-3 px-3 py-3'>
                <Avatar className='h-9 w-9 rounded-lg'>
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback className='bg-primary/10 text-primary rounded-lg text-xs font-semibold'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left leading-tight'>
                  <span className='truncate text-sm font-medium text-white'>
                    {user.name}
                  </span>
                  <span className='truncate text-xs text-white/35'>
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className='bg-white/6' />
            <DropdownMenuGroup className='p-1'>
              <DropdownMenuItem asChild>
                <Link
                  href='/me/settings'
                  className='flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'
                >
                  <IconSettings size={16} stroke={1.5} />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/me/notifications'
                  className='flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'
                >
                  <IconBell size={16} stroke={1.5} />
                  Notifications
                  {unreadNotifications > 0 && (
                    <span className='bg-primary/15 text-primary ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] leading-none font-semibold'>
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className='bg-white/6' />
            <div className='p-1'>
              <DropdownMenuItem
                className='flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-red-400/80 hover:bg-red-500/8 hover:text-red-400 focus:bg-red-500/8 focus:text-red-400'
                onClick={handleLogout}
              >
                <IconLogout size={16} stroke={1.5} />
                Log out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
