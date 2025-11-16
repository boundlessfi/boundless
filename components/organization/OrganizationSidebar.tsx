'use client';

import { Trophy, HandCoins, Settings, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useWindowSize } from '@/hooks/use-window-size';
import { FutureFeature } from '../FeatureFuture';

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
      description: 'Manage your events',
    },
    {
      icon: HandCoins,
      label: 'Grants',
      href: derivedOrgId ? `/organizations/${derivedOrgId}/grants` : '#',
      description: 'Fund amazing projects',
      disabled: true,
    },
    {
      icon: Settings,
      label: 'Settings',
      href: derivedOrgId
        ? `/organizations/${derivedOrgId}/settings`
        : '/organizations/new',
      description: 'Organization details',
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Host Hackathon',
      href: `/organizations/${derivedOrgId}/hackathons/new`,
      gradient: 'from-primary/20 to-primary/5',
      disabled: false,
    },
    {
      icon: Sparkles,
      label: 'Create Grants',
      href: '#',
      gradient: 'from-purple-500/20 to-purple-500/5',
      disabled: true,
    },
  ];

  const headerHeight = 64;
  const availableHeight = height ? height - headerHeight : 'calc(100vh - 4rem)';

  return (
    <aside
      className='fixed top-4 left-0 hidden w-[280px] border-r border-zinc-800/50 bg-black/40 backdrop-blur-xl md:block'
      style={{ height: availableHeight, top: '90px' }}
    >
      <nav className='flex h-full flex-col overflow-y-auto px-4 py-6'>
        {/* Navigation Section */}
        <div className='mb-8 space-y-1'>
          <h3 className='mb-4 px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
            Navigation
          </h3>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isValidHref = item.href !== '#';
            const isActive =
              isValidHref &&
              (normalizedPath === item.href ||
                normalizedPath?.startsWith(item.href + '/'));

            return item.disabled ? (
              <FutureFeature key={item.label} badgeClassName='right-2 top-2'>
                <div
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-500 transition-all'
                  )}
                >
                  <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900/50'>
                    <Icon className='h-4 w-4' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>{item.label}</span>
                    <span className='text-xs text-zinc-600'>
                      {item.description}
                    </span>
                  </div>
                </div>
              </FutureFeature>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'from-primary/10 text-primary shadow-primary/5 bg-gradient-to-r to-transparent shadow-lg'
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className='bg-primary absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full'></div>
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

                {/* Hover indicator */}
                {!isActive && (
                  <div className='absolute inset-0 rounded-xl border border-transparent transition-colors group-hover:border-zinc-700/50'></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Actions Section */}
        <div className='mt-auto space-y-3'>
          <h3 className='mb-4 px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
            Quick Actions
          </h3>

          {quickActions.map(action => {
            const Icon = action.icon;

            return action.disabled ? (
              <FutureFeature
                key={action.label}
                label='Coming Soon'
                badgeClassName='right-2 top-2'
              >
                <div className='group relative cursor-not-allowed overflow-hidden rounded-xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-900/20 p-4 transition-all'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br',
                        action.gradient
                      )}
                    >
                      <Icon className='h-5 w-5 text-zinc-500' />
                    </div>
                    <span className='font-medium text-zinc-500'>
                      {action.label}
                    </span>
                  </div>
                </div>
              </FutureFeature>
            ) : (
              <Link
                key={action.label}
                href={action.href}
                className='group hover:border-primary/50 hover:shadow-primary/10 relative block overflow-hidden rounded-xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-900/20 p-4 transition-all hover:shadow-lg'
              >
                {/* Animated gradient overlay */}
                <div className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                  <div className='from-primary/5 absolute inset-0 bg-gradient-to-r via-transparent to-transparent'></div>
                </div>

                <div className='relative flex items-center gap-3'>
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br transition-all group-hover:scale-110',
                      action.gradient
                    )}
                  >
                    <Icon className='text-primary h-5 w-5' />
                  </div>
                  <span className='group-hover:text-primary font-medium text-white transition-colors'>
                    {action.label}
                  </span>
                </div>

                {/* Bottom accent line */}
                <div className='via-primary absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
              </Link>
            );
          })}
        </div>

        {/* Decorative bottom gradient */}
        <div className='pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t from-black via-black/50 to-transparent'></div>
      </nav>
    </aside>
  );
}
