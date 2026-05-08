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
      <div className='border-border-subtle bg-surface relative overflow-hidden rounded-[24px] border p-8 md:p-12 lg:p-16'>
        <div className='grid gap-10 lg:grid-cols-[7fr_5fr] lg:items-center lg:gap-16'>
          <div>
            <div className='border-mint-border bg-mint-bg inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
              <BadgeCheck className='text-mint' size={14} strokeWidth={2} />
              <span className='text-mint text-xs font-medium tracking-wide uppercase'>
                Stellar Community Fund #40
              </span>
            </div>

            <h2
              id='trust-heading'
              className='text-foreground mt-5 text-3xl leading-[120%] tracking-tight md:text-4xl xl:text-[44px]'
            >
              Backed by Stellar Community Fund #40
            </h2>

            <p className='text-secondary-text mt-5 max-w-2xl text-base leading-[170%] md:text-lg'>
              Boundless was awarded Stellar Community Fund #40. The grant funded
              the milestone contracts on Soroban, the Contribution Hub for
              bounties and open-source work, wallet-linked contributor profiles,
              and KYC and on-ramp integrations — all of which are live on the
              platform today.
            </p>

            <Link
              href='/blog/boundless-wins-stellar-community-fund-40'
              className='text-foreground hover:text-mint group mt-6 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline'
            >
              Read the SCF #40 announcement
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </Link>
          </div>

          <div className='border-border-subtle bg-stage relative rounded-2xl border p-6 md:p-8'>
            <p className='text-muted-text text-xs font-medium tracking-wide uppercase'>
              What the grant funded — now live
            </p>
            <ul className='mt-4 space-y-3'>
              {fundedCapabilities.map(item => (
                <li
                  key={item}
                  className='text-foreground/85 flex items-start gap-3 text-sm leading-[160%] md:text-base'
                >
                  <span className='bg-mint mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full' />
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
