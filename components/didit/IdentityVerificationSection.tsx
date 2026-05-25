'use client';

import { useCallback, useEffect, useState } from 'react';
import { DiditVerifyButton } from './DiditVerifyButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Hourglass,
  RotateCcw,
} from 'lucide-react';
import clsx from 'clsx';
import {
  getDiditStatus,
  type VerificationState,
  type VerificationStatus,
} from '@/lib/api/didit';

interface BadgeConfig {
  label: string;
  icon: React.ElementType;
  className: string;
}

const STATE_BADGES: Record<VerificationState, BadgeConfig | null> = {
  not_started: null,
  in_progress: {
    label: 'In progress',
    icon: Hourglass,
    className: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
  in_review: {
    label: 'Under review',
    icon: Clock,
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  approved: {
    label: 'Verified',
    icon: CheckCircle2,
    className: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  declined: {
    label: 'Declined',
    icon: XCircle,
    className: 'text-red-500 bg-red-500/10 border-red-500/20',
  },
  abandoned: {
    label: 'Not completed',
    icon: AlertCircle,
    className: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  },
  expired: {
    label: 'Expired',
    icon: RotateCcw,
    className: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  },
};

const isLocalhost = (): boolean =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

const formatDate = (iso?: string): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
};

export function IdentityVerificationSection() {
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

  return (
    <Card className='border-zinc-800 bg-zinc-900/30'>
      <CardHeader>
        <CardTitle className='text-white'>Identity verification</CardTitle>
        <CardDescription className='text-zinc-400'>
          Verify your identity with Didit for KYC and compliance. Your data is
          processed securely.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {loading ? (
          <Skeleton className='h-9 w-48' />
        ) : error ? (
          <div className='flex items-center justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <span>Could not load verification status: {error}</span>
            <button
              type='button'
              onClick={refresh}
              className='text-xs underline'
            >
              Retry
            </button>
          </div>
        ) : status ? (
          <StatusBlock status={status} onRetry={refresh} />
        ) : null}

        {!loading && status?.canStartNew && isLocalhost() && (
          <p className='rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs text-zinc-500'>
            Using localhost? If verification is blocked by the browser, use a
            tunnel (e.g. ngrok) and set your backend FRONTEND_URL or
            DIDIT_CALLBACK_URL to the tunnel URL. See DIDIT_INTEGRATION.md →
            Troubleshooting.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusBlockProps {
  status: VerificationStatus;
  onRetry: () => void;
}

function StatusBlock({ status, onRetry }: StatusBlockProps) {
  const badge = STATE_BADGES[status.state];
  const BadgeIcon = badge?.icon ?? AlertCircle;
  const verifiedOn = formatDate(status.verifiedAt);
  const estimatedOn = formatDate(status.reviewWindow?.estimatedCompletionAt);

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-3'>
        {badge && (
          <Badge
            variant='outline'
            className={clsx(
              'inline-flex items-center gap-1.5 font-medium',
              badge.className
            )}
          >
            <BadgeIcon className='h-3.5 w-3.5' />
            {badge.label}
          </Badge>
        )}
        {verifiedOn && status.state === 'approved' && (
          <span className='text-sm text-zinc-500'>
            Verified on {verifiedOn}
          </span>
        )}
      </div>

      <p className='text-sm text-zinc-400'>{status.message}</p>

      {status.state === 'in_review' && status.reviewWindow && (
        <div className='rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90'>
          Expected completion: by <strong>{estimatedOn}</strong> (
          {status.reviewWindow.minBusinessDays}-
          {status.reviewWindow.maxBusinessDays} business days). We will email
          you when it&rsquo;s done — no need to wait on this page.
        </div>
      )}

      {status.state === 'declined' && status.decline?.reason && (
        <div className='rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-200/90'>
          Reason: {status.decline.reason}
        </div>
      )}

      {status.canStartNew && (
        <DiditVerifyButton
          label={
            status.state === 'declined'
              ? 'Try verification again'
              : status.state === 'expired' || status.state === 'abandoned'
                ? 'Start new verification'
                : 'Verify identity'
          }
          onError={onRetry}
        />
      )}
    </div>
  );
}
