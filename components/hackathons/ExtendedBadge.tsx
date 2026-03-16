import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExtendedBadgeProps {
  submissionDeadline?: string;
  submissionDeadlineOriginal?: string;
  className?: string;
}

export const ExtendedBadge = ({
  submissionDeadline,
  submissionDeadlineOriginal,
  className,
}: ExtendedBadgeProps) => {
  const isExtended =
    submissionDeadlineOriginal &&
    submissionDeadline &&
    new Date(submissionDeadline) > new Date(submissionDeadlineOriginal);

  if (!isExtended) return null;

  return (
    <Badge
      variant='outline'
      className={cn(
        'border-red-500/30 bg-red-500/10 text-[10px] font-bold tracking-wider text-red-500 uppercase',
        className
      )}
    >
      Extended
    </Badge>
  );
};
