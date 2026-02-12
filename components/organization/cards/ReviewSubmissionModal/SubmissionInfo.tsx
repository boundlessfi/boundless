'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from './VideoPlayer';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

interface Submission {
  id: string;
  projectName: string;
  category: string;
  description: string;
  votes: number;
  comments: number;
  logo?: string;
  videoUrl?: string;
  introduction?: string;
}

interface SubmissionInfoProps {
  submission: Submission;
}

const FALLBACK_LOGO = '/bitmed.png';

export const SubmissionInfo: React.FC<SubmissionInfoProps> = ({
  submission,
}) => {
  return (
    <div className='bg-background-card/20 flex w-1/2 flex-col overflow-y-auto border-r border-gray-900/40'>
      <div className='relative aspect-video w-full overflow-hidden bg-black/40'>
        {submission.videoUrl ? (
          <VideoPlayer videoUrl={submission.videoUrl} />
        ) : (
          <div className='bg-background/20 flex h-full w-full items-center justify-center'>
            <Image
              src={submission.logo || FALLBACK_LOGO}
              alt={submission.projectName}
              width={400}
              height={225}
              className='h-full w-full object-cover px-8 py-4 opacity-30 blur-2xl'
            />
            <div className='absolute inset-0 flex items-center justify-center'>
              <Image
                src={submission.logo || FALLBACK_LOGO}
                alt={submission.projectName}
                width={120}
                height={120}
                className='h-32 w-32 rounded-2xl border-4 border-gray-950 object-cover shadow-2xl'
              />
            </div>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-6 p-8'>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col gap-4'
        >
          <div className='flex items-center gap-3'>
            <Badge className='bg-primary/10 border-primary/20 text-primary rounded-full border px-3 py-1 text-[10px] font-bold tracking-widest uppercase'>
              {submission.category}
            </Badge>
          </div>

          <h1 className='text-2xl leading-tight font-black tracking-tight text-white'>
            {submission.projectName}
          </h1>

          {submission.introduction && (
            <p className='text-lg leading-relaxed font-medium text-gray-400 italic'>
              "{submission.introduction}"
            </p>
          )}

          <div className='space-y-4'>
            <p className='text-base leading-relaxed font-normal text-gray-400'>
              {submission.description}
            </p>
          </div>
        </motion.div>
        <div className='mt-4 grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-1 rounded-xl border border-gray-900/50 bg-gray-900/30 p-4 transition-colors hover:border-gray-800'>
            <span className='text-[10px] font-bold tracking-widest text-gray-500 uppercase'>
              Current Votes
            </span>
            <div className='flex items-center gap-2'>
              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
              <span className='text-xl font-black text-white'>
                {submission.votes}
              </span>
            </div>
          </div>
          <div className='flex flex-col gap-1 rounded-xl border border-gray-900/50 bg-gray-900/30 p-4 transition-colors hover:border-gray-800'>
            <span className='text-[10px] font-bold tracking-widest text-gray-500 uppercase'>
              Community Buzz
            </span>
            <div className='flex items-center gap-2'>
              <div className='flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20'>
                <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400' />
              </div>
              <span className='text-xl font-black text-white'>
                {submission.comments.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
