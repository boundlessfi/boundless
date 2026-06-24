'use client';

import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Trophy,
  XCircle,
  Archive,
  ShieldAlert,
  Settings,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useWindowSize } from '@/hooks/use-window-size';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  description: string;
  disabled?: boolean;
}

interface BountySidebarContentProps {
  menuItems: SidebarItem[];
  normalizedPath: string | null;
  bountyTitle?: string;
}

function BountySidebarContent({
  menuItems,
  normalizedPath,
  bountyTitle,
}: BountySidebarContentProps) {
  return (
    <nav className='flex h-full flex-col overflow-y-auto px-4 py-6'>
      {/* Bounty Title */}
      <div className='mb-8'>
        <div className='rounded-xl bg-zinc-900/50 px-3 py-3'>
          <p className='text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
            Bounty
          </p>
          <p className='mt-1 truncate text-sm font-medium text-white'>
            {bountyTitle || 'Bounty Management'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className='mb-8 space-y-1'>
        <h3 className='mb-4 px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
          Navigation
        </h3>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive =
            item.label === 'Overview'
              ? normalizedPath === item.href
              : normalizedPath === item.href ||
                normalizedPath?.startsWith(item.href + '/');

          if (item.disabled) {
            return (
              <div
                key={item.label}
                className='group relative flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 opacity-40'
              >
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900/50'>
                  <Icon className='h-4 w-4 text-zinc-500' />
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium text-zinc-500'>
                    {item.label}
                  </span>
                  <span className='text-xs text-zinc-600'>
                    {item.description}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'from-primary/10 text-primary shadow-primary/5 bg-linear-to-r to-transparent shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
              )}
            >
              {isActive && (
                <div className='bg-primary absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full' />
              )}
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                  isActive
                    ? 'bg-primary/20 shadow-primary/20 shadow-lg'
                    : 'bg-zinc-900/50 group-hover:bg-zinc-800'
                )}
              >
                <Icon className='h-4 w-4' />
              </div>
              <div className='flex flex-col'>
                <span className='text-sm font-medium'>{item.label}</span>
                <span
                  className={cn(
                    'text-xs transition-colors',
                    isActive
                      ? 'text-primary/60'
                      : 'text-zinc-600 group-hover:text-zinc-500'
                  )}
                >
                  {item.description}
                </span>
              </div>
              {!isActive && (
                <div className='absolute inset-0 rounded-xl border border-transparent transition-colors group-hover:border-zinc-700/50' />
              )}
            </Link>
          );
        })}
      </div>

      <div className='pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-linear-to-t from-black via-black/50 to-transparent' />
    </nav>
  );
}

interface BountySidebarProps {
  organizationId?: string;
  bountyTitle?: string;
}

export default function BountySidebar({
  organizationId,
  bountyTitle,
}: BountySidebarProps) {
  const pathname = usePathname();
  const { height } = useWindowSize();

  const derivedOrgId =
    organizationId ||
    (() => {
      if (!pathname) return undefined;
      const parts = pathname.split('/');
      if (parts.length >= 3 && parts[1] === 'organizations') return parts[2];
      return undefined;
    })();

  const bountyId = useMemo(() => {
    if (!pathname) return undefined;
    const parts = pathname.split('/');
    if (
      parts.length >= 5 &&
      parts[1] === 'organizations' &&
      parts[3] === 'bounties'
    ) {
      return parts[4];
    }
    return undefined;
  }, [pathname]);

  const basePath = useMemo(() => {
    if (!derivedOrgId || !bountyId) return '#';
    return `/organizations/${derivedOrgId}/bounties/${bountyId}`;
  }, [derivedOrgId, bountyId]);

  const normalizedPath =
    pathname?.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;

  const menuItems = useMemo<SidebarItem[]>(
    () => [
      {
        icon: LayoutDashboard,
        label: 'Overview',
        href: basePath,
        description: 'Bounty dashboard',
      },
      {
        icon: ClipboardList,
        label: 'Applications',
        href: basePath !== '#' ? `${basePath}/applications` : '#',
        description: 'Review & shortlist',
        disabled: basePath === '#',
      },
      {
        icon: FileText,
        label: 'Submissions',
        href: basePath !== '#' ? `${basePath}/submissions` : '#',
        description: 'View submitted work',
        disabled: basePath === '#',
      },
      {
        icon: Trophy,
        label: 'Payout',
        href: basePath !== '#' ? `${basePath}/payout` : '#',
        description: 'Select winners & pay',
        disabled: basePath === '#',
      },
      {
        icon: Archive,
        label: 'Wrap',
        href: basePath !== '#' ? `${basePath}/wrap` : '#',
        description: 'Results & archive',
        disabled: basePath === '#',
      },
      {
        icon: ShieldAlert,
        label: 'Disputes',
        href: basePath !== '#' ? `${basePath}/disputes` : '#',
        description: 'Dispute resolution',
        disabled: basePath === '#',
      },
      {
        icon: XCircle,
        label: 'Cancel',
        href: basePath !== '#' ? `${basePath}/cancel` : '#',
        description: 'Cancel & refund',
        disabled: basePath === '#',
      },
      {
        icon: Settings,
        label: 'Settings',
        href: basePath !== '#' ? `${basePath}/settings` : '#',
        description: 'Configure bounty',
        disabled: basePath === '#',
      },
    ],
    [basePath]
  );

  const headerHeight = 64;
  const availableHeight = height ? height - headerHeight : 'calc(100vh - 4rem)';

  return (
    <>
      {/* Mobile */}
      <div className='fixed top-20 left-4 z-50 md:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <button className='flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-black/60 shadow-lg backdrop-blur-xl'>
              <Menu className='h-5 w-5 text-white' />
            </button>
          </SheetTrigger>
          <SheetContent
            side='left'
            className='w-[280px] border-r border-zinc-800 bg-black p-0'
          >
            <BountySidebarContent
              menuItems={menuItems}
              normalizedPath={normalizedPath}
              bountyTitle={bountyTitle}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <aside
        className='fixed left-0 hidden w-[280px] border-r border-zinc-800/50 bg-black/40 backdrop-blur-xl md:block'
        style={{ height: availableHeight, top: '90px' }}
      >
        <BountySidebarContent
          menuItems={menuItems}
          normalizedPath={normalizedPath}
          bountyTitle={bountyTitle}
        />
      </aside>
    </>
  );
}
