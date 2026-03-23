'use client';

import { DiditVerifyButton } from './DiditVerifyButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { GetMeResponse } from '@/lib/api/types';

export type IdentityVerificationStatus =
  | 'Approved'
  | 'Declined'
  | 'In Review'
  | null
  | undefined;

export interface IdentityVerificationSectionProps {
  user: GetMeResponse | null;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  Approved: {
    label: 'Verified',
    icon: CheckCircle2,
    className: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  Declined: {
    label: 'Declined',
    icon: XCircle,
    className: 'text-red-500 bg-red-500/10 border-red-500/20',
  },
  'In Review': {
    label: 'In review',
    icon: Clock,
    className: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
};

const isLocalhost = (): boolean =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

export function IdentityVerificationSection({
  user,
}: IdentityVerificationSectionProps) {
  const status = user?.user
    ?.identityVerificationStatus as IdentityVerificationStatus;
  const verifiedAt = user?.user?.identityVerificationAt;
  const config = status ? statusConfig[status] : null;
  const StatusIcon = config?.icon ?? AlertCircle;

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
        {/* Status badge row */}
        {status && config && (
          <div className='flex flex-wrap items-center gap-3'>
            <Badge
              variant='outline'
              className={clsx(
                'inline-flex items-center gap-1.5 font-medium',
                config.className
              )}
            >
              <StatusIcon className='h-3.5 w-3.5' />
              {config.label}
            </Badge>
            {verifiedAt && status === 'Approved' && (
              <span className='text-sm text-zinc-500'>
                Verified on{' '}
                {new Date(verifiedAt).toLocaleDateString(undefined, {
                  dateStyle: 'medium',
                })}
              </span>
            )}
          </div>
        )}

        {/* Per-state messaging */}
        {status === 'Approved' && (
          <p className='text-sm text-zinc-400'>
            Your identity has been verified. You have full access to all
            compliance-gated features.
          </p>
        )}

        {status === 'In Review' && (
          <div className='rounded-md border border-amber-500/20 bg-amber-500/5 px-4 py-3'>
            <p className='text-sm font-medium text-amber-400'>
              Your submission is under review
            </p>
            <p className='mt-1 text-sm text-zinc-400'>
              We&apos;re reviewing your identity documents. This typically takes
              1–3 business days. You&apos;ll be notified once a decision has
              been made — no further action is needed right now.
            </p>
          </div>
        )}

        {status === 'Declined' && (
          <div className='rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3'>
            <p className='text-sm font-medium text-red-400'>
              Verification was declined
            </p>
            <p className='mt-1 text-sm text-zinc-400'>
              Your identity verification was not successful. This can happen if
              the documents were unclear, expired, or didn&apos;t match the
              required criteria. Please try again with valid, legible documents.
            </p>
          </div>
        )}

        {!status && (
          <p className='text-sm text-zinc-500'>
            You have not completed identity verification yet. Verify your
            identity to unlock compliance-gated features.
          </p>
        )}

        {/* CTA — shown for unverified and declined users */}
        {user && status !== 'Approved' && status !== 'In Review' && (
          <>
            <DiditVerifyButton
              label={
                status === 'Declined' ? 'Re-verify identity' : 'Verify identity'
              }
            />
            {isLocalhost() && (
              <p className='rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs text-zinc-500'>
                Using localhost? If verification is blocked by the browser, use
                a tunnel (e.g. ngrok) and set your backend FRONTEND_URL or
                DIDIT_CALLBACK_URL to the tunnel URL. See DIDIT_INTEGRATION.md →
                Troubleshooting.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
