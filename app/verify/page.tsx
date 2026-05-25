'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Hourglass,
  Loader2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DiditVerifyButton } from '@/components/didit/DiditVerifyButton';
import {
  getDiditStatus,
  type VerificationState,
  type VerificationStatus,
} from '@/lib/api/didit';

const KNOWN_STATES = new Set<VerificationState>([
  'not_started',
  'in_progress',
  'in_review',
  'approved',
  'declined',
  'abandoned',
  'expired',
]);

interface StateView {
  title: string;
  body: (status: VerificationStatus) => React.ReactNode;
  icon: React.ElementType;
  iconClass: string;
  ringClass: string;
  haloClass: string;
  primaryHref?: string;
  primaryLabel: string;
  showVerifyButton?: boolean;
}

const formatDate = (iso?: string): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
};

const VIEWS: Record<VerificationState, StateView> = {
  approved: {
    title: 'You are verified',
    body: status => {
      const on = formatDate(status.verifiedAt);
      return on
        ? `Your identity was verified on ${on}. You can now use all features that require KYC.`
        : 'Your identity has been verified. You can now use all features that require KYC.';
    },
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    ringClass: 'bg-emerald-500/10 ring-emerald-500/30',
    haloClass: 'bg-emerald-500/20',
    primaryHref: '/me',
    primaryLabel: 'Continue to dashboard',
  },
  in_review: {
    title: 'Verification submitted',
    body: status => {
      const w = status.reviewWindow;
      if (!w) {
        return 'Your identity is under review. We will email you once it is complete.';
      }
      const completion = formatDate(w.estimatedCompletionAt);
      return (
        <>
          Your identity is under review. Decisions usually take{' '}
          <strong>
            {w.minBusinessDays}-{w.maxBusinessDays} business days
          </strong>
          {completion ? (
            <>
              {' '}
              &mdash; expected by <strong>{completion}</strong>
            </>
          ) : null}
          . We will email you when it is complete.
        </>
      );
    },
    icon: Clock,
    iconClass: 'text-amber-400',
    ringClass: 'bg-amber-500/10 ring-amber-500/30',
    haloClass: 'bg-amber-500/20',
    primaryHref: '/me',
    primaryLabel: 'Back to dashboard',
  },
  in_progress: {
    title: 'Verification in progress',
    body: () =>
      'We are still receiving the result from our verification provider. This page will refresh automatically — you can also wait for the email.',
    icon: Hourglass,
    iconClass: 'text-sky-400',
    ringClass: 'bg-sky-500/10 ring-sky-500/30',
    haloClass: 'bg-sky-500/20',
    primaryHref: '/me/settings?tab=identity',
    primaryLabel: 'View status',
  },
  declined: {
    title: 'Verification was declined',
    body: status => {
      const reason = status.decline?.reason;
      return reason
        ? `Reason: ${reason}. You can try the verification again below.`
        : 'Your verification did not pass review. You can try again below.';
    },
    icon: XCircle,
    iconClass: 'text-red-400',
    ringClass: 'bg-red-500/10 ring-red-500/30',
    haloClass: 'bg-red-500/20',
    primaryHref: '/me/settings?tab=identity',
    primaryLabel: 'View details',
    showVerifyButton: true,
  },
  abandoned: {
    title: 'Verification was not completed',
    body: () =>
      'It looks like the verification flow ended before you finished. You can start a new verification below.',
    icon: AlertCircle,
    iconClass: 'text-zinc-300',
    ringClass: 'bg-zinc-500/10 ring-zinc-500/30',
    haloClass: 'bg-zinc-500/20',
    primaryHref: '/me/settings?tab=identity',
    primaryLabel: 'Back to settings',
    showVerifyButton: true,
  },
  expired: {
    title: 'Verification session expired',
    body: () =>
      'Your verification session expired before you finished. You can start a new one below.',
    icon: RotateCcw,
    iconClass: 'text-zinc-300',
    ringClass: 'bg-zinc-500/10 ring-zinc-500/30',
    haloClass: 'bg-zinc-500/20',
    primaryHref: '/me/settings?tab=identity',
    primaryLabel: 'Back to settings',
    showVerifyButton: true,
  },
  not_started: {
    title: 'Start identity verification',
    body: () =>
      'You have not started identity verification yet. Verify your identity to unlock features that require KYC.',
    icon: AlertCircle,
    iconClass: 'text-zinc-300',
    ringClass: 'bg-zinc-500/10 ring-zinc-500/30',
    haloClass: 'bg-zinc-500/20',
    primaryHref: '/me/settings?tab=identity',
    primaryLabel: 'Back to settings',
    showVerifyButton: true,
  },
};

function parseStateParam(raw: string | null): VerificationState | null {
  if (!raw) return null;
  return KNOWN_STATES.has(raw as VerificationState)
    ? (raw as VerificationState)
    : null;
}

function VerifyResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialState = parseStateParam(searchParams.get('state'));

  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const next = await getDiditStatus();
      setStatus(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (status?.state !== 'in_progress') return;
    const id = setInterval(refresh, 10_000);
    return () => clearInterval(id);
  }, [status?.state, refresh]);

  useEffect(() => {
    if (!error || status) return;
    // If we can't fetch authoritative status (e.g. unauthenticated)
    // and we don't have a usable URL state either, send the user home.
    if (!initialState) {
      router.replace('/');
    }
  }, [error, status, initialState, router]);

  const effectiveState: VerificationState =
    status?.state ?? initialState ?? 'in_review';
  const view = VIEWS[effectiveState];
  const Icon = view.icon;

  const cardBody = (() => {
    if (loading && !status) {
      return (
        <div className='flex flex-col items-center gap-3'>
          <Skeleton className='h-4 w-64' />
          <Skeleton className='h-4 w-48' />
        </div>
      );
    }
    if (error && !status) {
      return (
        <div className='space-y-3 text-sm text-zinc-400'>
          <p>
            We could not load the latest verification status. The page may have
            been opened in a session that has signed out. You can sign in again
            and view your status in Settings.
          </p>
          <Button
            type='button'
            variant='outline'
            onClick={refresh}
            className='w-full'
          >
            Retry
          </Button>
        </div>
      );
    }
    return (
      <p className='text-sm leading-relaxed text-zinc-400'>
        {status
          ? view.body(status)
          : view.body({
              state: effectiveState,
              canStartNew: false,
              message: '',
            } as VerificationStatus)}
      </p>
    );
  })();

  return (
    <main className='flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-16'>
      <div className='relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl shadow-black/40'>
        <div className='mb-6 flex items-center justify-center'>
          <div className='relative flex items-center justify-center'>
            <span
              className={clsx(
                'absolute inline-flex h-20 w-20 animate-ping rounded-full',
                view.haloClass
              )}
            />
            <span
              className={clsx(
                'relative flex h-16 w-16 items-center justify-center rounded-full ring-1',
                view.ringClass
              )}
            >
              <Icon className={clsx('h-8 w-8', view.iconClass)} />
            </span>
          </div>
        </div>

        <h1 className='text-center text-xl font-semibold text-white'>
          {view.title}
        </h1>
        <div className='mt-4 text-center'>{cardBody}</div>

        {loading && status && (
          <div className='mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' /> Refreshing…
          </div>
        )}

        <div className='mt-8 space-y-3'>
          {status?.canStartNew && view.showVerifyButton && (
            <DiditVerifyButton
              label={
                effectiveState === 'declined'
                  ? 'Try verification again'
                  : effectiveState === 'expired' ||
                      effectiveState === 'abandoned'
                    ? 'Start new verification'
                    : 'Verify identity'
              }
              className='w-full'
              onError={refresh}
            />
          )}
          {view.primaryHref && (
            <Button asChild variant='outline' className='w-full'>
              <Link href={view.primaryHref}>
                {view.primaryLabel}
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main className='flex min-h-screen items-center justify-center bg-zinc-950'>
          <Loader2 className='h-6 w-6 animate-spin text-zinc-500' />
        </main>
      }
    >
      <VerifyResult />
    </Suspense>
  );
}
