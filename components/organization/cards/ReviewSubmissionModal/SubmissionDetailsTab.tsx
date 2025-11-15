'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VideoPlayer, VideoPlayerError } from './VideoPlayer';

interface SubmissionDetailsTabProps {
  projectName: string;
  videoUrl?: string;
  introduction?: string;
  description: string;
}

export const SubmissionDetailsTab: React.FC<SubmissionDetailsTabProps> = ({
  projectName,
  videoUrl,
  introduction,
  description,
}) => {
  return (
    <ScrollArea className='h-full pr-4'>
      <div className='space-y-6'>
        <div>
          <h4 className='mb-4 text-base font-medium text-white'>
            How {projectName} Works in 2 Minutes
          </h4>
          <div className='relative h-[250px] overflow-hidden rounded-lg border border-gray-800 bg-gray-900'>
            {videoUrl ? (
              <VideoPlayer videoUrl={videoUrl} />
            ) : (
              <VideoPlayerError />
            )}
          </div>
        </div>

        <div>
          <h4 className='mb-3 text-base font-medium text-white'>
            Introduction
          </h4>
          <p className='text-sm leading-relaxed text-gray-400'>
            {introduction || description}
          </p>
        </div>
      </div>
    </ScrollArea>
  );
};
