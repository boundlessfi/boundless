'use client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { BoundlessButton } from '@/components/buttons';
import { DottedUnderline } from '@/components/ui/dotted-underline';

export default function AboutUsHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (gridRef.current) {
        gsap.to(gridRef.current, {
          rotation: 5,
          duration: 15,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: -1,
        });

        gsap.to(gridRef.current, {
          scale: 1.02,
          duration: 8,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: -1,
        });

        gsap.to(gridRef.current, {
          opacity: 0.6,
          duration: 4,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: -1,
        });
      }

      if (contentRef.current) {
        const tl = gsap.timeline();

        tl.fromTo(
          contentRef.current.querySelector('h1'),
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
        )
          .fromTo(
            contentRef.current.querySelector('p'),
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
            '-=0.5'
          )
          .fromTo(
            contentRef.current.querySelector('.buttons'),
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
            '-=0.3'
          );
      }
    },
    { scope: heroRef }
  );

  return (
    <div
      ref={heroRef}
      className='bg-background-main-bg relative flex h-full min-h-[95vh] items-center justify-center overflow-hidden'
    >
      <div
        className='absolute bottom-0 z-10 h-[772px] w-full'
        style={{
          background:
            'linear-gradient(180deg, rgba(3, 3, 3, 0.00) 0%, #030303 100%)',
        }}
      ></div>
      <div
        ref={gridRef}
        className='absolute inset-0 h-full w-full'
        style={{
          backgroundImage: 'url(/about-us-hero-bg.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.8,
        }}
      />
      <div className='border-20px] absolute inset-0 top-1/2 left-1/2 h-[383px] w-[383px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[#DBFFB7] opacity-[0.3] mix-blend-overlay blur-[25px]' />
      <div className='absolute inset-0 top-1/2 left-1/2 h-[397px] w-[397px] -translate-x-1/2 -translate-y-1/2 rounded-full border-100 border-[#6DC01A] opacity-[0.2] mix-blend-hard-light blur-[100px]' />
      <div className='absolute inset-0 top-1/2 left-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A7F9503D] blur-[400px]' />

      <div
        ref={contentRef}
        className='relative z-10 mx-auto max-w-[504px] px-5 text-center'
      >
        <h1 className='mb-6 text-[30px] leading-[100%] tracking-[-1.92px] text-white lg:text-[32px] xl:text-[48px]'>
          Boundless is Where
          <br />
          <span className='gradient-text font-medium text-nowrap'>
            Ideas meet Opportunity
          </span>
        </h1>

        <DottedUnderline className='mx-auto mb-7 w-full max-w-[504px]' />

        <p
          className='mb-7 text-[14px] leading-[160%] lg:text-[14px] xl:text-[16px]'
          style={{
            background: 'linear-gradient(93deg, #B5B5B5 15.93%, #FFF 97.61%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          We help innovators validate ideas, raise funds, and access grants &
          hackathons through milestone-based support powered by Stellar and
          Trustless Work.
        </p>

        <div className='buttons mx-auto flex max-w-[446px] flex-col items-center justify-center gap-4 md:flex-row'>
          <BoundlessButton variant='default' size='lg' fullWidth>
            Explore Projects
          </BoundlessButton>
          <BoundlessButton variant='secondary' size='lg' fullWidth>
            Submit Your Idea
          </BoundlessButton>
        </div>
      </div>
    </div>
  );
}
