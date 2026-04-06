'use client';

import { MailIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BoundlessButton } from '@/components/buttons';
import AuthCard from '@/components/auth/AuthCard';

const CheckEmail = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <AuthCard>
      <div className='flex flex-col items-center justify-center space-y-6 text-center'>
        <div className='bg-primary/10 rounded-full p-4'>
          <MailIcon className='text-primary h-12 w-12' />
        </div>

        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold text-white'>
            Check your email
          </h1>
          {email && (
            <p className='text-[#D9D9D9]'>
              We&apos;ve sent a verification link to{' '}
              <span className='font-medium text-white'>{email}</span>
            </p>
          )}
          <p className='text-sm text-[#B5B5B5]'>
            Click the link in the email to verify your account and complete your
            signup.
          </p>
        </div>

        <div className='w-full max-w-sm space-y-4'>
          <p className='text-xs text-[#B5B5B5]'>
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <Link href='/auth?mode=signup' className='text-primary underline'>
              try signing up again
            </Link>
          </p>

          <BoundlessButton asChild fullWidth variant='outline'>
            <Link href='/auth?mode=signin'>Back to sign in</Link>
          </BoundlessButton>
        </div>
      </div>
    </AuthCard>
  );
};

export default CheckEmail;
