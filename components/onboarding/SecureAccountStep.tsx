'use client';

import { useState } from 'react';
import { Fingerprint, ShieldCheck, Smartphone } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';
import { useSmartWallet } from '@/components/providers/smart-wallet-provider';

interface SecureAccountStepProps {
  userName: string;
  onComplete: (contractId: string | null) => void;
}

export default function SecureAccountStep({
  userName,
  onComplete,
}: SecureAccountStepProps) {
  const smartWallet = useSmartWallet();
  const alreadySetUp = !!smartWallet.contractId;
  const [status, setStatus] = useState<'idle' | 'creating' | 'done' | 'error'>(
    alreadySetUp ? 'done' : 'idle'
  );

  const handleSetup = async () => {
    setStatus('creating');
    try {
      const contractId = await smartWallet.register(userName);
      setStatus('done');
      onComplete(contractId);
    } catch {
      setStatus('error');
    }
  };

  const canUsePasskey = smartWallet.isAvailable;

  return (
    <div className='flex flex-col items-center text-center'>
      {/* Icon */}
      <div className='bg-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full'>
        <Fingerprint className='text-primary h-10 w-10' />
      </div>

      <h2 className='mb-2 text-2xl font-semibold text-white'>
        Secure your account
      </h2>
      <p className='mb-8 max-w-sm text-sm leading-relaxed text-[#B5B5B5]'>
        Use your fingerprint, face, or device PIN to protect your account. This
        also creates your personal wallet — no passwords or seed phrases needed.
      </p>

      {/* Feature cards */}
      <div className='mb-8 grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2'>
        <div className='flex items-start gap-3 rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-4'>
          <ShieldCheck className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />
          <div className='text-left'>
            <p className='text-sm font-medium text-white'>Passwordless</p>
            <p className='text-xs text-[#B5B5B5]'>
              No seed phrases to remember
            </p>
          </div>
        </div>
        <div className='flex items-start gap-3 rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-4'>
          <Smartphone className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />
          <div className='text-left'>
            <p className='text-sm font-medium text-white'>Device-secured</p>
            <p className='text-xs text-[#B5B5B5]'>
              Protected by your biometrics
            </p>
          </div>
        </div>
      </div>

      {/* Status messages */}
      {status === 'done' && (
        <div className='bg-success-500/10 border-success-500/20 mb-4 w-full max-w-md rounded-xl border p-4'>
          <p className='text-success-500 text-sm font-medium'>
            Account secured! Your wallet is ready.
          </p>
        </div>
      )}
      {status === 'error' && (
        <div className='mb-4 w-full max-w-md rounded-xl border border-red-500/20 bg-red-500/10 p-4'>
          <p className='text-sm text-red-400'>
            Something went wrong. Please try again.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className='flex w-full max-w-md flex-col gap-3'>
        {status !== 'done' && canUsePasskey && (
          <BoundlessButton
            fullWidth
            onClick={handleSetup}
            loading={status === 'creating'}
            disabled={status === 'creating'}
          >
            <Fingerprint className='mr-2 h-5 w-5' />
            Set up with biometrics
          </BoundlessButton>
        )}

        {status === 'done' && (
          <BoundlessButton
            fullWidth
            onClick={() => onComplete(smartWallet.contractId)}
          >
            Continue
          </BoundlessButton>
        )}

        {!canUsePasskey && status === 'idle' && (
          <>
            <p className='text-xs text-[#B5B5B5]'>
              Passkey setup is not available on this device. A custodial wallet
              has been created for you automatically.
            </p>
            <BoundlessButton fullWidth onClick={() => onComplete(null)}>
              Continue
            </BoundlessButton>
          </>
        )}
      </div>
    </div>
  );
}
