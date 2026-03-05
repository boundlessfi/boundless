'use client';

import React, { useEffect } from 'react';
import { BoundlessButton } from '@/components/buttons';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { reportError } from '@/lib/error-reporting';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error: React.FC<ErrorProps> = ({ error, reset }) => {
  useEffect(() => {
    reportError(error, {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  const handleReset = () => {
    reset();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-lg'>
        {/* Error Card */}
        <div className='rounded-[12px] border border-[#21413F3D] bg-[#1C1C1C] p-8 text-center shadow-[0_1.5px_4px_-1px_rgba(16,25,40,0.07)]'>
          {/* Error Icon */}
          <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10'>
            <AlertTriangle className='h-8 w-8 text-red-500' />
          </div>

          {/* Error Title */}
          <h1 className='mb-4 text-2xl font-bold text-white'>
            Something went wrong
          </h1>

          {/* Error Message */}
          <p className='mb-6 text-sm leading-relaxed text-gray-400'>
            We encountered an unexpected error. If you have error reporting
            enabled, our team has been notified. Otherwise, try again or contact
            support.
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className='mb-6 rounded-lg bg-[#2A2A2A] p-4 text-left'>
              <h3 className='mb-2 text-sm font-semibold text-white'>
                Error Details:
              </h3>
              <p className='font-mono text-xs break-all text-red-400'>
                {error.message}
              </p>
              {error.digest && (
                <p className='mt-2 text-xs text-gray-500'>
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className='space-y-3'>
            <BoundlessButton
              onClick={handleReset}
              className='w-full'
              icon={<RefreshCw className='h-4 w-4' />}
            >
              Try Again
            </BoundlessButton>

            <div className='flex gap-3'>
              <BoundlessButton
                variant='secondary'
                onClick={handleGoBack}
                className='flex-1'
                icon={<ArrowLeft className='h-4 w-4' />}
              >
                Go Back
              </BoundlessButton>

              <BoundlessButton
                variant='secondary'
                onClick={handleGoHome}
                className='flex-1'
                icon={<Home className='h-4 w-4' />}
              >
                Go Home
              </BoundlessButton>
            </div>
          </div>

          {/* Support Info */}
          <div className='mt-6 border-t border-[#2A2A2A] pt-6'>
            <p className='text-xs text-gray-500'>
              Still having issues?{' '}
              <a
                href='mailto:support@boundlessfi.xyz'
                className='text-blue-400 underline hover:text-blue-300'
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-6 text-center'>
          <p className='text-xs text-gray-600'>
            Boundless Platform • Error Page
          </p>
        </div>
      </div>
    </div>
  );
};

export default Error;
