import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import HackathonsPageHero from '@/components/hackathons/HackathonsPageHero';
import HackathonsPage from '@/components/hackathons/HackathonsPage';

export const metadata: Metadata = generatePageMetadata('hackathons');

export default function HackathonsPageRoute() {
  return (
    <div className='relative mx-auto min-h-screen max-w-[1440px] px-5 py-5 md:px-[50px] lg:px-[100px]'>
      <HackathonsPageHero />
      <HackathonsPage />
    </div>
  );
}
