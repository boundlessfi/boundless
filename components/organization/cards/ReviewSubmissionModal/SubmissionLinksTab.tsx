'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SubmissionLinksTabProps {
  links?: Array<{ type: string; url: string }>;
}

export const SubmissionLinksTab: React.FC<SubmissionLinksTabProps> = ({
  links,
}) => {
  return (
    <ScrollArea className='h-full pr-4'>
      <div className='space-y-3'>
        {links && links.length > 0 ? (
          links.map((link, index) => (
            <Link
              key={index}
              href={link.url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-between rounded-lg border border-gray-800 p-4 capitalize transition-colors hover:bg-gray-900/50'
            >
              <span className='flex items-center gap-2'>
                {link.type === 'github' ? (
                  <Image
                    src='/footer/github.svg'
                    width={16}
                    height={16}
                    alt='GitHub'
                  />
                ) : link.type === 'twitter' ? (
                  <Image
                    src='/footer/twitter.svg'
                    width={16}
                    height={16}
                    alt='Twitter'
                  />
                ) : (
                  <Image
                    src='/globe.svg'
                    width={16}
                    height={16}
                    alt='Website'
                  />
                )}
                <span className='text-sm text-white'>{link.type}</span>
              </span>
              <ArrowUpRight className='h-4 w-4 text-gray-400' />
            </Link>
          ))
        ) : (
          <p className='text-sm text-gray-400'>No links available</p>
        )}
      </div>
    </ScrollArea>
  );
};
