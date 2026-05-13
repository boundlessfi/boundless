'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  PlayCircle,
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScoreSlider } from '@/components/judge/ScoreSlider';
import {
  KeyboardShortcuts,
  ShortcutDef,
} from '@/components/judge/KeyboardShortcuts';
import {
  useJudgeHackathon,
  useJudgeQueueNeighbors,
  useJudgeSubmission,
  useSubmitJudgeScore,
} from '@/hooks/judge/use-judge-queries';
import { CountdownBanner } from '@/components/judge/CountdownBanner';
import { getCountdown } from '@/components/judge/utils';
import type {
  CriterionScoreRequest,
  JudgingCriterion,
} from '@/lib/api/hackathons/judging';
import { cn } from '@/lib/utils';

export default function JudgeScoringPage() {
  return (
    <AuthGuard redirectTo='/auth?mode=signin'>
      <ScorePage />
    </AuthGuard>
  );
}

const SHORTCUTS: ShortcutDef[] = [
  { keys: ['Tab'], description: 'Advance to next criterion' },
  { keys: ['⇧', 'Tab'], description: 'Previous criterion' },
  { keys: ['1', '–', '9'], description: 'Set focused criterion (0-10)' },
  { keys: ['⌘', '↵'], description: 'Submit score and continue' },
  { keys: ['J'], description: 'Skip to next submission' },
  { keys: ['K'], description: 'Previous submission' },
  { keys: ['Esc'], description: 'Back to queue' },
  { keys: ['?'], description: 'Show this panel' },
];

function getCriterionKey(c: JudgingCriterion) {
  // Server guarantees a non-empty unique id on every persisted
  // criterion (Sprint 2 #7). Use it directly; never fall back to name
  // or title — that fallback silently merges criteria with the same
  // human-readable label.
  return c.id;
}

function ScorePage() {
  const params = useParams<{ hackathonId: string; submissionId: string }>();
  const router = useRouter();
  const hackathonId = params?.hackathonId ?? '';
  const submissionId = params?.submissionId ?? '';

  const { data, isPending, isError } = useJudgeSubmission(
    hackathonId,
    submissionId
  );
  // Pull the hackathon overview for the deadline. Same query is on the
  // overview page, so when the judge navigates here from there this is
  // a cache hit.
  const { data: hackathonOverview } = useJudgeHackathon(hackathonId);
  const judgingClosed = (() => {
    if (!hackathonOverview?.judgingEnd) return false;
    return getCountdown(hackathonOverview.judgingEnd).isPast;
  })();
  // Cursor-style lookup so we never fetch the full queue. Powers the
  // "X of N" counter, J/K navigation, and auto-advance.
  const { data: neighbors } = useJudgeQueueNeighbors(hackathonId, submissionId);

  const criteria = data?.criteria ?? [];
  const existingScores = data?.myScore?.criteriaScores ?? [];

  // ---- form state ----
  const [scores, setScores] = useState<Record<string, number | ''>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [overall, setOverall] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'demo' | 'links'>(
    'overview'
  );

  const initialScores = useMemo(() => {
    const out: Record<string, number | ''> = {};
    for (const c of criteria) {
      const key = getCriterionKey(c);
      const existing = existingScores.find(
        s => s.criterionId === getCriterionKey(c)
      );
      out[key] = existing ? existing.score : '';
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria.length, submissionId, existingScores.length]);

  const initialComments = useMemo(() => {
    const out: Record<string, string> = {};
    for (const c of criteria) {
      const key = getCriterionKey(c);
      const existing = existingScores.find(
        s => s.criterionId === getCriterionKey(c)
      );
      out[key] = existing?.comment ?? '';
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria.length, submissionId, existingScores.length]);

  useEffect(() => {
    setScores(initialScores);
    setComments(initialComments);
    setOverall(data?.myScore?.comment ?? '');
    setErrors({});
    setFocused(criteria[0] ? getCriterionKey(criteria[0]) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId, initialScores, initialComments]);

  // ---- derived: queue position + weighted total ----
  const totalInQueue = neighbors?.total ?? 0;
  const scoredInQueue = neighbors?.scoredCount ?? 0;
  const positionLabel =
    neighbors?.position != null
      ? `${neighbors.position} of ${totalInQueue}`
      : null;
  const nextUnscoredId = neighbors?.nextUnscored?.submissionId ?? null;
  const prevId = neighbors?.prev?.submissionId ?? null;
  const nextId = neighbors?.next?.submissionId ?? null;

  const weightedRunningTotal = useMemo(() => {
    if (criteria.length === 0) return null;
    let weightSum = 0;
    let scoreSum = 0;
    for (const c of criteria) {
      const key = getCriterionKey(c);
      const s = scores[key];
      const w = typeof c.weight === 'number' ? c.weight : 0;
      weightSum += w;
      if (typeof s === 'number') scoreSum += s * (w / 100);
    }
    if (weightSum === 0) return null;
    return Math.round(scoreSum * 10) / 10;
  }, [scores, criteria]);

  const filledCount = useMemo(
    () =>
      criteria.filter(c => typeof scores[getCriterionKey(c)] === 'number')
        .length,
    [scores, criteria]
  );

  // ---- handlers ----
  const handleScoreChange = useCallback((key: string, value: number | '') => {
    if (value === '') {
      setScores(p => ({ ...p, [key]: '' }));
    } else {
      const clamped = Math.min(10, Math.max(0, value));
      setScores(p => ({ ...p, [key]: clamped }));
    }
    setErrors(p => (p[key] ? { ...p, [key]: null } : p));
  }, []);

  const advanceFocus = useCallback(() => {
    if (!focused) {
      if (criteria[0]) setFocused(getCriterionKey(criteria[0]));
      return;
    }
    const idx = criteria.findIndex(c => getCriterionKey(c) === focused);
    if (idx < criteria.length - 1) {
      setFocused(getCriterionKey(criteria[idx + 1]));
    } else {
      setFocused(null);
    }
  }, [criteria, focused]);

  const submit = useSubmitJudgeScore(hackathonId);

  const submitOrError = useCallback(() => {
    const newErrors: Record<string, string | null> = {};
    let valid = true;
    for (const c of criteria) {
      const key = getCriterionKey(c);
      if (typeof scores[key] !== 'number') {
        newErrors[key] = 'Score required';
        valid = false;
      }
    }
    setErrors(newErrors);
    if (!valid) return;

    const criteriaScores: CriterionScoreRequest[] = criteria.map(c => {
      const key = getCriterionKey(c);
      return {
        criterionId: c.id,
        score: scores[key] as number,
        comment: comments[key] || undefined,
      };
    });

    submit.mutate(
      {
        submissionId,
        payload: { criteriaScores, comment: overall || undefined },
      },
      {
        onSuccess: () => {
          if (autoAdvance && nextUnscoredId) {
            router.push(`/judge/${hackathonId}/submissions/${nextUnscoredId}`);
          } else if (!nextUnscoredId) {
            router.push(`/judge/${hackathonId}`);
          }
        },
      }
    );
  }, [
    criteria,
    scores,
    comments,
    overall,
    submit,
    submissionId,
    autoAdvance,
    nextUnscoredId,
    router,
    hackathonId,
  ]);

  // Global key handler: J/K to navigate, Esc to leave, Cmd+Enter to submit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        submitOrError();
        return;
      }
      if (inField) return;
      if (e.key === 'Escape') {
        router.push(`/judge/${hackathonId}/submissions`);
      } else if (e.key === 'j' || e.key === 'J') {
        if (nextId) router.push(`/judge/${hackathonId}/submissions/${nextId}`);
      } else if (e.key === 'k' || e.key === 'K') {
        if (prevId) router.push(`/judge/${hackathonId}/submissions/${prevId}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, hackathonId, nextId, prevId, submitOrError]);

  if (isPending) return <SkeletonScoringPage />;
  if (isError || !data) return <UnavailableState hackathonId={hackathonId} />;

  // Once judging closes, the page becomes read-only. Existing scores
  // are still visible (organizer can override on the org side); the
  // form is disabled.
  const readOnly = judgingClosed;

  const { submission, participant, myScore } = data;
  const videoUrl = submission.videoUrl;
  const links = submission.links ?? [];
  const tabs: Array<{
    id: 'overview' | 'demo' | 'links';
    label: string;
    count?: number;
  }> = [{ id: 'overview', label: 'Overview' }];
  if (videoUrl) tabs.push({ id: 'demo', label: 'Demo' });
  if (links.length > 0)
    tabs.push({ id: 'links', label: 'Links', count: links.length });

  return (
    <div className='space-y-5'>
      {/* Top context bar */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Link
          href={`/judge/${hackathonId}/submissions`}
          className='inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300'
        >
          <ArrowLeft className='h-3.5 w-3.5' /> Back to queue
        </Link>
        <div className='flex items-center gap-2'>
          {positionLabel && (
            <span className='text-xs text-gray-500'>
              Submission{' '}
              <span className='font-medium text-gray-300'>{positionLabel}</span>
            </span>
          )}
          <KeyboardShortcuts shortcuts={SHORTCUTS} />
        </div>
      </div>

      {/* Bulk progress strip */}
      {totalInQueue > 0 && (
        <QueueProgress
          total={totalInQueue}
          scored={scoredInQueue}
          position={neighbors?.position ?? null}
        />
      )}

      {/* Countdown / closed state. Hidden when judging is comfortably
          in the future. Switches to a "Judging is closed" banner once
          past the deadline. */}
      <CountdownBanner
        deadline={hackathonOverview?.judgingEnd}
        hint='You can still see your scores, but new ratings are disabled.'
      />

      <div className='grid gap-5 lg:grid-cols-[1.1fr_1fr]'>
        {/* Left column: context */}
        <section className='space-y-5'>
          <div className='rounded-2xl border border-white/5 bg-[#101010] p-6'>
            <div className='flex items-start gap-4'>
              <Avatar className='h-10 w-10 border border-white/10'>
                <AvatarImage
                  src={participant.user.image}
                  alt={participant.user.name}
                />
                <AvatarFallback className='bg-white/5 text-xs'>
                  {(participant.user.name ?? '?').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <h1 className='truncate text-xl font-semibold tracking-tight text-white'>
                  {submission.projectName}
                </h1>
                <p className='mt-0.5 truncate text-sm text-gray-500'>
                  {participant.teamName
                    ? `Team · ${participant.teamName}`
                    : participant.user.name}
                  {submission.category && (
                    <>
                      <span className='mx-2 text-gray-700'>·</span>
                      <span className='text-gray-400'>
                        {submission.category}
                      </span>
                    </>
                  )}
                </p>
              </div>
              {myScore && (
                <div className='shrink-0 rounded-md border border-emerald-700/40 bg-emerald-900/20 px-2 py-1 text-right'>
                  <p className='text-[10px] tracking-wider text-emerald-400/70 uppercase'>
                    Your score
                  </p>
                  <p className='text-base font-semibold text-emerald-300'>
                    {myScore.totalScore.toFixed(1)}
                  </p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className='mt-5 flex items-center gap-1 border-b border-white/5'>
              {tabs.map(t => (
                <button
                  key={t.id}
                  type='button'
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'relative -mb-px px-3 py-2 text-xs font-medium transition-colors',
                    activeTab === t.id
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  )}
                >
                  {t.label}
                  {typeof t.count === 'number' && (
                    <span className='ml-1 text-gray-600'>{t.count}</span>
                  )}
                  {activeTab === t.id && (
                    <span className='bg-primary absolute inset-x-0 -bottom-px h-px' />
                  )}
                </button>
              ))}
            </div>

            <div className='mt-4'>
              {activeTab === 'overview' && (
                <>
                  {submission.introduction && (
                    <p className='mb-3 text-sm text-gray-300'>
                      {submission.introduction}
                    </p>
                  )}
                  {submission.description ? (
                    <div className='prose prose-invert max-w-none text-sm leading-relaxed text-gray-300'>
                      <p className='whitespace-pre-wrap'>
                        {submission.description}
                      </p>
                    </div>
                  ) : (
                    <p className='text-sm text-gray-600'>
                      No description provided.
                    </p>
                  )}
                </>
              )}
              {activeTab === 'demo' && videoUrl && (
                <a
                  href={videoUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group flex items-center gap-3 rounded-xl border border-white/5 bg-black/30 p-4 transition-colors hover:border-white/10'
                >
                  <span className='bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-lg'>
                    <PlayCircle className='h-5 w-5' />
                  </span>
                  <span className='min-w-0 flex-1'>
                    <p className='text-sm font-medium text-white'>Watch demo</p>
                    <p className='truncate text-xs text-gray-500'>{videoUrl}</p>
                  </span>
                  <ExternalLink className='h-4 w-4 text-gray-600 group-hover:text-gray-300' />
                </a>
              )}
              {activeTab === 'links' && (
                <ul className='space-y-2'>
                  {links.map((l, i) => (
                    <li key={`${l.url}-${i}`}>
                      <a
                        href={l.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='group flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/30 px-3 py-2 hover:border-white/10'
                      >
                        <span className='min-w-0 flex-1 truncate text-sm text-gray-200'>
                          {l.type ? (
                            <span className='mr-2 text-xs text-gray-500'>
                              {l.type}
                            </span>
                          ) : null}
                          {l.url}
                        </span>
                        <ExternalLink className='h-3.5 w-3.5 shrink-0 text-gray-600 group-hover:text-gray-300' />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Right column: scoring */}
        <aside className='space-y-4 lg:sticky lg:top-20 lg:self-start'>
          <div className='rounded-2xl border border-white/5 bg-[#0c0c0c] p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <p className='text-[10px] tracking-wider text-gray-500 uppercase'>
                  Score
                </p>
                <p className='text-2xl font-semibold text-white tabular-nums'>
                  {weightedRunningTotal !== null ? (
                    weightedRunningTotal.toFixed(1)
                  ) : (
                    <span className='text-gray-700'>—</span>
                  )}
                  <span className='text-sm text-gray-600'>/10</span>
                </p>
              </div>
              <div className='text-right'>
                <p className='text-[10px] tracking-wider text-gray-500 uppercase'>
                  Filled
                </p>
                <p className='text-sm text-gray-300'>
                  <span className='font-semibold text-white'>
                    {filledCount}
                  </span>
                  <span className='text-gray-600'> / {criteria.length}</span>
                </p>
              </div>
            </div>

            {criteria.length === 0 ? (
              <p className='rounded-lg border border-white/5 bg-black/30 p-3 text-sm text-gray-500'>
                The organizer has not published a rubric yet.
              </p>
            ) : (
              <div className='space-y-3'>
                {criteria.map(c => {
                  const key = getCriterionKey(c);
                  return (
                    <ScoreSlider
                      key={key}
                      label={c.title || c.name || 'Criterion'}
                      weight={c.weight}
                      description={c.description}
                      value={scores[key] ?? ''}
                      onChange={v => handleScoreChange(key, v)}
                      isFocused={focused === key}
                      onFocus={() => setFocused(key)}
                      onBlur={() => {
                        if (focused === key) setFocused(null);
                      }}
                      onAdvance={advanceFocus}
                      onSubmitWithEnter={submitOrError}
                      comment={comments[key] ?? ''}
                      onCommentChange={v =>
                        setComments(p => ({ ...p, [key]: v }))
                      }
                      error={errors[key] ?? null}
                      inputId={`score-${key}`}
                      disabled={readOnly}
                    />
                  );
                })}
              </div>
            )}

            <div className='mt-4'>
              <label
                htmlFor='overall-comment'
                className='mb-1.5 block text-[10px] tracking-wider text-gray-500 uppercase'
              >
                Overall feedback (optional)
              </label>
              <textarea
                id='overall-comment'
                value={overall}
                onChange={e => setOverall(e.target.value)}
                rows={3}
                placeholder='Final notes for the organizers'
                className='focus:border-primary/40 focus:ring-primary/30 w-full resize-none rounded-lg border border-white/5 bg-black/40 p-3 text-sm text-gray-200 placeholder:text-gray-700 focus:ring-1 focus:outline-none'
              />
            </div>

            <div className='mt-5 flex items-center justify-between gap-3'>
              <label className='inline-flex cursor-pointer items-center gap-2 text-xs text-gray-500'>
                <input
                  type='checkbox'
                  checked={autoAdvance}
                  onChange={e => setAutoAdvance(e.target.checked)}
                  className='accent-primary h-3.5 w-3.5'
                />
                Auto-advance after submit
              </label>
              <span className='text-[10px] text-gray-700'>
                <kbd className='rounded border border-white/10 bg-black/40 px-1 font-mono'>
                  ⌘
                </kbd>{' '}
                <kbd className='rounded border border-white/10 bg-black/40 px-1 font-mono'>
                  ↵
                </kbd>
              </span>
            </div>

            <Button
              onClick={submitOrError}
              disabled={submit.isPending || criteria.length === 0 || readOnly}
              className='bg-primary hover:bg-primary/90 text-primary-foreground mt-3 h-11 w-full text-sm font-semibold disabled:opacity-50'
              title={readOnly ? 'Judging is closed' : undefined}
            >
              {readOnly ? (
                'Judging closed'
              ) : submit.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {myScore ? 'Updating…' : 'Submitting…'}
                </>
              ) : nextUnscoredId && autoAdvance ? (
                <>
                  {myScore ? 'Update' : 'Submit'} &amp; next
                  <ArrowRight className='ml-2 h-4 w-4' />
                </>
              ) : myScore ? (
                'Update score'
              ) : (
                'Submit score'
              )}
            </Button>

            {!nextUnscoredId && filledCount === criteria.length && (
              <p className='mt-3 flex items-center gap-1.5 text-xs text-emerald-400'>
                <CheckCircle2 className='h-3.5 w-3.5' />
                Last unscored submission in your queue.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function QueueProgress({
  total,
  scored,
  position,
}: {
  total: number;
  scored: number;
  position: number | null;
}) {
  const scoredPct = total > 0 ? (scored / total) * 100 : 0;
  const positionPct =
    position != null && total > 0 ? ((position - 0.5) / total) * 100 : null;
  return (
    <div className='rounded-xl border border-white/5 bg-[#0c0c0c] p-3'>
      <div className='relative h-1.5 overflow-hidden rounded-full bg-white/5'>
        <div
          className='absolute inset-y-0 left-0 rounded-full bg-emerald-500/40 transition-[width] duration-700 ease-out'
          style={{ width: `${scoredPct}%` }}
        />
        {positionPct != null && (
          <div
            className='bg-primary absolute top-1/2 h-3 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(46,237,170,0.6)]'
            style={{ left: `${positionPct}%` }}
          />
        )}
      </div>
      <p className='mt-2 flex items-center justify-between text-[11px] text-gray-500'>
        <span>
          <span className='font-medium text-gray-300'>{scored}</span>
          <span className='text-gray-600'> / {total} scored</span>
        </span>
        {position != null && (
          <span className='text-gray-600'>
            You are at{' '}
            <span className='text-primary font-medium'>#{position}</span>
          </span>
        )}
      </p>
    </div>
  );
}

function SkeletonScoringPage() {
  return (
    <div className='space-y-5'>
      <div className='h-4 w-24 animate-pulse rounded bg-white/5' />
      <div className='h-2 animate-pulse rounded bg-white/5' />
      <div className='grid gap-5 lg:grid-cols-[1.1fr_1fr]'>
        <div className='h-72 animate-pulse rounded-2xl bg-white/5' />
        <div className='h-[28rem] animate-pulse rounded-2xl bg-white/5' />
      </div>
    </div>
  );
}

function UnavailableState({ hackathonId }: { hackathonId: string }) {
  return (
    <div className='mx-auto max-w-md rounded-2xl border border-white/5 bg-[#101010] p-8 text-center'>
      <h2 className='text-lg font-semibold'>Submission unavailable</h2>
      <p className='mt-2 text-sm text-gray-500'>
        It may have been removed from the shortlist, or you are no longer
        assigned to score this hackathon.
      </p>
      <Link
        href={`/judge/${hackathonId}/submissions`}
        className='text-primary mt-4 inline-block text-sm hover:underline'
      >
        Back to queue →
      </Link>
    </div>
  );
}
