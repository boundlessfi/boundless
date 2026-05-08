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
  ctaHref: string;
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

  return (
    <button
      type='button'
      onClick={() => router.push(ctaHref)}
      className='group border-border-subtle bg-surface hover:border-border-strong focus-visible:ring-mint/40 relative flex h-full w-full flex-col overflow-hidden rounded-2xl border text-left transition-colors focus:outline-none focus-visible:ring-2'
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
              ? 'bg-stage md:border-border-subtle relative flex min-h-[220px] items-center justify-center md:min-h-0 md:border-r'
              : 'bg-stage relative flex h-44 items-center justify-center md:h-52'
          }
        >
          {illustration}
        </div>

        {/* Text content */}
        <div className='relative flex flex-1 flex-col gap-3 p-6 md:p-7'>
          <ArrowUpRight
            className='text-subtle-text group-hover:text-foreground absolute top-5 right-5 h-5 w-5 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
            strokeWidth={1.75}
          />
          <p className='text-muted-text pr-7 text-xs font-medium tracking-wide italic'>
            {hostedBy}
          </p>
          <h3
            className={
              isWide
                ? 'text-foreground text-2xl leading-[1.2] font-semibold tracking-tight md:text-[28px]'
                : 'text-foreground text-xl leading-[1.2] font-semibold tracking-tight md:text-2xl'
            }
          >
            {title}
          </h3>
          <p className='text-secondary-text flex-1 text-[15px] leading-[160%]'>
            {body}
          </p>
          <p className='text-muted-text group-hover:text-foreground mt-2 text-sm font-medium transition-colors'>
            {ctaLabel}
          </p>
        </div>
      </div>
    </button>
  );
};

export default function FourPrograms() {
  return (
    <section className='relative w-full' aria-labelledby='programs-heading'>
      <header className='mx-auto max-w-3xl text-center'>
        <h2
          id='programs-heading'
          className='text-foreground text-3xl leading-[140%] tracking-tight md:text-4xl xl:text-[48px]'
        >
          One platform. Four program types.
        </h2>
        <p className='text-secondary-text mx-auto mt-4 max-w-2xl text-base leading-[160%] md:text-lg'>
          Each program runs on the release rule that fits its shape — judging
          for hackathons, milestones for grants and crowdfunding campaigns, work
          acceptance for bounties.
        </p>
      </header>

      {/* Bento grid: 8/4 in row 1, 4/8 in row 2 */}
      <div className='mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-12'>
        <div className='md:col-span-8'>
          <ProgramCard
            layout='wide'
            illustration={<HackathonMock />}
            hostedBy='Hosted by ecosystems, foundations, projects, and DAOs.'
            title='Hackathons'
            body='Set up the prize pool, deadlines, and judging criteria. Submissions are time-bound. Prizes sit in on-chain escrow and release to selected entries when judging completes.'
            ctaLabel='Run a hackathon'
            ctaHref='/hackathons'
          />
        </div>

        <div className='md:col-span-4'>
          <ProgramCard
            layout='narrow'
            illustration={<GrantMock />}
            hostedBy='Hosted by foundations, DAOs, and ecosystems.'
            title='Grants'
            body='Define the program scope, application process, and release schedule. Staged grants release on verified milestones. One-shot grants release on single approval. Every disbursement is on-chain.'
            ctaLabel='Run a grant program'
            ctaHref='/grants'
          />
        </div>

        <div className='md:col-span-4'>
          <ProgramCard
            layout='narrow'
            illustration={<BountyMock />}
            hostedBy='Hosted by projects, DAOs, and organizers.'
            title='Bounties'
            body='Post a bounty with the spec and the reward. Contributors submit work; reviewers accept or reject. The bounty releases on acceptance, automatically.'
            ctaLabel='Post a bounty'
            ctaHref='/bounties'
          />
        </div>

        <div className='md:col-span-8'>
          <ProgramCard
            layout='wide'
            illustration={<CrowdfundingMock />}
            hostedBy='Launched by builders.'
            title='Crowdfunding campaigns'
            body='Define your campaign milestones. Backers fund the campaign; their contributions sit in escrow. Each milestone releases on verified progress, with backer voting on disputes.'
            ctaLabel='Launch a campaign'
            ctaHref='/campaigns'
          />
        </div>
      </div>
    </section>
  );
}
