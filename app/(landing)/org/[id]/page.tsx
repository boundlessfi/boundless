import { Metadata } from 'next';
import { getOrganizationProfile } from '@/lib/api/organization';
import OrgProfileClient from './org-profile-client';

interface OrgProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrgProfilePageProps): Promise<Metadata> {
  try {
    const { id: slug } = await params;
    const org = await getOrganizationProfile(slug);

    return {
      title: `${org.name} | Boundless`,
      description: org.description || `View ${org.name} on Boundless`,
      openGraph: {
        title: `${org.name} | Boundless`,
        description: org.description || `View ${org.name} on Boundless`,
        images: org.logoUrl ? [{ url: org.logoUrl }] : [],
      },
      twitter: {
        card: 'summary',
        title: `${org.name} | Boundless`,
        description: org.description || `View ${org.name} on Boundless`,
      },
    };
  } catch {
    return {
      title: 'Organization | Boundless',
      description: 'View organization profile on Boundless.',
    };
  }
}

export default async function OrgProfilePage({ params }: OrgProfilePageProps) {
  const { id: slug } = await params;

  return <OrgProfileClient slug={slug} />;
}
