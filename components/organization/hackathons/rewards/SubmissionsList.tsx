'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubmissionListItem from './SubmissionListItem';
import { Submission } from './types';

interface SubmissionsListProps {
  submissions: Submission[];
  onRankChange: (submissionId: string, newRank: number | null) => void;
  maxRank?: number;
}

export default function SubmissionsList({
  submissions,
  onRankChange,
  maxRank = 3,
}: SubmissionsListProps) {
  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (a.rank && a.rank <= maxRank && (!b.rank || b.rank > maxRank)) return -1;
    if (b.rank && b.rank <= maxRank && (!a.rank || a.rank > maxRank)) return 1;
    if (a.rank && b.rank) return a.rank - b.rank;
    return b.score - a.score;
  });

  return (
    <>
      <div className='space-y-2'>
        {sortedSubmissions.map(submission => (
          <SubmissionListItem
            key={submission.id}
            submission={submission}
            onRankChange={onRankChange}
            maxRank={maxRank}
          />
        ))}
      </div>

      <div className='mt-6 flex justify-center'>
        <Button
          variant='outline'
          className='bg-background-card rounded-lg border-gray-800 text-white hover:bg-gray-800'
        >
          View More
          <ChevronDown className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </>
  );
}
