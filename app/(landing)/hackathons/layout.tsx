import { HackathonDataProvider } from '@/lib/providers/hackathonProvider';
import { OrganizationProvider } from '@/lib/providers/OrganizationProvider';
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
    <OrganizationProvider>
      <HackathonDataProvider hackathonSlug={resolvedParams.slug}>
        {children}
      </HackathonDataProvider>
    </OrganizationProvider>
  );
}
