'use client';

import { useState } from 'react';
import { Fingerprint, ShieldCheck, Smartphone } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useCreateWallet } from '@/hooks/wallet/useCreateWallet';
import { useConnect } from '@/hooks/wallet/useConnect';
import { parseWalletError } from '@/lib/smartwallet/errors';

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'creating' | 'connecting' | 'done' | 'error';

interface SecureAccountStepProps {
  email: string;
  onComplete: (contractId: string | null) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// WebAuthn is a browser API — check at runtime, not build time
function isPasskeyAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SecureAccountStep({
  email,
  onComplete,
}: SecureAccountStepProps) {
  const contractId = useWalletStore(s => s.contractId);
  const alreadySetUp = !!contractId;

  const createWallet = useCreateWallet();
  const connect = useConnect();

  const [status, setStatus] = useState<Status>(alreadySetUp ? 'done' : 'idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canUsePasskey = isPasskeyAvailable();
  const isPending = status === 'creating' || status === 'connecting';

  // ── Create new wallet ─────────────────────────────────────────────────────
  // Triggers WebAuthn passkey registration, then deploys the smart contract.

  const handleCreate = async () => {
    setStatus('creating');
    setErrorMsg(null);

    const result = await createWallet.mutateAsync(
      {
        appName: 'Boundless',
        userName: email,
        nativeTokenContract: process.env.NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT!,
      },
      {
        onError: err => {
          setErrorMsg(parseWalletError(err));
          setStatus('error');
        },
      }
    );

    if (result?.contractId) {
      setStatus('done');
      onComplete(result.contractId);
    }
  };

  // ── Connect existing wallet ───────────────────────────────────────────────
  // Triggers WebAuthn assertion — prompts the user to pick an existing passkey.

  const handleConnect = async () => {
    setStatus('connecting');
    setErrorMsg(null);

    await connect.mutateAsync(undefined, {
      onError: err => {
        setErrorMsg(parseWalletError(err));
        setStatus('error');
      },
      onSuccess: () => {
        // contractId is now in the Zustand store from useConnect → store.connect()
        setStatus('done');
        onComplete(contractId);
      },
    });
  };

  // ── Continue after already set up ─────────────────────────────────────────

  const handleContinue = () => {
    onComplete(contractId);
  };

  // ── Render ────────────────────────────────────────────────────────────────

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
          <ShieldCheck className='text-primary mt-0.5 h-5 w-5 shrink-0' />
          <div className='text-left'>
            <p className='text-sm font-medium text-white'>Passwordless</p>
            <p className='text-xs text-[#B5B5B5]'>
              No seed phrases to remember
            </p>
          </div>
        </div>
        <div className='flex items-start gap-3 rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-4'>
          <Smartphone className='text-primary mt-0.5 h-5 w-5 shrink-0' />
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

      {status === 'error' && errorMsg && (
        <div className='mb-4 w-full max-w-md rounded-xl border border-red-500/20 bg-red-500/10 p-4'>
          <p className='text-sm text-red-400'>{errorMsg}</p>
        </div>
      )}

      {/* Actions */}
      <div className='flex w-full max-w-md flex-col gap-3'>
        {/* Passkey not supported on this device */}
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

        {/* Wallet not yet set up — show create + connect */}
        {canUsePasskey && status !== 'done' && (
          <>
            <BoundlessButton
              fullWidth
              onClick={handleCreate}
              loading={status === 'creating'}
              disabled={isPending}
            >
              <Fingerprint className='mr-2 h-5 w-5' />
              {status === 'creating'
                ? 'Setting up your wallet…'
                : 'Set up with biometrics'}
            </BoundlessButton>

            <BoundlessButton
              fullWidth
              variant='outline'
              onClick={handleConnect}
              loading={status === 'connecting'}
              disabled={isPending}
            >
              {status === 'connecting'
                ? 'Connecting…'
                : 'I already have a wallet'}
            </BoundlessButton>
          </>
        )}

        {/* Wallet ready — just continue */}
        {status === 'done' && (
          <BoundlessButton fullWidth onClick={handleContinue}>
            Continue
          </BoundlessButton>
        )}

        {/* Skip — always visible unless done or no passkey */}
        {canUsePasskey && status !== 'done' && (
          <button
            onClick={() => onComplete(null)}
            disabled={isPending}
            className='mt-1 text-xs text-white/30 underline-offset-2 hover:text-white/50 hover:underline disabled:cursor-not-allowed'
          >
            Skip for now — I'll set this up later
          </button>
        )}
      </div>
    </div>
  );
}
