'use client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyEmail = async (token: string) => {
    await authClient.verifyEmail({
      query: {
        token,
      },
      fetchOptions: {
        onSuccess: () => {
          toast.success('Email verified successfully');
          router.push('/');
        },
        onError: () => {
          toast.error('Failed to verify email');
        },
      },
    });
  };
  useEffect(() => {
    const tokenParam = searchParams.get('token');

    if (tokenParam) {
      verifyEmail(tokenParam);
    }
  }, [searchParams, verifyEmail]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 backdrop-blur-lg'>
      <LoadingSpinner variant='spinner' size='lg' color='primary' />
      <p className='text-sm text-gray-500'>Verifying email...</p>
    </div>
  );
};

export default VerifyEmail;
