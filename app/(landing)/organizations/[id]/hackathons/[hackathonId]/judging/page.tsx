'use client';

import { useEffect, useState, useCallback } from 'react';
import MetricsCard from '@/components/organization/cards/MetricsCard';
import JudgingParticipant from '@/components/organization/cards/JudgingParticipant';
import { useParams } from 'next/navigation';
import {
  getJudgingSubmissions,
  type JudgingSubmission,
} from '@/lib/api/hackathons';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function JudgingPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const [submissions, setSubmissions] = useState<JudgingSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });

  const fetchSubmissions = useCallback(
    async (pageNum = 1) => {
      if (!organizationId || !hackathonId) return;

      setIsLoading(true);
      try {
        const response = await getJudgingSubmissions(
          organizationId,
          hackathonId,
          pageNum,
          10
        );

        if (response.success) {
          setSubmissions(response.data);
          setPagination(response.pagination);
          setPage(pageNum);
        }
      } catch {
        toast.error('Failed to load submissions');
      } finally {
        setIsLoading(false);
      }
    },
    [organizationId, hackathonId]
  );

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleSuccess = () => {
    fetchSubmissions(page);
  };

  // Calculate statistics
  const totalSubmissions = pagination.totalItems;
  const averageScore =
    submissions.length > 0
      ? submissions.reduce((sum, sub) => {
          return sum + (sub.averageScore || 0);
        }, 0) / submissions.length
      : 0;
  const totalJudges = new Set(
    submissions.flatMap(sub => sub.scores.map(score => score.judge._id))
  ).size;

  return (
    <div className='bg-background min-h-screen space-y-4 p-8 text-white'>
      <div className='flex gap-4'>
        <MetricsCard
          title='Shortlisted Submissions'
          value={totalSubmissions}
          subtitle={`${submissions.length} displayed`}
        />
        <MetricsCard
          title='Average Score'
          value={averageScore > 0 ? averageScore.toFixed(2) : 'N/A'}
          subtitle={
            submissions.length > 0 ? 'Across all submissions' : undefined
          }
        />
        <MetricsCard
          title='Active Judges'
          value={totalJudges}
          subtitle='Judges who have graded'
        />
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
        </div>
      ) : submissions.length === 0 ? (
        <div className='bg-background/8 rounded-lg border border-gray-900 p-8 text-center text-gray-400'>
          No shortlisted submissions found
        </div>
      ) : (
        <>
          <div className='flex flex-col gap-4'>
            {submissions.map(submission => (
              <JudgingParticipant
                key={submission.participant._id}
                submission={submission}
                organizationId={organizationId}
                hackathonId={hackathonId}
                onSuccess={handleSuccess}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 pt-4'>
              <Button
                variant='outline'
                onClick={() => fetchSubmissions(page - 1)}
                disabled={!pagination.hasPrev || isLoading}
                className='border-gray-700 text-gray-400 hover:bg-gray-800'
              >
                Previous
              </Button>
              <span className='text-sm text-gray-400'>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant='outline'
                onClick={() => fetchSubmissions(page + 1)}
                disabled={!pagination.hasNext || isLoading}
                className='border-gray-700 text-gray-400 hover:bg-gray-800'
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
