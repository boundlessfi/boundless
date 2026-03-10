'use client';

import React from 'react';
import {
  IconBell,
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
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
import { Badge } from './ui/badge';
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

export const NavUser = ({ user }: NavUserProps): React.ReactElement => {
  const { isMobile } = useSidebar();
  const { logout } = useAuthActions();
  const unreadNotifications = useNotificationStore(state => state.unreadCount);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors'
            >
              <Avatar className='border-sidebar-border h-9 w-9 rounded-lg border-2'>
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className='from-primary/20 to-primary/10 text-primary rounded-lg bg-linear-to-br font-semibold'>
                  {user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left leading-tight'>
                <span className='truncate text-sm font-semibold'>
                  {user.name}
                </span>
                <span className='text-muted-foreground truncate text-xs'>
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className='ml-auto size-4 opacity-50' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='bg-background-main-bg/98 w-56 rounded-lg border-white/10 text-white backdrop-blur-xl'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-3 px-2 py-2 text-left'>
                <Avatar className='border-border h-10 w-10 rounded-lg border-2'>
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback className='from-primary/20 to-primary/10 text-primary rounded-lg bg-linear-to-br font-semibold'>
                    {user.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left leading-tight'>
                  <span className='truncate text-sm font-semibold text-white'>
                    {user.name}
                  </span>
                  <span className='truncate text-xs text-white/60'>
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href='/me/settings'
                  className='flex cursor-pointer items-center gap-2 text-white/80 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'
                >
                  <IconUserCircle className='h-4 w-4' />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/coming-soon'
                  className='flex cursor-pointer items-center gap-2 text-white/80 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'
                >
                  <IconCreditCard className='h-4 w-4' />
                  <span>Billing</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/me/notifications'
                  className='flex cursor-pointer items-center gap-2 text-white/80 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'
                >
                  <IconBell className='h-4 w-4' />
                  <span>Notifications</span>
                  {unreadNotifications > 0 && (
                    <Badge className='ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a7f950] text-xs font-bold text-black'>
                      {unreadNotifications}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className='bg-white/10' />
            <DropdownMenuItem
              className='text-destructive focus:text-destructive cursor-pointer gap-2 hover:bg-red-500/10'
              onClick={() => logout()}
            >
              <IconLogout className='h-4 w-4' />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
