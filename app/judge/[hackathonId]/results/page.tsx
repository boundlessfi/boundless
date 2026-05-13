'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Trophy } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useJudgeResults } from '@/hooks/judge/use-judge-queries';
import { formatJudgeDate } from '@/components/judge/utils';
import type { JudgeResultItem } from '@/lib/api/judge';
import { cn } from '@/lib/utils';

export default function JudgeResultsPage() {
  return (
    <AuthGuard redirectTo='/auth?mode=signin'>
      <ResultsPage />
    </AuthGuard>
  );
}

function ResultsPage() {
  const params = useParams<{ hackathonId: string }>();
  const hackathonId = params?.hackathonId ?? '';
  const { data, isPending, isError, error } = useJudgeResults(hackathonId);

  if (isPending) {
    return (
      <div className='space-y-4'>
        <div className='h-8 w-48 animate-pulse rounded bg-white/5' />
        <div className='h-40 animate-pulse rounded-2xl bg-white/5' />
        <div className='h-72 animate-pulse rounded-2xl bg-white/5' />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <p className='text-sm text-red-400'>
        {error instanceof Error
          ? error.message
          : 'Could not load results for this hackathon.'}
      </p>
    );
  }

  const ranked = [...data.results].sort((a, b) => {
    const ra = a.rank ?? a.computedRank ?? 9999;
    const rb = b.rank ?? b.computedRank ?? 9999;
    return ra - rb;
  });
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <div className='space-y-6'>
      <header>
        <Link
          href={`/judge/${hackathonId}`}
          className='text-xs text-gray-500 hover:text-gray-300'
        >
          ← Hackathon overview
        </Link>
        <div className='mt-2 flex items-center gap-3'>
          <span className='inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-700/40 bg-amber-900/30 text-amber-300'>
            <Trophy className='h-4 w-4' />
          </span>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Final results
            </h1>
            <p className='text-xs text-gray-500'>
              {data.resultsPublished
                ? `Published ${data.resultsPublishedAt ? formatJudgeDate(data.resultsPublishedAt) : ''}`
                : 'Not yet published.'}
            </p>
          </div>
        </div>
      </header>

      {!data.resultsPublished ? (
        <div className='rounded-2xl border border-dashed border-white/10 bg-[#0c0c0c] p-12 text-center'>
          <Trophy className='mx-auto h-7 w-7 text-gray-700' />
          <p className='mt-3 text-base font-medium text-white'>
            Results not published yet
          </p>
          <p className='mx-auto mt-1 max-w-md text-sm text-gray-500'>
            Once the organizer publishes the final ranking, you can see it here.
            Peer scores stay hidden until then.
          </p>
        </div>
      ) : ranked.length === 0 ? (
        <p className='text-sm text-gray-500'>No ranked submissions.</p>
      ) : (
        <>
          {/* Podium for the top three */}
          {top3.length > 0 && (
            <section className='grid gap-3 sm:grid-cols-3'>
              {top3.map(r => (
                <PodiumCard key={r.submissionId} item={r} />
              ))}
            </section>
          )}

          {/* Rest of the leaderboard */}
          {rest.length > 0 && (
            <section>
              <h2 className='mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase'>
                Leaderboard
              </h2>
              <ol className='divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-[#101010]'>
                {rest.map(r => {
                  const rank = r.rank ?? r.computedRank ?? null;
                  return (
                    <li
                      key={r.submissionId}
                      className='flex items-center justify-between gap-3 px-4 py-3'
                    >
                      <div className='flex min-w-0 items-center gap-3'>
                        <span className='w-7 shrink-0 text-right text-sm font-medium text-gray-500 tabular-nums'>
                          {rank ? `#${rank}` : '—'}
                        </span>
                        <p className='truncate text-sm font-medium text-white'>
                          {r.projectName}
                        </p>
                      </div>
                      <div className='shrink-0 text-right'>
                        <p className='text-sm font-semibold text-white tabular-nums'>
                          {r.averageScore.toFixed(2)}
                        </p>
                        {r.prize && (
                          <p className='text-[10px] tracking-wider text-amber-300/70 uppercase'>
                            {r.prize}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function PodiumCard({ item }: { item: JudgeResultItem }) {
  const rank = item.rank ?? item.computedRank ?? 0;
  const tone =
    rank === 1
      ? {
          border: 'border-amber-700/50',
          bg: 'bg-gradient-to-b from-amber-900/40 via-[#101010] to-[#101010]',
          ring: 'text-amber-300',
          label: '1st place',
        }
      : rank === 2
        ? {
            border: 'border-zinc-500/40',
            bg: 'bg-gradient-to-b from-zinc-700/30 via-[#101010] to-[#101010]',
            ring: 'text-zinc-200',
            label: '2nd place',
          }
        : {
            border: 'border-orange-800/40',
            bg: 'bg-gradient-to-b from-orange-900/30 via-[#101010] to-[#101010]',
            ring: 'text-orange-300',
            label: '3rd place',
          };

  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border p-5 text-center',
        tone.border,
        tone.bg
      )}
    >
      <span className={cn('text-[10px] tracking-wider uppercase', tone.ring)}>
        {tone.label}
      </span>
      <span
        className={cn(
          'mt-1 flex h-12 w-12 items-center justify-center rounded-full border bg-black/30 text-lg font-bold tabular-nums',
          tone.border,
          tone.ring
        )}
      >
        #{rank}
      </span>
      <h3 className='mt-3 line-clamp-2 text-sm font-semibold text-white'>
        {item.projectName}
      </h3>
      <p className='mt-2 text-2xl font-semibold text-white tabular-nums'>
        {item.averageScore.toFixed(2)}
      </p>
      <p className='text-[10px] tracking-wider text-gray-500 uppercase'>
        avg score
      </p>
      {item.prize && (
        <span className='mt-3 inline-flex items-center gap-1 rounded-md border border-amber-700/40 bg-amber-900/30 px-2 py-0.5 text-[11px] text-amber-200'>
          <Trophy className='h-3 w-3' /> {item.prize}
        </span>
      )}
    </div>
  );
}
