import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOrganization } from '@/lib/api/organization';
import OrgProfileClient from './org-profile-client';

interface OrgProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrgProfilePageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const response = await getOrganization(id);
    const org = response.data || response;

    return {
      title: `${org.name} | Boundless`,
      description: org.tagline || org.about || `View ${org.name} on Boundless`,
      openGraph: {
        title: `${org.name} | Boundless`,
        description:
          org.tagline || org.about || `View ${org.name} on Boundless`,
        images: org.logo ? [{ url: org.logo }] : [],
      },
      twitter: {
        card: 'summary',
        title: `${org.name} | Boundless`,
        description:
          org.tagline || org.about || `View ${org.name} on Boundless`,
      },
    };
  } catch {
    return {
      title: 'Organization | Boundless',
      description: 'View organization profile on Boundless.',
    };
  }
}

export default async function OrgProfilePage({
  params,
}: OrgProfilePageProps) {
  const { id } = await params;

  return <OrgProfileClient id={id} />;
}
