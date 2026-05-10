'use client';

import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect, useMemo } from 'react';
import HackathonCard from './hackathon/HackathonCard';
import Link from 'next/link';
import { getPublicHackathonsList } from '@/lib/api/hackathons';
import type { Hackathon } from '@/lib/api/hackathons';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/features/projects/hooks/use-project';
import ProjectCard from '@/features/projects/components/ProjectCard';

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

const HackathonCardSkeleton = () => (
  <div className='group flex w-full flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#0c0c0c]'>
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

export default function Explore() {
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  const initialFilters = useMemo(() => ({}), []);

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects({
    initialPage: 1,
    pageSize: 6,
    initialFilters,
  });

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(true);
  const [hackathonsError, setHackathonsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHackathonsLoading(true);
    getPublicHackathonsList({ limit: 6, page: 1 })
      .then(response => {
        if (cancelled) return;
        setHackathons(response.hackathons || []);
      })
      .catch(() => {
        if (cancelled) return;
        setHackathonsError('Failed to fetch hackathons');
      })
      .finally(() => {
        if (!cancelled) setHackathonsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleTabs = useMemo(() => {
    const all: { name: string; value: string }[] = [];
    if (hackathons.length > 0 || projects.length > 0)
      all.push({ name: 'All', value: 'all' });
    if (projects.length > 0)
      all.push({ name: 'Featured Projects', value: 'featured-projects' });
    if (hackathons.length > 0)
      all.push({ name: 'Ongoing Hackathons', value: 'ongoing-hackathons' });
    return all;
  }, [hackathons.length, projects.length]);

  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (visibleTabs.length === 0) return;
    if (!visibleTabs.some(t => t.value === activeTab)) {
      setActiveTab(visibleTabs[0].value);
    }
  }, [visibleTabs, activeTab]);

  useEffect(() => {
    const currentTab = tabRefs.current[activeTab];
    if (currentTab) {
      setUnderlineStyle({
        width: currentTab.offsetWidth,
        left: currentTab.offsetLeft,
      });
    }
  }, [activeTab, visibleTabs]);

  const isInitialLoading = projectsLoading || hackathonsLoading;
  if (!isInitialLoading && visibleTabs.length === 0) return null;

  return (
    <section
      id='explore'
      className='relative -mt-12 flex scroll-mt-24 flex-col items-center justify-center text-white md:-mt-24'
    >
      <div className='flex flex-col items-center gap-6 text-center'>
        <p className='to-primary bg-gradient-to-r from-[#3AE6B2] bg-clip-text text-transparent'>
          Active Opportunities
        </p>
        <h2 className='text-5xl max-sm:text-3xl'>Explore What's Happening</h2>

        <div className='relative flex gap-8 overflow-auto border-b border-gray-700 px-4 md:px-0'>
          {visibleTabs.map(tab => (
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
            className='bg-primary absolute bottom-0 h-[3px] transition-all duration-300 ease-in-out'
            style={underlineStyle}
          />
        </div>
      </div>

      <div className='mt-10 grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:px-6 lg:grid-cols-3 xl:max-w-7xl xl:px-0'>
        {activeTab === 'all' && (
          <>
            {projectsLoading || hackathonsLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProjectCardSkeleton key={index} />
                ))}
              </>
            ) : projects.length === 0 && hackathons.length === 0 ? (
              <div className='col-span-full py-12 text-center text-gray-400'>
                No opportunities available at the moment.
              </div>
            ) : (
              <>
                {hackathons.map(hackathon => (
                  <HackathonCard
                    key={`hackathon-${hackathon.id}`}
                    isFullWidth={true}
                    {...hackathon}
                  />
                ))}
                {projects.map(project => (
                  <ProjectCard
                    isFullWidth={true}
                    key={`project-${project.id}`}
                    data={project}
                  />
                ))}
              </>
            )}
          </>
        )}

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
              projects.map(project => (
                <ProjectCard
                  isFullWidth={true}
                  key={project.id}
                  data={project}
                />
              ))
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
              hackathons.map(hackathon => (
                <HackathonCard
                  key={hackathon.id}
                  isFullWidth={true}
                  {...hackathon}
                />
              ))
            )}
          </>
        )}
      </div>

      <div className='mt-20 flex cursor-pointer items-center gap-1'>
        <Link href='/hackathons'>
          <p className='font-medium underline'>View More Opportunities</p>
        </Link>
        <ArrowRight className='h-3 w-3' />
      </div>

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
