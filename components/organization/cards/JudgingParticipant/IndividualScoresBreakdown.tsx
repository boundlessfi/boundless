'use client';

import React, { useState, useEffect } from 'react';
import {
  getSubmissionScores,
  type IndividualJudgeScore,
} from '@/lib/api/hackathons/judging';
import { Loader2, ChevronDown, ChevronUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { reportError } from '@/lib/error-reporting';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface IndividualScoresBreakdownProps {
  organizationId: string;
  hackathonId: string;
  participantId: string;
  initialScores?: Array<{
    judgeId: string;
    judgeName: string;
    score: number;
  }>;
}

interface JudgeScore {
  judgeId: string;
  judgeName: string;
  totalScore: number;
  score?: number;
  comment?: string;
  criteriaScores?: Array<{
    criterionId: string;
    criterionTitle?: string;
    score: number;
    comment?: string;
  }>;
}

const IndividualScoresBreakdown = ({
  organizationId,
  hackathonId,
  participantId,
  initialScores,
}: IndividualScoresBreakdownProps) => {
  const [scores, setScores] = useState<JudgeScore[]>([]);
  const [isLoading, setIsLoading] = useState(!initialScores);
  const [expandedJudges, setExpandedJudges] = useState<Record<string, boolean>>(
    {}
  );

  // Helper to normalize initial scores to JudgeScore shape
  const normalizeInitialScores = (
    scores: NonNullable<IndividualScoresBreakdownProps['initialScores']>
  ): JudgeScore[] => {
    return scores.map(s => ({
      judgeId: s.judgeId,
      judgeName: s.judgeName,
      totalScore: s.score,
      score: s.score,
    }));
  };

  useEffect(() => {
    // Always fetch detailed scores to get criteria breakdown
    // Even if initialScores are provided, they don't include criteriaScores
    // initialScores is only used as a fallback if fetch fails, so we don't need it in deps
    const fetchScores = async () => {
      setIsLoading(true);
      try {
        const res = await getSubmissionScores(
          organizationId,
          hackathonId,
          participantId
        );
        if (res.success && Array.isArray(res.data)) {
          // Map API response to internal state shape
          const mappedScores: JudgeScore[] = res.data.map((item: any) => ({
            judgeId: item.judgeId,
            judgeName: item.judgeName,
            // Ensure totalScore is available, fallback to sum of criteria scores if missing
            totalScore:
              item.totalScore ??
              item.criteriaScores?.reduce(
                (sum: number, c: any) => sum + (c.score || 0),
                0
              ) ??
              0,
            score: item.totalScore, // Keep score for backward compatibility if needed
            comment: item.comment,
            criteriaScores: item.criteriaScores,
          }));
          setScores(mappedScores);
        } else if (initialScores) {
          // Fallback to initialScores if API fails
          setScores(normalizeInitialScores(initialScores));
        }
      } catch (err) {
        reportError(err, {
          context: 'judging-individualScores',
          participantId,
        });
        // Fallback to initialScores if fetch fails
        if (initialScores) {
          setScores(normalizeInitialScores(initialScores));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, hackathonId, participantId]);

  const toggleExpand = (judgeId: string) => {
    setExpandedJudges(prev => ({
      ...prev,
      [judgeId]: !prev[judgeId],
    }));
  };

  const avgTotalScore =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + (s.totalScore ?? 0), 0) / scores.length
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant='outline'
                  className='animate-pulse cursor-help border-red-500/20 bg-red-500/10 text-[10px] text-red-500'
                >
                  Scoring Discrepancy Detected
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                One or more judges&apos; scores deviate significantly (&gt;2
                points) from the average. This may indicate differing
                interpretations.
              </TooltipContent>
            </Tooltip>
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className='ml-2 h-4 cursor-help border-red-500/30 bg-red-500/20 px-1.5 text-[9px] text-red-400'>
                          Outlier
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        This judge's score deviates significantly from the
                        average, indicating a different perspective on this
                        submission.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className='flex items-center gap-3'>
                  <Badge
                    variant='outline'
                    className='bg-primary/5 text-primary border-primary/20 text-[10px]'
                  >
                    Total:{' '}
                    {typeof score.totalScore === 'number'
                      ? score.totalScore.toFixed(1)
                      : score.score?.toFixed(1) || '0.0'}
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
                      {score.criteriaScores &&
                        score.criteriaScores.length > 0 && (
                          <div className='grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2'>
                            {score.criteriaScores.map(c => (
                              <div key={c.criterionId} className='space-y-1.5'>
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
                                    // Normalize to 100% (assuming max score is 10)
                                    style={{
                                      width: `${Math.min((c.score / 10) * 100, 100)}%`,
                                    }}
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
                        )}
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
