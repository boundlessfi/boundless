import { HackathonDataProvider } from '@/lib/providers/hackathonProvider';
import { use } from 'react';

interface HackathonLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug?: string;
  }>;
}

export default function HackathonLayout({
  children,
  params,
}: HackathonLayoutProps) {
  const resolvedParams = use(params);

  return (
    <HackathonDataProvider hackathonSlug={resolvedParams.slug}>
      {children}
    </HackathonDataProvider>
  );
}
