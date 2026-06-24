'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Wallet, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  contributeV2,
  submitSignedContribution,
} from '@/features/crowdfunding';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { connectWallet, signXdrWithKit } from '@/lib/wallet/wallet-kit';

type WalletOrigin = 'BOUNDLESS' | 'EXTERNAL';

/** Contract floor: contributions must be at least 10 USDC. */
export const MIN_CONTRIBUTION = 10;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  campaignTitle: string;
  fundingGoal: number;
  raisedAmount?: number;
}

export function ContributeSheet({
  open,
  onOpenChange,
  campaignId,
  campaignTitle,
  fundingGoal,
  raisedAmount = 0,
}: Props) {
  const [amount, setAmount] = useState('');
  const [walletOrigin, setWalletOrigin] = useState<WalletOrigin>('BOUNDLESS');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { walletAddress } = useWalletContext();
  const queryClient = useQueryClient();

  const numAmount = parseFloat(amount);
  const remaining = Math.max(0, fundingGoal - raisedAmount);
  const overRemaining = !isNaN(numAmount) && numAmount > remaining;
  const isValidAmount =
    !isNaN(numAmount) &&
    numAmount >= MIN_CONTRIBUTION &&
    numAmount <= remaining;

  const reset = () => {
    setAmount('');
    setWalletOrigin('BOUNDLESS');
    setMessage('');
    setAnonymous(false);
    setDone(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
  };

  const handleContribute = async () => {
    if (!isValidAmount || submitting) return;
    setSubmitting(true);
    try {
      const base = {
        amount: numAmount,
        message: message.trim() || undefined,
        anonymous,
      };
      if (walletOrigin === 'BOUNDLESS') {
        if (!walletAddress) {
          throw new Error('Connect your Boundless wallet to contribute.');
        }
        // Managed: the backend signs + submits with the custodial wallet.
        await contributeV2(campaignId, {
          ...base,
          walletOrigin: 'BOUNDLESS',
          contributorAddress: walletAddress,
        });
      } else {
        // External: connect a wallet, get the unsigned XDR, sign it, submit it.
        const connected = await connectWallet();
        const op = await contributeV2(campaignId, {
          ...base,
          walletOrigin: 'EXTERNAL',
          contributorAddress: connected.address,
        });
        if (!op?.unsignedXdr) {
          throw new Error('Could not build the contribution transaction.');
        }
        const signedXdr = await signXdrWithKit(
          op.unsignedXdr,
          connected.address
        );
        await submitSignedContribution(campaignId, op.opRowId, signedXdr);
      }
      // Refresh campaign data (raised total, backers) once the op is in flight.
      queryClient.invalidateQueries({ queryKey: ['crowdfunding'] });
      setDone(true);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Contribution failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet
      open={open}
      // Keep the sheet open mid-flow: the external path opens the wallet kit
      // modal while submitting, which Radix would otherwise treat as an outside
      // interaction and tear the contribute form down.
      onOpenChange={next => {
        if (!next && submitting) return;
        if (!next) handleClose();
      }}
      // Non-modal so the wallet kit's connect/sign popup stays interactive. A
      // modal sheet traps focus and blocks the wallet UI.
      modal={false}
    >
      <SheetContent
        side='right'
        className='w-full border-zinc-800 bg-zinc-950 sm:max-w-md'
        onInteractOutside={e => {
          if (submitting) e.preventDefault();
        }}
        onEscapeKeyDown={e => {
          if (submitting) e.preventDefault();
        }}
      >
        {done ? (
          <div className='flex h-full flex-col items-center justify-center gap-6 text-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/50 ring-1 ring-emerald-800/50'>
              <CheckCircle2 className='h-8 w-8 text-emerald-400' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-white'>
                Contribution submitted
              </h2>
              <p className='mt-2 text-sm text-zinc-500'>
                Thank you for backing{' '}
                <span className='text-zinc-300'>{campaignTitle}</span>. It will
                appear in the supporters list once confirmed.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className='bg-primary hover:bg-primary/90 w-full'
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <SheetHeader className='mb-6'>
              <SheetTitle className='text-white'>Back this project</SheetTitle>
              <SheetDescription className='text-zinc-500'>
                Your money is held safely and released to the team as each
                milestone is delivered and approved.
              </SheetDescription>
            </SheetHeader>

            <div className='space-y-6'>
              {/* Remaining to raise */}
              <div className='rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 text-sm'>
                <div className='flex items-center justify-between'>
                  <span className='text-zinc-500'>Still needed</span>
                  <span className='font-semibold text-white'>
                    ${remaining.toLocaleString()} USDC
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium text-zinc-300'>
                  Amount (USDC) <span className='text-red-400'>*</span>
                </Label>
                <div className='relative'>
                  <span className='absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500'>
                    $
                  </span>
                  <Input
                    type='number'
                    min={MIN_CONTRIBUTION}
                    max={remaining}
                    step='any'
                    placeholder='0.00'
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className='border-zinc-800 bg-zinc-900 pl-7 text-white placeholder:text-zinc-600'
                  />
                </div>
                {amount && overRemaining ? (
                  <p className='text-xs text-red-400'>
                    Only ${remaining.toLocaleString()} left to reach the goal.
                  </p>
                ) : amount && !isValidAmount ? (
                  <p className='text-xs text-red-400'>
                    Minimum contribution is ${MIN_CONTRIBUTION} USDC.
                  </p>
                ) : null}
              </div>

              {/* Wallet selector */}
              <div className='space-y-3'>
                <Label className='text-sm font-medium text-zinc-300'>
                  Pay with
                </Label>
                <div className='grid grid-cols-2 gap-3'>
                  {(
                    [
                      {
                        id: 'BOUNDLESS' as WalletOrigin,
                        icon: Zap,
                        label: 'Boundless wallet',
                        sub: 'No extra steps',
                      },
                      {
                        id: 'EXTERNAL' as WalletOrigin,
                        icon: Wallet,
                        label: 'My wallet',
                        sub: 'Sign in Freighter',
                      },
                    ] as const
                  ).map(opt => (
                    <button
                      key={opt.id}
                      type='button'
                      onClick={() => setWalletOrigin(opt.id)}
                      className={cn(
                        'flex flex-col items-start rounded-xl border p-3 text-left transition',
                        walletOrigin === opt.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                      )}
                    >
                      <opt.icon className='mb-1.5 h-4 w-4' />
                      <span className='text-sm font-medium'>{opt.label}</span>
                      <span className='text-xs opacity-70'>{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium text-zinc-300'>
                  Leave a message{' '}
                  <span className='font-normal text-zinc-600'>(optional)</span>
                </Label>
                <Textarea
                  placeholder='Cheer the team on...'
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  maxLength={280}
                  className='resize-none border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600'
                />
              </div>

              {/* Anonymous toggle */}
              <div className='flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-3'>
                <div>
                  <p className='text-sm font-medium text-zinc-300'>
                    Back anonymously
                  </p>
                  <p className='text-xs text-zinc-600'>
                    Your name won't appear in the backers list.
                  </p>
                </div>
                <Switch checked={anonymous} onCheckedChange={setAnonymous} />
              </div>

              <Button
                onClick={handleContribute}
                disabled={!isValidAmount || submitting}
                className='bg-primary hover:bg-primary/90 w-full gap-2'
                size='lg'
              >
                {submitting ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    {walletOrigin === 'EXTERNAL'
                      ? 'Confirm in wallet...'
                      : 'Processing...'}
                  </>
                ) : (
                  `Contribute $${isValidAmount ? numAmount.toFixed(2) : '0.00'} USDC`
                )}
              </Button>

              <p className='text-center text-xs text-zinc-600'>
                Your money is held safely and only released as milestones are
                approved.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
