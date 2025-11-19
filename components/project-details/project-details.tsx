'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMarkdown } from '@/hooks/use-markdown';
import { CrowdfundingProject } from '@/lib/api/types';

interface ProjectDetailsProps {
  project: CrowdfundingProject & {
    // Additional fields that might be added during transformation
    daysToDeadline?: number;
    additionalCreator?: {
      name: string;
      role: string;
      avatar: string;
    };
    links?: Array<{
      type: string;
      url: string;
      icon: string;
    }>;
  };
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const { loading, error, styledContent } = useMarkdown(project.description, {
    breaks: true,
    gfm: true,
    pedantic: true,
    loadingDelay: 100,
  });

  return (
    <div className='space-y-10 text-white'>
      {/* Markdown Content */}
      <div className='prose prose-invert prose-lg prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-[#a7f950] prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-[#a7f950] prose-code:bg-gray-900/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-gray-800 max-w-none'>
        {loading ? (
          <div className='flex items-center justify-center rounded-xl border border-gray-800/50 bg-gray-900/30 py-16 backdrop-blur-sm'>
            <div className='flex items-center gap-3 text-gray-400'>
              <div className='h-5 w-5 animate-spin rounded-full border-2 border-[#a7f950] border-t-transparent' />
              <span>Loading content...</span>
            </div>
          </div>
        ) : error ? (
          <div className='rounded-xl border border-red-500/30 bg-red-900/20 p-6 text-red-400 backdrop-blur-sm'>
            <p className='font-semibold'>Error loading content:</p>
            <p className='mt-2 text-sm'>{error}</p>
          </div>
        ) : (
          <div className='rounded-xl border border-gray-800/50 bg-gray-900/20 p-8 backdrop-blur-sm'>
            {styledContent}
          </div>
        )}
      </div>

      {/* Video Media Showcase */}
      {project.demoVideo && (
        <section className='space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='h-1 w-1 rounded-full bg-[#a7f950]' />
            <h2 className='text-2xl font-bold text-white'>Media Showcase</h2>
          </div>
          <Card className='overflow-hidden border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-gray-950/50 shadow-xl backdrop-blur-sm'>
            <CardContent className='p-0'>
              <div className='relative aspect-video overflow-hidden bg-black'>
                <video
                  className='h-full w-full object-cover'
                  controls
                  preload='metadata'
                >
                  <source src={project.demoVideo} type='video/mp4' />
                  Your browser does not support the video tag.
                </video>
                <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
              </div>
              <div className='border-t border-gray-800/50 bg-gray-900/30 p-4'>
                <p className='text-center text-sm text-gray-400'>
                  Project demonstration video
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Support Message Section */}
      <section className='rounded-xl border border-[#a7f950]/20 bg-gradient-to-br from-[#a7f950]/10 to-transparent p-8 backdrop-blur-sm'>
        <h2 className='mb-4 text-2xl font-bold text-white'>
          Support {project.title} Today
        </h2>
        <p className='leading-relaxed text-gray-300'>
          By backing {project.title}, you're contributing to innovative
          solutions in the{' '}
          <span className='font-semibold text-[#a7f950]'>
            {project.category}
          </span>{' '}
          space and helping bring this vision to life.
        </p>
      </section>
    </div>
  );
}
