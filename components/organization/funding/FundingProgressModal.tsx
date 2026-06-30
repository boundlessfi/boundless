'use client';

import React from 'react';
import {
  Loader2,
  Check,
  AlertTriangle,
  ExternalLink,
  PartyPopper,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { BoundlessButton } from '@/components/buttons';
import { getTransactionExplorerUrl } from '@/lib/wallet-utils';
import type { EscrowRunPhase, FundingMode } from './types';

interface FundingProgressModalProps {
  open: boolean;
  phase: EscrowRunPhase;
  txHash: string | null;
  error: string | null;
  isCompleted: boolean;
  isFailed: boolean;
  fundingMode: FundingMode;
  onClose: () => void;
  onRetry?: () => void;
  onSwitchToDraft?: () => void;
  onView?: () => void;
  /** Entity word for the copy, e.g. "hackathon" | "bounty". Defaults to "event". */
  entityNoun?: string;
}

interface Step {
  phase: EscrowRunPhase;
  label: string;
}

const MANAGED_STEPS: Step[] = [
  { phase: 'starting', label: 'Preparing transaction' },
  { phase: 'polling', label: 'Setting up the prize pool' },
];

const EXTERNAL_STEPS: Step[] = [
  { phase: 'starting', label: 'Preparing transaction' },
  { phase: 'signing', label: 'Awaiting your signature' },
  { phase: 'submitting', label: 'Submitting transaction' },
  { phase: 'polling', label: 'Setting up the prize pool' },
];

/**
 * Step-by-step funding progress, driven by the EscrowOpRunner phase. Replaces
 * the button-label-only loading so the organizer can see exactly where their
 * funding is (preparing -> signing -> submitting -> confirming -> done) and
 * recover cleanly on failure.
 */
export default function FundingProgressModal({
  open,
  phase,
  txHash,
  error,
  isCompleted,
  isFailed,
  fundingMode,
  onClose,
  onRetry,
  onSwitchToDraft,
  onView,
  entityNoun = 'event',
}: FundingProgressModalProps) {
  const steps = fundingMode === 'EXTERNAL' ? EXTERNAL_STEPS : MANAGED_STEPS;
  const dismissable = isCompleted || isFailed;
  const Entity = entityNoun.charAt(0).toUpperCase() + entityNoun.slice(1);

  const phaseIndex = steps.findIndex(s => s.phase === phase);
  const activeIndex = isCompleted
    ? steps.length
    : phaseIndex >= 0
      ? phaseIndex
      : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        // Only dismissable once funding has settled; while in-flight the modal
        // stays put so the organizer can't lose track of an on-chain op.
        if (!next && dismissable) onClose();
      }}
    >
      <DialogContent
        className='bg-background-card max-w-md border-gray-800'
        showCloseButton={dismissable}
        onInteractOutside={e => {
          if (!dismissable) e.preventDefault();
        }}
        onEscapeKeyDown={e => {
          if (!dismissable) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className='text-white'>
            {isCompleted
              ? `${Entity} published`
              : isFailed
                ? 'Funding failed'
                : `Funding your ${entityNoun}`}
          </DialogTitle>
          <DialogDescription className='text-gray-400'>
            {isCompleted
              ? `Your prize pool is secured and the ${entityNoun} is live.`
              : isFailed
                ? 'No funds moved. You can retry or move it back to draft.'
                : 'Keep this open while we set up your prize pool.'}
          </DialogDescription>
        </DialogHeader>

        {isCompleted ? (
          <div className='flex flex-col items-center gap-3 py-4'>
            <div className='flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15'>
              <PartyPopper className='h-7 w-7 text-green-400' />
            </div>
            {txHash && <ExplorerLink txHash={txHash} />}
          </div>
        ) : isFailed ? (
          <div className='flex items-start gap-3 rounded-lg border border-red-900/50 bg-red-950/30 p-3'>
            <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-red-400' />
            <p className='text-sm text-red-300'>
              {error || 'The funding transaction could not be completed.'}
            </p>
          </div>
        ) : (
          <ol className='space-y-3 py-1'>
            {steps.map((step, i) => {
              const state =
                i < activeIndex
                  ? 'done'
                  : i === activeIndex
                    ? 'active'
                    : 'pending';
              return (
                <li key={step.phase} className='flex items-center gap-3'>
                  <StepIcon state={state} />
                  <span
                    className={`text-sm ${
                      state === 'pending'
                        ? 'text-gray-500'
                        : state === 'active'
                          ? 'font-medium text-white'
                          : 'text-gray-300'
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
            {txHash && (
              <li className='pl-9'>
                <ExplorerLink txHash={txHash} />
              </li>
            )}
          </ol>
        )}

        <DialogFooter className='gap-2 sm:gap-2'>
          {isCompleted && (
            <>
              <BoundlessButton
                variant='outline'
                onClick={onClose}
                className='border-gray-700'
              >
                Close
              </BoundlessButton>
              {onView && (
                <BoundlessButton onClick={onView}>
                  View {entityNoun}
                </BoundlessButton>
              )}
            </>
          )}
          {isFailed && (
            <>
              {onSwitchToDraft && (
                <BoundlessButton
                  variant='outline'
                  onClick={onSwitchToDraft}
                  className='border-gray-700'
                >
                  Back to draft
                </BoundlessButton>
              )}
              {onRetry && (
                <BoundlessButton onClick={onRetry}>Retry</BoundlessButton>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StepIcon({ state }: { state: 'done' | 'active' | 'pending' }) {
  if (state === 'done') {
    return (
      <span className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500/15'>
        <Check className='h-3.5 w-3.5 text-green-400' />
      </span>
    );
  }
  if (state === 'active') {
    return (
      <span className='flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15'>
        <Loader2 className='h-3.5 w-3.5 animate-spin text-amber-400' />
      </span>
    );
  }
  return (
    <span className='flex h-6 w-6 items-center justify-center rounded-full border border-gray-700'>
      <span className='h-1.5 w-1.5 rounded-full bg-gray-600' />
    </span>
  );
}

function ExplorerLink({ txHash }: { txHash: string }) {
  let href = '';
  try {
    href = getTransactionExplorerUrl(txHash);
  } catch {
    href = '';
  }
  if (!href) return null;
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-primary inline-flex items-center gap-1.5 text-xs hover:underline'
    >
      View transaction
      <ExternalLink className='h-3 w-3' />
    </a>
  );
}
