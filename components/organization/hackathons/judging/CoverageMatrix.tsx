'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getJudgingCoverage,
  type JudgingCoverage,
} from '@/lib/api/hackathons/judging';
import { reportError } from '@/lib/error-reporting';
import { extractApiErrorMessage } from '@/lib/api/api';

interface CoverageMatrixProps {
  organizationId: string;
  hackathonId: string;
  /** Bumps when something on the page should trigger a re-fetch. */
  refreshKey?: number;
}

const initialOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Judges × submissions coverage heatmap for the organizer Overview
 * tab. Rows are submissions, columns are judges, cell colour signals
 * whether that judge has scored that submission. Designed to surface
 * two failure modes at a glance:
 *
 *  • Idle judges — a column of mostly grey cells means a judge hasn't
 *    started or is far behind.
 *  • Orphan submissions — a row with 0-1 scored cells can't be ranked
 *    safely (no allocator decision will be defensible).
 *
 * Collapsed by default; the organizer opens it when they want to triage
 * judging progress. No backend writes — pure read of the new coverage
 * endpoint plus a thin summary header.
 */
export default function CoverageMatrix({
  organizationId,
  hackathonId,
  refreshKey = 0,
}: CoverageMatrixProps) {
  const [data, setData] = useState<JudgingCoverage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCoverage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getJudgingCoverage(organizationId, hackathonId);
        if (cancelled) return;
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to load coverage matrix');
        }
      } catch (err) {
        if (cancelled) return;
        const msg = extractApiErrorMessage(
          err,
          'Failed to load coverage matrix'
        );
        setError(msg);
        reportError(err, {
          context: 'judging-coverage-matrix',
          organizationId,
          hackathonId,
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchCoverage();
    return () => {
      cancelled = true;
    };
  }, [organizationId, hackathonId, refreshKey]);

  const completionPct = useMemo(() => {
    if (!data) return 0;
    const { expectedScores, actualScores } = data.summary;
    if (expectedScores === 0) return 0;
    return Math.round((actualScores / expectedScores) * 100);
  }, [data]);

  // The submission view-model. Pre-computes the scored-set as a Set so
  // every cell render is an O(1) lookup instead of an array search.
  const submissionRows = useMemo(() => {
    if (!data) return [];
    return data.submissions.map(s => ({
      ...s,
      scoredSet: new Set(s.scoredBy),
    }));
  }, [data]);

  if (isLoading && !data) {
    return (
      <div className='flex items-center gap-3 rounded-lg border border-gray-900 bg-black/40 p-4'>
        <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
        <span className='text-sm text-gray-400'>Loading coverage…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center gap-3 rounded-lg border border-red-900/40 bg-red-950/20 p-4'>
        <AlertTriangle className='h-4 w-4 text-red-400' />
        <span className='text-sm text-red-300'>{error}</span>
      </div>
    );
  }

  if (!data) return null;
  if (data.summary.totalJudges === 0 || data.summary.totalSubmissions === 0) {
    // Nothing to display yet — judging hasn't started. Avoid an empty
    // skeleton that adds noise to the dashboard.
    return null;
  }

  const { summary, judges } = data;

  return (
    <div className='space-y-3 rounded-lg border border-gray-900 bg-black/40 p-5'>
      <button
        type='button'
        onClick={() => setOpen(v => !v)}
        className='flex w-full items-start justify-between gap-3 text-left'
      >
        <div>
          <h2 className='flex items-center gap-2 text-base font-bold text-gray-200'>
            <Users className='h-4 w-4 text-blue-400' />
            Coverage
            <Badge
              variant='outline'
              className={
                completionPct === 100
                  ? 'border-green-500/40 bg-green-500/10 text-green-300'
                  : completionPct >= 50
                    ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              }
            >
              {completionPct}% scored
            </Badge>
          </h2>
          <p className='mt-1 text-xs text-gray-500'>
            {summary.actualScores} of {summary.expectedScores} scores in.{' '}
            <span className='text-gray-400'>
              {summary.submissionsFullyCovered} fully scored,{' '}
              {summary.submissionsPartiallyCovered} partial,{' '}
              {summary.submissionsUncovered} unscored.
            </span>
          </p>
        </div>
        <Button variant='ghost' size='icon' className='h-7 w-7' asChild>
          <span>
            {open ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </span>
        </Button>
      </button>

      {open && (
        <div className='overflow-x-auto'>
          <table className='w-full min-w-max border-separate border-spacing-0 text-xs'>
            <thead>
              <tr>
                <th className='sticky left-0 z-10 bg-black/60 px-3 py-2 text-left font-medium text-gray-500'>
                  Submission
                </th>
                {judges.map(j => (
                  <th
                    key={j.userId}
                    className='px-2 py-2 text-center font-medium text-gray-400'
                    title={`${j.name}\nScored ${j.scoredCount} / ${summary.totalSubmissions}`}
                  >
                    <div className='flex flex-col items-center gap-1'>
                      <span className='flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[10px] font-semibold text-gray-300'>
                        {initialOf(j.name)}
                      </span>
                      <span className='text-[10px] whitespace-nowrap text-gray-500'>
                        {j.scoredCount}/{summary.totalSubmissions}
                      </span>
                    </div>
                  </th>
                ))}
                <th className='px-2 py-2 text-center font-medium text-gray-500'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {submissionRows.map(sub => (
                <tr key={sub.submissionId} className='hover:bg-white/[0.02]'>
                  <td className='sticky left-0 z-10 max-w-[240px] truncate bg-black/60 px-3 py-2 text-gray-200'>
                    {sub.projectName}
                  </td>
                  {judges.map(j => {
                    const scored = sub.scoredSet.has(j.userId);
                    return (
                      <td
                        key={j.userId}
                        className='px-2 py-2 text-center'
                        title={
                          scored
                            ? `${j.name} scored "${sub.projectName}"`
                            : `${j.name} has not scored "${sub.projectName}"`
                        }
                      >
                        <div
                          className={`mx-auto h-6 w-6 rounded ${
                            scored
                              ? 'bg-green-500/40'
                              : 'border border-gray-700/60 bg-gray-800'
                          }`}
                        />
                      </td>
                    );
                  })}
                  <td className='px-2 py-2 text-center'>
                    {sub.isCovered ? (
                      <CheckCircle2 className='mx-auto h-4 w-4 text-green-400' />
                    ) : sub.scoredCount === 0 ? (
                      <span className='text-[10px] font-medium text-red-400'>
                        Orphan
                      </span>
                    ) : (
                      <span className='text-[10px] text-amber-400'>
                        {sub.scoredCount}/{summary.totalJudges}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
