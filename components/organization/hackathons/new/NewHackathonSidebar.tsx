'use client';

import { Plus, FileText, Trophy } from 'lucide-react';
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

  const getStatusIcon = (status: string) => {
    if (status === 'draft') return FileText;
    return Trophy;
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Continue editing';
      case 'ongoing':
        return 'Active event';
      case 'completed':
        return 'Finished';
      default:
        return 'View details';
    }
  };

  return (
    <aside
      className='fixed top-4 left-0 hidden w-[280px] border-r border-zinc-800/50 bg-black/40 backdrop-blur-xl md:block'
      style={{ height: availableHeight, top: '90px' }}
    >
      <nav className='flex h-full flex-col overflow-y-auto px-4 py-6'>
        {/* Header Section */}
        <div className='mb-8'>
          <div className='mb-4 px-3'>
            <h2 className='text-lg font-semibold text-white'>New Hackathon</h2>
            <p className='text-xs text-zinc-500'>Create and manage events</p>
          </div>
        </div>

        {/* Continue Editing Section */}
        <div className='mb-8 space-y-1'>
          <h3 className='mb-4 px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
            Continue Editing
          </h3>

          {isLoading ? (
            <div className='px-3 py-4'>
              <div className='flex items-center gap-3'>
                <div className='h-9 w-9 animate-pulse rounded-lg bg-zinc-900/50' />
                <div className='flex flex-col gap-1'>
                  <div className='h-4 w-32 animate-pulse rounded bg-zinc-900/50' />
                  <div className='h-3 w-24 animate-pulse rounded bg-zinc-900/50' />
                </div>
              </div>
            </div>
          ) : hackathonData.length === 0 ? (
            <div className='px-3 py-4'>
              <p className='text-sm text-zinc-500'>
                No hackathons found. Create a new one to get started.
              </p>
            </div>
          ) : (
            hackathonData.map(hackathon => {
              const Icon = getStatusIcon(hackathon.status);
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
                    <span className='text-sm font-medium'>
                      {hackathon.title}
                    </span>
                    <span
                      className={cn(
                        'text-xs transition-colors',
                        isActive
                          ? 'text-primary/60'
                          : 'text-zinc-600 group-hover:text-zinc-500'
                      )}
                    >
                      {getStatusDescription(hackathon.status)}
                    </span>
                  </div>

                  {/* Hover indicator */}
                  {!isActive && (
                    <div className='absolute inset-0 rounded-xl border border-transparent transition-colors group-hover:border-zinc-700/50'></div>
                  )}
                </Link>
              );
            })
          )}
        </div>

        {/* Quick Actions Section */}
        <div className='mt-auto space-y-3'>
          <h3 className='mb-4 px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
            Quick Actions
          </h3>

          <Link
            href={`/organizations/${derivedOrgId}/hackathons/new`}
            className='group hover:border-primary/50 hover:shadow-primary/10 relative block overflow-hidden rounded-xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-900/20 p-4 transition-all hover:shadow-lg'
          >
            {/* Animated gradient overlay */}
            <div className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
              <div className='from-primary/5 absolute inset-0 bg-gradient-to-r via-transparent to-transparent'></div>
            </div>

            <div className='relative flex items-center gap-3'>
              <div className='from-primary/20 to-primary/5 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br transition-all group-hover:scale-110'>
                <Plus className='text-primary h-5 w-5' />
              </div>
              <span className='group-hover:text-primary font-medium text-white transition-colors'>
                Host Hackathon
              </span>
            </div>

            {/* Bottom accent line */}
            <div className='via-primary absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
          </Link>
        </div>

        {/* Decorative bottom gradient */}
        <div className='pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t from-black via-black/50 to-transparent'></div>
      </nav>
    </aside>
  );
}
