'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { BoundlessButton } from '../buttons';

export default function FinalCta() {
  const router = useRouter();

  return (
    <section className='mb-20' aria-labelledby='final-cta-heading'>
      <div className='bg-background-card relative mx-auto min-h-[20rem] overflow-hidden rounded-[3.2rem] border border-white/10'>
        <div className='absolute inset-0 -z-10'>
          <div className='bg-primary/10 absolute -top-32 left-1/2 h-72 w-[60%] -translate-x-1/2 rounded-full blur-3xl' />
        </div>

        <div className='relative z-10 flex flex-col items-center justify-center gap-8 px-6 py-16 text-center sm:px-10 lg:py-20'>
          <div className='flex flex-col gap-4'>
            <h2
              id='final-cta-heading'
              className='text-3xl leading-[120%] font-semibold tracking-tight text-white md:text-4xl lg:text-[44px]'
            >
              Ready to Build?
            </h2>
            <p className='mx-auto max-w-xl text-base leading-[170%] text-white/70 md:text-lg'>
              Launch your program or campaign in moments. With funds securely
              held in on-chain escrow on Stellar, you&apos;re ready to go
              without complex setup.
            </p>
          </div>

          <div className='flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center'>
            <BoundlessButton
              variant='default'
              size='xl'
              onClick={() => router.push('/organizations')}
              className='group'
            >
              Run a program
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </BoundlessButton>

            <BoundlessButton
              variant='outline'
              size='xl'
              onClick={() => router.push('/organizations')}
              className='group'
            >
              Launch a campaign
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </BoundlessButton>
          </div>

          <p className='text-sm leading-[170%] text-white/50'>
            Already on Boundless?{' '}
            <Link
              href='/auth?mode=signin'
              className='hover:text-primary text-white underline underline-offset-4 transition-colors'
            >
              Sign in
            </Link>
            . Looking for a partnership?{' '}
            <a
              href='https://discord.gg/k6eaFZ2vr'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-primary text-white underline underline-offset-4 transition-colors'
            >
              Talk to our team
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
