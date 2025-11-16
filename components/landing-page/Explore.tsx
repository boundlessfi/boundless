'use client';

import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import ProjectCard from './project/ProjectCard';
import Link from 'next/link';

interface ExploreProject {
  id: string;
  daysToDeadline?: number;
  status: 'Validation' | 'Funding' | 'Funded' | 'Completed';
  projectImg: string;
  currentAmount?: number;
  targetAmount?: number;
  currentVotes?: number;
  targetVotes?: number;
  milestonesCompleted?: number;
  totalMilestones?: number;
  milestonesRejected?: number;
  creatorName: string;
  creatorLogo: string;
  projectImage: string;
  projectTitle: string;
  projectDescription: string;
}

const projects: ExploreProject[] = [
  {
    id: '1',
    status: 'Validation',
    currentVotes: 28,
    targetVotes: 100,
    daysToDeadline: 43,
    projectImg: '/landing/explore/project-placeholder-1.png',
    creatorName: 'Alice Johnson',
    creatorLogo: '/landing/explore/creator-1.png',
    projectImage: '/landing/explore/project-placeholder-1.png',
    projectTitle: 'DeFi Protocol Innovation',
    projectDescription:
      'Building the next generation of decentralized finance protocols with enhanced security and efficiency.',
  },
  {
    id: '2',
    status: 'Funding',
    currentAmount: 120000,
    targetAmount: 300000,
    daysToDeadline: 15,
    projectImg: '/landing/explore/project-placeholder-2.png',
    creatorName: 'Bob Smith',
    creatorLogo: '/landing/explore/creator-2.png',
    projectImage: '/landing/explore/project-placeholder-2.png',
    projectTitle: 'NFT Marketplace Platform',
    projectDescription:
      'Creating a comprehensive NFT marketplace with advanced trading features and community tools.',
  },
  {
    id: '3',
    status: 'Completed',
    milestonesCompleted: 6,
    totalMilestones: 6,
    milestonesRejected: 1,
    projectImg: '/landing/explore/project-placeholder-3.png',
    creatorName: 'Carol Davis',
    creatorLogo: '/landing/explore/creator-3.png',
    projectImage: '/landing/explore/project-placeholder-3.png',
    projectTitle: 'Blockchain Education Platform',
    projectDescription:
      'Educational platform for blockchain technology with interactive courses and certifications.',
  },
  {
    id: '4',
    status: 'Funded',
    milestonesCompleted: 3,
    totalMilestones: 6,
    daysToDeadline: 3,
    projectImg: '/landing/explore/project-placeholder-4.png',
    creatorName: 'David Wilson',
    creatorLogo: '/landing/explore/creator-4.png',
    projectImage: '/landing/explore/project-placeholder-4.png',
    projectTitle: 'DAO Governance Tool',
    projectDescription:
      'Advanced governance tools for decentralized autonomous organizations with voting mechanisms.',
  },
  {
    id: '5',
    status: 'Funding',
    currentAmount: 120000,
    targetAmount: 300000,
    daysToDeadline: 15,
    projectImg: '/landing/explore/project-placeholder-2.png',
    creatorName: 'Eva Brown',
    creatorLogo: '/landing/explore/creator-5.png',
    projectImage: '/landing/explore/project-placeholder-2.png',
    projectTitle: 'Web3 Social Network',
    projectDescription:
      'Decentralized social networking platform with user-owned data and content monetization.',
  },
  {
    id: '6',
    status: 'Validation',
    currentVotes: 28,
    targetVotes: 100,
    daysToDeadline: 43,
    projectImg: '/landing/explore/project-placeholder-1.png',
    creatorName: 'Frank Miller',
    creatorLogo: '/landing/explore/creator-6.png',
    projectImage: '/landing/explore/project-placeholder-1.png',
    projectTitle: 'Cross-Chain Bridge Protocol',
    projectDescription:
      'Secure and efficient cross-chain bridge for seamless asset transfers between blockchains.',
  },
];

const tabs = [
  { name: 'Featured Projects', value: 'featured-projects' },
  { name: 'Ongoing Hackathons', value: 'ongoing-hackathons' },
  { name: 'Open Grants', value: 'open-grants' },
];

export default function Explore() {
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  useEffect(() => {
    const currentTab = tabRefs.current[activeTab];
    if (currentTab) {
      setUnderlineStyle({
        width: currentTab.offsetWidth,
        left: currentTab.offsetLeft,
      });
    }
  }, [activeTab]);

  return (
    <section className='relative flex flex-col items-center justify-center text-white'>
      <div className='flex flex-col items-center gap-6 text-center'>
        <p className='bg-gradient-to-r from-[#3AE6B2] to-[#A7F950] bg-clip-text text-transparent'>
          Active Opportunities
        </p>
        <h2 className='text-5xl max-sm:text-3xl'>Explore What’s Happening</h2>

        <div className='relative flex gap-8 overflow-auto border-b border-gray-700 px-4 md:px-0'>
          {tabs.map(tab => (
            <p
              key={tab.value}
              ref={el => {
                tabRefs.current[tab.value] = el;
              }}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'shrink-0 cursor-pointer pb-3 transition-colors',
                activeTab === tab.value
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              {tab.name}
            </p>
          ))}

          <span
            className='absolute bottom-0 h-[3px] bg-[#A7F950] transition-all duration-300 ease-in-out'
            style={underlineStyle}
          />
        </div>
      </div>

      <div className='mt-10 grid w-fit grid-cols-1 gap-6 px-4 md:grid-cols-2 md:px-6 lg:grid-cols-3 xl:px-0'>
        {projects.map(project => (
          <ProjectCard
            isFullWidth={true}
            key={project.id}
            deadlineInDays={project.daysToDeadline || 0}
            votes={
              project.currentVotes && project.targetVotes
                ? {
                    current: project.currentVotes,
                    goal: project.targetVotes,
                  }
                : undefined
            }
            funding={
              project.currentAmount && project.targetAmount
                ? {
                    current: project.currentAmount,
                    goal: project.targetAmount,
                    currency: 'USDC',
                  }
                : undefined
            }
            milestones={
              project.milestonesCompleted && project.totalMilestones
                ? {
                    current: project.milestonesCompleted,
                    goal: project.totalMilestones,
                  }
                : undefined
            }
            status={project.status}
            creatorName={project.creatorName}
            creatorLogo={project.creatorLogo}
            projectImage={project.projectImage}
            projectTitle={project.projectTitle}
            projectDescription={project.projectDescription}
          />
        ))}
      </div>

      <div className='mt-20 flex cursor-pointer items-center gap-1'>
        <Link href='/projects'>
          <p className='font-medium underline'>View More Opportunities</p>
        </Link>
        <ArrowRight className='h-3 w-3' />
      </div>

      {/* Glow Effects */}
      <Image
        src='/landing/explore/explore-glow-top.svg'
        alt='Glow Effect'
        width={300}
        height={200}
        className='absolute top-[75px] right-16 -z-[5] max-sm:hidden'
      />
      <Image
        src='/landing/explore/explore-glow-bottom.svg'
        alt='Glow Effect'
        width={300}
        height={200}
        className='absolute bottom-12 left-10 -z-[5] max-sm:hidden'
      />
    </section>
  );
}
