'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface SubmissionData {
  id: string;
  projectName: string;
  category: string;
  description?: string;
  votes: number;
  comments: number;
  logo?: string;
}

interface ProjectHeaderProps {
  submission: SubmissionData;
}

export const ProjectHeader = ({ submission }: ProjectHeaderProps) => {
  return (
    <div className='mb-8 flex items-start gap-4'>
      <div className='h-22 w-22 flex-shrink-0 overflow-hidden rounded-xl border-2 border-gray-800 bg-gray-900'>
        <Image
          src={submission.logo || '/bitmed.png'}
          alt={submission.projectName}
          width={80}
          height={80}
          className='h-full w-full object-cover'
        />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='mb-0 flex items-center gap-2'>
          <h3 className='text-xl font-medium text-white'>
            {submission.projectName}
          </h3>
          <Badge className='rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400'>
            {submission.category}
          </Badge>
        </div>
        <div className='mb-1 flex items-center gap-3 text-sm text-gray-400'>
          <span className='flex items-center gap-1'>
            <span className='font-medium text-white'>{submission.votes}</span>{' '}
            votes
          </span>
          <div className='h-1 w-1 rounded-full bg-gray-700' />
          <span className='flex items-center gap-1'>
            <span className='font-medium text-white'>
              {submission.comments}
            </span>{' '}
            comments
          </span>
        </div>
        {submission.description && (
          <p className='text-sm leading-relaxed text-gray-400'>
            {submission.description}
          </p>
        )}
      </div>
    </div>
  );
};
