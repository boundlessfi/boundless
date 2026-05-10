import Image from 'next/image';
import { Metadata } from 'next';
import NewsletterForm from '@/components/overview/NewsletterForm';

export const metadata: Metadata = {
  title: 'Subscribe to the Boundless Newsletter',
  description:
    'Stay Boundless. Get updates on grants, hackathons, bounties, and projects across the Stellar ecosystem.',
};

export default function NewsletterPage() {
  return (
    <main className='relative flex min-h-screen w-full items-center justify-center px-5 py-16 md:py-24'>
      <div className='mx-auto w-full max-w-xl'>
        <div
          className='rounded-[12px] p-[1px]'
          style={{
            background:
              'radial-gradient(circle at center, rgba(255, 255, 255, 0.0) 34%, rgba(255, 255, 255, 0.2) 90%)',
          }}
        >
          <div className='bg-background rounded-[12px] p-8 md:p-10'>
            <div className='flex flex-col items-start gap-6 sm:flex-row sm:gap-6'>
              <div className='h-[80px] w-[80px] flex-shrink-0 md:h-[90px] md:w-[90px]'>
                <Image
                  src='/mail.png'
                  alt='newsletter'
                  width={89}
                  height={89}
                  quality={100}
                  unoptimized
                  className='h-full w-full object-cover'
                />
              </div>
              <div className='flex-1 text-left'>
                <h1 className='leading-[120%] font-medium tracking-[-0.48px] text-white md:text-2xl'>
                  Join Our Newsletter
                </h1>
                <p className='mt-1 text-sm leading-[160%] font-normal text-[#D9D9D9] md:text-base'>
                  Stay Boundless! Never miss updates on grants, hackathons, and
                  projects.
                </p>
              </div>
            </div>

            <div className='mt-10'>
              <NewsletterForm source='newsletter-page' />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
