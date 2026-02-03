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
import ProjectCard from '@/features/projects/components/ProjectCard';

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
                className='bg-linear-to-r from-[#a7f950] to-[#8ae63a] bg-clip-text text-transparent'
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
              {...{
                id: 'hackathon-1',
                name: 'Boundless Innovation Hackathon',
                slug: 'boundless-hackathon-2024',
                tagline: 'Build the future of boundless',
                description:
                  'Join the biggest hackathon on Stellar blockchain. Build innovative solutions and compete for $50,000 in prizes.',
                banner: '/banner.png',
                organizationId: '1',
                organization: {
                  id: '1',
                  name: 'Boundless',
                  logo: '/bitmed.png',
                },
                status: 'PUBLISHED' as const,
                isActive: true,
                isParticipant: false,
                venueType: 'VIRTUAL' as const,
                venueName: 'Virtual',
                venueAddress: '123 Main St, Anytown, USA',
                city: 'Anytown',
                state: 'CA',
                country: 'USA',
                timezone: 'UTC',
                startDate: '2024-01-01',
                endDate: '2024-01-01',
                submissionDeadline: '2024-01-01',
                registrationDeadline: '2024-01-01',
                customRegistrationDeadline: '2024-01-01',
                registrationOpen: true,
                registrationDeadlinePolicy:
                  'BEFORE_SUBMISSION_DEADLINE' as const,
                daysUntilStart: 10,
                daysUntilEnd: 10,
                participantType: 'INDIVIDUAL' as const,
                teamMin: 1,
                teamMax: 4,
                categories: ['Web3', 'DeFi', 'Blockchain'],
                enabledTabs: [
                  'detailsTab',
                  'participantsTab',
                  'resourcesTab',
                  'submissionTab',
                  'announcementsTab',
                  'discussionTab',
                  'winnersTab',
                  'sponsorsTab',
                  'joinATeamTab',
                  'rulesTab',
                ],
                judgingCriteria: [
                  {
                    id: '1',
                    name: 'Best Project',
                    description: 'For the best project',
                    weight: 100,
                  },
                ],
                prizeTiers: [
                  {
                    id: '1',
                    place: '1',
                    prizeAmount: '50000',
                    description: 'For the best project',
                  },
                ],
                phases: [
                  {
                    id: '1',
                    name: 'Phase 1',
                    startDate: '2024-01-01',
                    endDate: '2024-01-01',
                  },
                ],
                resources: [],
                sponsorsPartners: [],
                submissions: [],
                followers: [],
                participants: [],
                requireGithub: true,
                requireDemoVideo: true,
                requireOtherLinks: true,
                contactEmail: 'contact@boundless.com',
                discord: 'https://discord.com/boundless',
                telegram: 'https://t.me/boundless',
                socialLinks: [
                  'https://x.com/boundless',
                  'https://www.linkedin.com/company/boundless',
                ],
                publishedAt: '2024-01-01',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                _count: { participants: 0, submissions: 0, followers: 0 },
              }}
            />
          </div>

          <div className='absolute top-0 left-1/2 z-20 w-80 -translate-x-1/2 transform cursor-pointer rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105'>
            <ProjectCard
              data={{
                id: 'project-1',
                slug: 'solar-power-initiative',
                title: 'Solar Power Initiative',
                vision:
                  'Revolutionary solar energy solution for rural communities',
                banner: '/banner.png',
                logo: '/bitmed.png',
                category: 'Sustainability',
                creator: {
                  name: 'Green Energy Team',
                  image: '/bitmed.png',
                },
                status: 'Funding',
                stats: {
                  funding: {
                    raised: 25000,
                    goal: 100000,
                    currency: 'USD',
                  },
                  votes: { current: 450, goal: 500 },
                  daysLeft: 15,
                },
              }}
            />
          </div>

          <div className='absolute top-20 right-0 z-10 w-72 rotate-3 transform cursor-pointer rounded-2xl shadow-xl transition-transform duration-300 hover:rotate-0'>
            <ProjectCard
              data={{
                id: 'project-2',
                slug: 'ai-learning-platform',
                title: 'AI Learning Platform',
                vision:
                  'Democratizing AI education through interactive learning',
                banner: '/banner.png',
                logo: '/bitmed.png',
                category: 'Education',
                creator: {
                  name: 'AI Research Lab',
                  image: '/bitmed.png',
                },
                status: 'Validation',
                stats: {
                  votes: { current: 320, goal: 500 },
                  daysLeft: 8,
                },
              }}
            />
          </div>

          <div className='absolute bottom-0 left-1/2 z-20 w-96 -translate-x-1/2 transform cursor-pointer rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105'>
            <HackathonCard
              {...{
                id: 'hackathon-2',
                name: 'AI Innovation Challenge',
                slug: 'ai-innovation-challenge',
                tagline: 'Build the future of boundless',
                description:
                  'Build the next generation of AI-powered applications',
                banner: '/banner.png',
                organizationId: '1',
                organization: {
                  id: '1',
                  name: 'Boundless',
                  logo: '/bitmed.png',
                },
                status: 'PUBLISHED' as const,
                isActive: true,
                isParticipant: false,
                venueType: 'PHYSICAL' as const,
                venueName: 'University of California, Los Angeles',
                venueAddress: '123 Main St, Anytown, USA',
                city: 'Los Angeles',
                state: 'California',
                country: 'United States',
                timezone: 'America/Los_Angeles',
                startDate: '2026-01-01',
                endDate: '2026-01-01',
                submissionDeadline: '2026-01-01',
                registrationDeadline: '2026-01-01',
                customRegistrationDeadline: '2026-01-01',
                registrationOpen: true,
                registrationDeadlinePolicy:
                  'BEFORE_SUBMISSION_DEADLINE' as const,
                daysUntilStart: 10,
                daysUntilEnd: 10,
                participantType: 'INDIVIDUAL' as const,
                teamMin: 1,
                teamMax: 4,
                categories: ['AI', 'Machine Learning', 'Open Source'],
                enabledTabs: [
                  'detailsTab',
                  'participantsTab',
                  'resourcesTab',
                  'submissionTab',
                  'announcementsTab',
                  'discussionTab',
                  'winnersTab',
                  'sponsorsTab',
                  'joinATeamTab',
                  'rulesTab',
                ],
                judgingCriteria: [
                  {
                    id: '1',
                    name: 'Best Project',
                    description: 'For the best project',
                    weight: 100,
                  },
                ],
                prizeTiers: [
                  {
                    id: '1',
                    place: '1st Place',
                    prizeAmount: '50000',
                    description: 'For the best project',
                  },
                ],
                phases: [
                  {
                    id: '1',
                    name: 'Phase 1',
                    startDate: '2026-01-01',
                    endDate: '2026-01-01',
                  },
                ],
                resources: [],
                sponsorsPartners: [],
                submissions: [],
                followers: [],
                participants: [],
                requireGithub: true,
                requireDemoVideo: true,
                requireOtherLinks: true,
                contactEmail: 'contact@boundless.com',
                discord: 'https://discord.com/boundless',
                telegram: 'https://t.me/boundless',
                socialLinks: [
                  'https://x.com/boundless',
                  'https://www.linkedin.com/company/boundless',
                ],
                publishedAt: '2024-01-01',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                _count: { participants: 0, submissions: 0, followers: 0 },
              }}
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
