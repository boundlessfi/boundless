'use client';

import { HackathonDataProvider } from '@/lib/providers/hackathonProvider';

interface HackathonLayoutProps {
  children: React.ReactNode;
  params: {
    slug?: string;
  };
}

export default function HackathonLayout({
  children,
  params,
}: HackathonLayoutProps) {
  return (
    <HackathonDataProvider hackathonSlug={params.slug}>
      {children}
    </HackathonDataProvider>
  );
}
