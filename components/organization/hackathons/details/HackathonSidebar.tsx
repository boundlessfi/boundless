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
    },
    {
      icon: Users,
      label: 'Participants',
      href:
        basePath !== '#' && !hackathonId?.startsWith('draft-')
          ? `${basePath}/participants`
          : '#',
    },
    {
      icon: BarChartBig,
      label: 'Judging',
      href:
        basePath !== '#' && !hackathonId?.startsWith('draft-')
          ? `${basePath}/judging`
          : '#',
    },
    {
      icon: Trophy,
      label: 'Rewards',
      href:
        basePath !== '#' && !hackathonId?.startsWith('draft-')
          ? `${basePath}/rewards`
          : '#',
    },
    {
      icon: Megaphone,
      label: 'Announcement',
      href:
        basePath !== '#' && !hackathonId?.startsWith('draft-')
          ? `${basePath}/announcement`
          : '#',
    },
    {
      icon: Settings,
      label: 'Settings',
      href:
        basePath !== '#' && !hackathonId?.startsWith('draft-')
          ? `${basePath}/settings`
          : '#',
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
        {/* Hackathon Selector */}
        <div className='mb-2 px-3'>
          {isLoading ? (
            <div className='flex items-center gap-3 bg-transparent px-3 py-2'>
              <div className='h-10 w-10 animate-pulse rounded bg-gray-300' />
              <span className='text-sm font-medium text-gray-400'>
                Loading...
              </span>
            </div>
          ) : hackathonData.length === 0 ? (
            <div className='flex items-center gap-3 bg-transparent px-3 py-2'>
              <span className='text-sm font-medium text-gray-400'>
                No hackathons found
              </span>
            </div>
          ) : (
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
          )}
        </div>

        {/* Menu Items */}
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
                'flex items-center gap-3 px-11 py-4 text-sm font-medium transition-colors',
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
      </nav>
    </aside>
  );
}
