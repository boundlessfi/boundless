'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useHackathonAnnouncements } from '@/hooks/hackathon/use-hackathon-queries';
import { AnnouncementsHeader } from './header';
import { AnnouncementCard } from './announcementCard';
import { Megaphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnnouncementsIndex() {
  const { slug } = useParams<{ slug: string }>();
  const { data: announcements, isLoading } = useHackathonAnnouncements(slug);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return [];
    if (activeFilter === 'all') return announcements;

    return announcements.filter(announcement => {
      const text = (
        announcement.title +
        ' ' +
        announcement.content
      ).toLowerCase();
      if (activeFilter === 'technical')
        return (
          text.includes('api') ||
          text.includes('technical') ||
          text.includes('endpoint')
        );
      if (activeFilter === 'logistics')
        return (
          text.includes('deadline') ||
          text.includes('requirement') ||
          text.includes('extension')
        );
      if (activeFilter === 'socials')
        return (
          text.includes('mixer') ||
          text.includes('social') ||
          text.includes('community')
        );
      return true;
    });
  }, [announcements, activeFilter]);

  return (
    <div className='flex flex-col gap-10 py-4'>
      <AnnouncementsHeader
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className='grid grid-cols-1 gap-6'>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='space-y-4 rounded-2xl border border-white/5 bg-[#141517] p-8'
            >
              <div className='flex items-center gap-2'>
                <Skeleton className='h-5 w-20' />
                <Skeleton className='h-5 w-32' />
              </div>
              <Skeleton className='h-8 w-3/4' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
              </div>
            </div>
          ))
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
            />
          ))
        ) : (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#141517] py-24 text-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white/5'>
              <Megaphone className='h-8 w-8 text-gray-500' />
            </div>
            <h3 className='mt-6 text-xl font-bold text-white'>
              No announcements found
            </h3>
            <p className='mt-2 text-gray-500'>
              We couldn&apos;t find any announcements for this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
