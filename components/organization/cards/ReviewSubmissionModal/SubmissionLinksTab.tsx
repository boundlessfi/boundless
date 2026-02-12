'use client';

import React from 'react';
import { ArrowUpRight, Github, Twitter, Globe, Link2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'motion/react';

interface SubmissionLinksTabProps {
  links?: Array<{ type: string; url: string }>;
}

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'github':
      return <Github className='h-5 w-5' />;
    case 'twitter':
      return <Twitter className='h-5 w-5' />;
    case 'website':
      return <Globe className='h-5 w-5' />;
    default:
      return <Link2 className='h-5 w-5' />;
  }
};

export const SubmissionLinksTab: React.FC<SubmissionLinksTabProps> = ({
  links,
}) => {
  return (
    <ScrollArea className='h-full pr-4'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='grid grid-cols-1 gap-4 lg:grid-cols-2'
      >
        {links && links.length > 0 ? (
          links.map((link, index) => (
            <motion.a
              key={link.url}
              href={link.url}
              target='_blank'
              rel='noopener noreferrer'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className='group bg-background-card/20 hover:border-primary/40 hover:bg-primary/5 flex flex-col gap-4 rounded-2xl border border-gray-900/60 p-5 transition-all hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]'
            >
              <div className='flex items-center justify-between'>
                <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110'>
                  {getIcon(link.type)}
                </div>
                <ArrowUpRight className='group-hover:text-primary h-4 w-4 text-gray-700 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
              </div>

              <div className='space-y-1'>
                <h4 className='text-[10px] font-bold tracking-widest text-gray-500 uppercase'>
                  {link.type}
                </h4>
                <p className='group-hover:text-primary truncate text-sm font-bold text-white transition-colors'>
                  {link.url.replace(/^https?:\/\/(www\.)?/, '')}
                </p>
              </div>
            </motion.a>
          ))
        ) : (
          <div className='col-span-full py-20 text-center opacity-50'>
            <Link2 className='mx-auto mb-4 h-12 w-12 text-gray-700' />
            <p className='text-sm font-bold tracking-widest text-gray-500 uppercase'>
              No references found
            </p>
          </div>
        )}
      </motion.div>
    </ScrollArea>
  );
};
