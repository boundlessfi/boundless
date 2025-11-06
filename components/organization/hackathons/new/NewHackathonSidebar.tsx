'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useWindowSize } from '@/hooks/use-window-size';

interface Hackathon {
  id: string;
  title: string;
  status: 'draft' | 'ongoing' | 'completed';
  href: string;
}

interface NewHackathonSidebarProps {
  organizationId?: string;
  hackathons?: Hackathon[];
}

export default function NewHackathonSidebar({
  organizationId,
  hackathons = [],
}: NewHackathonSidebarProps) {
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

  const defaultHackathons: Hackathon[] = [
    {
      id: '1draft',
      title: 'New Hackathon',
      status: 'draft',
      href: derivedOrgId ? `/organizations/${derivedOrgId}/hackathons` : '#',
    },
    {
      id: '2w',
      title: 'New Hackathon',
      status: 'draft',
      href: derivedOrgId ? `/organizations/${derivedOrgId}/hackathons/2w` : '#',
    },
    {
      id: '2',
      title: 'Vicklo Hackathon',
      status: 'ongoing',
      href: derivedOrgId ? `/organizations/${derivedOrgId}/hackathons/2` : '#',
    },
    {
      id: '1',
      title: 'New Hackathon',
      status: 'draft',
      href: derivedOrgId ? `/organizations/${derivedOrgId}/hackathons/1` : '#',
    },
  ];

  const hackathonData = hackathons.length > 0 ? hackathons : defaultHackathons;

  const headerHeight = 64;
  const availableHeight = height ? height - headerHeight : 'calc(100vh - 4rem)';

  return (
    <aside
      className='bg-background-main-bg fixed top-4 left-0 hidden w-[350px] border-r border-zinc-800 md:block'
      style={{ height: availableHeight, top: '90px' }}
    >
      <nav className='flex h-full flex-col gap-1 overflow-y-auto py-4'>
        <div className='px-11 py-2.5'>
          <div className='flex flex-col items-start gap-px'>
            <span className='text-primary text-sm font-medium'>
              New Hackathon
            </span>
            <span className='text-xs text-gray-500 capitalize'>Draft</span>
          </div>
        </div>

        <div className='mt-6'>
          <div className='px-11 py-2'>
            <h3 className='text-xs font-semibold tracking-wider text-white uppercase'>
              Continue Editing
            </h3>
          </div>

          {hackathonData.map(hackathon => {
            const isValidHref = hackathon.href !== '#';
            const isActive =
              isValidHref &&
              (normalizedPath === hackathon.href ||
                normalizedPath?.startsWith(hackathon.href + '/'));

            return (
              <Link
                key={`${hackathon.id}-${hackathon.title}`}
                href={hackathon.href}
                className={cn(
                  'flex flex-col items-start gap-px px-11 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-r-primary text-primary border-r-4 bg-zinc-900'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                )}
              >
                {hackathon.title}
                <span className='text-xs text-gray-500 capitalize'>
                  {hackathon.status}
                </span>
              </Link>
            );
          })}
        </div>

        <div className='mt-6 px-8'>
          <Link
            href={`/organizations/${derivedOrgId}/hackathons/new`}
            className='hover:text-primary flex items-center gap-3 text-white transition-colors'
          >
            <div className='bg-primary grid h-6 w-6 place-content-center rounded-full'>
              <Plus className='h-4 w-4 text-black' />
            </div>
            <span className='text-sm font-medium'>Host Hackathon</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
