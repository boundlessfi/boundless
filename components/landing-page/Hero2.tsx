'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  Cursor,
  CursorPointer,
  CursorBody,
  CursorMessage,
} from '../ui/shadcn-io/cursor';
import Image from 'next/image';
import { BoundlessButton } from '../buttons';
import HackathonCard from '@/components/landing-page/hackathon/HackathonCard';
import ProjectCard from './project/ProjectCard';

const BRAND_COLOR = '#a7f950';

export default function Hero2() {
  const router = useRouter();

  return (
    <section className='relative flex min-h-screen w-full items-center justify-center overflow-hidden py-12 md:py-20'>
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
            <div
              className='flex h-4 w-4 items-center justify-center rounded-full'
              style={{ backgroundColor: `${BRAND_COLOR}40` }}
            >
              <CheckCircle2
                className='h-3 w-3'
                style={{ color: BRAND_COLOR }}
              />
            </div>
            <span className='text-xs font-medium tracking-wide text-white/80 uppercase'>
              The #1 milestone-based funding platform on Stellar
            </span>
          </div>
        </div>

        <div className='mx-auto mb-12 max-w-4xl space-y-8 text-center md:mb-16'>
          <div className='space-y-4'>
            <h1 className='text-4xl leading-none font-bold tracking-tight md:text-6xl lg:text-7xl'>
              <span
                className='bg-gradient-to-r from-[#a7f950] to-[#8ae63a] bg-clip-text text-transparent'
                style={{ color: BRAND_COLOR }}
              >
                Launch Projects
              </span>
              <br />
              <span className='relative inline-block text-white'>
                Manage Hackathons.
                <div className='mt-2'>
                  <Image
                    src='/lines.svg'
                    alt=''
                    width={100}
                    height={12}
                    className='h-[12px] w-full'
                  />
                </div>
              </span>
            </h1>

            <p className='mx-auto max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl'>
              Turn your ideas into reality with{' '}
              <span
                className='font-medium underline decoration-2 underline-offset-2'
                style={{
                  color: BRAND_COLOR,
                  textDecorationColor: `${BRAND_COLOR}60`,
                }}
              >
                milestone-based funding
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
              Get Started for Free
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </BoundlessButton>

            <BoundlessButton
              variant='outline'
              size='xl'
              onClick={() => router.push('/organizations/new')}
              className='group'
            >
              Host a Hackathon
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </BoundlessButton>
          </div>
        </div>

        <div className='relative mx-auto hidden h-[500px] max-w-5xl md:block'>
          <div className='absolute top-12 left-0 z-10 w-72 -rotate-3 transform cursor-pointer shadow-xl transition-transform duration-300 hover:rotate-0'>
            <HackathonCard
              organizationName='Boundless'
              deadlineInDays={10}
              categories={['Web3', 'DeFi', 'Blockchain']}
              location='Virtual'
              venueType='virtual'
              participants={{ current: 127, goal: 200 }}
              prizePool={{ total: 50000, currency: 'USD' }}
              status='Published'
              hackathonSlug='boundless-hackathon-2024'
              hackathonId='hackathon-1'
              organizerName='Boundless Team'
              organizerLogo='/bitmed.png'
              hackathonImage='/banner.png'
              hackathonTitle='Boundless Innovation Hackathon'
              hackathonDescription='Join the biggest hackathon on Stellar blockchain. Build innovative solutions and compete for $50,000 in prizes.'
            />
          </div>

          <div className='absolute top-0 left-1/2 z-20 w-80 -translate-x-1/2 transform cursor-pointer rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105'>
            <ProjectCard
              projectId='project-1'
              creatorName='Green Energy Team'
              creatorLogo='/bitmed.png'
              projectImage='/banner.png'
              projectTitle='Solar Power Initiative'
              projectDescription='Revolutionary solar energy solution for rural communities'
              status='Funding'
              deadlineInDays={15}
              funding={{ current: 25000, goal: 100000, currency: 'USD' }}
              votes={{ current: 450, goal: 500 }}
            />
          </div>

          <div className='absolute top-20 right-0 z-10 w-72 rotate-3 transform cursor-pointer rounded-2xl shadow-xl transition-transform duration-300 hover:rotate-0'>
            <ProjectCard
              projectId='project-2'
              creatorName='AI Research Lab'
              creatorLogo='/bitmed.png'
              projectImage='/banner.png'
              projectTitle='AI Learning Platform'
              projectDescription='Democratizing AI education through interactive learning'
              status='Validation'
              deadlineInDays={8}
              votes={{ current: 320, goal: 500 }}
            />
          </div>

          <div className='absolute bottom-0 left-1/2 z-20 w-96 -translate-x-1/2 transform cursor-pointer rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105'>
            <HackathonCard
              organizationName='Boundless'
              deadlineInDays={5}
              categories={['AI', 'Machine Learning', 'Open Source']}
              location='Virtual'
              venueType='virtual'
              participants={{ current: 89, goal: 150 }}
              prizePool={{ total: 30000, currency: 'USD' }}
              status='Published'
              hackathonSlug='ai-innovation-challenge'
              hackathonId='hackathon-2'
              organizerName='Boundless AI'
              organizerLogo='/bitmed.png'
              hackathonImage='/banner.png'
              hackathonTitle='AI Innovation Challenge'
              hackathonDescription='Build the next generation of AI-powered applications'
            />
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
