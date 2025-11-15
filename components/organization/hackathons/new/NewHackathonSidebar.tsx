'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useWindowSize } from '@/hooks/use-window-size';
import { useHackathons } from '@/hooks/use-hackathons';

interface HackathonItem {
  id: string;
  title: string;
  status: 'draft' | 'ongoing' | 'completed' | 'published' | 'cancelled';
  href: string;
}

interface NewHackathonSidebarProps {
  organizationId?: string;
}

export default function NewHackathonSidebar({
  organizationId,
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

  // Use the hackathons hook to fetch real data
  const { drafts, draftsLoading, hackathons, hackathonsLoading } =
    useHackathons({
      organizationId: derivedOrgId,
      autoFetch: true,
    });

  const normalizedPath =
    pathname?.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;

  // Transform drafts and hackathons into the format needed by the component
  const hackathonData = useMemo<HackathonItem[]>(() => {
    const items: HackathonItem[] = [];

    // Add drafts first (for "Continue Editing" section)
    drafts.forEach(draft => {
      // Get title from information field (required by HackathonDraft type)
      const title = draft.information?.title || 'Untitled Hackathon';

      items.push({
        id: `draft-${draft._id}`,
        title:
          typeof title === 'string'
            ? title.trim() || 'Untitled Hackathon'
            : 'Untitled Hackathon',
        status: 'draft',
        href: derivedOrgId
          ? `/organizations/${derivedOrgId}/hackathons/drafts/${draft._id}`
          : '#',
      });
    });

    // Add published hackathons
    hackathons.forEach(hackathon => {
      // Get title from information field (required by Hackathon type)
      const title = hackathon.information?.title || 'Untitled Hackathon';

      items.push({
        id: `hackathon-${hackathon._id}`,
        title:
          typeof title === 'string'
            ? title.trim() || 'Untitled Hackathon'
            : 'Untitled Hackathon',
        status: hackathon.status === 'published' ? 'ongoing' : hackathon.status,
        href: derivedOrgId
          ? `/organizations/${derivedOrgId}/hackathons/${hackathon._id}`
          : '#',
      });
    });

    return items;
  }, [drafts, hackathons, derivedOrgId]);

  const isLoading = draftsLoading || hackathonsLoading;

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

          {isLoading ? (
            <div className='px-11 py-4'>
              <div className='flex items-center gap-2'>
                <div className='border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
                <span className='text-xs text-gray-500'>
                  Loading hackathons...
                </span>
              </div>
            </div>
          ) : hackathonData.length === 0 ? (
            <div className='px-11 py-4'>
              <span className='text-xs text-gray-500'>
                No hackathons found. Create a new one to get started.
              </span>
            </div>
          ) : (
            hackathonData.map(hackathon => {
              const isValidHref = hackathon.href !== '#';
              const isActive =
                isValidHref &&
                (normalizedPath === hackathon.href ||
                  normalizedPath?.startsWith(hackathon.href + '/'));

              return (
                <Link
                  key={hackathon.id}
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
            })
          )}
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
