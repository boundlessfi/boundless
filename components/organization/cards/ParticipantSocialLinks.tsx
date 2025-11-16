'use client';

import React from 'react';
import { Mail } from 'lucide-react';
import Image from 'next/image';
import type { Participant as ParticipantType } from '@/lib/api/hackathons';

interface ParticipantSocialLinksProps {
  socialLinks?: ParticipantType['socialLinks'];
}

export const ParticipantSocialLinks: React.FC<ParticipantSocialLinksProps> = ({
  socialLinks,
}) => {
  if (!socialLinks) return null;

  return (
    <div className='flex items-center gap-5'>
      {socialLinks.telegram && (
        <a
          href={socialLinks.telegram}
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image
            src='/footer/telegram.svg'
            alt='Telegram'
            width={24}
            height={24}
            className='h-6 w-6'
          />
        </a>
      )}
      {socialLinks.github && (
        <a href={socialLinks.github} target='_blank' rel='noopener noreferrer'>
          <Image
            src='/footer/github.svg'
            alt='Github'
            width={24}
            height={24}
            className='h-6 w-6'
          />
        </a>
      )}
      {socialLinks.email && (
        <a href={`mailto:${socialLinks.email}`}>
          <Mail className='h-4 w-4' />
        </a>
      )}
    </div>
  );
};
