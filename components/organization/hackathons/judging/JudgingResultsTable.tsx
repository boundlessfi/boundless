'use client';

import React from 'react';
import { JudgingResult } from '@/lib/api/hackathons/judging';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Trophy, Medal, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import IndividualScoresBreakdown from '@/components/organization/cards/JudgingParticipant/IndividualScoresBreakdown';
import AggregatedCriteriaBreakdown from './AggregatedCriteriaBreakdown';
import { JudgingCriterion } from '@/lib/api/hackathons/judging';

interface JudgingResultsTableProps {
  results: JudgingResult[];
  organizationId: string;
  hackathonId: string;
  totalJudges?: number;
  criteria?: JudgingCriterion[];
}

// Helper function to safely extract score from JudgingResult
const getScore = (result: JudgingResult): number => {
  return Number(result.averageScore ?? 0);
};

const JudgingResultsTable = ({
  results,
  organizationId,
  hackathonId,
  totalJudges,
  criteria = [],
}: JudgingResultsTableProps) => {
  const [expandedRows, setExpandedRows] = React.useState<
    Record<string, boolean>
  >({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sortedResults = React.useMemo(() => {
    return [...results].sort((a, b) => {
      return getScore(b) - getScore(a);
    });
  }, [results]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className='h-4 w-4 text-yellow-500' />;
      case 1:
        return <Medal className='h-4 w-4 text-gray-300' />;
      case 2:
        return <Award className='h-4 w-4 text-amber-600' />;
      default:
        return null;
    }
  };

  return (
    <div className='bg-background/50 overflow-hidden rounded-md border border-gray-900'>
      <Table>
        <TableHeader>
          <TableRow className='border-gray-900 bg-white/5 hover:bg-transparent'>
            <TableHead className='w-20 text-gray-400'>Rank</TableHead>
            <TableHead className='text-gray-400'>Project</TableHead>
            <TableHead className='text-right text-gray-400'>
              Avg. Score
            </TableHead>
            <TableHead className='text-right text-gray-400'>
              Participation
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((result, index) => {
            const isFullyGraded =
              result.isComplete ||
              (result.expectedJudgeCount > 0 &&
                result.judgeCount >= result.expectedJudgeCount);

            return (
              <React.Fragment key={result.submissionId}>
                <TableRow
                  className='cursor-pointer border-gray-900 transition-colors hover:bg-white/5'
                  onClick={() => toggleRow(result.submissionId)}
                >
                  <TableCell className='font-medium text-white'>
                    <div className='flex items-center gap-2'>
                      {getRankIcon(index)}
                      <span>#{result.rank ?? index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className='font-medium text-white'>
                    <div className='flex flex-col gap-1'>
                      <span>{result.projectName}</span>
                      <div className='flex flex-wrap gap-1'>
                        {result.prize && (
                          <Badge
                            variant='outline'
                            className='h-4 border-amber-500/50 bg-amber-500/10 py-0 text-[10px] text-amber-400'
                          >
                            Prize: {result.prize}
                          </Badge>
                        )}
                        {result.isPending && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant='outline'
                                className='h-4 cursor-help border-yellow-500/50 bg-yellow-500/10 py-0 text-[10px] text-yellow-500'
                              >
                                Pending
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Some judges have scored this submission, but
                              others are still missing
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {!result.isComplete && !result.isPending && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant='outline'
                                className='h-4 cursor-help border-blue-500/50 bg-blue-500/10 py-0 text-[10px] text-blue-500'
                              >
                                Incomplete
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Not all assigned judges have submitted their
                              scores yet
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {result.hasDisagreement && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant='outline'
                                className='h-4 cursor-help border-red-500/50 bg-red-500/10 py-0 text-[10px] text-red-500'
                              >
                                Disagreement
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              ⚠️ High variance detected: The gap between highest
                              and lowest judge scores is greater than 3.0.
                              Review recommended.
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <Badge
                        variant='outline'
                        className='bg-primary/10 text-primary border-primary/20 font-mono'
                      >
                        {getScore(result).toFixed(2)}
                      </Badge>
                      {expandedRows[result.submissionId] ? (
                        <ChevronUp className='h-4 w-4 text-gray-500' />
                      ) : (
                        <ChevronDown className='h-4 w-4 text-gray-500' />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <Badge
                        variant='secondary'
                        className={cn(
                          'border-gray-700 bg-gray-800 font-mono text-[10px] text-gray-400',
                          isFullyGraded &&
                            'border-green-500/20 bg-green-500/10 text-green-500'
                        )}
                      >
                        {result.judgeCount} /{' '}
                        {result.expectedJudgeCount ?? totalJudges ?? '?'}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedRows[result.submissionId] && (
                  <TableRow className='border-gray-900 bg-black/20'>
                    <TableCell colSpan={4} className='p-0'>
                      <div className='p-6 pt-2'>
                        {/* Aggregated Criteria Breakdown */}
                        {result.criteriaBreakdown &&
                          result.criteriaBreakdown.length > 0 && (
                            <AggregatedCriteriaBreakdown
                              criteriaBreakdown={result.criteriaBreakdown}
                              criteria={criteria}
                            />
                          )}

                        {/* Individual Judge Scores */}
                        <IndividualScoresBreakdown
                          organizationId={organizationId}
                          hackathonId={hackathonId}
                          participantId={result.submissionId}
                          initialScores={result.individualScores}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
          {results.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className='h-48 text-center text-gray-500 italic'
              >
                No judging results available yet. Results appear once judges
                submit scores.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default JudgingResultsTable;
