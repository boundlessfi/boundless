import { Metadata } from 'next';
import { ReactNode } from 'react';
import { Footer, Navbar } from '@/components/landing-page';
import { generatePageMetadata } from '@/lib/metadata';
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';

// Generate metadata for the landing layout (home page)
export const metadata: Metadata = generatePageMetadata('home');

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className='bg-background relative flex min-h-screen flex-col'>
      <Navbar />
      <main className='flex-1'>{children}</main>
      <Footer />
      <GoogleOneTap />
    </div>
  );
}
