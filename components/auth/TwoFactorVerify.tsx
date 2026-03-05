'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { LockIcon } from 'lucide-react';

interface TwoFactorVerifyProps {
  onSuccess: () => Promise<void>;
  onCancel: () => void;
}

const TwoFactorVerify = ({ onSuccess, onCancel }: TwoFactorVerifyProps) => {
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBackupMode, setIsBackupMode] = useState(false);

  const handleVerify = async (codeValue: string) => {
    if (codeValue.length < 6) return;

    setIsLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code: codeValue,
      });

      if (error) {
        toast.error(error.message || 'Verification failed');
        setCode(''); // Clear on error to let user try again
        return;
      }

      if (data) {
        toast.success('Verification successful');
        await onSuccess();
      }
    } catch (err) {
      toast.error('An unexpected error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyBackupCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!backupCode) {
      toast.error('Please enter a backup code');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.verifyBackupCode({
        code: backupCode.trim(),
      });

      if (error) {
        toast.error(error.message || 'Verification failed');
        setBackupCode('');
        return;
      }

      if (data) {
        toast.success('Recovery successful');
        setBackupCode('');
        await onSuccess();
      }
    } catch (err) {
      toast.error('An unexpected error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <div className='mb-4 flex justify-center'>
          <div className='rounded-full bg-[#a7f950]/10 p-3'>
            <LockIcon className='h-8 w-8 text-[#a7f950]' />
          </div>
        </div>
        <h2 className='text-2xl font-bold text-white'>
          {isBackupMode ? 'Account Recovery' : 'Two-Factor Authentication'}
        </h2>
        <p className='text-sm text-[#B5B5B5]'>
          {isBackupMode
            ? 'Enter a one-time backup code to access your account.'
            : 'Enter the 6-digit verification code from your authenticator app.'}
        </p>
      </div>

      <div className='flex flex-col items-center space-y-8'>
        {!isBackupMode ? (
          <div className='flex w-full flex-col items-center space-y-6'>
            <div className='flex w-full justify-center'>
              <InputOTP
                maxLength={6}
                value={code}
                onChange={val => {
                  setCode(val);
                  if (val.length === 6) {
                    handleVerify(val);
                  }
                }}
                disabled={isLoading}
                autoFocus
              >
                <InputOTPGroup className='gap-2 sm:gap-4'>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className='h-14 w-12 rounded-lg border-zinc-800 bg-zinc-900/50 text-2xl text-[#a7f950] sm:h-16 sm:w-14'
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              onClick={() => setIsBackupMode(true)}
              className='text-sm text-zinc-400 transition-colors hover:text-white'
            >
              Lost access to your device? Use a backup code
            </button>
          </div>
        ) : (
          <div className='w-full space-y-6'>
            <form onSubmit={handleVerifyBackupCode} className='space-y-4'>
              <div className='space-y-2'>
                <input
                  type='text'
                  placeholder='Enter backup code'
                  value={backupCode}
                  onChange={e => setBackupCode(e.target.value)}
                  className='h-14 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 text-center text-xl tracking-widest text-white focus:border-[#a7f950]/50 focus:outline-none'
                  autoFocus
                />
              </div>
              <button
                type='submit'
                disabled={isLoading || !backupCode}
                className='h-12 w-full rounded-lg bg-[#a7f950] font-bold text-black transition-colors hover:bg-[#96e048] disabled:opacity-50'
              >
                {isLoading ? 'Verifying...' : 'Recover Account'}
              </button>
            </form>

            <button
              onClick={() => setIsBackupMode(false)}
              className='w-full text-center text-sm text-zinc-400 transition-colors hover:text-white'
            >
              Back to regular 2FA
            </button>
          </div>
        )}

        <div className='w-full space-y-4 border-t border-zinc-800/50 pt-4'>
          <button
            type='button'
            onClick={onCancel}
            disabled={isLoading}
            className='flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white'
          >
            Cancel and return to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerify;
