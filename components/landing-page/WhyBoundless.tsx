'use client';

import { FileLock, Globe, UserCheck } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className='relative rounded-xl bg-[#101010] p-4'>
    <div className='pointer-events-none absolute inset-0 rounded-xl border border-white/20 [mask-image:linear-gradient(to_bottom,white,rgba(255,255,255,0.3))]'></div>
    <div className='relative z-10 space-y-4'>
      <div className='flex flex-col'>
        {icon}
        <h4 className='mt-2 leading-[145%] font-medium tracking-[-0.4px] text-white'>
          {title}
        </h4>
      </div>
      <p className='leading-[160%] text-[#B5B5B5]'>{description}</p>
    </div>
  </div>
);

const WhyBoundless = () => {
  const [imageLoading, setImageLoading] = useState(true);
  const [gifLoading, setGifLoading] = useState(true);

  const features = [
    {
      icon: <FileLock size={32} className='text-gray-500' />,
      title: 'Milestone Escrow',
      description:
        'Funds are locked in smart contracts and released only when milestones are completed. Backers know their contributions support real progress, while creators stay accountable.',
    },
    {
      icon: <Globe size={32} className='text-gray-500' />,
      title: 'Inclusive Opportunities',
      description:
        'From crowdfunding to grants and hackathons, Boundless provides builders with multiple ways to access funding and grow their ideas, while supporters discover projects that inspire them.',
    },
    {
      icon: <UserCheck size={32} className='text-gray-500' />,
      title: 'Powered by Stellar',
      description:
        'Built on Stellar and Soroban smart contracts, Boundless makes funding secure, fast, and affordable. This global infrastructure enables builders and backers to connect without barriers.',
    },
  ];

  const communityValidation = {
    icon: <UserCheck size={32} className='text-gray-500' />,
    title: 'Community Validation',
    description: [
      'Every project starts with open feedback and voting, allowing builders to refine their ideas and prove demand before funding begins.',
      'This ensures that only projects with genuine potential and credibility move forward, giving backers greater confidence in where their support goes.',
    ],
  };

  return (
    <section
      className='h-full w-full'
      id='how-boundless-work'
      aria-labelledby='why-boundless-heading'
    >
      <header className='mx-auto max-w-4xl text-center'>
        <h2
          id='why-boundless-heading'
          className='text-3xl leading-[140%] tracking-wide text-white md:text-4xl xl:text-[48px]'
        >
          Why Builders Choose Boundless
        </h2>
        <p className='gradient-text-2 mx-auto mt-3 max-w-xl text-base leading-[160%] md:text-lg'>
          Boundless combines transparency, accountability, and accessibility,
          giving creators the tools to raise funds confidently and backers the
          security to support with trust.
        </p>
      </header>

      <div className='mt-12 hidden flex-col-reverse items-center justify-between gap-10 lg:flex lg:flex-row'>
        <div className='w-full lg:w-1/2'>
          <div className='relative'>
            {imageLoading && (
              <Skeleton className='absolute inset-0 h-auto w-full rounded-lg' />
            )}
            <Image
              src='/why.png'
              alt='Why choose Boundless platform illustration'
              width={800}
              height={600}
              loading='lazy'
              className={`h-auto w-full rounded-lg transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              unoptimized
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </div>
        </div>
        <div className='relative w-full rounded-xl bg-[#101010] lg:w-1/2'>
          <div className='pointer-events-none absolute inset-0 rounded-xl border border-white/20 [mask-image:linear-gradient(to_bottom,white,rgba(255,255,255,0.3))]'></div>
          <div className='relative z-10 space-y-6 p-8'>
            <div className='space-y-4'>
              <div className='flex flex-col'>
                {communityValidation.icon}
                <h4 className='mt-2 leading-[145%] font-medium tracking-[-0.4px] text-white'>
                  {communityValidation.title}
                </h4>
              </div>
              {communityValidation.description.map((paragraph, index) => (
                <p key={index} className='leading-[160%] text-[#B5B5B5]'>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='mt-16'>
        <div
          className='relative z-10 rounded-xl border border-white/48 px-5 py-5 md:px-10 md:py-10'
          style={{
            background:
              'linear-gradient(258deg, rgba(167, 249, 80, 0.46) 53.09%, rgba(58, 230, 178, 0.92) 103.03%)',
          }}
        >
          <div className='relative'>
            {gifLoading && (
              <Skeleton className='absolute inset-0 z-20 h-auto w-full max-w-[754px] rounded-xl' />
            )}
            <Image
              src='/why.gif'
              alt='Boundless platform demonstration animation'
              width={800}
              height={600}
              priority
              unoptimized
              className={`z-30 mx-auto h-auto w-full max-w-[754px] rounded-xl object-cover transition-opacity duration-300 ${
                gifLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setGifLoading(false)}
              onError={() => setGifLoading(false)}
            />
          </div>
        </div>

        <div className='mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          <div className='relative w-full rounded-xl bg-[#101010] lg:hidden lg:w-1/2'>
            <div className='pointer-events-none absolute inset-0 rounded-xl border border-white/20 [mask-image:linear-gradient(to_bottom,white,rgba(255,255,255,0.3))]'></div>
            <div className='relative z-10 space-y-6 p-4'>
              <div className='space-y-4'>
                <div className='flex flex-col'>
                  {communityValidation.icon}
                  <h4 className='mt-2 leading-[145%] font-medium tracking-[-0.4px] text-white'>
                    {communityValidation.title}
                  </h4>
                </div>
                {communityValidation.description.map((paragraph, index) => (
                  <p key={index} className='leading-[160%] text-[#B5B5B5]'>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyBoundless;
