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
    <div className='relative flex min-h-[100vh] flex-col justify-between overflow-hidden bg-[#030303] sm:min-h-[95vh] sm:justify-center'>
      <BeamBackground />
      <div
        ref={contentRef}
        className='relative z-10 mx-auto flex w-full max-w-[550px] flex-1 flex-col justify-center px-4 pt-20 pb-20 text-center sm:px-5 sm:pt-10 sm:pb-40 md:px-6'
      >
        <h1 className='mb-4 flex flex-col items-center justify-center text-center text-[28px] leading-[110%] tracking-[-1.5px] text-white sm:mb-6 sm:text-[32px] sm:leading-[100%] sm:tracking-[-1.92px] lg:text-[32px] xl:text-[48px]'>
          <span className='w-full text-center'>Boundless is Where</span>
          <span className='gradient-text mx-auto mt-1 font-medium sm:mt-0 sm:text-nowrap'>
            Ideas meet Opportunity
          </span>
        </h1>

        <p
          className='mb-6 text-[13px] leading-[165%] text-zinc-300 sm:mb-7 sm:text-[14px] sm:leading-[160%] xl:text-[16px]'
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
          className='mx-auto flex w-full max-w-[446px] flex-col items-stretch justify-center gap-3 sm:gap-4 md:flex-row'
          aria-label='Primary actions'
        >
          <Link href='/projects' className='w-full md:w-auto md:flex-1'>
            <BoundlessButton
              variant='default'
              size='lg'
              fullWidth
              aria-label='Explore featured projects and campaigns'
              className='min-h-[48px] touch-manipulation sm:min-h-[44px]'
            >
              Explore Projects
            </BoundlessButton>
          </Link>
          <Link href='/submit' className='w-full md:w-auto md:flex-1'>
            <BoundlessButton
              variant='secondary'
              size='lg'
              fullWidth
              aria-label='Submit your project idea for funding'
              className='min-h-[48px] touch-manipulation sm:min-h-[44px]'
            >
              Submit Your Idea
            </BoundlessButton>
          </Link>
        </nav>
      </div>
      <div className='relative right-0 bottom-20 left-0 z-0 mt-auto sm:absolute sm:bottom-0 sm:mt-0'>
        <div className='absolute right-0 bottom-0 left-0 h-[120px] w-full bg-gradient-to-t from-[#030303] to-transparent opacity-80 sm:h-[100px] sm:opacity-50' />
        <Image
          src='/about-map.svg'
          alt=''
          width={1000}
          height={1000}
          className='mx-auto h-auto w-full max-w-full object-cover object-bottom sm:h-full sm:w-[90vw]'
          priority
          loading='eager'
          aria-hidden='true'
        />
      </div>
    </div>
  );
}
