'use client';

import React from 'react';

import Link from 'next/link';
import { Github, Globe, Linkedin, Mail, Send } from 'lucide-react';
import { Crowdfunding } from '@/features/projects/types';

interface MilestoneDetailLinksProps {
  campaign: Crowdfunding;
}

const iconMap: Record<string, React.ReactNode> = {
  github: <Github className='h-4 w-4' />,
  website: <Globe className='h-4 w-4' />,
  linkedin: <Linkedin className='h-4 w-4' />,
  twitter: <Send className='h-4 w-4' />,
  email: <Mail className='h-4 w-4' />,
};

export function MilestoneDetailLinks({ campaign }: MilestoneDetailLinksProps) {
  const project = campaign.project;
  const links = [
    {
      label: 'GitHub',
      url: project.githubUrl,
      icon: iconMap.github,
    },
    {
      label: 'Website',
      url: project.projectWebsite,
      icon: iconMap.website,
    },
    ...(campaign.socialLinks?.map(link => ({
      label: link.platform,
      url: link.url,
      icon: iconMap[link.platform.toLowerCase()] || (
        <Send className='h-4 w-4' />
      ),
    })) || []),
  ].filter(link => link.url);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4 border-t py-8'>
      <h2 className='text-xl font-semibold tracking-tight'>Project Links</h2>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            target='_blank'
            rel='noopener noreferrer'
            className='border-border/50 hover:border-primary/50 hover:bg-primary/5 flex items-center gap-3 rounded-lg border px-4 py-2 transition-colors'
          >
            <span className='text-muted-foreground'>{link.icon}</span>
            <span className='text-sm font-medium'>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
