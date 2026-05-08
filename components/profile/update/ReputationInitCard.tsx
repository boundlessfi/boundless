'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BoundlessButton } from '@/components/buttons';
import {
  getOnboardingStatus,
  confirmReputationInit,
} from '@/lib/api/onboarding';
import { initReputationProfile } from '@/lib/contracts/reputation-registry';
import { useSmartWallet } from '@/hooks/use-smart-wallet';
import { Star, CheckCircle2, AlertTriangle } from 'lucide-react';

const ReputationInitCard = () => {
  const { contractId } = useSmartWallet();
  const [status, setStatus] = useState<
    'loading' | 'initialized' | 'failed' | 'hidden'
  >('loading');
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    getOnboardingStatus()
      .then(data => {
        if (!data.completed) {
          setStatus('hidden');
        } else if (data.reputationInitialized) {
          setStatus('initialized');
        } else {
          setStatus('failed');
        }
      })
      .catch(() => setStatus('hidden'));
  }, []);

  const handleRetry = async () => {
    if (!contractId) {
      toast.error(
        'No smart wallet connected. Please connect your wallet first.'
      );
      return;
    }
    setIsRetrying(true);
    try {
      // Sign and submit init_profile on-chain via passkey
      await initReputationProfile(contractId);
      // Confirm in backend DB
      await confirmReputationInit();
      setStatus('initialized');
      toast.success('Reputation profile initialized successfully');
    } catch {
      toast.error('Failed to initialize reputation profile. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (status === 'loading' || status === 'hidden') return null;

  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex gap-3'>
          <div className='bg-primary/10 shrink-0 rounded-lg p-2'>
            <Star className='text-primary h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-white'>
              On-Chain Reputation
            </h3>
            {status === 'initialized' ? (
              <p className='mt-1 text-sm text-[#B5B5B5]'>
                Your on-chain reputation profile is active. Your activity across
                bounties, grants, and hackathons is being tracked.
              </p>
            ) : (
              <p className='mt-1 text-sm text-[#B5B5B5]'>
                Your on-chain reputation profile failed to initialize during
                onboarding. Initialize it now to participate in bounties,
                grants, and hackathons.
              </p>
            )}
          </div>
        </div>

        {status === 'initialized' ? (
          <div className='flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
            <CheckCircle2 className='text-primary h-3.5 w-3.5 shrink-0' />
            <span className='text-xs font-medium whitespace-nowrap text-white uppercase'>
              Active
            </span>
          </div>
        ) : (
          <div className='flex shrink-0 flex-col items-end gap-2'>
            <div className='flex w-fit items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1'>
              <AlertTriangle className='h-3.5 w-3.5 shrink-0 text-amber-400' />
              <span className='text-xs font-medium whitespace-nowrap text-amber-400 uppercase'>
                Not initialized
              </span>
            </div>
            <BoundlessButton
              size='sm'
              loading={isRetrying}
              onClick={handleRetry}
            >
              Initialize Reputation
            </BoundlessButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReputationInitCard;
