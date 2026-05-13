'use client';

import Link from 'next/link';
import { Gavel, Mail, Trophy } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DeadlineBadge } from '@/components/judge/DeadlineBadge';
import { useJudgeHackathons } from '@/hooks/judge/use-judge-queries';
import type { JudgeAssignment } from '@/lib/api/judge';
import { cn } from '@/lib/utils';

export default function JudgeHomePage() {
  return (
    <AuthGuard redirectTo='/auth?mode=signin'>
      <JudgeHome />
    </AuthGuard>
  );
}

type Bucket = 'open' | 'awaiting' | 'past';

function bucketOf(a: JudgeAssignment): Bucket {
  if (a.hackathon.resultsPublished) return 'past';
  if (
    a.hackathon.status === 'COMPLETED' ||
    a.hackathon.status === 'CANCELLED' ||
    a.hackathon.status === 'ARCHIVED'
  ) {
    return 'past';
  }
  // Anything else where results have not been published yet is either
  // open for judging or waiting on the organizer to publish.
  if (
    a.hackathon.totalSubmissions > 0 &&
    a.hackathon.myScoredCount >= a.hackathon.totalSubmissions
  ) {
    return 'awaiting';
  }
  return 'open';
}

function JudgeHome() {
  const { data, isPending, isError, error } = useJudgeHackathons();

  const grouped = {
    open: [] as JudgeAssignment[],
    awaiting: [] as JudgeAssignment[],
    past: [] as JudgeAssignment[],
  };
  for (const a of data ?? []) grouped[bucketOf(a)].push(a);

  return (
    <div className='space-y-8'>
      <header>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Hackathons you’re judging
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          You only see hackathons you have been invited to.
        </p>
      </header>

      {isPending && (
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='h-24 animate-pulse rounded-2xl bg-white/5'
            />
          ))}
        </div>
      )}

      {isError && (
        <p className='text-sm text-red-400'>
          {error instanceof Error ? error.message : 'Failed to load'}
        </p>
      )}

      {!isPending && !isError && (data?.length ?? 0) === 0 && <EmptyState />}

      {grouped.open.length > 0 && (
        <Section title='Open for judging' tone='primary'>
          <ul className='space-y-3'>
            {grouped.open.map(a => (
              <li key={a.hackathon.id}>
                <AssignmentRow assignment={a} variant='open' />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {grouped.awaiting.length > 0 && (
        <Section title='Waiting on results'>
          <ul className='space-y-3'>
            {grouped.awaiting.map(a => (
              <li key={a.hackathon.id}>
                <AssignmentRow assignment={a} variant='awaiting' />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {grouped.past.length > 0 && (
        <Section title='Past' muted>
          <ul className='space-y-3'>
            {grouped.past.map(a => (
              <li key={a.hackathon.id}>
                <AssignmentRow assignment={a} variant='past' />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  tone,
  muted,
  children,
}: {
  title: string;
  tone?: 'primary';
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className={cn(
          'mb-3 text-xs font-medium tracking-wider uppercase',
          tone === 'primary'
            ? 'text-primary'
            : muted
              ? 'text-gray-600'
              : 'text-gray-400'
        )}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyState() {
  return (
    <div className='rounded-2xl border border-dashed border-white/10 bg-[#0c0c0c] p-12 text-center'>
      <span className='bg-primary/10 text-primary inline-flex h-12 w-12 items-center justify-center rounded-full'>
        <Gavel className='h-5 w-5' />
      </span>
      <h2 className='mt-4 text-base font-medium text-white'>
        No assignments yet
      </h2>
      <p className='mt-1 text-sm text-gray-500'>
        Invitations from organizers will land here.
      </p>
      <Link
        href='/judge/invitations'
        className='text-primary mt-4 inline-flex items-center gap-1.5 text-sm hover:underline'
      >
        <Mail className='h-3.5 w-3.5' />
        Check pending invitations
      </Link>
    </div>
  );
}

function AssignmentRow({
  assignment,
  variant,
}: {
  assignment: JudgeAssignment;
  variant: 'open' | 'awaiting' | 'past';
}) {
  const h = assignment.hackathon;
  const pct =
    h.totalSubmissions > 0
      ? Math.round((h.myScoredCount / h.totalSubmissions) * 100)
      : 0;

  return (
    <Link
      href={`/judge/${h.id}`}
      className={cn(
        'group flex items-center gap-4 rounded-2xl border bg-[#101010] px-5 py-4 transition-all',
        variant === 'open'
          ? 'hover:border-primary/30 border-white/5 hover:bg-[#0e1311]'
          : variant === 'awaiting'
            ? 'border-white/5 hover:border-white/10'
            : 'border-white/5 opacity-70 hover:border-white/10 hover:opacity-100'
      )}
    >
      <Avatar className='h-10 w-10 rounded-lg border border-white/10'>
        <AvatarImage
          src={h.organization?.logo ?? undefined}
          alt={h.organization?.name ?? ''}
          className='rounded-lg'
        />
        <AvatarFallback className='rounded-lg bg-white/5 text-[11px]'>
          {(h.organization?.name ?? h.name).slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <h3 className='truncate text-sm font-medium text-white'>{h.name}</h3>
        </div>
        <div className='mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500'>
          {h.organization?.name && <span>{h.organization.name}</span>}
          {variant !== 'past' && (
            <>
              <span className='text-gray-700'>·</span>
              <DeadlineBadge deadline={h.judgingEnd} />
            </>
          )}
          {variant === 'past' && h.resultsPublished && (
            <>
              <span className='text-gray-700'>·</span>
              <span className='inline-flex items-center gap-1 text-amber-300/80'>
                <Trophy className='h-3 w-3' /> Results published
              </span>
            </>
          )}
        </div>
      </div>

      {variant !== 'past' && (
        <div className='hidden w-40 sm:block'>
          <div className='flex items-center justify-between text-[11px] text-gray-500'>
            <span>
              <span className='font-medium text-white'>{h.myScoredCount}</span>
              <span className='text-gray-700'> / {h.totalSubmissions}</span>
            </span>
            <span className='text-gray-700'>{pct}%</span>
          </div>
          <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5'>
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-700 ease-out',
                variant === 'open' ? 'bg-primary' : 'bg-gray-600'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}
