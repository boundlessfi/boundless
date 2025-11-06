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
import { cn } from '@/lib/utils';
import { useWindowSize } from '@/hooks/use-window-size';
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

  // Extract hackathonId from path: /organizations/[id]/hackathons/[hackathonId]/...
  // hackathonId is at index 4 (after '', 'organizations', '[id]', 'hackathons', '[hackathonId]')
  const getHackathonId = () => {
    if (!pathname) return undefined;
    const parts = pathname.split('/');
    if (
      parts.length >= 5 &&
      parts[1] === 'organizations' &&
      parts[3] === 'hackathons'
    ) {
      return parts[4];
    }
    return undefined;
  };

  const hackathonId = getHackathonId();

  const normalizedPath =
    pathname?.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;

  // Default hackathons if none provided
  const defaultHackathons: Hackathon[] = [
    {
      id: '1',
      title: 'Vicklo Hackathon',
      status: 'ongoing',
      href: derivedOrgId ? `/organizations/${derivedOrgId}/hackathons/1` : '#',
    },
    {
      id: '2',
      title: 'New Hackathon',
      status: 'draft',
      href: derivedOrgId ? `/organizations/${derivedOrgId}/hackathons/2` : '#',
    },
  ];

  const hackathonData = hackathons.length > 0 ? hackathons : defaultHackathons;

  // Find current hackathon
  const currentHackathon = hackathonId
    ? hackathonData.find(h => h.id === hackathonId) || hackathonData[0]
    : hackathonData[0];

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Overview',
      href:
        derivedOrgId && hackathonId
          ? `/organizations/${derivedOrgId}/hackathons/${hackathonId}`
          : '#',
    },
    {
      icon: Users,
      label: 'Participants',
      href:
        derivedOrgId && hackathonId
          ? `/organizations/${derivedOrgId}/hackathons/${hackathonId}/participants`
          : '#',
    },
    {
      icon: BarChartBig,
      label: 'Judging',
      href:
        derivedOrgId && hackathonId
          ? `/organizations/${derivedOrgId}/hackathons/${hackathonId}/judging`
          : '#',
    },
    {
      icon: Trophy,
      label: 'Rewards',
      href:
        derivedOrgId && hackathonId
          ? `/organizations/${derivedOrgId}/hackathons/${hackathonId}/rewards`
          : '#',
    },
    {
      icon: Megaphone,
      label: 'Announcement',
      href:
        derivedOrgId && hackathonId
          ? `/organizations/${derivedOrgId}/hackathons/${hackathonId}/announcement`
          : '#',
    },
    {
      icon: Settings,
      label: 'Settings',
      href:
        derivedOrgId && hackathonId
          ? `/organizations/${derivedOrgId}/hackathons/${hackathonId}/settings`
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
