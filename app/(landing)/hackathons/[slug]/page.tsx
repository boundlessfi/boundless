import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getHackathon } from '@/lib/api/hackathon';
import { generateHackathonMetadata } from '@/lib/metadata';
import { HackathonDataProvider } from '@/lib/providers/hackathonProvider';
import HackathonPageClient from './HackathonPageClient';
import Banner from './components/Banner';
import Header from './components/header';
import HackathonTabs from './components/tabs';
import Sidebar from './components/sidebar';

interface HackathonPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: HackathonPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const response = await getHackathon(slug);

    if (!response.success || !response.data) {
      return {
        title: 'Hackathon Not Found | Boundless',
        description: 'The requested hackathon could not be found.',
      };
    }

    return generateHackathonMetadata(response.data);
  } catch {
    return {
      title: 'Hackathon | Boundless',
      description: 'Join exciting hackathons on Boundless.',
    };
  }
}

export default async function HackathonPage({ params }: HackathonPageProps) {
  const { slug } = await params;
  try {
    const response = await getHackathon(slug);

    if (!response.success || !response.data) {
      notFound();
    }

    const hackathon = response.data;

    return (
      <HackathonDataProvider hackathonSlug={slug} initialData={hackathon}>
        <div className='relative'>
          <Banner banner={hackathon.banner || ''} title={hackathon.name} />

          <Header hackathon={hackathon} />
          <div className='mb-6 block px-6 lg:hidden'>
            <Sidebar />
          </div>
          <HackathonTabs sidebar={<Sidebar />} />
        </div>
      </HackathonDataProvider>
    );
  } catch {
    notFound();
  }
}
