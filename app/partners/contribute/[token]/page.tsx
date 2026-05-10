'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Wallet,
  ArrowRight,
  Copy,
  Check,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  isConnected as freighterIsConnected,
  setAllowed as freighterSetAllowed,
  getAddress as freighterGetAddress,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api';
import { Button } from '@/components/ui/button';
import {
  getPartnerInvitation,
  prepareFundTransaction,
  submitSignedTransaction,
  type PartnerInvitationDetails,
} from '@/lib/api/hackathons/partners';
import { reportError } from '@/lib/error-reporting';
import { extractApiErrorMessage } from '@/lib/api/api';
import { cn } from '@/lib/utils';

const truncateAddress = (a: string) =>
  a ? `${a.slice(0, 5)}...${a.slice(-5)}` : '';

const formatAmount = (raw: string) => {
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return raw;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

type StepState = 'pending' | 'active' | 'done';

export default function PartnerContributePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [invitation, setInvitation] = useState<PartnerInvitationDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getPartnerInvitation(token);
        if (!cancelled) setInvitation(res.data ?? null);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(extractApiErrorMessage(err, 'Invitation not found'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await freighterIsConnected();
        if (cancelled || !result.isConnected) return;
        const addr = await freighterGetAddress();
        if (cancelled || !addr.address) return;
        setWalletAddress(addr.address);
      } catch {
        // not installed / not approved — UI handles it
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connectFreighter = async () => {
    setConnecting(true);
    try {
      const installed = await freighterIsConnected();
      if (!installed.isConnected) {
        toast.error(
          'Freighter wallet not detected. Install it from freighter.app to continue.'
        );
        window.open('https://www.freighter.app/', '_blank', 'noreferrer');
        return null;
      }
      const allowed = await freighterSetAllowed();
      if (allowed.error) {
        throw new Error(allowed.error.message || 'Connection rejected');
      }
      const addr = await freighterGetAddress();
      if (addr.error || !addr.address) {
        throw new Error(
          addr.error?.message || 'No account selected in Freighter'
        );
      }
      setWalletAddress(addr.address);
      return { address: addr.address };
    } catch (err) {
      reportError(err, { context: 'partner-freighter-connect' });
      toast.error(extractApiErrorMessage(err, 'Failed to connect Freighter'));
      return null;
    } finally {
      setConnecting(false);
    }
  };

  const handleContribute = async () => {
    if (!invitation || !invitation.canContribute) {
      toast.error('This invitation can no longer be redeemed');
      return;
    }
    let signerAddress = walletAddress;
    if (!signerAddress) {
      const connected = await connectFreighter();
      if (!connected) return;
      signerAddress = connected.address;
    }
    setSubmitting(true);
    try {
      const prepareRes = await prepareFundTransaction(token, signerAddress);
      const prepared = prepareRes.data;
      if (!prepared)
        throw new Error('Backend did not return a transaction to sign');

      const signed = await freighterSignTransaction(
        prepared.unsignedTransaction,
        {
          networkPassphrase: prepared.networkPassphrase,
          address: signerAddress,
        }
      );
      if (signed.error || !signed.signedTxXdr) {
        throw new Error(
          signed.error?.message || 'Transaction signing was rejected'
        );
      }

      const submitRes = await submitSignedTransaction(
        token,
        signed.signedTxXdr
      );
      const updated = submitRes.data;
      if (updated?.txHash) setConfirmedTxHash(updated.txHash);

      toast.success('Thanks! Your contribution was recorded.');
      const refreshed = await getPartnerInvitation(token);
      setInvitation(refreshed.data ?? null);
    } catch (err: unknown) {
      reportError(err, { context: 'partner-contribute' });
      toast.error(
        extractApiErrorMessage(err, 'Failed to complete contribution')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyAddress = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  // ---- Loading / fatal error ----
  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#030303]'>
        <Loader2 className='text-primary h-7 w-7 animate-spin' />
      </div>
    );
  }
  if (error || !invitation) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#030303] px-6'>
        <div className='max-w-md rounded-2xl border border-white/5 bg-[#141517] p-8 text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10'>
            <AlertTriangle className='h-6 w-6 text-red-500' />
          </div>
          <h1 className='text-xl font-semibold text-white'>
            Invitation unavailable
          </h1>
          <p className='mt-2 text-sm text-gray-400'>
            {error ||
              'This contribution link is invalid, expired, or has been cancelled.'}
          </p>
        </div>
      </div>
    );
  }

  const hackathon = invitation.hackathon;
  const isConfirmed = invitation.status === 'CONFIRMED';
  const isCancelled = invitation.status === 'CANCELLED';
  const isFailed = invitation.status === 'FAILED';
  const isClosed = !invitation.windowOpen && !isConfirmed;
  const blocked = isCancelled || isFailed || isClosed;

  const stepStates: StepState[] = (() => {
    if (isConfirmed) return ['done', 'done', 'done'];
    if (submitting) {
      return [walletAddress ? 'done' : 'active', 'active', 'pending'];
    }
    if (walletAddress) return ['done', 'active', 'pending'];
    return ['active', 'pending', 'pending'];
  })();

  const txHash = confirmedTxHash || invitation.txHash || null;

  return (
    <div className='min-h-screen bg-[#030303] px-4 py-6 text-white sm:px-8 sm:py-10'>
      <div className='relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]'>
        {/* Top bar */}
        <div className='flex items-center justify-between border-b border-white/5 px-6 py-5 sm:px-10'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='bg-primary/15 flex h-8 w-8 items-center justify-center rounded-lg'>
              <Sparkles className='text-primary h-4 w-4' />
            </div>
            <span className='text-sm font-semibold tracking-tight text-white'>
              Boundless
            </span>
          </Link>

          {walletAddress ? (
            <button
              onClick={copyAddress}
              className='hover:border-primary/30 group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors'
            >
              <span className='bg-primary h-1.5 w-1.5 rounded-full' />
              <span className='font-mono'>
                {truncateAddress(walletAddress)}
              </span>
              {copied ? (
                <Check className='text-primary h-3.5 w-3.5' />
              ) : (
                <Copy className='h-3.5 w-3.5 text-gray-500 group-hover:text-gray-300' />
              )}
            </button>
          ) : (
            <button
              onClick={connectFreighter}
              disabled={connecting || blocked}
              className='bg-primary hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-black transition-colors disabled:opacity-40'
            >
              {connecting ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
              ) : (
                <Wallet className='h-3.5 w-3.5' />
              )}
              Connect wallet
            </button>
          )}
        </div>

        {/* Hero half — banner-tinted */}
        <div className='relative isolate overflow-hidden'>
          {hackathon?.banner ? (
            <div className='absolute inset-0 -z-10'>
              <Image
                src={hackathon.banner}
                alt=''
                fill
                priority
                className='object-cover opacity-20'
              />
              <div className='absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/85 via-[#0a0a0a]/70 to-[#0a0a0a]' />
            </div>
          ) : (
            <div className='from-primary/[0.06] absolute inset-0 -z-10 bg-gradient-to-br to-transparent' />
          )}

          <div className='grid gap-10 px-6 py-12 sm:grid-cols-[1fr_minmax(0,360px)] sm:px-10 sm:py-16'>
            {/* Left: title block */}
            <div className='flex flex-col justify-center'>
              <div className='mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium tracking-[0.2em] text-gray-400 uppercase'>
                <Sparkles className='text-primary h-3 w-3' />
                Sponsorship Invitation
              </div>

              <h1 className='text-4xl leading-[1.05] font-bold tracking-tight text-white sm:text-5xl'>
                Sponsor
                <br />
                <span className='text-primary'>
                  {hackathon?.name || 'this hackathon'}
                </span>
              </h1>

              {hackathon?.organization && (
                <p className='mt-5 text-sm text-gray-400'>
                  <span className='font-medium text-white'>
                    {hackathon.organization.name}
                  </span>{' '}
                  invited you to contribute to this hackathon&apos;s prize pool.
                </p>
              )}
              {hackathon?.tagline && (
                <p className='mt-1 max-w-md text-sm text-gray-500'>
                  {hackathon.tagline}
                </p>
              )}
            </div>

            {/* Right: floating amount card */}
            <div className='relative sm:-mb-32'>
              <div className='from-primary/40 absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br via-emerald-500/20 to-transparent opacity-60 blur-xl' />
              <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d0f] p-6'>
                {/* Stylized art */}
                <div className='relative mb-6 h-24 overflow-hidden rounded-xl border border-white/5 bg-[#101113]'>
                  <div className='from-primary/30 absolute inset-0 bg-gradient-to-br via-emerald-500/10 to-transparent' />
                  <div className='absolute -top-4 -right-4 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl' />
                  <div className='bg-primary/30 absolute -bottom-4 -left-4 h-20 w-20 rounded-full blur-2xl' />
                  <div className='absolute inset-0 grid grid-cols-3 gap-2 p-3 opacity-90'>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'rounded-full',
                          i % 2 === 0 ? 'bg-primary/40' : 'bg-emerald-400/30',
                          'blur-[2px]'
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className='text-[11px] font-medium tracking-[0.18em] text-gray-500 uppercase'>
                  Pledged contribution
                </div>
                <div className='mt-2 flex items-baseline gap-2'>
                  <span className='font-mono text-4xl font-bold text-white sm:text-5xl'>
                    {formatAmount(invitation.pledgedAmount)}
                  </span>
                  <span className='text-primary text-base font-semibold'>
                    {invitation.currency}
                  </span>
                </div>
                <div className='mt-4'>
                  <StatusBadge
                    status={invitation.status}
                    windowOpen={invitation.windowOpen}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom half — action area */}
        <div className='border-t border-white/5 bg-[#070707] px-6 py-12 sm:px-10 sm:pt-32 sm:pb-14'>
          <div className='grid gap-12 sm:grid-cols-[1fr_minmax(0,360px)]'>
            {/* Left: steps */}
            <div>
              <h2 className='text-lg font-semibold text-white'>How it works</h2>
              <p className='mt-1 text-sm text-gray-500'>
                Three steps. Your funds go straight to the hackathon escrow.
              </p>

              <div className='mt-8 space-y-1'>
                <Step
                  number={1}
                  state={stepStates[0]}
                  title='Connect your wallet'
                  description='Use any Stellar wallet — Freighter is the simplest. No Boundless account required.'
                />
                <Connector active={stepStates[0] === 'done'} />
                <Step
                  number={2}
                  state={stepStates[1]}
                  title='Sign the transaction'
                  description={`Approve a single transfer of ${formatAmount(invitation.pledgedAmount)} ${invitation.currency} into the hackathon escrow.`}
                />
                <Connector active={stepStates[1] === 'done'} />
                <Step
                  number={3}
                  state={stepStates[2]}
                  title='Funds in the prize pool'
                  description='Your contribution is recorded on-chain and credited to the prize pool. Trustless Work releases it to winners.'
                />
              </div>
            </div>

            {/* Right: action panel */}
            <div className='self-start'>
              <div className='rounded-2xl border border-white/5 bg-[#0c0d0f] p-6'>
                {isConfirmed ? (
                  <ConfirmedPanel txHash={txHash} />
                ) : isCancelled ? (
                  <ClosedPanel
                    icon={<XCircle className='h-5 w-5 text-gray-400' />}
                    title='Invitation cancelled'
                    body='This invitation was cancelled by the organizer. Reach out if this is a mistake.'
                  />
                ) : isFailed ? (
                  <ClosedPanel
                    icon={<AlertTriangle className='h-5 w-5 text-red-400' />}
                    title='Previous attempt failed'
                    body='The last contribution attempt could not be recorded. Please contact the organizer.'
                  />
                ) : isClosed ? (
                  <ClosedPanel
                    icon={<Clock className='h-5 w-5 text-gray-400' />}
                    title='Window closed'
                    body='Winners may have already been announced or deposits are no longer accepted.'
                  />
                ) : (
                  <>
                    <div className='mb-1 flex items-center gap-2'>
                      <div className='bg-primary/15 flex h-8 w-8 items-center justify-center rounded-lg'>
                        <Wallet className='text-primary h-4 w-4' />
                      </div>
                      <h3 className='text-base font-semibold text-white'>
                        {walletAddress
                          ? 'Ready to contribute'
                          : 'Connect your wallet'}
                      </h3>
                    </div>
                    <p className='mt-2 text-sm text-gray-400'>
                      {walletAddress
                        ? 'You’ll sign one Stellar transaction. Funds go straight to the hackathon escrow.'
                        : 'We’ll prompt you to approve Freighter, then walk you through signing.'}
                    </p>

                    {invitation.message && (
                      <div className='mt-5 rounded-xl border border-white/5 bg-black/40 px-4 py-3'>
                        <div className='text-[10px] font-medium tracking-[0.18em] text-gray-500 uppercase'>
                          Note from organizer
                        </div>
                        <p className='mt-1 text-xs leading-relaxed text-gray-300'>
                          &ldquo;{invitation.message}&rdquo;
                        </p>
                      </div>
                    )}

                    <Button
                      size='lg'
                      onClick={handleContribute}
                      disabled={submitting || connecting}
                      className={cn(
                        'bg-primary hover:bg-primary/90 group mt-6 h-12 w-full text-base font-semibold text-black',
                        'disabled:hover:bg-primary disabled:opacity-50'
                      )}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                          Processing...
                        </>
                      ) : connecting ? (
                        <>
                          <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                          Connecting Freighter...
                        </>
                      ) : walletAddress ? (
                        <>
                          Contribute {formatAmount(invitation.pledgedAmount)}{' '}
                          {invitation.currency}
                          <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                        </>
                      ) : (
                        <>
                          <Wallet className='mr-2 h-5 w-5' />
                          Connect wallet
                        </>
                      )}
                    </Button>

                    <p className='mt-3 text-center text-[11px] text-gray-500'>
                      Don&apos;t have a wallet?{' '}
                      <a
                        href='https://www.freighter.app/'
                        target='_blank'
                        rel='noreferrer'
                        className='text-primary underline-offset-4 hover:underline'
                      >
                        Install Freighter
                      </a>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex flex-col gap-3 border-t border-white/5 px-6 py-5 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:px-10'>
          <div>
            © {new Date().getFullYear()} Boundless. Powered by Trustless Work on
            Stellar.
          </div>
          <div className='flex items-center gap-5'>
            {hackathon?.slug && (
              <Link
                href={`/hackathons/${hackathon.slug}`}
                className='transition-colors hover:text-gray-300'
              >
                Hackathon page
              </Link>
            )}
            <Link
              href='/privacy'
              className='transition-colors hover:text-gray-300'
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Subcomponents ----

function StatusBadge({
  status,
  windowOpen,
}: {
  status: PartnerInvitationDetails['status'];
  windowOpen: boolean;
}) {
  const map: Record<
    string,
    { label: string; dot: string; text: string; bg: string }
  > = {
    PENDING: windowOpen
      ? {
          label: 'Awaiting your signature',
          dot: 'bg-primary',
          text: 'text-primary',
          bg: 'bg-primary/10 border-primary/20',
        }
      : {
          label: 'Window closed',
          dot: 'bg-gray-500',
          text: 'text-gray-400',
          bg: 'bg-white/5 border-white/10',
        },
    CONFIRMED: {
      label: 'Contribution confirmed',
      dot: 'bg-emerald-400',
      text: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-400/20',
    },
    FAILED: {
      label: 'Failed',
      dot: 'bg-red-400',
      text: 'text-red-400',
      bg: 'bg-red-400/10 border-red-400/20',
    },
    CANCELLED: {
      label: 'Cancelled',
      dot: 'bg-gray-500',
      text: 'text-gray-400',
      bg: 'bg-white/5 border-white/10',
    },
    REFUNDED: {
      label: 'Refunded',
      dot: 'bg-blue-400',
      text: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-400/20',
    },
  };
  const c = map[status] || map.PENDING;
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium',
        c.bg,
        c.text
      )}
    >
      <span className={cn('h-1.5 w-1.5 animate-pulse rounded-full', c.dot)} />
      {c.label}
    </div>
  );
}

function Step({
  number,
  state,
  title,
  description,
}: {
  number: number;
  state: StepState;
  title: string;
  description: string;
}) {
  return (
    <div className='flex items-start gap-4'>
      <div className='shrink-0'>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
            state === 'done' && 'border-primary bg-primary text-black',
            state === 'active' &&
              'border-primary text-primary bg-primary/10 ring-primary/20 ring-4',
            state === 'pending' &&
              'border-white/10 bg-white/[0.02] text-gray-500'
          )}
        >
          {state === 'done' ? <Check className='h-4 w-4' /> : number}
        </div>
      </div>
      <div className='pb-1'>
        <h3
          className={cn(
            'text-sm font-semibold transition-colors',
            state === 'pending' ? 'text-gray-400' : 'text-white'
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'mt-1 text-sm transition-colors',
            state === 'pending' ? 'text-gray-600' : 'text-gray-400'
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <div className='flex h-7 items-center pl-4'>
      <div
        className={cn(
          'ml-px h-full w-px border-l-2 border-dashed transition-colors',
          active ? 'border-primary/40' : 'border-white/10'
        )}
      />
    </div>
  );
}

function ConfirmedPanel({ txHash }: { txHash: string | null }) {
  return (
    <div>
      <div className='flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/10'>
          <CheckCircle2 className='h-5 w-5 text-emerald-400' />
        </div>
        <div>
          <h3 className='text-base font-semibold text-white'>
            Contribution confirmed
          </h3>
          <p className='mt-1 text-sm text-gray-400'>
            Your sponsorship is now part of the prize pool. Thank you for
            backing this hackathon.
          </p>
        </div>
      </div>

      {txHash && (
        <a
          href={`https://stellar.expert/explorer/public/tx/${txHash}`}
          target='_blank'
          rel='noreferrer'
          className='hover:border-primary/30 group mt-5 flex items-center justify-between rounded-xl border border-white/5 bg-black/40 px-4 py-3 transition-colors'
        >
          <div className='min-w-0'>
            <div className='text-[10px] font-medium tracking-[0.18em] text-gray-500 uppercase'>
              Stellar transaction
            </div>
            <div className='mt-0.5 truncate font-mono text-xs text-white'>
              {txHash}
            </div>
          </div>
          <ExternalLink className='group-hover:text-primary ml-3 h-4 w-4 shrink-0 text-gray-500 transition-colors' />
        </a>
      )}
    </div>
  );
}

function ClosedPanel({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className='flex items-start gap-3'>
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5'>
        {icon}
      </div>
      <div>
        <h3 className='text-base font-semibold text-white'>{title}</h3>
        <p className='mt-1 text-sm text-gray-400'>{body}</p>
      </div>
    </div>
  );
}
