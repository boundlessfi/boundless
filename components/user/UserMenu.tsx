'use client';

import { ChevronDown, User, Building2, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useContext } from 'react';
import { useAuthActions, useAuthStatus } from '@/hooks/use-auth';
import { OrganizationContext } from '@/lib/providers/OrganizationProvider';

interface UserMenuProps {
  /**
   * Whether to show the organizations count badge
   * @default true
   */
  showOrganizationsCount?: boolean;
  /**
   * Whether to hide the Organizations menu item
   * @default false
   */
  hideOrganizationsItem?: boolean;
  /**
   * Custom className for the trigger button
   */
  triggerClassName?: string;
  /**
   * Custom className for the dropdown content
   */
  contentClassName?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  showOrganizationsCount = true,
  hideOrganizationsItem = false,
  triggerClassName,
  contentClassName,
}) => {
  const { isLoading, user } = useAuthStatus();
  const { logout } = useAuthActions();

  const orgContext = useContext(OrganizationContext);
  const organizations = orgContext?.organizations || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={
            triggerClassName ||
            'flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-1 transition-all hover:border-zinc-700 hover:bg-zinc-900/50'
          }
        >
          <Avatar className='h-7 w-7 border border-zinc-800'>
            <AvatarImage
              src={user?.image || user?.profile?.avatar || ''}
              alt={user?.name || user?.profile?.firstName || ''}
            />
            <AvatarFallback className='from-primary/20 to-primary/5 text-primary bg-gradient-to-br text-xs font-semibold'>
              {(user?.name || user?.profile?.firstName || 'U')
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className='mr-1 hidden h-3.5 w-3.5 text-zinc-500 md:block' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={
          contentClassName ||
          'w-64 rounded-xl border border-zinc-800/50 bg-zinc-950/95 p-0 backdrop-blur-xl'
        }
        align='end'
        forceMount
      >
        <div className='border-b border-zinc-800/50 p-4'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-10 w-10 border border-zinc-800'>
              <AvatarImage
                src={user?.image || user?.profile?.avatar || ''}
                alt={user?.name || user?.profile?.firstName || ''}
              />
              <AvatarFallback className='from-primary/20 to-primary/5 text-primary bg-gradient-to-br font-semibold'>
                {(user?.name || user?.profile?.firstName || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-semibold text-white'>
                {user?.name || user?.profile?.firstName || 'User'}
              </p>
              <p className='truncate text-xs text-zinc-500'>{user?.email}</p>
            </div>
          </div>
          {showOrganizationsCount && organizations.length > 0 && (
            <div className='mt-3 flex items-center gap-2 rounded-lg bg-zinc-900/50 px-3 py-2'>
              <Building2 className='h-3.5 w-3.5 text-zinc-500' />
              <span className='text-xs text-zinc-400'>
                {organizations.length} organization
                {organizations.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className='p-2'>
          <DropdownMenuItem
            className='rounded-lg px-3 py-2 text-sm text-white transition-colors hover:bg-zinc-900/50 focus:bg-zinc-900/50'
            asChild
          >
            <Link
              href='/me'
              className='flex items-center gap-3 hover:!text-white'
            >
              <User className='h-4 w-4 text-zinc-400' />
              Profile
            </Link>
          </DropdownMenuItem>

          {!hideOrganizationsItem && (
            <DropdownMenuItem
              className='rounded-lg px-3 py-2 text-sm text-white transition-colors hover:bg-zinc-900/50 hover:text-white focus:bg-zinc-900/50'
              asChild
            >
              <Link
                href='/organizations'
                className='flex items-center gap-3 hover:!text-white'
              >
                <Building2 className='h-4 w-4 text-zinc-400' />
                Organizations
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className='rounded-lg px-3 py-2 text-sm text-white transition-colors hover:bg-zinc-900/50 hover:text-white focus:bg-zinc-900/50'
            asChild
          >
            <Link
              href='/me/settings'
              className='flex items-center gap-3 hover:!text-white'
            >
              <Settings className='h-4 w-4 text-zinc-400' />
              Settings
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className='bg-zinc-800/50' />

        {/* Logout */}
        <div className='p-2'>
          <DropdownMenuItem
            onClick={() => !isLoading && logout()}
            disabled={isLoading}
            className='rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:!text-red-400 focus:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <LogOut className='mr-3 h-4 w-4' />
            {isLoading ? 'Signing out...' : 'Sign out'}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
