'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  ClipboardList,
  Loader2,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/judge/ProgressRing';
import { DeadlineBadge } from '@/components/judge/DeadlineBadge';
import { HackathonBanner } from '@/components/judge/HackathonBanner';
import { CountdownBanner } from '@/components/judge/CountdownBanner';
import { useJudgeHackathon } from '@/hooks/judge/use-judge-queries';
import type { JudgingCriterion } from '@/lib/api/hackathons/judging';
import { cn } from '@/lib/utils';

export default function JudgeHackathonPage() {
  return (
    <AuthGuard redirectTo='/auth?mode=signin'>
      <JudgeHackathon />
    </AuthGuard>
  );
}

function JudgeHackathon() {
  const params = useParams<{ hackathonId: string }>();
  const router = useRouter();
  const hackathonId = params?.hackathonId ?? '';

  const { data, isPending, isError, error } = useJudgeHackathon(hackathonId);
  const firstUnscoredId = data?.firstUnscoredSubmissionId ?? null;

  if (isPending) return <Skeleton />;
  if (isError || !data) {
    return (
      <p className='text-sm text-red-400'>
        {error instanceof Error
          ? error.message
          : 'You are not assigned to this hackathon, or it could not be loaded.'}
      </p>
    );
  }

  const remaining = Math.max(0, data.totalSubmissions - data.myScoredCount);
  const criteria = (data.judgingCriteria ?? []) as JudgingCriterion[];
  const isDone = data.totalSubmissions > 0 && remaining === 0;
  const allScored = data.totalSubmissions > 0 && remaining === 0;

  return (
    <div className='space-y-6'>
      <div>
        <Link
          href='/judge'
          className='text-xs text-gray-500 hover:text-gray-300'
        >
          ← All assignments
        </Link>
      </div>

      <HackathonBanner banner={data.banner} name={data.name}>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            {data.organization?.name && (
              <p className='text-[11px] tracking-wider text-white/70 uppercase'>
                {data.organization.name}
              </p>
            )}
            <h1 className='mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl'>
              {data.name}
            </h1>
            {data.tagline && (
              <p className='mt-1 max-w-xl text-sm text-white/70'>
                {data.tagline}
              </p>
            )}
          </div>
          <div className='flex flex-wrap gap-2'>
            {data.resultsPublished ? (
              <span className='inline-flex items-center gap-1 rounded-md border border-amber-700/40 bg-amber-900/40 px-2 py-0.5 text-[11px] font-medium text-amber-200'>
                <Trophy className='h-3 w-3' />
                Results published
              </span>
            ) : data.status === 'JUDGING' ? (
              <span className='border-primary/40 bg-primary/15 text-primary inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium'>
                <Sparkles className='h-3 w-3' />
                Judging open
              </span>
            ) : (
              <span className='inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-gray-300'>
                {data.status.toLowerCase()}
              </span>
            )}
            <DeadlineBadge deadline={data.judgingEnd} prefix='Ends' />
          </div>
        </div>
      </HackathonBanner>

      {/* Live countdown — only renders when within 48h. After deadline,
          renders a "closed" state. */}
      <CountdownBanner
        deadline={data.judgingEnd}
        hint={
          data.totalSubmissions > 0
            ? `${remaining} left in your queue`
            : undefined
        }
        closedLabel='Judging is closed'
      />

      {/* Progress + primary CTA */}
      <div className='grid gap-4 md:grid-cols-[auto_1fr]'>
        <div className='rounded-2xl border border-white/5 bg-[#101010] p-6'>
          <ProgressRing
            value={data.myScoredCount}
            total={data.totalSubmissions}
            sublabel='Your progress'
            done={isDone}
          />
        </div>
        <div
          className={cn(
            'flex flex-col justify-between gap-4 rounded-2xl border bg-[#101010] p-6',
            allScored
              ? 'border-emerald-800/30'
              : firstUnscoredId
                ? 'border-primary/20'
                : 'border-white/5'
          )}
        >
          <div>
            <p className='text-[10px] tracking-wider text-gray-500 uppercase'>
              Next up
            </p>
            <h2 className='mt-1 text-lg font-semibold text-white'>
              {allScored
                ? 'You have scored every submission'
                : firstUnscoredId
                  ? `Continue scoring`
                  : data.totalSubmissions === 0
                    ? 'Nothing shortlisted yet'
                    : 'All scored. Awaiting more.'}
            </h2>
            <p className='mt-1 text-sm text-gray-500'>
              {allScored
                ? 'When the organizer publishes results, you will see the final ranking here.'
                : firstUnscoredId
                  ? `${remaining} submission${remaining === 1 ? '' : 's'} left in your queue.`
                  : data.totalSubmissions === 0
                    ? 'The organizer has not shortlisted any submissions for judging.'
                    : 'You are caught up. Check back later.'}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {firstUnscoredId ? (
              <Button
                onClick={() =>
                  router.push(
                    `/judge/${hackathonId}/submissions/${firstUnscoredId}`
                  )
                }
                className='bg-primary hover:bg-primary/90 text-primary-foreground'
              >
                Continue scoring
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            ) : null}
            <Link
              href={`/judge/${hackathonId}/submissions`}
              className='inline-flex items-center gap-2 rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-gray-200 hover:bg-white/5'
            >
              <ClipboardList className='h-4 w-4' />
              {allScored ? 'Review my scores' : 'See full queue'}
            </Link>
            {data.resultsPublished && (
              <Link
                href={`/judge/${hackathonId}/results`}
                className='inline-flex items-center gap-2 rounded-md border border-amber-700/40 bg-amber-900/20 px-3 py-2 text-sm text-amber-200 hover:bg-amber-900/30'
              >
                <Trophy className='h-4 w-4' />
                See final results
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Rubric */}
      <section>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-medium tracking-wide text-gray-300 uppercase'>
            Rubric
          </h2>
          <span className='text-xs text-gray-500'>
            {criteria.length} criteri{criteria.length === 1 ? 'on' : 'a'} ·
            score 0–10
          </span>
        </div>
        {criteria.length === 0 ? (
          <p className='rounded-2xl border border-white/5 bg-[#101010] p-5 text-sm text-gray-500'>
            The organizer has not published a rubric yet. Once they do, you can
            start scoring.
          </p>
        ) : (
          <ul className='grid gap-3 sm:grid-cols-2'>
            {criteria.map(c => (
              <li
                key={c.id}
                className='rounded-2xl border border-white/5 bg-[#101010] p-4'
              >
                <div className='flex items-start justify-between gap-3'>
                  <p className='font-medium text-white'>{c.title || c.name}</p>
                  <span className='shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400'>
                    {c.weight}%
                  </span>
                </div>
                {c.description && (
                  <p className='mt-2 text-xs leading-relaxed text-gray-500'>
                    {c.description}
                  </p>
                )}
                <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-white/5'>
                  <div
                    className='bg-primary/70 h-full rounded-full'
                    style={{ width: `${Math.min(100, c.weight ?? 0)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Skeleton() {
  return (
    <div className='space-y-6'>
      <div className='h-40 animate-pulse rounded-2xl bg-white/5 sm:h-52' />
      <div className='grid gap-4 md:grid-cols-[auto_1fr]'>
        <div className='h-44 w-44 animate-pulse rounded-2xl bg-white/5' />
        <div className='h-44 animate-pulse rounded-2xl bg-white/5' />
      </div>
      <div className='flex items-center gap-2 text-gray-600'>
        <Loader2 className='h-4 w-4 animate-spin' /> Loading hackathon…
      </div>
    </div>
  );
}
