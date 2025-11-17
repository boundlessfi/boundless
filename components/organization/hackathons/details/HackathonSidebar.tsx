'use client';

import {
  Trophy,
  Settings,
  LayoutDashboard,
  Users,
  BarChartBig,
  Megaphone,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useWindowSize } from '@/hooks/use-window-size';
import { useHackathons } from '@/hooks/use-hackathons';
import HackathonSelector from './HackathonSelector';
import { FutureFeature } from '@/components/FeatureFuture';

interface Hackathon {
  id: string;
  title: string;
  status: 'draft' | 'ongoing' | 'completed';
  href: string;
}

interface HackathonSidebarProps {
  organizationId?: string;
  hackathons?: Hackathon[];
}

export default function HackathonSidebar({
  organizationId,
  hackathons = [],
}: HackathonSidebarProps) {
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

  // Use the hackathons hook to fetch real data
  const {
    drafts,
    draftsLoading,
    hackathons: apiHackathons,
    hackathonsLoading,
  } = useHackathons({
    organizationId: derivedOrgId,
    autoFetch: true,
  });

  // Extract hackathonId from path: /organizations/[id]/hackathons/[hackathonId]/...
  // Also handle drafts: /organizations/[id]/hackathons/drafts/[draftId]/...
  const getHackathonId = () => {
    if (!pathname) return undefined;
    const parts = pathname.split('/');
    if (
      parts.length >= 5 &&
      parts[1] === 'organizations' &&
      parts[3] === 'hackathons'
    ) {
      // Check if it's a draft route
      if (parts[4] === 'drafts' && parts.length >= 6) {
        return `draft-${parts[5]}`;
      }
      // Regular hackathon route
      return `hackathon-${parts[4]}`;
    }
    return undefined;
  };

  const hackathonId = getHackathonId();

  const normalizedPath =
    pathname?.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;

  // Transform drafts and hackathons into the format needed by the component
  const hackathonData = useMemo<Hackathon[]>(() => {
    const items: Hackathon[] = [];

    // Add published hackathons first
    apiHackathons.forEach(hackathon => {
      // Check multiple possible title locations
      // The information field might be null/undefined, or title might be empty
      let title = 'Untitled Hackathon';

      title = hackathon.title || title;

      // Fallback: if information doesn't exist, keep default title
      // Note: Hackathon type requires information field, but we handle edge cases

      // Ensure it's a string and trim it
      title =
        typeof title === 'string'
          ? title.trim() || 'Untitled Hackathon'
          : 'Untitled Hackathon';

      items.push({
        id: `hackathon-${hackathon._id}`,
        title,
        status:
          hackathon.status === 'published'
            ? 'ongoing'
            : (hackathon.status as 'draft' | 'ongoing' | 'completed'),
        href: derivedOrgId
          ? `/organizations/${derivedOrgId}/hackathons/${hackathon._id}`
          : '#',
      });
    });

    // Add drafts
    drafts.forEach(draft => {
      // Check multiple possible title locations
      // The information field might be null/undefined, or title might be empty
      let title = 'Untitled Hackathon';

      if (draft.information) {
        title = draft.information.title || title;
      }

      // Fallback: if information doesn't exist, keep default title
      // Note: HackathonDraft type requires information field, but we handle edge cases

      // Ensure it's a string and trim it
      title =
        typeof title === 'string'
          ? title.trim() || 'Untitled Hackathon'
          : 'Untitled Hackathon';

      items.push({
        id: `draft-${draft._id}`,
        title,
        status: 'draft',
        href: derivedOrgId
          ? `/organizations/${derivedOrgId}/hackathons/drafts/${draft._id}`
          : '#',
      });
    });

    // Use provided hackathons if available (for backward compatibility)
    if (hackathons.length > 0) {
      return hackathons;
    }

    return items;
  }, [drafts, apiHackathons, derivedOrgId, hackathons]);

  const isLoading = draftsLoading || hackathonsLoading;

  // Find current hackathon
  const currentHackathon = useMemo(() => {
    if (hackathonId) {
      return hackathonData.find(h => h.id === hackathonId) || hackathonData[0];
    }
    return hackathonData[0];
  }, [hackathonId, hackathonData]);

  // Extract actual hackathon ID (without prefix) for menu items
  const actualHackathonId = useMemo(() => {
    if (!hackathonId) return undefined;
    // Remove prefix (draft- or hackathon-)
    return hackathonId.replace(/^(draft-|hackathon-)/, '');
  }, [hackathonId]);

  // Determine base path - drafts go to edit page, published go to detail pages
  const getBasePath = () => {
    if (!derivedOrgId || !actualHackathonId) return '#';

    // If it's a draft, menu items should navigate to the draft edit page
    if (hackathonId?.startsWith('draft-')) {
      return `/organizations/${derivedOrgId}/hackathons/drafts/${actualHackathonId}`;
    }

    // For published hackathons, use the regular hackathon detail pages
    return `/organizations/${derivedOrgId}/hackathons/${actualHackathonId}`;
  };

  const basePath = getBasePath();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Overview',
      href: basePath !== '#' ? basePath : '#',
      description: 'Event dashboard',
      disabled: false,
    },
    {
      icon: Users,
      label: 'Participants',
      href:
        basePath !== '#' && !hackathonId?.startsWith('draft-')
          ? `${basePath}/participants`
          : '#',
      description: 'Manage registrations',
      disabled: hackathonId?.startsWith('draft-'),
    },
    {
      icon: BarChartBig,
      label: 'Judging',
      href:
        basePath !== '#' && !hackathonId?.startsWith('draft-')
          ? `${basePath}/judging`
          : '#',
      description: 'Review submissions',
      disabled: hackathonId?.startsWith('draft-'),
    },
    {
      icon: Trophy,
      label: 'Rewards',
      href:
        basePath !== '#' && !hackathonId?.startsWith('draft-')
          ? `${basePath}/rewards`
          : '#',
      description: 'Prize distribution',
      disabled: hackathonId?.startsWith('draft-'),
    },
    {
      icon: Megaphone,
      label: 'Announcement',
      href:
        basePath !== '#' && !hackathonId?.startsWith('draft-')
          ? `${basePath}/announcement`
          : '#',
      description: 'Send updates',
      disabled: hackathonId?.startsWith('draft-'),
    },
    {
      icon: Settings,
      label: 'Settings',
      href:
        basePath !== '#' && !hackathonId?.startsWith('draft-')
          ? `${basePath}/settings`
          : '#',
      description: 'Configure event',
      disabled: hackathonId?.startsWith('draft-'),
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
        {/* Hackathon Selector */}
        <div className='mb-8'>
          {isLoading ? (
            <div className='flex items-center gap-3 rounded-xl bg-zinc-900/50 px-3 py-3'>
              <div className='h-9 w-9 animate-pulse rounded-lg bg-zinc-800' />
              <div className='flex flex-col gap-1'>
                <div className='h-4 w-32 animate-pulse rounded bg-zinc-800' />
                <div className='h-3 w-24 animate-pulse rounded bg-zinc-800' />
              </div>
            </div>
          ) : hackathonData.length === 0 ? (
            <div className='rounded-xl bg-zinc-900/50 px-3 py-3'>
              <p className='text-sm text-zinc-500'>No hackathons found</p>
            </div>
          ) : (
            <div className='mb-4 rounded-xl bg-zinc-900/50 p-2'>
              <HackathonSelector
                hackathons={hackathonData}
                currentHackathon={currentHackathon}
                onHackathonChange={id => {
                  const hackathon = hackathonData.find(h => h.id === id);
                  if (hackathon && hackathon.href && hackathon.href !== '#') {
                    // Navigation is handled by HackathonSelector
                  }
                }}
              />
            </div>
          )}
        </div>

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

        {/* Decorative bottom gradient */}
        <div className='pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t from-black via-black/50 to-transparent'></div>
      </nav>
    </aside>
  );
}
