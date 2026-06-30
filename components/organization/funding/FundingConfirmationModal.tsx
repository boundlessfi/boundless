'use client';

import React, { useEffect, useState } from 'react';
import {
  Lock,
  Wallet,
  AlertTriangle,
  Landmark,
  Mail,
  Copy,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { BoundlessButton } from '@/components/buttons';
import { formatCurrency } from '@/lib/utils/format-utils';
import { formatAddress } from '@/lib/wallet-utils';
import { copyToClipboard } from '@/lib/utils';
import { PLATFORM_FEE } from '@/lib/utils/hackathon-escrow';

export interface FundingOtpRequestOutcome {
  required: boolean;
  alreadyVerified: boolean;
  sent: boolean;
}

export type FundingSourceKind = 'MANAGED_TREASURY' | 'EXTERNAL';

export interface FundingSourceItem {
  id: string;
  kind: FundingSourceKind;
  label: string;
  description: string;
  /** Source G-address. Null for EXTERNAL until the user connects a wallet. */
  address: string | null;
}

interface FundingConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalPrizePool: number;
  platformFee: number;
  totalFunding: number;
  /** Selectable funding sources: org treasury wallets or a connected wallet. */
  sources: FundingSourceItem[];
  selectedSourceId: string;
  onSelectSource: (id: string) => void;
  /** USDC balance of the selected source when known (managed treasury). Undefined
   * for external/unknown sources, which are validated on-chain at publish. */
  sourceUsdc?: number;
  /** True while the selected treasury's balance is still loading. */
  balanceLoading?: boolean;
  /** True while the Wallet Kit connect modal is resolving. */
  connecting?: boolean;
  /** Open the Wallet Kit picker to connect an external wallet. */
  onConnectExternal?: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  /** Optional email-OTP step-up. When provided, the confirm click first runs
   * requestOtp; if a code is required, the modal collects and verifies it
   * before calling onConfirm. Omit to fund without step-up. */
  requestOtp?: () => Promise<FundingOtpRequestOutcome>;
  verifyOtp?: (code: string) => Promise<void>;
  /** Entity word for the copy, e.g. "hackathon" | "bounty". Defaults to "event". */
  entityNoun?: string;
}

function sourceIcon(kind: FundingSourceKind) {
  if (kind === 'MANAGED_TREASURY') return <Landmark className='h-4 w-4' />;
  return <Wallet className='h-4 w-4' />;
}

/**
 * The funding confirmation gate shown before any funds move. Shows what will be
 * locked (prize pool + platform fee), the source wallet, and a source selector
 * (an org treasury wallet or a connected wallet), with an optional email-OTP
 * step-up.
 */
export default function FundingConfirmationModal({
  open,
  onOpenChange,
  totalPrizePool,
  platformFee,
  totalFunding,
  sources,
  selectedSourceId,
  onSelectSource,
  sourceUsdc,
  balanceLoading = false,
  connecting = false,
  onConnectExternal,
  onConfirm,
  isSubmitting = false,
  requestOtp,
  verifyOtp,
  entityNoun = 'event',
}: FundingConfirmationModalProps) {
  const selected =
    sources.find(s => s.id === selectedSourceId) ?? sources[0] ?? null;
  const isExternal = selected?.kind === 'EXTERNAL';
  const externalConnected = isExternal && !!selected?.address;

  // Up-front balance gate for sources whose USDC we can read (managed treasury).
  // External sources have no readable balance here and stay gated on-chain.
  const balanceKnown =
    typeof sourceUsdc === 'number' && Number.isFinite(sourceUsdc);
  const insufficient = balanceKnown && (sourceUsdc as number) < totalFunding;
  const sourceMissing = isExternal ? !externalConnected : !selected?.address;

  const [view, setView] = useState<'review' | 'otp'>('review');
  const [code, setCode] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const handleCopyAddress = (addr: string) => {
    copyToClipboard(addr);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 1500);
  };

  // Reset the step-up flow whenever the modal closes.
  useEffect(() => {
    if (!open) {
      setView('review');
      setCode('');
      setOtpBusy(false);
      setOtpError(null);
      setOtpSent(false);
    }
  }, [open]);

  const reviewBlocked =
    sourceMissing || insufficient || balanceLoading || isSubmitting || otpBusy;

  const proceedOrStepUp = async () => {
    if (!requestOtp) {
      onConfirm();
      return;
    }
    setOtpBusy(true);
    setOtpError(null);
    try {
      const outcome = await requestOtp();
      if (!outcome.required || outcome.alreadyVerified) {
        onConfirm();
        return;
      }
      setOtpSent(outcome.sent);
      setCode('');
      setView('otp');
    } catch (err) {
      setOtpError(
        err instanceof Error
          ? err.message
          : 'Could not start verification. Try again.'
      );
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyAndConfirm = async () => {
    if (!verifyOtp || code.length !== 6) return;
    setOtpBusy(true);
    setOtpError(null);
    try {
      await verifyOtp(code);
      onConfirm();
    } catch (err) {
      setOtpError(
        err instanceof Error
          ? err.message
          : 'That code is not right. Try again.'
      );
    } finally {
      setOtpBusy(false);
    }
  };

  const resendCode = async () => {
    if (!requestOtp) return;
    setOtpBusy(true);
    setOtpError(null);
    try {
      const outcome = await requestOtp();
      setOtpSent(outcome.sent);
    } catch (err) {
      setOtpError(
        err instanceof Error ? err.message : 'Could not resend the code.'
      );
    } finally {
      setOtpBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-background-card max-w-md border-gray-800'>
        {view === 'otp' ? (
          <>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-white'>
                <Mail className='text-primary h-4 w-4' />
                Verify it&apos;s you
              </DialogTitle>
              <DialogDescription className='text-gray-400'>
                {otpSent
                  ? 'Enter the 6-digit code we emailed you to confirm.'
                  : 'We are emailing you a 6-digit code. Enter it here to continue.'}
              </DialogDescription>
            </DialogHeader>

            <div className='flex flex-col items-center gap-4 py-2'>
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                disabled={otpBusy}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {otpError && (
                <p className='flex items-center gap-1.5 text-center text-xs text-red-400'>
                  <AlertTriangle className='h-3.5 w-3.5 shrink-0' />
                  {otpError}
                </p>
              )}

              <button
                type='button'
                onClick={resendCode}
                disabled={otpBusy}
                className='text-xs text-gray-400 underline-offset-2 hover:text-gray-200 hover:underline disabled:opacity-50'
              >
                Resend code
              </button>
            </div>

            <DialogFooter className='gap-2 sm:gap-2'>
              <BoundlessButton
                variant='outline'
                onClick={() => setView('review')}
                disabled={otpBusy}
                className='border-gray-700'
              >
                Back
              </BoundlessButton>
              <BoundlessButton
                onClick={verifyAndConfirm}
                disabled={otpBusy || code.length !== 6}
              >
                {otpBusy ? 'Verifying…' : 'Verify & fund'}
              </BoundlessButton>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-white'>
                <Lock className='text-primary h-4 w-4' />
                Fund &amp; publish {entityNoun}
              </DialogTitle>
              <DialogDescription className='text-gray-400'>
                Publishing sets aside your prize pool so it is ready to pay
                winners. Review the amount and source before confirming.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              {/* Amount breakdown */}
              <div className='rounded-xl border border-gray-800 bg-gray-900/40 p-4'>
                <div className='space-y-2.5'>
                  <Row
                    label='Total prize pool'
                    value={formatCurrency(totalPrizePool)}
                  />
                  <Row
                    label={`Platform fee (${PLATFORM_FEE}%)`}
                    value={formatCurrency(platformFee)}
                    muted
                  />
                  <div className='flex items-center justify-between border-t border-gray-800 pt-2.5'>
                    <span className='text-sm font-medium text-gray-300'>
                      Total to lock
                    </span>
                    <span className='text-primary text-lg font-bold'>
                      {formatCurrency(totalFunding)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected source detail */}
              <div className='rounded-xl border border-gray-800 bg-gray-900/40 p-4'>
                <div className='flex items-center justify-between'>
                  <span className='flex items-center gap-2 text-sm text-gray-400'>
                    {selected ? sourceIcon(selected.kind) : null}
                    {selected?.label ?? 'No source'}
                  </span>
                  {selected?.address ? (
                    <button
                      type='button'
                      onClick={() => handleCopyAddress(selected.address!)}
                      title={copiedAddr ? 'Copied!' : 'Copy full address'}
                      className='flex items-center gap-1 font-mono text-xs text-gray-300 transition-colors hover:text-white'
                    >
                      {formatAddress(selected.address, 4)}
                      {copiedAddr ? (
                        <Check className='text-primary h-3 w-3' />
                      ) : (
                        <Copy className='h-3 w-3' />
                      )}
                    </button>
                  ) : (
                    <span className='font-mono text-xs text-gray-300'>
                      Not connected
                    </span>
                  )}
                </div>

                {balanceKnown ? (
                  <>
                    <div className='mt-2 flex items-center justify-between'>
                      <span className='text-sm text-gray-400'>
                        USDC balance
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          insufficient ? 'text-red-400' : 'text-white'
                        }`}
                      >
                        {formatCurrency(sourceUsdc as number)}
                      </span>
                    </div>
                    {insufficient && (
                      <div className='mt-3 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/30 p-2.5 text-xs text-red-300'>
                        <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
                        <span>
                          Insufficient USDC. You need{' '}
                          {formatCurrency(totalFunding)} but this wallet holds{' '}
                          {formatCurrency(sourceUsdc as number)}. Top it up or
                          pick another source.
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className='mt-2 flex items-center justify-between gap-2'>
                    <p className='text-xs text-gray-500'>
                      {balanceLoading
                        ? 'Checking balance…'
                        : isExternal && !externalConnected
                          ? 'Connect a wallet that holds the prize pool in USDC.'
                          : 'Your USDC balance is checked when you publish.'}
                    </p>
                    {isExternal && externalConnected && onConnectExternal && (
                      <button
                        type='button'
                        onClick={onConnectExternal}
                        disabled={connecting}
                        className='text-primary shrink-0 text-xs hover:underline disabled:opacity-50'
                      >
                        Change
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Funding source selector */}
              <div className='space-y-2'>
                <Label className='text-sm text-gray-400'>Funding source</Label>
                <RadioGroup
                  value={selectedSourceId}
                  onValueChange={onSelectSource}
                  className='gap-2'
                >
                  {sources.map(s => (
                    <SourceOption
                      key={s.id}
                      value={s.id}
                      selected={s.id === selectedSourceId}
                      title={s.label}
                      description={s.description}
                      icon={sourceIcon(s.kind)}
                    />
                  ))}
                </RadioGroup>
                <p className='flex items-start gap-1.5 pt-0.5 text-xs text-gray-500'>
                  <Wallet className='mt-0.5 h-3.5 w-3.5 shrink-0' />
                  <span>
                    The selected wallet must already hold the full amount in
                    USDC. Fund your Boundless managed wallet, or connect a
                    funded external wallet, before publishing.
                  </span>
                </p>
              </div>

              {otpError && (
                <p className='flex items-center gap-1.5 text-xs text-red-400'>
                  <AlertTriangle className='h-3.5 w-3.5 shrink-0' />
                  {otpError}
                </p>
              )}
            </div>

            <DialogFooter className='gap-2 sm:gap-2'>
              <BoundlessButton
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || otpBusy || connecting}
                className='border-gray-700'
              >
                Cancel
              </BoundlessButton>
              {isExternal && !externalConnected ? (
                <BoundlessButton
                  onClick={onConnectExternal}
                  disabled={connecting || !onConnectExternal}
                >
                  {connecting ? 'Connecting…' : 'Connect wallet'}
                </BoundlessButton>
              ) : (
                <BoundlessButton
                  onClick={proceedOrStepUp}
                  disabled={reviewBlocked}
                >
                  {balanceLoading
                    ? 'Checking balance…'
                    : insufficient
                      ? 'Insufficient USDC'
                      : isSubmitting || otpBusy
                        ? 'Starting…'
                        : `Fund ${formatCurrency(totalFunding)} & publish`}
                </BoundlessButton>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className='flex items-center justify-between'>
      <span className='text-sm text-gray-400'>{label}</span>
      <span
        className={`text-sm ${muted ? 'font-medium text-gray-300' : 'font-semibold text-white'}`}
      >
        {value}
      </span>
    </div>
  );
}

function SourceOption({
  value,
  selected,
  title,
  description,
  icon,
}: {
  value: string;
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Label
      htmlFor={`funding-${value}`}
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
        selected
          ? 'border-primary/60 bg-primary/5'
          : 'border-gray-800 hover:border-gray-700'
      }`}
    >
      <RadioGroupItem
        value={value}
        id={`funding-${value}`}
        className='mt-0.5'
      />
      <span className='flex-1'>
        <span className='flex items-center gap-2 text-sm font-medium text-white'>
          {icon}
          {title}
        </span>
        <span className='mt-0.5 block text-xs text-gray-400'>
          {description}
        </span>
      </span>
    </Label>
  );
}
