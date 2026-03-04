import { Metadata } from 'next';
import { getOrganizationProfile } from '@/lib/api/organization';
import OrgProfileClient from './org-profile-client';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://boundlessfi.xyz';

interface OrgProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: OrgProfilePageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const org = await getOrganizationProfile(slug);

    const title = `${org.name} | Boundless`;
    const description = org.description || `View ${org.name} on Boundless`;
    const ogImageUrl = `${SITE_URL}/api/og?slug=${encodeURIComponent(slug)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/org/${slug}`,
        siteName: 'Boundless',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: org.name,
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {
      title: 'Organization | Boundless',
      description: 'View organization profile on Boundless.',
      openGraph: {
        images: [`${SITE_URL}/api/og`],
      },
    };
  }
}

export default async function OrgProfilePage({ params }: OrgProfilePageProps) {
  const { slug } = await params;

  return <OrgProfileClient slug={slug} />;
}
