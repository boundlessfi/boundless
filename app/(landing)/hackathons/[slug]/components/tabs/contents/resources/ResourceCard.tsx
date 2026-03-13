'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  LucideIcon,
  ArrowRight,
  ExternalLink,
  Settings,
  Download,
} from 'lucide-react';

export interface ResourceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText: string;
  actionHref?: string;
  isComingSoon?: boolean;
  type?: 'read' | 'repo' | 'download' | 'watch' | 'config';
}

export const ResourceCard = ({
  title,
  description,
  icon: Icon,
  actionText,
  actionHref,
  isComingSoon = false,
  type = 'read',
}: ResourceCardProps) => {
  if (isComingSoon) {
    return (
      <div className='group relative flex flex-col gap-4 rounded-3xl border border-white/5 bg-white/3 p-8 text-center transition-all duration-300'>
        <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-gray-500'>
          <Icon className='h-6 w-6' />
        </div>
        <div>
          <h3 className='text-xl font-bold text-gray-300'>{title}</h3>
          <p className='mt-3 text-sm leading-relaxed text-gray-500'>
            {description}
          </p>
        </div>
      </div>
    );
  }

  const getActionIcon = () => {
    switch (type) {
      case 'read':
        return (
          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
        );
      case 'repo':
        return (
          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
        );
      case 'download':
        return <Download className='h-4 w-4' />;
      case 'watch':
        return <ExternalLink className='h-4 w-4' />;
      case 'config':
        return <Settings className='h-4 w-4' />;
      default:
        return <ArrowRight className='h-4 w-4' />;
    }
  };

  return (
    <a
      href={actionHref || '#'}
      target={type === 'read' || type === 'download' ? '_self' : '_blank'}
      className='group flex flex-col justify-between gap-8 rounded-3xl border border-white/5 bg-[#0D0E10] p-8 transition-all duration-300 hover:border-[#A7F950]/30 hover:bg-[#141517]'
    >
      <div className='space-y-6'>
        <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-[#232B20] text-[#A7F950] transition-colors group-hover:bg-[#A7F950] group-hover:text-black'>
          <Icon className='h-6 w-6' />
        </div>
        <div>
          <h3 className='text-xl font-bold text-white'>{title}</h3>
          <p className='mt-3 line-clamp-2 text-sm leading-relaxed text-gray-400 group-hover:text-gray-300'>
            {description}
          </p>
        </div>
      </div>

      <div className='flex items-center gap-2 text-sm font-black tracking-wider text-[#A7F950] uppercase'>
        {actionText}
        {getActionIcon()}
      </div>
    </a>
  );
};
