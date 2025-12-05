'use client';

import React, { useEffect } from 'react';
import { useAuthStatus } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  requireVerified?: boolean;
  requireRole?: 'USER' | 'ADMIN';
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/auth/signin',
  requireAuth = true,
  requireVerified = false,
  requireRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check if user verification is required
    if (requireVerified && user && !user.profile?.isVerified) {
      router.push('/auth/verify-email');
      return;
    }

    // Check if specific role is required
    if (requireRole && user && user.role !== requireRole) {
      router.push('/unauthorized');
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    requireAuth,
    requireVerified,
    requireRole,
    router,
    redirectTo,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-white'></div>
        </div>
      )
    );
  }

  // Show fallback if not authenticated and auth is required
  if (requireAuth && !isAuthenticated) {
    return (
      fallback || (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-white'></div>
        </div>
      )
    );
  }

  // Show fallback if user is not verified
  if (requireVerified && user && !user.profile?.isVerified) {
    return (
      fallback || (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='text-center'>
            <h2 className='mb-2 text-xl font-semibold'>
              Email Verification Required
            </h2>
            <p className='text-gray-600'>
              Please verify your email address to continue.
            </p>
          </div>
        </div>
      )
    );
  }

  // Show fallback if user doesn't have required role
  if (requireRole && user && user.role !== requireRole) {
    return (
      fallback || (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='text-center'>
            <h2 className='mb-2 text-xl font-semibold'>Access Denied</h2>
            <p className='text-gray-600'>
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Convenience components for different protection levels
export function RequireAuth({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'requireAuth'>) {
  return (
    <ProtectedRoute requireAuth={true} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function RequireVerified({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'requireVerified'>) {
  return (
    <ProtectedRoute requireVerified={true} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function RequireAdmin({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'requireRole'>) {
  return (
    <ProtectedRoute requireRole='ADMIN' {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function RequireUser({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'requireRole'>) {
  return (
    <ProtectedRoute requireRole='USER' {...props}>
      {children}
    </ProtectedRoute>
  );
}
