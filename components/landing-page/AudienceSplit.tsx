'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BoundlessButton } from '../buttons';
import OrganizerMock from './illustrations/OrganizerMock';
import BuilderMock from './illustrations/BuilderMock';

interface AudienceCardProps {
  index: string;
  illustration: React.ReactNode;
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  accent?: boolean;
}

const AudienceCard = ({
  index,
  illustration,
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  accent = false,
}: AudienceCardProps) => {
  const router = useRouter();

  return (
    <div className='border-border-subtle bg-surface relative flex h-full flex-col gap-6 rounded-2xl border p-5 md:gap-8 md:p-6'>
      {/* Stage panel with mock illustration */}
      <div className='border-border-subtle bg-stage relative h-56 w-full overflow-hidden rounded-xl border md:h-64'>
        <div className='border-border-subtle bg-surface/80 absolute top-3 left-3 z-10 rounded-md border px-1.5 py-0.5'>
          <span className='text-muted-text font-mono text-[10px] tracking-tight'>
            [{index}]
          </span>
        </div>
        {illustration}
      </div>

      {/* Editorial copy */}
      <div className='flex flex-1 flex-col gap-4 px-1 md:px-2'>
        <span className='text-mint font-mono text-[11px] font-medium tracking-[0.2em] uppercase'>
          {eyebrow}
        </span>

        <h3 className='text-foreground text-2xl leading-[1.2] font-semibold tracking-tight md:text-[28px]'>
          {headline}
        </h3>

        <p className='text-secondary-text flex-1 text-base leading-[160%]'>
          {body}
        </p>

        <div className='flex flex-col gap-3 pt-2'>
          <BoundlessButton
            variant={accent ? 'default' : 'outline'}
            size='xl'
            onClick={() => router.push(ctaHref)}
            className='group w-full sm:w-auto'
          >
            {ctaLabel}
            <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
          </BoundlessButton>

          <Link
            href={secondaryHref}
            className='text-muted-text hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline'
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function AudienceSplit() {
  return (
    <section
      className='relative w-full'
      aria-labelledby='audience-split-heading'
    >
      <header className='mx-auto max-w-3xl text-center'>
        <h2
          id='audience-split-heading'
          className='text-foreground text-3xl leading-[140%] tracking-tight md:text-4xl xl:text-[48px]'
        >
          Built for both sides of the funding loop.
        </h2>
      </header>

      <div className='mt-12 grid gap-6 md:mt-16 md:grid-cols-2'>
        <AudienceCard
          index='01'
          illustration={<OrganizerMock />}
          eyebrow='For organizers'
          headline='Run programs with on-chain escrow and verifiable release.'
          body='For ecosystems, foundations, projects, and DAOs. One platform for hackathons, grant rounds, and bounty programs — four program types, every disbursement on Stellar.'
          ctaLabel='Run your first program'
          ctaHref='/auth/signup?role=organizer'
          secondaryLabel='Or talk to our team'
          secondaryHref='/contact?topic=organizer'
          accent
        />

        <AudienceCard
          index='02'
          illustration={<BuilderMock />}
          eyebrow='For builders'
          headline='Get paid on verified work.'
          body='For builders, teams, and contributors. Launch a milestone-based crowdfunding campaign, apply for grants, win hackathons, take bounties — without a centralized treasury between you and your backers.'
          ctaLabel='Get started'
          ctaHref='/auth/signup?role=builder'
          secondaryLabel='Or browse open programs'
          secondaryHref='/programs'
        />
      </div>
    </section>
  );
}
