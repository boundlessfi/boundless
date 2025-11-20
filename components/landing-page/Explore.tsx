'use client';

import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import ProjectCard from './project/ProjectCard';
import HackathonCard from './hackathon/HackathonCard';
import Link from 'next/link';
import { getProjects } from '@/lib/api/project';
import {
  getPublicHackathonsList,
  transformPublicHackathonToHackathon,
} from '@/lib/api/hackathons';
import { useHackathonTransform } from '@/hooks/hackathon/use-hackathon-transform';
import type { Hackathon } from '@/lib/api/hackathons';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectApi {
  _id: string;
  title: string;
  description: string;
  whitepaperUrl?: string;
  tags?: string[];
  category?: string;
  type?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    type?: {
      _id?: string;
      profile?: {
        firstName?: string;
        lastName?: string;
        username?: string;
        avatar?: string;
      } | null;
    } | null;
  } | null;
}

// Map project status to ProjectCard status format
const mapProjectStatus = (
  status: string
): 'Validation' | 'Funding' | 'Funded' | 'Completed' => {
  switch (status) {
    case 'under_review':
      return 'Validation';
    case 'funding':
      return 'Funding';
    case 'funded':
      return 'Funded';
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'Funding';
    default:
      return 'Validation';
  }
};

// Calculate days to deadline from project dates
const calculateDaysToDeadline = (): number => {
  // For now, return a default value since we don't have deadline info in the basic project API
  // This would need to be enhanced when we have access to crowdfunding project details
  return 30; // Default placeholder
};

// Project Card Skeleton
const ProjectCardSkeleton = () => (
  <div className='font-inter flex w-full max-w-full flex-col gap-4 rounded-[8px] border border-gray-900 bg-[#030303] p-4 sm:p-5'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <Skeleton className='size-6 rounded-full' />
        <Skeleton className='h-4 w-24' />
      </div>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-6 w-16 rounded-[4px]' />
        <Skeleton className='h-6 w-20 rounded-[4px]' />
      </div>
    </div>
    <div className='flex items-start gap-3 sm:gap-5'>
      <Skeleton className='h-[70px] w-[60px] flex-shrink-0 rounded-[8px] sm:h-[90px] sm:w-[79.41px]' />
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <Skeleton className='h-5 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
      </div>
    </div>
    <div className='flex flex-col gap-2'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-4 w-28' />
      </div>
      <Skeleton className='h-2 w-full rounded-full' />
    </div>
  </div>
);

// Hackathon Card Skeleton
const HackathonCardSkeleton = () => (
  <div className='group flex w-full flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#0c0c0c]'>
    {/* Image */}
    <div className='relative h-44 overflow-hidden sm:h-52'>
      <Skeleton className='h-full w-full' />
      <div className='absolute top-3 right-3 left-3 flex items-center justify-between'>
        <Skeleton className='h-6 w-20 rounded-md' />
        <Skeleton className='h-6 w-16 rounded-md' />
      </div>
      <div className='absolute bottom-3 left-3 flex items-center gap-2'>
        <Skeleton className='size-7 rounded-full' />
        <Skeleton className='h-4 w-24' />
      </div>
    </div>
    {/* Body */}
    <div className='flex flex-col gap-3 pt-3'>
      <div className='px-4 sm:px-5'>
        <Skeleton className='mb-2 h-6 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='mt-1 h-4 w-2/3' />
      </div>
      <div className='flex flex-wrap items-center justify-between border-t border-neutral-800 px-4 pt-3 sm:px-5'>
        <Skeleton className='h-5 w-24' />
        <Skeleton className='h-4 w-32' />
      </div>
      <div className='flex items-center justify-between border-t border-neutral-800 px-4 py-3 sm:px-5'>
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-1.5 w-24 rounded-full sm:w-32' />
      </div>
    </div>
  </div>
);

const tabs = [
  { name: 'Featured Projects', value: 'featured-projects' },
  { name: 'Ongoing Hackathons', value: 'ongoing-hackathons' },
  { name: 'Open Grants', value: 'open-grants' },
  { name: 'Bounties', value: 'live-grants' },
];

export default function Explore() {
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  // State for projects
  const [projects, setProjects] = useState<ProjectApi[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // State for hackathons
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(false);
  const [hackathonsError, setHackathonsError] = useState<string | null>(null);

  const { transformHackathonForCard } = useHackathonTransform();

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      const response = await getProjects(1, 6);
      const apiProjects = (response.projects ?? []) as unknown as ProjectApi[];
      setProjects(apiProjects);
    } catch {
      setProjectsError('Failed to fetch projects');
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // Fetch hackathons
  const fetchHackathons = useCallback(async () => {
    try {
      setHackathonsLoading(true);
      setHackathonsError(null);
      const response = await getPublicHackathonsList({
        status: 'ongoing',
        limit: 6,
        page: 1,
      });

      // Transform public hackathons to Hackathon type
      const hackathonsList = response.data.hackathons || [];
      const transformedHackathons = hackathonsList.map(hackathon =>
        transformPublicHackathonToHackathon(hackathon)
      );

      setHackathons(transformedHackathons);
    } catch {
      setHackathonsError('Failed to fetch hackathons');
    } finally {
      setHackathonsLoading(false);
    }
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (
      activeTab === 'featured-projects' &&
      projects.length === 0 &&
      !projectsLoading
    ) {
      fetchProjects();
    } else if (
      activeTab === 'ongoing-hackathons' &&
      hackathons.length === 0 &&
      !hackathonsLoading
    ) {
      fetchHackathons();
    }
  }, [
    activeTab,
    fetchProjects,
    fetchHackathons,
    projects.length,
    hackathons.length,
    projectsLoading,
    hackathonsLoading,
  ]);

  // Fetch projects on mount if default tab
  useEffect(() => {
    if (activeTab === 'featured-projects') {
      fetchProjects();
    }
  }, [activeTab, fetchProjects]);

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
        {activeTab === 'featured-projects' && (
          <>
            {projectsLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProjectCardSkeleton key={index} />
                ))}
              </>
            ) : projectsError ? (
              <div className='col-span-full py-12 text-center text-red-400'>
                {projectsError}
              </div>
            ) : projects.length === 0 ? (
              <div className='col-span-full py-12 text-center text-gray-400'>
                No projects available at the moment.
              </div>
            ) : (
              projects.map(project => {
                const ownerName = project.owner?.type?.profile
                  ? `${project.owner.type.profile.firstName || ''} ${project.owner.type.profile.lastName || ''}`.trim() ||
                    'Anonymous'
                  : 'Anonymous';
                const ownerAvatar =
                  project.owner?.type?.profile?.avatar || '/avatar.png';
                const projectImage = project.whitepaperUrl || '/banner.png';

                return (
                  <ProjectCard
                    isFullWidth={true}
                    key={project._id}
                    projectId={project._id}
                    deadlineInDays={calculateDaysToDeadline()}
                    status={mapProjectStatus(project.status)}
                    creatorName={ownerName}
                    creatorLogo={ownerAvatar}
                    projectImage={projectImage}
                    projectTitle={project.title}
                    projectDescription={project.description}
                  />
                );
              })
            )}
          </>
        )}

        {activeTab === 'ongoing-hackathons' && (
          <>
            {hackathonsLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <HackathonCardSkeleton key={index} />
                ))}
              </>
            ) : hackathonsError ? (
              <div className='col-span-full py-12 text-center text-red-400'>
                {hackathonsError}
              </div>
            ) : hackathons.length === 0 ? (
              <div className='col-span-full py-12 text-center text-gray-400'>
                No ongoing hackathons at the moment.
              </div>
            ) : (
              hackathons.map(hackathon => {
                const orgName =
                  '_organizationName' in hackathon
                    ? (hackathon as Hackathon & { _organizationName?: string })
                        ._organizationName
                    : undefined;
                const transformed = transformHackathonForCard(
                  hackathon,
                  orgName
                );
                return (
                  <HackathonCard
                    key={hackathon._id}
                    isFullWidth={true}
                    {...transformed}
                  />
                );
              })
            )}
          </>
        )}

        {activeTab === 'open-grants' && (
          <div className='col-span-full py-12 text-center text-gray-400'>
            <p className='mb-2 text-lg font-medium text-white'>Coming Soon</p>
            <p>Open Grants feature will be available soon.</p>
          </div>
        )}

        {activeTab === 'live-grants' && (
          <div className='col-span-full py-12 text-center text-gray-400'>
            <p className='mb-2 text-lg font-medium text-white'>Coming Soon</p>
            <p>Bounties feature will be available soon.</p>
          </div>
        )}
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
