'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { VerificationState, VerificationStatus } from '@/lib/api/didit';

interface VerificationSubmittedModalProps {
  open: boolean;
  onClose: () => void;
  status?: VerificationStatus | null;
}

interface StateCopy {
  title: string;
  description: (status: VerificationStatus) => string;
  icon: React.ElementType;
  iconClass: string;
  ringClass: string;
  haloClass: string;
  cta: string;
}

const COPY: Partial<Record<VerificationState, StateCopy>> = {
  in_review: {
    title: 'Verification submitted',
    description: status => {
      const { reviewWindow } = status;
      if (!reviewWindow) {
        return 'Your identity is under review. We will email you once it is complete.';
      }
      const completion = new Date(
        reviewWindow.estimatedCompletionAt
      ).toLocaleDateString(undefined, { dateStyle: 'medium' });
      return `Your identity is under review. Decisions usually take ${reviewWindow.minBusinessDays}-${reviewWindow.maxBusinessDays} business days — expected by ${completion}. We will email you when it is complete.`;
    },
    icon: Clock,
    iconClass: 'text-amber-400',
    ringClass: 'bg-amber-500/10 ring-amber-500/30',
    haloClass: 'bg-amber-500/20',
    cta: 'Got it',
  },
  approved: {
    title: 'You are verified',
    description: () =>
      'Your identity has been verified. You can now use all features that require KYC.',
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    ringClass: 'bg-emerald-500/10 ring-emerald-500/30',
    haloClass: 'bg-emerald-500/20',
    cta: 'Continue',
  },
  declined: {
    title: 'Verification was declined',
    description: status => {
      const reason = status.decline?.reason;
      return reason
        ? `Reason: ${reason}. You can try again from this page.`
        : 'Your verification did not pass review. You can try again from this page.';
    },
    icon: XCircle,
    iconClass: 'text-red-400',
    ringClass: 'bg-red-500/10 ring-red-500/30',
    haloClass: 'bg-red-500/20',
    cta: 'Got it',
  },
  in_progress: {
    title: 'Verification in progress',
    description: () =>
      'We are still receiving your verification result. This page will update automatically — you can also wait for the email.',
    icon: Clock,
    iconClass: 'text-sky-400',
    ringClass: 'bg-sky-500/10 ring-sky-500/30',
    haloClass: 'bg-sky-500/20',
    cta: 'Got it',
  },
  abandoned: {
    title: 'Verification was not completed',
    description: () =>
      'It looks like the verification flow ended before you finished. You can start a new verification from this page.',
    icon: AlertCircle,
    iconClass: 'text-zinc-300',
    ringClass: 'bg-zinc-500/10 ring-zinc-500/30',
    haloClass: 'bg-zinc-500/20',
    cta: 'Got it',
  },
  expired: {
    title: 'Verification session expired',
    description: () =>
      'Your verification session expired before you finished. You can start a new one from this page.',
    icon: AlertCircle,
    iconClass: 'text-zinc-300',
    ringClass: 'bg-zinc-500/10 ring-zinc-500/30',
    haloClass: 'bg-zinc-500/20',
    cta: 'Got it',
  },
};

const FALLBACK: StateCopy = {
  title: 'Verification submitted',
  description: () =>
    'Your identity is under review. We will email you once it is complete.',
  icon: Clock,
  iconClass: 'text-amber-400',
  ringClass: 'bg-amber-500/10 ring-amber-500/30',
  haloClass: 'bg-amber-500/20',
  cta: 'Got it',
};

export function VerificationSubmittedModal({
  open,
  onClose,
  status,
}: VerificationSubmittedModalProps) {
  const state = status?.state ?? 'in_review';
  const copy = COPY[state] ?? FALLBACK;
  const Icon = copy.icon;
  const description = status
    ? copy.description(status)
    : copy.description({
        state,
        canStartNew: false,
        message: '',
      } as VerificationStatus);

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className='flex flex-col items-center gap-0 border-zinc-800 bg-zinc-900 p-8 text-center sm:max-w-sm'
      >
        <div className='relative mb-6 flex items-center justify-center'>
          <span
            className={clsx(
              'absolute inline-flex h-20 w-20 animate-ping rounded-full',
              copy.haloClass
            )}
          />
          <span
            className={clsx(
              'relative flex h-16 w-16 items-center justify-center rounded-full ring-1',
              copy.ringClass
            )}
          >
            <Icon className={clsx('h-8 w-8', copy.iconClass)} />
          </span>
        </div>

        <DialogHeader className='w-full'>
          <DialogTitle className='text-center text-xl text-white'>
            {copy.title}
          </DialogTitle>
          <DialogDescription className='mt-2 text-center text-sm text-zinc-400'>
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='mt-6 w-full'>
          <Button onClick={onClose} className='w-full'>
            {copy.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
