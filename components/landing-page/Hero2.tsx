'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  Cursor,
  CursorPointer,
  CursorBody,
  CursorMessage,
} from '../ui/shadcn-io/cursor';
import { BoundlessButton } from '../buttons';

const BRAND_COLOR = '#2eedaa';

export default function Hero2() {
  const router = useRouter();

  return (
    <section className='relative flex w-full items-center justify-center overflow-hidden py-12 md:py-20'>
      <Cursor className='animate-float-slow absolute top-32 left-20 z-20 hidden text-sm font-medium lg:block'>
        <CursorPointer style={{ color: BRAND_COLOR }} />
        <CursorBody
          className='text-black'
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <CursorMessage>Milestone Escrow</CursorMessage>
        </CursorBody>
      </Cursor>
      <Cursor className='animate-float-medium absolute top-40 right-24 z-20 hidden text-sm font-medium lg:block'>
        <CursorPointer className='text-orange-500' />
        <CursorBody className='border border-orange-500/50 bg-orange-500/20 text-orange-400'>
          <CursorMessage>Community Validation</CursorMessage>
        </CursorBody>
      </Cursor>
      <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-8 flex justify-center md:mb-12'>
          <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-sm'>
            <div className='bg-primary/10 flex h-4 w-4 items-center justify-center rounded-full'>
              <CheckCircle2 className='text-primary h-3 w-3' />
            </div>
            <span className='text-xs font-medium tracking-wide text-white/70 uppercase'>
              The Future of Funding, Built on Stellar
            </span>
          </div>
        </div>

        <div className='mx-auto mb-12 max-w-4xl space-y-8 text-center md:mb-16'>
          <div className='space-y-4'>
            <h1 className='mx-auto max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-white md:text-6xl'>
              Drive Progress.{' '}
              <span className='text-primary'>Reward Talent.</span> Grow
              Communities.
            </h1>

            <p className='mx-auto max-w-4xl text-lg leading-relaxed text-white/70 md:text-xl'>
              <span className='block md:inline'>
                Boundless provides robust infrastructure for organizations
              </span>{' '}
              <span className='block md:inline'>
                to launch impactful programs and for creators to fund their
                groundbreaking projects.
              </span>{' '}
              <span className='block md:inline'>
                Clarity and reliability, every transaction.
              </span>
            </p>
          </div>

          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <BoundlessButton
              variant='default'
              size='xl'
              onClick={() => router.push('/auth?mode=signup')}
              className='group'
            >
              Start Your Program{' '}
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </BoundlessButton>

            <BoundlessButton
              variant='outline'
              size='xl'
              onClick={() =>
                document
                  .getElementById('programs')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className='group'
            >
              Explore How It Works{' '}
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </BoundlessButton>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(-2deg);
          }
          50% {
            transform: translateY(-15px) rotate(-2deg);
          }
        }

        @keyframes float-medium {
          0%,
          100% {
            transform: translateY(0px) rotate(2deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
