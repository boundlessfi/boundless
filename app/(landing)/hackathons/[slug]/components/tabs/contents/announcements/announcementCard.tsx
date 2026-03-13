'use client';

import { format } from 'date-fns';
import { ChevronRight, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HackathonAnnouncement } from '@/lib/api/types';
import BasicAvatar from '@/components/avatars/BasicAvatar';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';

interface AnnouncementCardProps {
  announcement: HackathonAnnouncement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/hackathons/${slug}/announcements/${announcement.id}`);
  };

  // Determine a category label based on content keywords since API doesn't have a direct category field
  const getCategoryLabel = (title: string, content: string) => {
    const text = (title + ' ' + content).toLowerCase();
    if (
      text.includes('deadline') ||
      text.includes('requirement') ||
      text.includes('extension')
    )
      return {
        label: 'IMPORTANT',
        className: 'bg-red-500/10 text-red-500 border-red-500/20',
      };
    if (
      text.includes('api') ||
      text.includes('technical') ||
      text.includes('endpoint') ||
      text.includes('dev')
    )
      return {
        label: 'TECHNICAL',
        className: 'bg-lime-500/10 text-lime-500 border-lime-500/20',
      };
    if (
      text.includes('mixer') ||
      text.includes('social') ||
      text.includes('community') ||
      text.includes('event')
    )
      return {
        label: 'EVENT',
        className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      };
    return {
      label: 'UPDATE',
      className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
  };

  const category = getCategoryLabel(announcement.title, announcement.content);

  return (
    <div
      onClick={handleNavigate}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-[#141517] p-8 transition-all hover:border-white/10 hover:bg-[#18191b]',
        announcement.isPinned && 'ring-primary/20 bg-primary/2 ring-1'
      )}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <span
            className={cn(
              'rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
              category.className
            )}
          >
            {category.label}
          </span>
          <span className='text-xs font-medium text-gray-500'>
            {format(new Date(announcement.createdAt), 'MMM d, yyyy')} •{' '}
            {format(new Date(announcement.createdAt), 'h:mm aa')}
          </span>
        </div>
        {announcement.isPinned && (
          <Pin className='h-4 w-4 rotate-45 text-gray-600' />
        )}
      </div>

      <div className='mt-5'>
        <h3 className='group-hover:text-primary text-2xl font-bold text-white transition-colors'>
          {announcement.title}
        </h3>
        <p className='mt-3 line-clamp-2 text-base leading-relaxed text-gray-400'>
          {announcement.content}
        </p>
      </div>

      <div className='mt-8 flex items-center justify-between gap-4 border-t border-white/5 pt-6'>
        <div className='flex items-center gap-3'>
          <BasicAvatar
            name={announcement.author?.name || 'Organizer'}
            image={announcement.author?.image}
            username={announcement.author?.username || 'organizer'}
          />
        </div>

        <Button
          variant='ghost'
          onClick={e => {
            e.stopPropagation();
            handleNavigate();
          }}
          className='text-primary flex items-center gap-2 text-xs font-bold hover:bg-transparent'
        >
          <span className='hidden sm:block'>Read Full Update</span>{' '}
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
