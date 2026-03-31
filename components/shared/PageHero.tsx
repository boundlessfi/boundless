'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PageHeroProps {
  /** Small label above the headline */
  label?: string;
  /** Main headline */
  headline: string;
  /** Short description */
  description: string;
  /** Icon next to the label */
  icon?: LucideIcon;
  /** Action buttons */
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHero({
  label,
  headline,
  description,
  icon: Icon,
  actions,
  className,
}: PageHeroProps) {
  return (
    <div
      className={cn(
        'bg-background-card rounded-2xl border border-[#2B2B2B] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12',
        className
      )}
    >
      <div className='mx-auto max-w-[1300px]'>
        {/* Label */}
        {(label || Icon) && (
          <div className='mb-4 flex items-center gap-2'>
            {Icon && <Icon className='text-primary h-4 w-4' />}
            {label && (
              <span className='text-primary text-sm font-medium'>{label}</span>
            )}
          </div>
        )}

        {/* Headline */}
        <h1 className='max-w-2xl text-2xl leading-tight font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl'>
          {headline}
        </h1>

        {/* Description */}
        <p className='mt-3 max-w-lg text-base text-[#B5B5B5]'>{description}</p>

        {/* Actions */}
        {actions && (
          <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center'>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
