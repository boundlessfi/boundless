'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { contributeToProject } from '@/features/projects/api';
import { useWalletInfo } from '@/hooks/use-wallet';
import { Loader2, DollarSign, MessageSquare, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface FundingModalProps {
  campaignId: string;
  projectTitle: string;
  currentRaised: number;
  fundingGoal: number;
  escrowAddress: string;
  children: React.ReactNode;
}

export function FundingModal({
  campaignId,
  projectTitle,
  currentRaised,
  fundingGoal,
  escrowAddress,
  children,
}: FundingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'signing' | 'confirming'>('input');
  const [error, setError] = useState<string | null>(null);
  const walletInfo = useWalletInfo();
  const address = walletInfo?.address || '';

  const remainingGoal = Math.max(0, fundingGoal - currentRaised);
  const progressPercentage = (currentRaised / fundingGoal) * 100;

  const handleFund = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > remainingGoal) {
      setError(
        `Amount cannot exceed remaining goal of $${remainingGoal.toLocaleString()}`
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await contributeToProject(campaignId, {
        amount: parseFloat(amount),
        message: message || undefined,
        anonymous,
      });

      if (data.success) {
        toast.success('Thank you for your contribution!', {
          description: `You've successfully funded $${parseFloat(amount).toLocaleString()} USDC`,
        });

        // Success - close modal and refresh data
        setIsOpen(false);
        setAmount('');
        setMessage('');
        setAnonymous(false);
        setStep('input');

        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to contribute');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during contribution');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepMessage = () => {
    return 'Enter the amount you want to contribute';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle className='text-foreground flex items-center gap-2'>
            Fund {projectTitle}
          </DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            {getStepMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          {/* Funding Progress */}
          <div className='border-border bg-muted/30 space-y-3 rounded-lg border p-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Campaign Progress</span>
              <span className='text-foreground font-medium'>
                ${currentRaised.toLocaleString()} / $
                {fundingGoal.toLocaleString()}
              </span>
            </div>
            <div className='bg-muted h-2.5 w-full overflow-hidden rounded-full'>
              <div
                className='bg-primary h-full rounded-full transition-all duration-500 ease-out'
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-muted-foreground'>
                {remainingGoal > 0
                  ? `$${remainingGoal.toLocaleString()} remaining`
                  : 'Goal reached!'}
              </span>
              <span className='text-primary font-medium'>
                {Math.min(progressPercentage, 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Amount Input */}
          {step === 'input' && (
            <div className='space-y-5'>
              <div className='space-y-2'>
                <Label htmlFor='amount' className='text-sm font-medium'>
                  Contribution Amount (USDC)
                </Label>
                <div className='relative'>
                  <DollarSign className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                  <Input
                    id='amount'
                    type='number'
                    placeholder='Enter amount'
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className='h-11 pl-10 text-base'
                    min='0'
                    max={remainingGoal}
                    step='0.01'
                  />
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <p className='text-muted-foreground text-xs'>
                    ≈ {parseFloat(amount).toLocaleString()} USDC on Stellar
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='message'
                  className='flex items-center gap-2 text-sm font-medium'
                >
                  <MessageSquare className='h-4 w-4' />
                  Message{' '}
                  <span className='text-muted-foreground text-xs font-normal'>
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id='message'
                  placeholder='Leave a message of support...'
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className='min-h-[80px] resize-none'
                  maxLength={500}
                />
                {message && (
                  <p className='text-muted-foreground text-right text-xs'>
                    {message.length}/500
                  </p>
                )}
              </div>

              <div className='border-border bg-muted/20 flex items-start space-x-3 rounded-lg border p-3'>
                <Checkbox
                  id='anonymous'
                  checked={anonymous}
                  onCheckedChange={checked => setAnonymous(checked as boolean)}
                />
                <div className='grid gap-1.5 leading-none'>
                  <label
                    htmlFor='anonymous'
                    className='flex items-center gap-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    <EyeOff className='h-4 w-4' />
                    Contribute anonymously
                  </label>
                  <p className='text-muted-foreground text-xs'>
                    Your name will be hidden from public view
                  </p>
                </div>
              </div>

              {error && (
                <div className='border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'>
                  {error}
                </div>
              )}

              <div className='flex gap-3 pt-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsOpen(false)}
                  className='flex-1'
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFund}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  className='flex-1'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Processing...
                    </>
                  ) : (
                    'Contribute Now'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Signing/Confirming State */}
          {(step === 'signing' || step === 'confirming') && (
            <div className='space-y-4 py-8 text-center'>
              <div className='bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                <Loader2 className='text-primary h-8 w-8 animate-spin' />
              </div>
              <div className='space-y-1'>
                <p className='text-foreground font-medium'>
                  {getStepMessage()}
                </p>
                <p className='text-muted-foreground text-sm'>
                  {step === 'signing'
                    ? 'Check your wallet to approve the transaction'
                    : 'This may take a few moments'}
                </p>
              </div>
              {error && (
                <div className='border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
