'use client';

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

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    image: string;
  };
}) {
  const { isMobile } = useSidebar();

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
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className='from-primary/20 to-primary/10 text-primary rounded-lg bg-gradient-to-br font-semibold'>
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
            className='w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-3 px-2 py-2 text-left'>
                <Avatar className='border-border h-10 w-10 rounded-lg border-2'>
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className='from-primary/20 to-primary/10 text-primary rounded-lg bg-gradient-to-br font-semibold'>
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
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className='cursor-pointer gap-2'>
                <IconUserCircle className='h-4 w-4' />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer gap-2'>
                <IconCreditCard className='h-4 w-4' />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer gap-2'>
                <IconBell className='h-4 w-4' />
                <span>Notifications</span>
                <Badge className='ml-auto h-5 min-w-5 rounded-full'>3</Badge>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive focus:text-destructive cursor-pointer gap-2'>
              <IconLogout className='h-4 w-4' />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
