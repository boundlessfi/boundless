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
import type { GetHackathonResponse } from '@/lib/api/hackathons';

interface HackathonPageProps {
  params: Promise<{ slug: string }>;
}

function isApiNotFound(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    (err as { status?: number }).status === 404
  );
}

async function fetchHackathonWithRetry(
  slug: string,
  retries = 2
): Promise<GetHackathonResponse> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await getHackathon(slug);
    } catch (err) {
      lastErr = err;
      if (isApiNotFound(err)) throw err;
      const status = (err as { status?: number })?.status;
      const isTransient = !status || status >= 500;
      if (!isTransient || attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  throw lastErr;
}

export async function generateMetadata({
  params,
}: HackathonPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const response = await fetchHackathonWithRetry(slug);

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

  let response: GetHackathonResponse;
  try {
    response = await fetchHackathonWithRetry(slug);
  } catch (err) {
    if (isApiNotFound(err)) notFound();
    throw err;
  }

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
}
