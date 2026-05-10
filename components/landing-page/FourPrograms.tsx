'use client';

import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import HackathonMock from './illustrations/HackathonMock';
import GrantMock from './illustrations/GrantMock';
import BountyMock from './illustrations/BountyMock';
import CrowdfundingMock from './illustrations/CrowdfundingMock';

interface ProgramCardProps {
  illustration: React.ReactNode;
  hostedBy: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref?: string;
  layout: 'wide' | 'narrow';
}

const ProgramCard = ({
  illustration,
  hostedBy,
  title,
  body,
  ctaLabel,
  ctaHref,
  layout,
}: ProgramCardProps) => {
  const router = useRouter();
  const isWide = layout === 'wide';
  const disabled = !ctaHref;

  return (
    <button
      type='button'
      onClick={() => ctaHref && router.push(ctaHref)}
      disabled={disabled}
      className='group bg-background-card hover:border-border-strong focus-visible:ring-mint/40 relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 text-left transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-default'
    >
      <div
        className={
          isWide
            ? 'grid h-full grid-cols-1 md:grid-cols-2'
            : 'flex h-full flex-col'
        }
      >
        {/* Stage panel with mock */}
        <div
          className={
            isWide
              ? 'relative flex min-h-[220px] items-center justify-center bg-white/5 md:min-h-0 md:border-r md:border-white/10'
              : 'relative flex h-44 items-center justify-center bg-white/5 md:h-52'
          }
        >
          {illustration}
        </div>

        {/* Text content */}
        <div className='relative flex flex-1 flex-col gap-3 p-6 md:p-7'>
          <ArrowUpRight
            className='text-subtle-text absolute top-5 right-5 h-5 w-5 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white'
            strokeWidth={1.75}
          />
          <p className='pr-7 text-xs font-medium tracking-wide text-white/50 italic'>
            {hostedBy}
          </p>
          <h3
            className={
              isWide
                ? 'text-2xl leading-[1.2] font-semibold tracking-tight text-white md:text-[28px]'
                : 'text-xl leading-[1.2] font-semibold tracking-tight text-white md:text-2xl'
            }
          >
            {title}
          </h3>
          <p className='flex-1 text-[15px] leading-[160%] text-white/70'>
            {body}
          </p>
          <p className='mt-2 text-sm font-medium text-white/50 transition-colors group-hover:text-white'>
            {ctaLabel}
          </p>
        </div>
      </div>
    </button>
  );
};

export default function FourPrograms() {
  return (
    <section
      id='programs'
      className='relative w-full scroll-mt-24'
      aria-labelledby='programs-heading'
    >
      <header className='mx-auto max-w-3xl text-center'>
        <h2
          id='programs-heading'
          className='text-3xl leading-[140%] tracking-tight text-white md:text-4xl xl:text-[48px]'
        >
          Every funding shape, one home.
        </h2>
        <p className='mx-auto mt-4 max-w-2xl text-base leading-[160%] text-white/70 md:text-lg'>
          Boundless provides tailored frameworks for every type of initiative,
          ensuring funds move precisely when your project milestones are met or
          work is verified.
        </p>
      </header>

      {/* Bento grid: 8/4 in row 1, 4/8 in row 2 */}
      <div className='mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-12'>
        <div className='md:col-span-8'>
          <ProgramCard
            layout='wide'
            illustration={<HackathonMock />}
            hostedBy='Hosted by ecosystems, foundations, projects, and DAOs.'
            title='Hackathons: Discover Breakthroughs.'
            body='Attract top talent and unearth novel solutions. Define your challenge, set the stakes, and let Boundless manage the secure prize distribution upon successful judging.'
            ctaLabel='Run a hackathon'
            ctaHref='/organizations'
          />
        </div>

        <div className='md:col-span-4'>
          <ProgramCard
            layout='narrow'
            illustration={<GrantMock />}
            hostedBy='Hosted by foundations, DAOs, and ecosystems.'
            title='Grants: Fuel Progress.'
            body='Support vital projects with confidence. Structure your grant program with clear milestones or single approvals, knowing every disbursement is transparently recorded and released on-chain.'
            ctaLabel='Run a grant program'
          />
        </div>

        <div className='md:col-span-4'>
          <ProgramCard
            layout='narrow'
            illustration={<BountyMock />}
            hostedBy='Hosted by projects, DAOs, and organizers.'
            title='Bounties: Get Work Done.'
            body='Accelerate your project by rewarding specific tasks. Post your challenge, define the reward, and Boundless ensures contributors are paid instantly upon verified work acceptance.'
            ctaLabel='Post a bounty'
          />
        </div>

        <div className='md:col-span-8'>
          <ProgramCard
            layout='wide'
            illustration={<CrowdfundingMock />}
            hostedBy='Launched by builders.'
            title='Crowdfunding: Bring Ideas to Life.'
            body='Rally your community and fund your vision. Launch milestone-driven campaigns where backers contribute securely, and funds are released as you achieve verified progress.'
            ctaLabel='Launch a campaign'
            ctaHref='/organizations'
          />
        </div>
      </div>
    </section>
  );
}
