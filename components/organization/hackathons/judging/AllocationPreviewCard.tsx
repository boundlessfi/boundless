'use client';

import { useEffect, useState } from 'react';
import {
  Trophy,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getAllocationPreview,
  type AllocationPreview,
} from '@/lib/api/hackathons/judging';
import { reportError } from '@/lib/error-reporting';
import { extractApiErrorMessage } from '@/lib/api/api';

interface AllocationPreviewCardProps {
  organizationId: string;
  hackathonId: string;
  /**
   * Bumps when judging results refresh. The preview re-fetches when this
   * changes so the organizer always sees an up-to-date allocation.
   */
  refreshKey?: number;
}

const formatPrize = (amount?: string, currency?: string): string | null => {
  if (!amount) return null;
  const c = currency || 'USDC';
  return c.length === 1 ? `${c}${amount}` : `${amount} ${c}`;
};

/**
 * Renders the read-only allocator dry-run for the organizer dashboard.
 * Sits above the Publish button on the Results tab and lets the
 * organizer see *exactly* what publish-results would commit, including
 * EXCLUSIVE stacking effects (a track leader can lose if they also win
 * overall). Also surfaces the publish gates (deadline, completeness,
 * partner-allocation) so blockers are visible without an attempted
 * publish.
 */
export default function AllocationPreviewCard({
  organizationId,
  hackathonId,
  refreshKey = 0,
}: AllocationPreviewCardProps) {
  const [data, setData] = useState<AllocationPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchPreview = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getAllocationPreview(organizationId, hackathonId);
        if (cancelled) return;
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to load allocation preview');
        }
      } catch (err) {
        if (cancelled) return;
        const msg = extractApiErrorMessage(
          err,
          'Failed to load allocation preview'
        );
        setError(msg);
        reportError(err, {
          context: 'judging-allocation-preview',
          organizationId,
          hackathonId,
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchPreview();
    return () => {
      cancelled = true;
    };
  }, [organizationId, hackathonId, refreshKey]);

  if (isLoading && !data) {
    return (
      <div className='flex items-center gap-3 rounded-lg border border-gray-900 bg-black/40 p-4'>
        <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
        <span className='text-sm text-gray-400'>
          Computing allocation preview…
        </span>
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

  const { overall, tracks, gates } = data;

  // Hide when there's nothing to preview yet — no overall placements
  // configured AND no track tiers. Avoids rendering an empty card on
  // hackathons that haven't set up prize tiers.
  if (overall.length === 0 && tracks.length === 0) return null;

  const blockers: string[] = [];
  if (!gates.submissionDeadlinePassed) {
    blockers.push('Submission deadline has not passed yet.');
  }
  if (!gates.complete) {
    blockers.push(
      `${gates.incompleteSubmissionCount} submission${
        gates.incompleteSubmissionCount === 1 ? '' : 's'
      } missing at least one judge's score.`
    );
  }
  if (gates.reviewedCount === 0) {
    blockers.push('No submissions have been reviewed yet.');
  }
  if (gates.unallocatedPartnerContributionAmount > 0.0000001) {
    blockers.push(
      `${gates.unallocatedPartnerContributionAmount.toFixed(2)} ${
        gates.currency
      } of partner contributions are unallocated.`
    );
  }

  const canPublish = blockers.length === 0;

  return (
    <div className='space-y-4 rounded-lg border border-blue-900/40 bg-blue-950/10 p-5'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='flex items-center gap-2 text-base font-bold text-blue-300'>
            <RefreshCw className='h-4 w-4' />
            Allocator preview
          </h2>
          <p className='mt-1 text-xs text-gray-500'>
            This is exactly what will be stamped on publish. EXCLUSIVE stacking
            applied — one award per submission. Refreshes when scores change.
          </p>
        </div>
        <Badge
          variant='outline'
          className={
            canPublish
              ? 'border-green-500/40 bg-green-500/10 text-green-300'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
          }
        >
          {canPublish ? (
            <>
              <CheckCircle2 className='mr-1 h-3 w-3' />
              Ready to publish
            </>
          ) : (
            <>
              <AlertTriangle className='mr-1 h-3 w-3' />
              {blockers.length} blocker{blockers.length === 1 ? '' : 's'}
            </>
          )}
        </Badge>
      </div>

      {blockers.length > 0 && (
        <div className='rounded border border-amber-500/30 bg-amber-950/20 p-3'>
          <div className='mb-2 flex items-center gap-2 text-xs font-semibold text-amber-300'>
            <AlertTriangle className='h-3.5 w-3.5' />
            Cannot publish yet
          </div>
          <ul className='space-y-1 text-xs text-amber-200/80'>
            {blockers.map((b, i) => (
              <li key={i} className='ml-4 list-disc'>
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Overall placements */}
      {overall.length > 0 && (
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-400 uppercase'>
            <Trophy className='h-3.5 w-3.5 text-yellow-500' />
            Overall placements
          </div>
          <div className='overflow-hidden rounded border border-gray-900'>
            <table className='w-full text-sm'>
              <thead className='bg-black/40 text-xs text-gray-500'>
                <tr>
                  <th className='px-3 py-2 text-left font-medium'>Rank</th>
                  <th className='px-3 py-2 text-left font-medium'>Project</th>
                  <th className='px-3 py-2 text-right font-medium'>Score</th>
                  <th className='px-3 py-2 text-right font-medium'>Prize</th>
                  <th className='px-3 py-2 text-right font-medium'>Source</th>
                </tr>
              </thead>
              <tbody>
                {overall.map(o => (
                  <tr
                    key={o.submissionId}
                    className='border-t border-gray-900/60'
                  >
                    <td className='px-3 py-2 text-yellow-500'>#{o.rank}</td>
                    <td className='px-3 py-2 text-gray-200'>{o.projectName}</td>
                    <td className='px-3 py-2 text-right text-gray-400'>
                      {o.averageScore.toFixed(2)}
                    </td>
                    <td className='px-3 py-2 text-right text-gray-300'>
                      {formatPrize(o.prizeAmount, o.currency) ?? '—'}
                    </td>
                    <td className='px-3 py-2 text-right text-xs'>
                      {o.isOverride ? (
                        <span className='text-purple-400'>Override</span>
                      ) : (
                        <span className='text-gray-500'>Computed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Track winners */}
      {tracks.length > 0 && (
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-400 uppercase'>
            <Layers className='h-3.5 w-3.5 text-blue-400' />
            Track winners
          </div>
          <div className='space-y-2'>
            {tracks.map(t => (
              <div
                key={t.trackId}
                className='rounded border border-gray-900 bg-black/30 p-3'
              >
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-white'>
                      {t.trackName}
                    </span>
                    {formatPrize(t.prizeAmount, t.currency) && (
                      <Badge
                        variant='outline'
                        className='border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                      >
                        {formatPrize(t.prizeAmount, t.currency)}
                      </Badge>
                    )}
                  </div>
                  {t.skippedReason && (
                    <Badge
                      variant='outline'
                      className='border-amber-500/30 bg-amber-500/10 text-amber-400'
                    >
                      <AlertTriangle className='mr-1 h-3 w-3' />
                      {t.skippedReason === 'NO_ENTRIES'
                        ? 'No opt-ins'
                        : 'No scored entries'}
                    </Badge>
                  )}
                </div>
                {t.winner ? (
                  <div className='mt-2 flex items-center justify-between text-sm'>
                    <span className='text-gray-200'>
                      Winner:{' '}
                      <span className='font-medium text-white'>
                        {t.winner.projectName}
                      </span>
                    </span>
                    <span className='text-xs text-gray-500'>
                      score {t.winner.averageScore.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <p className='mt-2 text-xs text-amber-300/70'>
                    This track will not pay out — fix before publish.
                  </p>
                )}
                {t.runnersUp.length > 0 && (
                  <div className='mt-2 text-xs text-gray-500'>
                    Runners-up:{' '}
                    {t.runnersUp.map((r, i) => (
                      <span key={r.submissionId}>
                        {r.projectName} ({r.averageScore.toFixed(2)})
                        {i < t.runnersUp.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className='flex items-center gap-2 text-xs text-gray-500'>
          <Loader2 className='h-3 w-3 animate-spin' />
          Refreshing…
        </div>
      )}
    </div>
  );
}

// `Button` import retained for future actions (e.g. an inline "refresh"
// button) without forcing a follow-up import edit. Strip if unused at
// the next polish pass.
void Button;
