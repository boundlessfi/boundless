import Link from 'next/link';
import { ArrowRight, BadgeCheck } from 'lucide-react';

const fundedCapabilities = [
  'Milestone contracts on Soroban',
  'Contribution Hub for bounties and open-source work',
  'Wallet-linked contributor profiles',
  'KYC and on-ramp integrations',
];

export default function TrustAndProof() {
  return (
    <section className='relative w-full' aria-labelledby='trust-heading'>
      <div className='bg-background-card relative overflow-hidden rounded-[24px] border border-white/10 p-8 md:p-12 lg:p-16'>
        <div className='grid gap-10 lg:grid-cols-[7fr_5fr] lg:items-center lg:gap-16'>
          <div>
            <div className='border-primary/30 bg-primary/10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
              <BadgeCheck className='text-primary' size={14} strokeWidth={2} />
              <span className='text-primary text-xs font-medium tracking-wide uppercase'>
                Stellar Community Fund #40
              </span>
            </div>

            <h2
              id='trust-heading'
              className='mt-5 text-3xl leading-[120%] tracking-tight text-white md:text-4xl xl:text-[44px]'
            >
              Validated by the Community.
            </h2>

            <p className='mt-5 max-w-2xl text-base leading-[170%] text-white/70 md:text-lg'>
              Boundless proudly received the Stellar Community Fund #40 award.
              This grant directly supported the development of key features now
              live on our platform, including Soroban milestone contracts, the
              Contribution Hub for bounties, wallet-linked contributor profiles,
              and essential KYC and on-ramp integrations.
            </p>

            <Link
              href='/blog/boundless-wins-stellar-community-fund-40'
              className='hover:text-primary group mt-6 inline-flex items-center gap-2 text-sm font-medium text-white underline-offset-4 hover:underline'
            >
              Read the SCF #40 announcement
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </Link>
          </div>

          <div className='relative rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8'>
            <p className='text-xs font-medium tracking-wide text-white/50 uppercase'>
              What the grant funded — now live
            </p>
            <ul className='mt-4 space-y-3'>
              {fundedCapabilities.map(item => (
                <li
                  key={item}
                  className='flex items-start gap-3 text-sm leading-[160%] text-white/85 md:text-base'
                >
                  <span className='bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
