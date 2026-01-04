'use client';

import { ReactNode } from 'react';
import { useRequireAuthEnhanced } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  redirectTo = '/auth?mode=signin',
  fallback = (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-white'></div>
    </div>
  ),
}: AuthGuardProps) {
  const { isPending, isAuthenticated } = useRequireAuthEnhanced(redirectTo);

  if (isPending) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useRequireAuthEnhanced
  }

  return <>{children}</>;
}
