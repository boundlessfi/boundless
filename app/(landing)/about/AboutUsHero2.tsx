'use client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { BoundlessButton } from '@/components/buttons';
import Image from 'next/image';
import BeamBackground from '@/components/landing-page/BeamBackground';
import Link from 'next/link';

export default function AboutUsHero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (contentRef.current) {
      gsap.from(contentRef.current.children, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }
  }, []);

  return (
    <div className='relative flex h-full min-h-[95vh] justify-center overflow-hidden bg-[#030303]'>
      <BeamBackground />
      <div
        ref={contentRef}
        className='relative z-10 mx-auto w-full max-w-[550px] px-5 text-center sm:mt-10 md:px-6'
      >
        <h1 className='mb-4 flex flex-col items-center justify-center text-center text-[30px] leading-[100%] tracking-[-1.92px] text-white sm:mb-6 sm:text-[32px] lg:text-[32px] xl:text-[48px]'>
          <span className='w-full text-center'>Boundless is Where</span>
          <span className='gradient-text mx-auto font-medium sm:text-nowrap'>
            Ideas meet Opportunity
          </span>
        </h1>

        <p
          className='mb-6 text-[14px] leading-[160%] sm:mb-7 sm:text-[14px] xl:text-[16px]'
          style={{
            background: 'linear-gradient(93deg, #B5B5B5 15.93%, #FFF 97.61%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          We help innovators validate ideas, raise funds, and access grants,
          hackathons and bounties through milestone-based support powered by
          Stellar and Trustless Work.
        </p>

        <nav
          className='mx-auto flex max-w-[446px] flex-col items-center justify-center gap-3 sm:gap-4 md:flex-row'
          aria-label='Primary actions'
        >
          <Link href='/projects' className='w-full'>
            <BoundlessButton
              variant='default'
              size='lg'
              fullWidth
              aria-label='Explore featured projects and campaigns'
              className='min-h-[44px] touch-manipulation'
            >
              Explore Projects
            </BoundlessButton>
          </Link>
          <Link href='/submit' className='w-full'>
            <BoundlessButton
              variant='secondary'
              size='lg'
              fullWidth
              aria-label='Submit your project idea for funding'
              className='min-h-[44px] touch-manipulation'
            >
              Submit Your Idea
            </BoundlessButton>
          </Link>
        </nav>
      </div>
      <div className='absolute right-0 bottom-0 left-0 z-0'>
        <div className='from-background absolute right-0 bottom-0 h-[80px] w-full bg-gradient-to-t to-transparent opacity-50 sm:h-[100px]' />
        <Image
          src='/about-map.svg'
          alt=''
          width={1000}
          height={1000}
          className='mx-auto h-auto w-[90vw] max-w-full object-cover sm:h-full'
          priority
          loading='eager'
          aria-hidden='true'
        />
      </div>
    </div>
  );
}
