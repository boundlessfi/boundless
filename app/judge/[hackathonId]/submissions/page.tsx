'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Search,
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useJudgeSubmissions } from '@/hooks/judge/use-judge-queries';
import type { JudgingSubmission } from '@/lib/api/hackathons/judging';
import { cn } from '@/lib/utils';

type Filter = 'unscored' | 'scored' | 'all';
const PAGE_SIZE = 50;

export default function JudgeSubmissionsPage() {
  return (
    <AuthGuard redirectTo='/auth?mode=signin'>
      <SubmissionsList />
    </AuthGuard>
  );
}

function SubmissionsList() {
  const params = useParams<{ hackathonId: string }>();
  const router = useRouter();
  const hackathonId = params?.hackathonId ?? '';

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const { data, isPending, isError, isFetching } = useJudgeSubmissions(
    hackathonId,
    {
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
    }
  );

  const submissions = data?.submissions ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;
  // Server-derived: accurate across pages, not derived from the current
  // window. Falls back to in-page count when older responses are cached.
  const scoredCount =
    data?.scoredCount ?? (submissions.filter(s => s.myScore).length || 0);

  const visible = useMemo(() => {
    if (filter === 'unscored') return submissions.filter(s => !s.myScore);
    if (filter === 'scored') return submissions.filter(s => s.myScore);
    return submissions;
  }, [submissions, filter]);

  const [focusIdx, setFocusIdx] = useState(0);
  useEffect(() => {
    if (visible.length === 0) {
      setFocusIdx(0);
      return;
    }
    setFocusIdx(i => Math.min(Math.max(0, i), visible.length - 1));
  }, [visible.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      )
        return;
      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIdx(i => Math.min(visible.length - 1, i + 1));
      } else if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIdx(i => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        const s = visible[focusIdx];
        if (s) {
          router.push(`/judge/${hackathonId}/submissions/${s.submission.id}`);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, focusIdx, router, hackathonId]);

  return (
    <div className='space-y-5'>
      <header>
        <Link
          href={`/judge/${hackathonId}`}
          className='text-xs text-gray-500 hover:text-gray-300'
        >
          ← Hackathon overview
        </Link>
        <h1 className='mt-2 text-2xl font-semibold tracking-tight'>
          Submissions
        </h1>
      </header>

      {/* Progress strip — accurate even across pages */}
      <div className='rounded-2xl border border-white/5 bg-[#101010] p-4'>
        <div className='flex items-center justify-between text-xs text-gray-500'>
          <span>
            <span className='font-medium text-white'>{scoredCount}</span>
            <span className='text-gray-600'> / {total} scored</span>
          </span>
          <span>{Math.max(0, total - scoredCount)} remaining</span>
        </div>
        <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-white/5'>
          <div
            className='bg-primary h-full rounded-full transition-[width] duration-700 ease-out'
            style={{ width: `${total ? (scoredCount / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Filter tabs + search */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-1 rounded-lg border border-white/5 bg-[#101010] p-1'>
          <FilterTab
            label='Unscored'
            active={filter === 'unscored'}
            onClick={() => setFilter('unscored')}
          />
          <FilterTab
            label='Scored'
            active={filter === 'scored'}
            onClick={() => setFilter('scored')}
          />
          <FilterTab
            label='All'
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            setSearch(searchInput.trim());
            setPage(1);
          }}
          className='relative ml-auto w-full sm:w-72'
        >
          <Search className='absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-600' />
          <input
            type='text'
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder='Search project or participant'
            className='focus:border-primary/40 focus:ring-primary/30 w-full rounded-lg border border-white/5 bg-[#101010] py-2 pr-3 pl-9 text-sm text-white placeholder:text-gray-700 focus:ring-1 focus:outline-none'
          />
        </form>
      </div>

      {isPending && (
        <div className='space-y-2'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='h-16 animate-pulse rounded-xl bg-white/5' />
          ))}
        </div>
      )}

      {isError && (
        <p className='text-sm text-red-400'>Failed to load submissions.</p>
      )}

      {!isPending && visible.length === 0 && (
        <EmptyForFilter
          filter={filter}
          hasSearch={!!search}
          hasAnyOnPage={submissions.length > 0}
        />
      )}

      {!isPending && visible.length > 0 && (
        <ul
          className={cn(
            'space-y-2',
            isFetching && 'opacity-70 transition-opacity'
          )}
        >
          {visible.map((s, i) => (
            <li key={s.submission.id}>
              <Row
                hackathonId={hackathonId}
                submission={s}
                focused={i === focusIdx}
                onHover={() => setFocusIdx(i)}
              />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={p => {
            setPage(p);
            setFocusIdx(0);
          }}
          disabled={isFetching}
        />
      )}

      {visible.length > 0 && (
        <p className='text-center text-[11px] text-gray-700'>
          Press{' '}
          <kbd className='rounded border border-white/10 bg-black/40 px-1 font-mono'>
            ↑
          </kbd>{' '}
          <kbd className='rounded border border-white/10 bg-black/40 px-1 font-mono'>
            ↓
          </kbd>{' '}
          to navigate,{' '}
          <kbd className='rounded border border-white/10 bg-black/40 px-1 font-mono'>
            ↵
          </kbd>{' '}
          to open
        </p>
      )}
    </div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-white/10 text-white'
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
      )}
    >
      {label}
    </button>
  );
}

function Row({
  hackathonId,
  submission,
  focused,
  onHover,
}: {
  hackathonId: string;
  submission: JudgingSubmission;
  focused: boolean;
  onHover: () => void;
}) {
  const scored = !!submission.myScore;
  return (
    <Link
      href={`/judge/${hackathonId}/submissions/${submission.submission.id}`}
      onMouseEnter={onHover}
      className={cn(
        'group flex items-center gap-3 rounded-xl border bg-[#101010] px-4 py-3 transition-all',
        focused
          ? 'border-primary/30 bg-[#0e1311]'
          : 'border-white/5 hover:border-white/10'
      )}
    >
      <span className='shrink-0'>
        {scored ? (
          <CheckCircle2 className='text-primary h-4 w-4' />
        ) : (
          <Circle className='h-4 w-4 text-gray-700' />
        )}
      </span>
      <Avatar className='h-8 w-8 border border-white/10'>
        <AvatarImage
          src={submission.participant.user.image}
          alt={submission.participant.user.name}
        />
        <AvatarFallback className='bg-white/5 text-[10px]'>
          {(submission.participant.user.name ?? '?').slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <p className='truncate text-sm font-medium text-white'>
            {submission.submission.projectName}
          </p>
          {submission.submission.category && (
            <span className='hidden shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400 sm:inline'>
              {submission.submission.category}
            </span>
          )}
        </div>
        <p className='mt-0.5 truncate text-xs text-gray-500'>
          {submission.participant.teamName
            ? `Team · ${submission.participant.teamName}`
            : submission.participant.user.name}
        </p>
      </div>
      {scored && submission.myScore && (
        <span className='shrink-0 rounded-md border border-emerald-700/40 bg-emerald-900/20 px-2 py-0.5 text-xs text-emerald-300 tabular-nums'>
          {submission.myScore.totalScore.toFixed(1)}
        </span>
      )}
      <ChevronRight className='h-4 w-4 shrink-0 text-gray-700 group-hover:text-gray-400' />
    </Link>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className='flex items-center justify-between text-sm'>
      <button
        type='button'
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1 || disabled}
        className='inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#101010] px-3 py-1.5 text-gray-300 disabled:opacity-40'
      >
        <ChevronLeft className='h-3.5 w-3.5' /> Previous
      </button>
      <span className='text-gray-500'>
        Page <span className='text-gray-300'>{page}</span>{' '}
        <span className='text-gray-700'>/ {totalPages}</span>
      </span>
      <button
        type='button'
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages || disabled}
        className='inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#101010] px-3 py-1.5 text-gray-300 disabled:opacity-40'
      >
        Next <ChevronRight className='h-3.5 w-3.5' />
      </button>
    </div>
  );
}

function EmptyForFilter({
  filter,
  hasSearch,
  hasAnyOnPage,
}: {
  filter: Filter;
  hasSearch: boolean;
  hasAnyOnPage: boolean;
}) {
  return (
    <div className='rounded-2xl border border-dashed border-white/10 bg-[#0c0c0c] p-10 text-center'>
      {filter === 'unscored' && !hasSearch && !hasAnyOnPage ? (
        <>
          <CheckCircle2 className='text-primary mx-auto mb-3 h-8 w-8' />
          <h2 className='text-base font-medium text-white'>
            You are caught up
          </h2>
          <p className='mt-1 text-sm text-gray-500'>
            Every shortlisted submission has your score.
          </p>
        </>
      ) : (
        <>
          <h2 className='text-base font-medium text-white'>Nothing to show</h2>
          <p className='mt-1 text-sm text-gray-500'>
            {hasSearch
              ? 'No submissions match your search.'
              : 'Switch filters to see other submissions.'}
          </p>
        </>
      )}
    </div>
  );
}
