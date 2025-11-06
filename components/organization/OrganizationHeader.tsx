'use client';
import { ChevronDown, User, Building2, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { useAuthActions, useAuthStatus } from '@/hooks/use-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OrganizationSelector from './cards/OrganizationSelector';
import { useOrganization } from '@/lib/providers/OrganizationProvider';

export default function OrganizationHeader() {
  const { isLoading, user } = useAuthStatus();
  const { logout } = useAuthActions();
  const pathname = usePathname();
  const isOnOrganizationsPage = pathname === '/dashboard/organizations';
  const { organizations, activeOrg, setActiveOrg } = useOrganization();
  const showOrgSelector =
    pathname !== '/organizations' && pathname.startsWith('/organizations');

  return (
    <header className='sticky top-0 z-50 flex w-full flex-wrap items-center justify-between overflow-x-hidden border-b border-b-zinc-800 bg-black px-4 py-3 md:flex-nowrap md:px-10'>
      <div className='flex min-w-0 flex-1 items-center gap-4 overflow-x-auto md:overflow-visible'>
        <div className='flex items-center gap-2'>
          <Image
            src='/footer/logo.svg'
            width={50}
            height={50}
            alt='Boundless Logo'
          />
        </div>

        <Link href='/organizations'>
          <button className='hover:text-primary/80 flex items-center gap-2 text-gray-600 transition-colors'>
            <Building2 className='h-5 w-5' />
            <span className='text-sm font-medium'>Home</span>
          </button>
        </Link>

        {showOrgSelector && organizations && organizations.length > 0 && (
          <OrganizationSelector
            organizations={organizations}
            currentOrganization={
              activeOrg
                ? {
                    _id: activeOrg._id,
                    name: activeOrg.name,
                    logo: activeOrg.logo,
                    tagline: activeOrg.tagline,
                    isProfileComplete: activeOrg.isProfileComplete,
                    role: 'owner',
                    memberCount: activeOrg.members.length,
                    hackathonCount: activeOrg.hackathons.length,
                    grantCount: activeOrg.grants.length,
                    createdAt: activeOrg.createdAt,
                  }
                : undefined
            }
            onOrganizationChange={orgId => setActiveOrg(orgId)}
          />
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className='flex items-center space-x-2 rounded-full p-1 transition-colors hover:bg-white/10'>
            <Avatar className='h-12 w-12'>
              <AvatarImage
                src={user?.image || user?.profile?.avatar || ''}
                alt={user?.name || user?.profile?.firstName || ''}
              />
              <AvatarFallback>
                <Image
                  src={
                    user?.image ||
                    user?.profile?.avatar ||
                    'https://i.pravatar.cc/150?img=10'
                  }
                  alt='logo'
                  width={116}
                  height={22}
                  className='h-full w-full object-cover'
                />
              </AvatarFallback>
            </Avatar>
            <ChevronDown className='h-5 w-5 text-white' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='bg-background w-[350px] rounded-[8px] border border-[#2B2B2B] p-0 !text-white shadow-[0_4px_4px_0_rgba(26,26,26,0.25)]'
          align='end'
          forceMount
        >
          <DropdownMenuLabel className='p-6 !pb-3 font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-[160%]'>
                Signed in as{' '}
                <span className='leading-[145%] font-semibold'>
                  {user?.name || user?.profile?.firstName || 'User'}
                </span>
              </p>
              <p className='text-sm leading-[145%] text-[#B5B5B5]'>
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className='h-[0.5px] bg-[#2B2B2B]' />
          <DropdownMenuItem
            className='group hover:!text-primary cursor-pointer px-6 py-3.5 pt-3 hover:!bg-transparent'
            asChild
          >
            <Link
              href='/me'
              className='group-hover:!text-primary flex items-center'
            >
              <User className='teext-white group-hover:!text-primary mr-2 h-4 w-4 text-white' />
              Profile
            </Link>
          </DropdownMenuItem>
          {!isOnOrganizationsPage && (
            <DropdownMenuItem
              className='group hover:!text-primary cursor-pointer px-6 py-3.5 hover:!bg-transparent'
              asChild
            >
              <Link
                href='/organizations'
                className='group-hover:text-primary flex items-center'
              >
                <Building2 className='group-hover:!text-primary mr-2 h-4 w-4 text-white' />
                Organizations
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className='group hover:!text-primary cursor-pointer px-6 py-3.5 pb-6 hover:!bg-transparent'
            asChild
          >
            <Link href='/settings' className='flex items-center'>
              <Settings className='group-hover:!text-primary mr-2 h-4 w-4 text-white' />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className='h-[0.5px] bg-[#2B2B2B]' />
          <DropdownMenuItem
            onClick={() => !isLoading && logout()}
            disabled={isLoading}
            className='group flex cursor-pointer items-center px-6 pt-3 pb-6 text-red-600 hover:!bg-transparent hover:!text-red-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <LogOut className='mr-2 h-4 w-4 text-red-600 group-hover:!text-red-700' />
            {isLoading ? 'Signing Out...' : 'Sign Out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
