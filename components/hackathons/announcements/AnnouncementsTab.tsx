'use client';

import React, { useState, useMemo } from 'react';
import { Megaphone, Pin, ArrowUpDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HackathonAnnouncement } from '@/lib/api/hackathons/index';
import Link from 'next/link';

interface AnnouncementsTabProps {
  announcements: HackathonAnnouncement[];
  hackathonSlug: string;
}

export function AnnouncementsTab({
  announcements,
  hackathonSlug,
}: AnnouncementsTabProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort((a, b) => {
      // Always put pinned at top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then sort by date
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();

      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [announcements, sortBy]);

  const isRecent = (date: string) => {
    const announcementDate = new Date(date).getTime();
    const now = new Date().getTime();
    const diff = now - announcementDate;
    return diff < 1000 * 60 * 60 * 24; // 24 hours
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Megaphone className='text-primary h-5 w-5' />
          <h2 className='text-xl font-bold'>Announcements</h2>
          <span className='rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400'>
            {announcements.length}
          </span>
        </div>

        <button
          onClick={() =>
            setSortBy(prev => (prev === 'newest' ? 'oldest' : 'newest'))
          }
          className='flex items-center gap-2 rounded-lg bg-zinc-900/50 px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white'
        >
          <ArrowUpDown className='h-3.5 w-3.5' />
          <span>{sortBy === 'newest' ? 'Newest' : 'Oldest'}</span>
        </button>
      </div>

      <div className='grid gap-4'>
        {sortedAnnouncements.map(announcement => (
          <Link
            key={announcement.id}
            href={`/hackathons/${hackathonSlug}/announcements/${announcement.id}`}
            target='_blank'
            className={cn(
              'group relative overflow-hidden rounded-xl border p-5 transition-all hover:scale-[1.01]',
              announcement.isPinned
                ? 'border-primary/50 bg-primary/5 shadow-primary/20 shadow-lg'
                : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/50'
            )}
          >
            {isRecent(announcement.publishedAt || announcement.createdAt) && (
              <div className='bg-primary absolute top-0 right-0 rounded-bl-lg px-2 py-1 text-[10px] font-bold tracking-wider text-black uppercase'>
                New
              </div>
            )}

            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0 flex-1 space-y-2'>
                <div className='flex items-center gap-2'>
                  {announcement.isPinned && (
                    <Pin className='fill-primary text-primary h-4 w-4' />
                  )}
                  <h3 className='group-hover:text-primary truncate text-lg font-bold text-white'>
                    {announcement.title}
                  </h3>
                </div>

                <p className='line-clamp-2 text-sm text-zinc-400'>
                  {announcement.content.replace(/<[^>]*>/g, '')}
                </p>

                <div className='flex items-center gap-4 text-xs text-zinc-500'>
                  <span className='flex items-center gap-1.5'>
                    {new Date(
                      announcement.publishedAt || announcement.createdAt
                    ).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span>By {announcement.author?.name || 'Organizer'}</span>
                </div>
              </div>

              <div className='hidden items-center justify-center rounded-lg bg-zinc-800 p-2 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 sm:flex'>
                <ExternalLink className='h-5 w-5' />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
