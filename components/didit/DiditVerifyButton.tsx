'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { createDiditSession } from '@/lib/api/didit';

export interface DiditVerifyButtonProps {
  onError?: (error: Error | { code?: string; message?: string }) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function DiditVerifyButton({
  onError,
  className,
  disabled = false,
  label = 'Verify identity',
}: DiditVerifyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const { verification_url } = await createDiditSession();

      if (!verification_url) {
        throw new Error('Invalid session response');
      }

      // Redirect to Didit's hosted verification page. After the user completes
      // (or cancels) verification, Didit redirects back to /api/didit/callback
      // which bounces them to /me/settings?verification=complete.
      window.location.href = verification_url;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Failed to start verification';
      setError(message);
      setLoading(false);
      onError?.(e instanceof Error ? e : new Error(message));
    }
  };

  return (
    <div className='space-y-2'>
      <Button
        type='button'
        onClick={handleVerify}
        disabled={disabled || loading}
        className={clsx(className)}
      >
        {loading ? 'Redirecting to verification…' : label}
      </Button>
      {error && (
        <p className='text-sm text-red-500' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
}
