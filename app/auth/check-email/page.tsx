'use client';

import { MailIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BoundlessButton } from '@/components/buttons';

const CheckEmail = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-[600px]'>
        <div className='group relative rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-2 hover:border-white/30 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]'>
          <div className='pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-50'></div>
          <div className='pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30'></div>

          <div className='relative z-10'>
            <div className='flex flex-col items-center justify-center space-y-6 text-center'>
              <div className='bg-primary/10 rounded-full p-4'>
                <MailIcon className='text-primary h-12 w-12' />
              </div>

              <div className='space-y-2'>
                <h1 className='text-2xl font-semibold text-white'>
                  Check your email
                </h1>
                <p className='text-[#D9D9D9]'>
                  We've sent a verification link to{' '}
                  <span className='font-medium text-white'>{email}</span>
                </p>
                <p className='text-sm text-[#B5B5B5]'>
                  Click the link in the email to verify your account and
                  complete your signup.
                </p>
              </div>

              <div className='w-full max-w-sm space-y-4'>
                <p className='text-xs text-[#B5B5B5]'>
                  Didn't receive the email? Check your spam folder or{' '}
                  <Link
                    href='/auth?mode=signup'
                    className='text-primary underline'
                  >
                    try signing up again
                  </Link>
                </p>

                <BoundlessButton asChild fullWidth variant='outline'>
                  <Link href='/auth?mode=signin'>Back to sign in</Link>
                </BoundlessButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
