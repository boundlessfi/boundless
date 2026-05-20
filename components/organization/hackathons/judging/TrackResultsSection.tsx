'use client';

import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Trophy,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { HackathonTrack } from '@/lib/api/hackathons/tracks';
import type {
  JudgingCriterion,
  JudgingResult,
} from '@/lib/api/hackathons/judging';
import JudgingResultsTable from './JudgingResultsTable';

interface TrackResultsSectionProps {
  /** All non-archived tracks for the hackathon. */
  tracks: HackathonTrack[];
  /** Full aggregated results list. Filtered per-track inside. */
  results: JudgingResult[];
  /** Total active judges, used by the inner table to compute coverage. */
  totalJudges?: number;
  /** Configured judging criteria for per-criterion drill-down. */
  criteria?: JudgingCriterion[];
  /** Organizer override capability — controlled by parent. */
  canManage?: boolean;
  /** Existing winner overrides, threaded through to the inner table. */
  winnerOverrides?: Record<string, number>;
  /**
   * Map of trackId → bound prize tier (e.g. "$2,000"). When present, the
   * section header shows the prize amount next to the track name. Empty
   * map is fine — tracks without a bound prize just don't show one.
   */
  prizeByTrackId?: Record<string, string>;
  organizationId: string;
  hackathonId: string;
}

/**
 * Per-track standings for the organizer dashboard. Renders one
 * collapsible section per non-archived track, scoped to submissions
 * opted into that track (`result.trackIds`). The leading submission is
 * highlighted as the current allocator pick — but it's a soft preview,
 * not authoritative. EXCLUSIVE stacking applied at publish time may
 * promote a runner-up if the current leader wins an overall placement
 * or another track. The Phase 2 allocator preview surfaces that.
 */
export default function TrackResultsSection({
  tracks,
  results,
  totalJudges,
  criteria,
  canManage,
  winnerOverrides,
  prizeByTrackId,
  organizationId,
  hackathonId,
}: TrackResultsSectionProps) {
  // Default-collapsed; the organizer expands the tracks they care about.
  // Tracks with no opted-in submissions are still rendered so the
  // organizer notices the gap before publish.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const resultsByTrack = useMemo(() => {
    const map = new Map<string, JudgingResult[]>();
    for (const r of results) {
      const trackIds = r.trackIds ?? [];
      for (const trackId of trackIds) {
        const list = map.get(trackId) ?? [];
        list.push(r);
        map.set(trackId, list);
      }
    }
    // Sort each list by averageScore descending so the leader is index 0.
    for (const [k, v] of map.entries()) {
      map.set(
        k,
        [...v].sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0))
      );
    }
    return map;
  }, [results]);

  const visibleTracks = useMemo(
    () =>
      [...tracks]
        .filter(t => !t.isArchived)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [tracks]
  );

  if (visibleTracks.length === 0) return null;

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Layers className='h-5 w-5 text-blue-400' />
        <h2 className='text-lg font-bold text-gray-200'>Per-Track Standings</h2>
        <span className='text-xs text-gray-500'>
          ({visibleTracks.length} track{visibleTracks.length === 1 ? '' : 's'})
        </span>
      </div>

      <p className='text-xs text-gray-500'>
        Each section shows submissions opted into that track, sorted by their
        average score across all judges. The highlighted row is the current
        leader — at publish time, EXCLUSIVE stacking may promote a runner-up if
        the leader wins an overall placement or another track.
      </p>

      <div className='space-y-3'>
        {visibleTracks.map(track => {
          const trackResults = resultsByTrack.get(track.id) ?? [];
          const isOpen = !!expanded[track.id];
          const leader = trackResults[0];
          const prize = prizeByTrackId?.[track.id];
          const noEntries = trackResults.length === 0;

          return (
            <div
              key={track.id}
              className='overflow-hidden rounded-lg border border-gray-900 bg-black/40'
            >
              <button
                type='button'
                onClick={() =>
                  setExpanded(prev => ({
                    ...prev,
                    [track.id]: !prev[track.id],
                  }))
                }
                className='flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.02]'
              >
                <div className='flex min-w-0 flex-1 items-center gap-3'>
                  <Trophy className='h-4 w-4 shrink-0 text-yellow-500' />
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='truncate text-sm font-semibold text-white'>
                        {track.name}
                      </span>
                      {prize && (
                        <Badge
                          variant='outline'
                          className='border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                        >
                          {prize}
                        </Badge>
                      )}
                      <Badge
                        variant='outline'
                        className='border-gray-800 text-gray-400'
                      >
                        {trackResults.length} entr
                        {trackResults.length === 1 ? 'y' : 'ies'}
                      </Badge>
                      {noEntries && (
                        <Badge
                          variant='outline'
                          className='border-amber-500/30 bg-amber-500/10 text-amber-400'
                        >
                          <AlertTriangle className='mr-1 h-3 w-3' />
                          No opted-in submissions
                        </Badge>
                      )}
                    </div>
                    {leader && (
                      <div className='mt-1 truncate text-xs text-gray-500'>
                        Currently leading:{' '}
                        <span className='text-gray-300'>
                          {leader.projectName}
                        </span>{' '}
                        ({leader.averageScore?.toFixed(2)})
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 text-gray-400'
                  asChild
                >
                  <span>
                    {isOpen ? (
                      <ChevronUp className='h-4 w-4' />
                    ) : (
                      <ChevronDown className='h-4 w-4' />
                    )}
                  </span>
                </Button>
              </button>

              {isOpen && (
                <div className='border-t border-gray-900 bg-black/20 p-4'>
                  {noEntries ? (
                    <div className='py-6 text-center text-xs text-gray-500'>
                      No submissions have opted into this track yet. Use the{' '}
                      <span className='text-gray-300'>
                        Settings → Tracks → Opt in all
                      </span>{' '}
                      action if you want to retrofit existing submissions.
                    </div>
                  ) : (
                    <JudgingResultsTable
                      results={trackResults}
                      organizationId={organizationId}
                      hackathonId={hackathonId}
                      totalJudges={totalJudges}
                      criteria={criteria}
                      canManage={canManage}
                      winnerOverrides={winnerOverrides}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
