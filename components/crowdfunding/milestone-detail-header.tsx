'use client';

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Milestone } from '@/features/projects/types';

interface MilestoneDetailHeaderProps {
  title: string;
  milestone: Milestone;
  campaignSlug: string;
  backLink: string;
  onSubmitEvidence?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'approved':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'in progress':
    case 'in-progress':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'submitted':
    case 'in-review':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'pending':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'rejected':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export function MilestoneDetailHeader({
  title,
  milestone,
  backLink,
  onSubmitEvidence,
}: MilestoneDetailHeaderProps) {
  return (
    <div className='space-y-4 border-b pb-8'>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='sm' asChild className='h-8 w-8 p-0'>
          <Link href={backLink}>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div className='flex-1'>
          <h1 className='text-3xl font-bold tracking-tight'>
            {milestone.name}
          </h1>
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Badge
            className={getStatusColor(milestone.reviewStatus)}
            variant='outline'
          >
            {milestone.reviewStatus}
          </Badge>
          <p className='text-muted-foreground text-sm'>{title}</p>
        </div>
        {onSubmitEvidence && (
          <Button onClick={onSubmitEvidence} className='h-9'>
            <FileText className='mr-2 h-4 w-4' />
            Submit Evidence
          </Button>
        )}
      </div>
    </div>
  );
}
