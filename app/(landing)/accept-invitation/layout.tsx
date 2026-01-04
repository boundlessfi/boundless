import AnimatedAuthLayout from '@/components/auth/AnimatedAuthLayout';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Authentication - Boundless',
  description: 'Sign in or create an account to access Boundless platform',
  robots: 'noindex, nofollow',
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayoutWrapper({ children }: AuthLayoutProps) {
  return (
    <div className='absolute inset-0 z-50 flex min-h-screen items-center justify-center'>
      <div className='absolute z-9999999 h-screen w-screen backdrop-blur-lg' />
      <AnimatedAuthLayout>{children}</AnimatedAuthLayout>
    </div>
  );
}
