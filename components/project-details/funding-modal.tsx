'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  prepareProjectFunding,
  confirmProjectFunding,
} from '@/lib/api/project';
import { useWalletInfo, useWalletSigning } from '@/hooks/use-wallet';
import { Loader2, DollarSign } from 'lucide-react';

interface FundingModalProps {
  projectId: string;
  projectTitle: string;
  currentRaised: number;
  fundingGoal: number;
  children: React.ReactNode;
}

export function FundingModal({
  projectId,
  projectTitle,
  currentRaised,
  fundingGoal,
  children,
}: FundingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'signing' | 'confirming'>('input');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [unsignedXdr, setUnsignedXdr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const walletSigning = useWalletSigning();
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
      // Step 1: Prepare funding
      setStep('signing');
      const prepareResponse = await prepareProjectFunding(projectId, {
        amount: parseFloat(amount),
        signer: address || '',
      });

      if (!prepareResponse.success) {
        throw new Error(prepareResponse.message || 'Failed to prepare funding');
      }

      setUnsignedXdr(prepareResponse.data.unsignedXdr);

      // Step 2: Sign transaction
      const signedXdr = await walletSigning.signTransaction(
        prepareResponse.data.unsignedXdr
      );

      // Step 3: Confirm funding
      setStep('confirming');
      const confirmResponse = await confirmProjectFunding(projectId, {
        signedXdr,
        transactionHash: 'mock-hash', // This should come from the signing process
        amount: parseFloat(amount),
      });

      if (!confirmResponse.success) {
        throw new Error(confirmResponse.message || 'Failed to confirm funding');
      }

      // Success - close modal and refresh data
      setIsOpen(false);
      setAmount('');
      setStep('input');
      setUnsignedXdr(null);

      // TODO: Refresh project data or show success message
      window.location.reload(); // Temporary solution
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepMessage = () => {
    switch (step) {
      case 'signing':
        return 'Please sign the transaction in your wallet...';
      case 'confirming':
        return 'Confirming your funding...';
      default:
        return 'Enter the amount you want to contribute';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='border-gray-800 bg-[#1a1a1a] sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-white'>
            <DollarSign className='h-5 w-5' />
            Fund {projectTitle}
          </DialogTitle>
          <DialogDescription className='text-gray-400'>
            {getStepMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Funding Progress */}
          <div className='space-y-3'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-400'>Progress</span>
              <span className='text-white'>
                ${currentRaised.toLocaleString()} / $
                {fundingGoal.toLocaleString()}
              </span>
            </div>
            <div className='h-2 w-full rounded-full bg-gray-700'>
              <div
                className='h-2 rounded-full bg-[#A7F950] transition-all duration-300'
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className='text-xs text-gray-400'>
              {remainingGoal > 0
                ? `$${remainingGoal.toLocaleString()} remaining`
                : 'Goal reached!'}
            </div>
          </div>

          {/* Amount Input */}
          {step === 'input' && (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='amount' className='text-white'>
                  Amount (USD)
                </Label>
                <div className='relative'>
                  <DollarSign className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    id='amount'
                    type='number'
                    placeholder='0.00'
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className='border-gray-600 bg-[#2a2a2a] pl-10 text-white'
                    min='0'
                    max={remainingGoal}
                    step='0.01'
                  />
                </div>
              </div>

              {error && <div className='text-sm text-red-400'>{error}</div>}

              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  onClick={() => setIsOpen(false)}
                  className='flex-1 border-gray-600 text-gray-300 hover:bg-gray-800'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFund}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  className='flex-1 bg-[#A7F950] text-black hover:bg-[#A7F950]/90'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Processing...
                    </>
                  ) : (
                    'Fund Project'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Signing/Confirming State */}
          {(step === 'signing' || step === 'confirming') && (
            <div className='space-y-4 text-center'>
              <Loader2 className='mx-auto h-8 w-8 animate-spin text-[#A7F950]' />
              <p className='text-white'>{getStepMessage()}</p>
              {error && <div className='text-sm text-red-400'>{error}</div>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
