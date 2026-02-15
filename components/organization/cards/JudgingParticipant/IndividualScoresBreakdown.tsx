'use client';

import React, { useState, useEffect } from 'react';
import {
  getSubmissionScores,
  type IndividualJudgeScore,
} from '@/lib/api/hackathons/judging';
import { Loader2, ChevronDown, ChevronUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface IndividualScoresBreakdownProps {
  organizationId: string;
  hackathonId: string;
  participantId: string;
}

const IndividualScoresBreakdown = ({
  organizationId,
  hackathonId,
  participantId,
}: IndividualScoresBreakdownProps) => {
  const [scores, setScores] = useState<IndividualJudgeScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJudges, setExpandedJudges] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const fetchScores = async () => {
      setIsLoading(true);
      try {
        const res = await getSubmissionScores(
          organizationId,
          hackathonId,
          participantId
        );
        if (res.success && Array.isArray(res.data)) {
          setScores(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch individual scores:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, [organizationId, hackathonId, participantId]);

  const toggleExpand = (judgeId: string) => {
    setExpandedJudges(prev => ({
      ...prev,
      [judgeId]: !prev[judgeId],
    }));
  };

  const avgTotalScore =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length
      : 0;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-6'>
        <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className='py-6 text-center text-sm text-gray-500 italic'>
        No individual scores available yet.
      </div>
    );
  }

  return (
    <div className='mt-4 space-y-3 border-t border-gray-900 pt-4'>
      <div className='mb-2 flex items-center justify-between'>
        <h6 className='text-xs font-semibold tracking-wider text-gray-400 uppercase'>
          Judge Scores Breakdown
        </h6>
        <div className='flex gap-2'>
          {scores.some(s => Math.abs(s.totalScore - avgTotalScore) > 2) && (
            <Badge
              variant='outline'
              className='animate-pulse border-red-500/20 bg-red-500/10 text-[10px] text-red-500'
            >
              Scoring Discrepancy Detected
            </Badge>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        {scores.map(score => {
          const isDiscrepant = Math.abs(score.totalScore - avgTotalScore) > 2;

          return (
            <div
              key={score.judgeId}
              className={cn(
                'overflow-hidden rounded border bg-white/5 transition-colors',
                isDiscrepant
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-white/5'
              )}
            >
              <div
                className='flex cursor-pointer items-center justify-between p-2 transition-colors hover:bg-white/5'
                onClick={() => toggleExpand(score.judgeId)}
              >
                <div className='flex items-center gap-2'>
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gray-800'>
                    <User className='h-3 w-3 text-gray-400' />
                  </div>
                  <span className='text-sm font-medium text-gray-200'>
                    {score.judgeName}
                  </span>
                  {isDiscrepant && (
                    <Badge className='ml-2 h-4 border-red-500/30 bg-red-500/20 px-1.5 text-[9px] text-red-400'>
                      Outlier
                    </Badge>
                  )}
                </div>
                <div className='flex items-center gap-3'>
                  <Badge
                    variant='outline'
                    className='bg-primary/5 text-primary border-primary/20 text-[10px]'
                  >
                    Total: {score.totalScore.toFixed(1)}
                  </Badge>
                  {expandedJudges[score.judgeId] ? (
                    <ChevronUp className='h-4 w-4 text-gray-500' />
                  ) : (
                    <ChevronDown className='h-4 w-4 text-gray-500' />
                  )}
                </div>
              </div>

              {expandedJudges[score.judgeId] && (
                <div className='space-y-4 border-t border-white/5 bg-black/20 p-3'>
                  {score.comment && (
                    <div className='mb-2'>
                      <label className='mb-1 flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase'>
                        <div className='bg-primary h-1 w-1 rounded-full' />
                        Expert Feedback
                      </label>
                      <p className='rounded border border-white/5 bg-white/5 p-3 text-sm text-gray-200 italic'>
                        "{score.comment}"
                      </p>
                    </div>
                  )}
                  <div className='grid grid-cols-1 gap-4'>
                    <div>
                      <label className='mb-2 block text-[10px] font-bold text-gray-400 uppercase'>
                        Criteria Breakdown
                      </label>
                      <div className='grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2'>
                        {score.criteriaScores.map((c, idx) => (
                          <div key={idx} className='space-y-1.5'>
                            <div className='flex items-center justify-between text-xs'>
                              <span className='max-w-[150px] truncate text-gray-400'>
                                {c.criterionTitle || c.criterionId}{' '}
                              </span>
                              <span className='font-mono font-bold text-white'>
                                {c.score}
                              </span>
                            </div>
                            <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-800'>
                              <div
                                className={cn(
                                  'h-full transition-all',
                                  getScoreColor(c.score)
                                )}
                                style={{ width: `${c.score * 10}%` }}
                              />
                            </div>
                            {c.comment && (
                              <p className='mt-0.5 text-[10px] leading-tight text-gray-500 italic'>
                                {c.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IndividualScoresBreakdown;
