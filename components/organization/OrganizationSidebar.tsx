'use client';

import { Trophy, HandCoins, Settings, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useWindowSize } from '@/hooks/use-window-size';

interface OrganizationSidebarProps {
  organizationId?: string;
}

export default function OrganizationSidebar({
  organizationId,
}: OrganizationSidebarProps) {
  const pathname = usePathname();
  const { height } = useWindowSize();

  const derivedOrgId =
    organizationId ||
    (() => {
      if (!pathname) return undefined;
      const parts = pathname.split('/');
      if (parts.length >= 3 && parts[1] === 'organizations') {
        return parts[2];
      }
      return undefined;
    })();

  const normalizedPath =
    pathname?.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;

  const menuItems = [
    {
      icon: Trophy,
      label: 'Hackathons',
      href: derivedOrgId ? `/organizations/${derivedOrgId}/hackathons` : '#',
    },
    {
      icon: HandCoins,
      label: 'Grants',
      href: derivedOrgId ? `/organizations/${derivedOrgId}/grants` : '#',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: derivedOrgId
        ? `/organizations/${derivedOrgId}/settings`
        : '/organizations/new',
    },
  ];

  const headerHeight = 64;
  const availableHeight = height ? height - headerHeight : 'calc(100vh - 4rem)';

  return (
    <aside
      className='fixed top-4 left-0 hidden w-[350px] border-r border-zinc-800 bg-black md:block'
      style={{ height: availableHeight, top: '90px' }}
    >
      <nav className='flex h-full flex-col gap-1 overflow-y-auto py-4'>
        <h3 className='mb-2 px-11 text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
          Menu
        </h3>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isValidHref = item.href !== '#';
          const isActive =
            isValidHref &&
            (normalizedPath === item.href ||
              normalizedPath?.startsWith(item.href + '/'));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-11 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-r-primary bg-active-bg text-primary border-r-4'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              )}
            >
              <Icon className='h-4 w-4' />
              {item.label}
            </Link>
          );
        })}
        <div className='mt-6 space-y-6 px-8'>
          <Link
            href={`/organizations/${organizationId}/hackathons/new`}
            className='flex items-center gap-3'
          >
            <div className='bg-primary grid h-6 w-6 place-content-center rounded-full'>
              <Plus className='h-5 w-5 text-black' />
            </div>
            <span>Host Hackathon</span>
          </Link>
          <Link
            href={`/organizations/${organizationId}/grants/new`}
            className='flex items-center gap-3'
          >
            <div className='flex items-center gap-3'>
              <div className='bg-primary grid h-6 w-6 place-content-center rounded-full'>
                <Plus className='h-5 w-5 text-black' />
              </div>
              <span>Create Grants</span>
            </div>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
