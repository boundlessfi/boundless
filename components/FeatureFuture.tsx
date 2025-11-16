'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FutureFeatureProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
  disabledClass?: string;
  badgeClassName?: string;
}

export function FutureFeature({
  children,
  label = 'Coming Soon',
  className,
  disabledClass = 'pointer-events-none opacity-50',
  badgeClassName,
}: FutureFeatureProps) {
  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <div className={disabledClass}>{children}</div>

      <Badge
        variant='secondary'
        className={cn(
          'py-0.2 absolute -top-3.5 -right-2 bg-amber-50/45 px-1 text-[10px]',
          badgeClassName
        )}
      >
        {label}
      </Badge>
    </div>
  );
}
