'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Megaphone, ArrowLeft, Calendar, User, Pin } from 'lucide-react';
import {
  getAnnouncementDetails,
  GetHackathonBySlug,
  type HackathonAnnouncement,
} from '@/lib/api/hackathons/index';
import { useMarkdown } from '@/hooks/use-markdown';
import { reportError } from '@/lib/error-reporting';
import { BoundlessButton } from '@/components/buttons';
import Loading from '@/components/Loading';
import { Badge } from '@/components/ui/badge';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const announcementId = params.announcementId as string;
  const slug = params.slug as string;

  const [announcement, setAnnouncement] =
    useState<HackathonAnnouncement | null>(null);
  const [hackathonName, setHackathonName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      if (!announcementId) return;
      try {
        setLoading(true);
        const [announcementData, hackathonData] = await Promise.all([
          getAnnouncementDetails(announcementId),
          GetHackathonBySlug(slug),
        ]);
        setAnnouncement(announcementData);
        setHackathonName(hackathonData.data.name);
      } catch (err) {
        reportError(err, {
          context: 'announcement-details',
          announcementId,
          slug,
        });
        setError(
          'Failed to load announcement. It may have been deleted or moved.'
        );
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [announcementId, slug]);

  const { styledContent, loading: markdownLoading } = useMarkdown(
    announcement?.content || '',
    {
      breaks: true,
      gfm: true,
    }
  );

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <Loading />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center'>
        <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10'>
          <Megaphone className='h-10 w-10 text-red-500' />
        </div>
        <h1 className='mb-2 text-2xl font-bold text-white'>
          Announcement Not Found
        </h1>
        <p className='mb-8 text-zinc-400'>
          {error || "We couldn't find the announcement you're looking for."}
        </p>
        <BoundlessButton onClick={() => router.back()} variant='outline'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Go Back
        </BoundlessButton>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black pb-24'>
      {/* Top Header */}
      <div className='sticky top-0 z-10 border-b border-zinc-900 bg-black/80 backdrop-blur-md'>
        <div className='mx-auto max-w-4xl items-center justify-between px-6 py-4'>
          <button
            onClick={() => window.close()}
            className='flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white'
          >
            <ArrowLeft className='h-4 w-4' />
            Close Tab
          </button>
          <div className='flex items-center gap-2 text-zinc-500'>
            <Megaphone className='text-primary h-4 w-4' />
            <span className='text-xs font-medium tracking-widest uppercase'>
              {hackathonName ? `${hackathonName} • ` : ''}Announcement
            </span>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-4xl px-6 pt-12'>
        {/* Title & Metadata */}
        <div className='mb-12 space-y-6 border-b border-zinc-900 pb-12'>
          <div className='flex flex-wrap items-center gap-3'>
            {hackathonName && (
              <Badge
                variant='outline'
                className='border-primary/30 text-primary bg-primary/5 font-bold tracking-tighter uppercase'
              >
                {hackathonName}
              </Badge>
            )}
            {announcement.isPinned && (
              <Badge
                variant='secondary'
                className='bg-primary/10 text-primary border-primary/20 flex items-center gap-1 tracking-tighter uppercase'
              >
                <Pin className='h-3 w-3 fill-current' />
                Pinned
              </Badge>
            )}
            <Badge
              variant='outline'
              className='tracking-tighter text-zinc-500 uppercase'
            >
              Published
            </Badge>
          </div>

          <h1 className='text-2xl font-bold tracking-tight text-white'>
            {announcement.title}
          </h1>

          <div className='flex flex-wrap items-center gap-6 text-sm text-zinc-400'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 uppercase'>
                {announcement.author?.name?.charAt(0) || (
                  <User className='h-4 w-4' />
                )}
              </div>
              <span className='font-medium text-zinc-200'>
                {announcement.author?.name || 'Organizer'}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-zinc-600' />
              <span>
                {new Date(
                  announcement.publishedAt || announcement.createdAt
                ).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='prose prose-invert prose-primary max-w-none'>
          {markdownLoading ? (
            <div className='flex h-32 items-center justify-center'>
              <div className='border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
            </div>
          ) : (
            <div className='text-lg leading-relaxed text-zinc-200'>
              {styledContent}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='mt-24 rounded-2xl border border-zinc-900 bg-zinc-950/50 p-8 text-center'>
          <h3 className='mb-2 font-bold text-white'>End of Announcement</h3>
          <p className='mb-6 text-sm text-zinc-500'>
            This announcement was published by the hackathon organizers.
          </p>
          <BoundlessButton
            onClick={() => window.close()}
            variant='outline'
            size='sm'
          >
            Return to Hackathon
          </BoundlessButton>
        </div>
      </div>
    </div>
  );
}
