'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, FileText, Info, Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMarkdown } from '@/hooks/use-markdown';
import { cn } from '@/lib/utils';
import {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerControlsOverlay,
  MediaPlayerFullscreen,
  MediaPlayerLoading,
  MediaPlayerPlay,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
} from '@/components/ui/media-player';
import type { ProjectViewModel } from '@/features/projects/types/view-model';

interface DetailsTabProps {
  vm: ProjectViewModel;
}

interface OutlineItem {
  id: string;
  label: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function DetailsTab({ vm }: DetailsTabProps) {
  const hasDescription = !!vm.description?.trim();

  if (!hasDescription) {
    return <DetailsEmptyState vm={vm} />;
  }

  return <DetailsContent vm={vm} />;
}

function DetailsContent({ vm }: DetailsTabProps) {
  const { loading, error, styledContent } = useMarkdown(vm.description, {
    breaks: true,
    gfm: true,
    pedantic: true,
    loadingDelay: 100,
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Build outline from rendered h2 headings + scroll-spy
  useEffect(() => {
    if (loading || !contentRef.current) return;

    const headings = Array.from(
      contentRef.current.querySelectorAll('h2')
    ) as HTMLHeadingElement[];

    const items: OutlineItem[] = headings.map(h => {
      const label = h.textContent ?? '';
      const id = h.id || slugify(label);
      h.id = id;
      h.style.scrollMarginTop = '96px';
      return { id, label };
    });

    setOutline(items);
    setActiveId(prev => prev ?? items[0]?.id ?? null);

    if (!items.length) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 }
    );

    headings.forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, [loading, vm.description]);

  const handleOutlineClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  const isCampaign = vm.projectType === 'campaign';

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr] lg:gap-10 xl:grid-cols-[240px_1fr]'>
      {/* Outline sidebar */}
      <aside className='lg:sticky lg:top-24 lg:h-fit'>
        <div className='border-stepper-border bg-background-card rounded-2xl border p-5'>
          <p className='text-primary mb-4 text-xs font-semibold tracking-widest uppercase'>
            Outline
          </p>
          {outline.length === 0 ? (
            <p className='text-xs text-gray-600'>No sections yet</p>
          ) : (
            <ul className='space-y-3'>
              {outline.map(item => {
                const isActive = item.id === activeId;
                return (
                  <li key={item.id} className='flex items-start gap-2'>
                    <span
                      className={cn(
                        'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                        isActive ? 'bg-primary' : 'bg-gray-700'
                      )}
                    />
                    <button
                      type='button'
                      onClick={() => handleOutlineClick(item.id)}
                      className={cn(
                        'text-left text-sm leading-snug transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-gray-400 hover:text-gray-200'
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Right column: markdown + video + support CTA */}
      <div className='min-w-0 space-y-8'>
        {loading ? (
          <div className='border-stepper-border bg-background-card flex items-center justify-center rounded-2xl border py-16'>
            <div className='flex items-center gap-3 text-gray-500'>
              <Loader2 className='text-primary h-5 w-5 animate-spin' />
              <span className='text-sm'>Loading content...</span>
            </div>
          </div>
        ) : error ? (
          <div className='border-error-500/30 bg-error-900/20 text-error-300 rounded-2xl border p-6'>
            <p className='font-semibold'>Error loading content:</p>
            <p className='mt-2 text-sm'>{error}</p>
          </div>
        ) : (
          <div ref={contentRef}>{styledContent}</div>
        )}

        {/* Demo video showcase — preserves the legacy media player behavior */}
        {vm.demoVideo && <DemoVideo url={vm.demoVideo} />}

        {/* Campaign-only support CTA */}
        {isCampaign && <SupportCard vm={vm} />}
      </div>
    </div>
  );
}

/* ────────────────────────── Demo video ────────────────────────── */

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be')) {
        videoId = url.split('/').pop()?.split('?')[0] || '';
      } else if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v') || '';
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  } catch {
    return null;
  }
}

function DemoVideo({ url }: { url: string }) {
  const youtubeEmbedUrl = getYouTubeEmbedUrl(url);

  return (
    <section className='space-y-4'>
      <div className='flex items-center gap-3'>
        <div className='bg-primary h-1 w-1 rounded-full' />
        <h2 className='text-xl font-bold text-white sm:text-2xl'>
          Media Showcase
        </h2>
      </div>
      <Card className='border-stepper-border bg-background-card overflow-hidden'>
        <CardContent className='p-0'>
          <div className='relative aspect-video overflow-hidden bg-black'>
            {youtubeEmbedUrl ? (
              <iframe
                src={youtubeEmbedUrl}
                title='Project Video'
                className='h-full w-full'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
            ) : (
              <MediaPlayer className='h-full w-full'>
                <MediaPlayerVideo
                  className='h-full w-full object-cover'
                  src={url}
                />
                <MediaPlayerLoading />
                <MediaPlayerControlsOverlay />
                <MediaPlayerControls className='flex-col items-stretch justify-end gap-2 bg-linear-to-t from-black/80 via-black/40 to-transparent pt-12 pb-4'>
                  <MediaPlayerSeek />
                  <div className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-2'>
                      <MediaPlayerPlay />
                      <MediaPlayerSeekBackward />
                      <MediaPlayerSeekForward />
                      <MediaPlayerVolume />
                      <MediaPlayerTime />
                    </div>
                    <div className='flex items-center gap-2'>
                      <MediaPlayerFullscreen />
                    </div>
                  </div>
                </MediaPlayerControls>
              </MediaPlayer>
            )}
          </div>
          <div className='border-stepper-border bg-inactive/40 border-t p-4'>
            <p className='text-center text-sm text-gray-500'>
              Project demonstration video
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

/* ───────────────────────── Support CTA ────────────────────────── */

function SupportCard({ vm }: { vm: ProjectViewModel }) {
  const handleBackProject = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className='border-primary/30 from-primary/10 via-primary/5 rounded-2xl border bg-linear-to-r to-transparent p-6 sm:p-8'>
      <div className='flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center'>
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold text-white sm:text-xl'>
            Support {vm.title} Today
          </h3>
          <p className='max-w-xl text-sm leading-relaxed text-gray-400'>
            By backing {vm.title}, you&apos;re contributing to innovative
            solutions in the{' '}
            <span className='text-primary font-semibold'>{vm.category}</span>{' '}
            space and helping bring this vision to life.
          </p>
        </div>
        <Button
          onClick={handleBackProject}
          className='bg-primary text-primary-foreground hover:bg-primary/90 h-11 shrink-0 px-6 text-sm font-semibold'
        >
          Back Project Now
        </Button>
      </div>
    </section>
  );
}

/* ───────────────────────── Empty state ────────────────────────── */

function DetailsEmptyState({ vm }: { vm: ProjectViewModel }) {
  return (
    <div className='border-stepper-border bg-background-card rounded-2xl border px-6 py-14 sm:py-20'>
      <div className='mx-auto flex max-w-md flex-col items-center text-center'>
        <div className='border-primary/30 bg-primary/10 shadow-primary/20 relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border shadow-[0_0_60px_-10px]'>
          <FileText className='text-primary h-10 w-10' />
        </div>

        <h3 className='text-xl font-bold text-white sm:text-2xl'>
          No project details yet
        </h3>
        <p className='mt-3 text-sm leading-relaxed text-gray-500'>
          The creator hasn&apos;t added a detailed description or vision for
          this project yet. Check back soon for updates or follow the project to
          get notified.
        </p>

        <div className='mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
          <Button
            variant='outline'
            onClick={() =>
              typeof window !== 'undefined' &&
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
            className='border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary h-11 px-6 text-sm font-semibold'
          >
            <Bell className='mr-2 h-4 w-4' />
            Follow Project
          </Button>
          <Button
            variant='outline'
            onClick={() =>
              typeof window !== 'undefined' &&
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
            className='border-stepper-border bg-inactive/40 hover:bg-inactive h-11 px-6 text-sm font-semibold text-white'
          >
            <Share2 className='mr-2 h-4 w-4' />
            Share
          </Button>
        </div>

        <div className='border-stepper-border/60 mt-10 w-full border-t pt-5'>
          <p className='inline-flex items-center gap-1.5 text-xs text-gray-600'>
            <Info className='h-3.5 w-3.5' />
            Project ID:{' '}
            <span className='text-gray-500'>{vm.slug || vm.id}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
