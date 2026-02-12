'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'motion/react';

interface SubmissionDetailsTabProps {
  projectName: string;
  videoUrl?: string; // Kept for interface compatibility but not used here
  introduction?: string;
  description: string;
}

export const SubmissionDetailsTab: React.FC<SubmissionDetailsTabProps> = ({
  projectName,
  introduction,
  description,
}) => {
  return (
    <ScrollArea className='h-full pr-4'>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className='space-y-10'
      >
        <section>
          <p className='text-lg leading-relaxed font-bold text-white'>
            {projectName}.
          </p>
        </section>

        {introduction && (
          <section>
            <h4 className='mb-6 text-[11px] font-bold tracking-widest text-gray-500 uppercase'>
              Introduction
            </h4>
            <p className='text-base leading-loose text-gray-400'>
              {introduction}
            </p>
          </section>
        )}

        <section>
          <h4 className='mb-6 text-[11px] font-bold tracking-widest text-gray-500 uppercase'>
            Project Overview
          </h4>
          <article className='prose prose-invert max-w-none'>
            <p className='text-base leading-loose text-gray-400'>
              {description}
            </p>
          </article>
        </section>
      </motion.div>
    </ScrollArea>
  );
};
