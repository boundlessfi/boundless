'use client';

import { ComponentType } from 'react';
import { useRequireAuthEnhanced } from '@/hooks/use-auth';

export function withAuth<T extends object>(
  Component: ComponentType<T>,
  redirectTo = '/auth?mode=signin'
) {
  return function AuthenticatedComponent(props: T) {
    const { session, isPending, isAuthenticated } =
      useRequireAuthEnhanced(redirectTo);

    if (isPending) {
      return (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-white'></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect via useRequireAuthEnhanced
    }

    return <Component {...props} session={session} />;
  };
}
