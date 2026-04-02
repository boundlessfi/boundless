'use client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { CheckCircle, AlertCircle } from 'lucide-react';

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasVerified = useRef(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');

    if (!tokenParam) {
      setStatus('error');
      setErrorMessage(
        'No verification token found. Please check your email link.'
      );
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    authClient.verifyEmail({
      query: { token: tokenParam },
      fetchOptions: {
        onSuccess: () => {
          setStatus('success');
          toast.success('Email verified successfully');
          setTimeout(() => {
            router.push('/onboarding');
          }, 2000);
        },
        onError: ctx => {
          setStatus('error');
          const message =
            ctx?.error?.message ||
            'Failed to verify email. The link may have expired.';
          setErrorMessage(message);
          toast.error(message);
        },
      },
    });
  }, [searchParams, router]);

  if (status === 'success') {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 backdrop-blur-lg'>
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
          <CheckCircle className='h-8 w-8 text-green-500' />
        </div>
        <h2 className='text-xl font-semibold text-white'>Email Verified!</h2>
        <p className='text-sm text-gray-400'>
          Redirecting you to get started...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 backdrop-blur-lg'>
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20'>
          <AlertCircle className='h-8 w-8 text-red-500' />
        </div>
        <h2 className='text-xl font-semibold text-white'>
          Verification Failed
        </h2>
        <p className='max-w-sm text-center text-sm text-gray-400'>
          {errorMessage}
        </p>
        <Link
          href='/auth?mode=signup'
          className='text-primary hover:text-primary/80 mt-2 text-sm underline'
        >
          Back to sign up
        </Link>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 backdrop-blur-lg'>
      <LoadingSpinner variant='spinner' size='lg' color='primary' />
      <p className='text-sm text-gray-500'>Verifying email...</p>
    </div>
  );
};

export default VerifyEmail;
