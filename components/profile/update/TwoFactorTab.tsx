'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { BoundlessButton } from '@/components/buttons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { User } from '@/types/user';
import {
  Loader2,
  Copy,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Smartphone,
} from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

interface TwoFactorTabProps {
  user: User;
  onStatusChange: () => void;
}

const TwoFactorTab = ({ user, onStatusChange }: TwoFactorTabProps) => {
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'backup'>(
    'status'
  );
  const [password, setPassword] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCodes, setShowCodes] = useState(false);

  const handleStartSetup = async () => {
    if (!password) {
      toast.error('Please enter your password to enable 2FA');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.enable({
        password,
      });

      if (error) {
        toast.error(error.message || 'Failed to start 2FA setup');
      } else if (data) {
        setTotpUri(data.totpURI);
        try {
          const url = new URL(data.totpURI);
          const secret = url.searchParams.get('secret');
          setSecretKey(secret || '');
        } catch (e) {
          // Fallback to simple split if URL parsing fails
          const secret = data.totpURI.split('secret=')[1]?.split('&')[0];
          setSecretKey(secret || '');
        }
        setBackupCodes(data.backupCodes);
        setStep('setup');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySetup = async (codeValue: string) => {
    if (codeValue.length !== 6) return;

    setIsLoading(true);
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: codeValue,
      });

      if (error) {
        toast.error(error.message || 'Verification failed');
        setVerificationCode(''); // Clear on error
      } else {
        toast.success('Two-factor authentication enabled successfully!');
        setStep('backup');
        onStatusChange();
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateCodes = async () => {
    if (!password) {
      toast.error('Please enter your password to regenerate codes');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.generateBackupCodes({
        password,
      });

      if (error) {
        toast.error(error.message || 'Failed to regenerate backup codes');
      } else if (data) {
        setBackupCodes(data.backupCodes);
        setShowCodes(true);
        setPassword('');
        toast.success('New backup codes generated');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!password) {
      toast.error('Please enter your password to disable 2FA');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authClient.twoFactor.disable({
        password,
      });

      if (error) {
        toast.error(error.message || 'Failed to disable 2FA');
      } else {
        toast.success('Two-factor authentication disabled');
        setPassword('');
        setStep('status');
        onStatusChange();
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = async (codes: string[]) => {
    const text = codes.join('\n');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('Backup codes copied to clipboard');
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (err) {
      // Fallback for older browsers or non-secure contexts
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          toast.success('Backup codes copied to clipboard');
        } else {
          throw new Error('Fallback copy failed');
        }
      } catch (fallbackErr) {
        toast.error('Unable to copy backup codes');
      }
    }
  };

  if (user.twoFactorEnabled && step === 'status') {
    return (
      <div className='space-y-6'>
        <div className='flex items-start gap-4 rounded-xl border border-[#a7f950]/20 bg-[#a7f950]/5 p-6 md:p-8'>
          <div className='rounded-lg bg-[#a7f950]/10 p-2'>
            <ShieldCheck className='h-6 w-6 text-[#a7f950]' />
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-white'>2FA is Enabled</h3>
            <p className='mt-1 text-sm text-[#B5B5B5]'>
              Your account is protected with an extra layer of security. You
              will be prompted for a verification code when signing in.
            </p>
          </div>
        </div>

        <div className='space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <KeyRound className='h-5 w-5 text-[#a7f950]' />
              <h4 className='font-medium text-white'>Backup Codes</h4>
            </div>
            <p className='text-sm text-[#B5B5B5]'>
              Backup codes can be used to access your account if you lose your
              authentication device. Each code can only be used once.
            </p>

            {!showCodes ? (
              <div className='space-y-4 pt-2'>
                <div className='space-y-2'>
                  <Label htmlFor='regen-password'>
                    Confirm Password to View/Regenerate
                  </Label>
                  <Input
                    id='regen-password'
                    type='password'
                    placeholder='Enter your password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                  />
                </div>
                <div className='flex gap-3'>
                  <BoundlessButton
                    variant='outline'
                    onClick={handleRegenerateCodes}
                    loading={isLoading}
                  >
                    Regenerate Codes
                  </BoundlessButton>
                  <BoundlessButton
                    variant='outline'
                    className='border-red-500/20 text-red-500 hover:bg-red-500/10'
                    onClick={handleDisable}
                    loading={isLoading}
                  >
                    Disable 2FA
                  </BoundlessButton>
                </div>
              </div>
            ) : (
              <div className='space-y-6 pt-2'>
                <div className='grid grid-cols-2 gap-3'>
                  {backupCodes.map((code, i) => (
                    <div
                      key={i}
                      className='rounded border border-white/10 bg-white/5 p-3 text-center font-mono text-sm tracking-widest text-white uppercase'
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <div className='flex gap-3'>
                  <BoundlessButton
                    variant='outline'
                    size='sm'
                    onClick={() => copyBackupCodes(backupCodes)}
                  >
                    <Copy className='mr-2 h-4 w-4' /> Copy All
                  </BoundlessButton>
                  <BoundlessButton
                    variant='outline'
                    size='sm'
                    onClick={() => setShowCodes(false)}
                  >
                    Hide Codes
                  </BoundlessButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'status') {
    return (
      <div className='space-y-6'>
        <div className='flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
          <div className='rounded-lg bg-yellow-500/10 p-2'>
            <ShieldAlert className='h-6 w-6 text-yellow-500' />
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-white'>
              2FA is Not Enabled
            </h3>
            <p className='mt-1 text-sm text-[#B5B5B5]'>
              We recommend enabling two-factor authentication to keep your
              account secure. You'll need an authenticator app like Google
              Authenticator or Authy.
            </p>
          </div>
        </div>

        <div className='space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
          <div className='space-y-2'>
            <Label htmlFor='setup-password'>Confirm Password to Setup</Label>
            <Input
              id='setup-password'
              type='password'
              placeholder='Enter your password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
            />
          </div>
          <BoundlessButton onClick={handleStartSetup} loading={isLoading}>
            Setup 2FA
          </BoundlessButton>
        </div>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className='space-y-8'>
        <div className='flex items-center gap-4'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#a7f950] font-bold text-[#141414]'>
            1
          </div>
          <h3 className='text-xl font-bold text-white'>Scan QR Code</h3>
        </div>

        <div className='flex flex-col items-center gap-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 md:flex-row'>
          <div className='rounded-lg bg-white p-4'>
            <QRCodeSVG value={totpUri} size={180} />
          </div>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Smartphone className='h-5 w-5 text-[#a7f950]' />
              <p className='text-sm text-[#B5B5B5]'>
                Scan this code with your authenticator app.
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <KeyRound className='h-5 w-5 text-[#a7f950]' />
              <p className='text-sm text-[#B5B5B5]'>
                If you can't scan, you can manually enter the secret key.
              </p>
            </div>

            {secretKey && (
              <div className='flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-3'>
                <div className='flex flex-col'>
                  <span className='mb-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase'>
                    Secret Key
                  </span>
                  <code className='font-mono text-sm break-all text-[#a7f950]'>
                    {secretKey}
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(secretKey);
                    toast.success('Secret key copied');
                  }}
                  className='shrink-0 rounded-md p-2 transition-colors hover:bg-white/5'
                  title='Copy Secret Key'
                >
                  <Copy className='h-4 w-4 text-zinc-400' />
                </button>
              </div>
            )}

            <div className='pt-2'>
              <BoundlessButton
                size='sm'
                variant='outline'
                onClick={() => setStep('verify')}
              >
                Next: Verify Code
              </BoundlessButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className='space-y-8'>
        <div className='flex items-center gap-4'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#a7f950] font-bold text-[#141414]'>
            2
          </div>
          <h3 className='text-xl font-bold text-white'>Verify Setup</h3>
        </div>

        <div className='space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-8'>
          <div className='space-y-2 text-center'>
            <p className='text-[#B5B5B5]'>
              Enter the 6-digit code from your app to confirm everything is
              working.
            </p>
          </div>
          <div className='flex w-full justify-center'>
            <InputOTP
              maxLength={6}
              value={verificationCode}
              onChange={val => {
                setVerificationCode(val);
                if (val.length === 6) {
                  handleVerifySetup(val);
                }
              }}
              disabled={isLoading}
              autoFocus
            >
              <InputOTPGroup className='gap-2 sm:gap-4'>
                <InputOTPSlot
                  index={0}
                  className='h-14 w-12 rounded-lg border-zinc-800 bg-zinc-900/50 text-2xl text-[#a7f950]'
                />
                <InputOTPSlot
                  index={1}
                  className='h-14 w-12 rounded-lg border-zinc-800 bg-zinc-900/50 text-2xl text-[#a7f950]'
                />
                <InputOTPSlot
                  index={2}
                  className='h-14 w-12 rounded-lg border-zinc-800 bg-zinc-900/50 text-2xl text-[#a7f950]'
                />
                <InputOTPSlot
                  index={3}
                  className='h-14 w-12 rounded-lg border-zinc-800 bg-zinc-900/50 text-2xl text-[#a7f950]'
                />
                <InputOTPSlot
                  index={4}
                  className='h-14 w-12 rounded-lg border-zinc-800 bg-zinc-900/50 text-2xl text-[#a7f950]'
                />
                <InputOTPSlot
                  index={5}
                  className='h-14 w-12 rounded-lg border-zinc-800 bg-zinc-900/50 text-2xl text-[#a7f950]'
                />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className='flex gap-4'>
            <BoundlessButton
              fullWidth
              variant='outline'
              onClick={() => setStep('setup')}
              disabled={isLoading}
            >
              Back
            </BoundlessButton>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className='space-y-8'>
        <div className='space-y-4 rounded-xl border border-[#a7f950]/20 bg-[#a7f950]/10 p-6'>
          <div className='flex items-center gap-3 text-[#a7f950]'>
            <ShieldCheck className='h-6 w-6' />
            <h3 className='text-xl font-bold'>2FA Enabled Successfully</h3>
          </div>
          <p className='text-sm text-[#B5B5B5]'>
            Please save these backup codes in a safe place. You can use them to
            access your account if you lose your phone.
          </p>
        </div>

        <div className='space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-8'>
          <div className='grid grid-cols-2 gap-4'>
            {backupCodes.map((code, i) => (
              <div
                key={i}
                className='rounded border border-white/10 bg-white/5 p-3 text-center font-mono tracking-widest text-white uppercase'
              >
                {code}
              </div>
            ))}
          </div>
          <div className='flex gap-4'>
            <BoundlessButton
              fullWidth
              variant='outline'
              onClick={() => copyBackupCodes(backupCodes)}
            >
              <Copy className='mr-2 h-4 w-4' /> Copy Codes
            </BoundlessButton>
            <BoundlessButton
              fullWidth
              onClick={() => {
                setStep('status');
                setPassword('');
                setShowCodes(false);
              }}
            >
              Done
            </BoundlessButton>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TwoFactorTab;
