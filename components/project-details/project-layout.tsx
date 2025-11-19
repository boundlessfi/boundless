'use client';

import { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectDetails } from './project-details';
import { ProjectAbout } from './project-about';
import { ProjectTeam } from './project-team';
import { useIsMobile } from '@/hooks/use-mobile';
import { CrowdfundingProject, CrowdfundData } from '@/lib/api/types';
import { ChevronLeftCircle, ChevronRightCircle } from 'lucide-react';
import { ProjectComments } from './comment-section/project-comments';
import ProjectMilestone from './project-milestone';
import ProjectVoters from './project-voters';
import ProjectBackers from './project-backers';
import { ProjectSidebar } from './project-sidebar';
import { cn } from '@/lib/utils';

interface ProjectLayoutProps {
  project: CrowdfundingProject & {
    // Additional fields that might be added during transformation
    daysToDeadline?: number;
    additionalCreator?: {
      name: string;
      role: string;
      avatar: string;
    };
    links?: Array<{
      type: string;
      url: string;
      icon: string;
    }>;
    // Legacy fields for backward compatibility
    name?: string;
    description?: string;
    logo?: string;
    validation?: string;
    date?: string;
    votes?: number;
    totalVotes?: number;
  };
  crowdfund?: CrowdfundData;
}

/**
 * Desktop: Two columns with proper spacing - sidebar left (400px), tabs+content right
 * Mobile: Single column - project info, tabs (including About), content
 */
export function ProjectLayout({ project, crowdfund }: ProjectLayoutProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('details'); // Start with about tab on mobile
  const [isLeftScrollable, setIsLeftScrollable] = useState(true);
  const [isRightScrollable, setIsRightScrollable] = useState(true);
  const tabsListRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (tabsListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;

      setIsLeftScrollable(canScrollLeft);
      setIsRightScrollable(canScrollRight);
    }
  };

  useEffect(() => {
    const tabsList = tabsListRef.current;
    if (tabsList) {
      const checkScroll = () => {
        handleScroll();
      };

      checkScroll();
      const timeoutId1 = setTimeout(checkScroll, 50);
      const timeoutId2 = setTimeout(checkScroll, 200);
      const timeoutId3 = setTimeout(checkScroll, 500);

      tabsList.addEventListener('scroll', handleScroll);

      const resizeObserver = new ResizeObserver(() => {
        handleScroll();
      });
      resizeObserver.observe(tabsList);

      const handleResize = () => {
        setTimeout(handleScroll, 100);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        clearTimeout(timeoutId3);
        tabsList.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
      };
    }
  }, []);

  const scrollLeft = () => {
    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(handleScroll, 100);
    }
  };

  const scrollRight = () => {
    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(handleScroll, 100);
    }
  };

  if (isMobile) {
    return (
      <div className='min-h-screen overflow-x-hidden bg-gradient-to-b from-[#030303] via-[#0a0a0a] to-[#030303]'>
        <div className='w-full'>
          {/* Mobile Header with Sidebar */}
          <div className='border-b border-gray-800/50 bg-gradient-to-b from-[#030303] to-[#0a0a0a] px-4 py-6 backdrop-blur-sm'>
            <ProjectSidebar
              project={project}
              crowdfund={crowdfund}
              isMobile={true}
            />
          </div>

          {/* Enhanced Tab Navigation */}
          <div className='sticky top-0 z-40 w-full border-b border-gray-800/50 bg-[#030303]/80 backdrop-blur-md'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='relative h-auto w-full justify-start rounded-none bg-transparent p-0'>
                <div
                  className='scrollbar-hide flex w-full gap-2 overflow-x-auto px-4 py-3'
                  ref={tabsListRef}
                >
                  {isLeftScrollable && (
                    <ChevronLeftCircle
                      className='absolute top-1/2 left-0 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-gray-900/80 text-gray-400 backdrop-blur-sm transition-all hover:bg-gray-800 hover:text-white'
                      onClick={scrollLeft}
                      size={24}
                    />
                  )}

                  {isRightScrollable && (
                    <ChevronRightCircle
                      className='absolute top-1/2 right-0 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-gray-900/80 text-gray-400 backdrop-blur-sm transition-all hover:bg-gray-800 hover:text-white'
                      onClick={scrollRight}
                      size={24}
                    />
                  )}

                  {[
                    { value: 'about', label: 'About' },
                    { value: 'details', label: 'Details' },
                    { value: 'team', label: 'Team' },
                    { value: 'milestones', label: 'Milestones' },
                    { value: 'voters', label: 'Voters' },
                    { value: 'comments', label: 'Comments' },
                  ].map(tab => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        'relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                        'text-gray-400 hover:text-gray-300',
                        'data-[state=active]:bg-[#a7f950]/10 data-[state=active]:text-[#a7f950]',
                        'data-[state=active]:border data-[state=active]:border-[#a7f950]/30'
                      )}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </div>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area */}
          <div className='px-4 py-6'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsContent value='about' className='mt-0'>
                <ProjectAbout project={project} />
              </TabsContent>
              <TabsContent value='details' className='mt-0'>
                <ProjectDetails project={project} />
              </TabsContent>
              <TabsContent value='team' className='mt-0'>
                <ProjectTeam project={project} />
              </TabsContent>
              <TabsContent value='milestones' className='mt-0'>
                <ProjectMilestone projectId={project._id} project={project} />
              </TabsContent>
              <TabsContent value='voters' className='mt-0'>
                <ProjectVoters project={project} />
              </TabsContent>
              <TabsContent value='comments' className='mt-0'>
                <ProjectComments projectId={project._id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-[#030303] via-[#0a0a0a] to-[#030303]'>
      <div className='mx-auto max-w-7xl'>
        <div className='flex gap-8 lg:gap-12'>
          {/* Sidebar - Sticky */}
          <div className='sticky top-8 h-fit w-full max-w-[420px] shrink-0'>
            <div className='rounded-2xl border border-gray-800/50 bg-gradient-to-b from-gray-900/50 to-gray-950/50 p-6 shadow-xl backdrop-blur-sm'>
              <ProjectSidebar
                project={project}
                crowdfund={crowdfund}
                isMobile={false}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className='min-h-0 flex-1'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              {/* Enhanced Tab Navigation */}
              <div className='sticky top-0 z-30 mb-8 border-b border-gray-800/50 bg-[#030303]/80 py-4 backdrop-blur-md'>
                <TabsList className='h-auto w-fit justify-start gap-2 rounded-none bg-transparent p-0'>
                  {[
                    { value: 'details', label: 'Details' },
                    { value: 'team', label: 'Team' },
                    { value: 'milestones', label: 'Milestones' },
                    { value: 'voters', label: 'Voters' },
                    { value: 'backers', label: 'Backers' },
                    { value: 'comments', label: 'Comments' },
                  ].map(tab => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        'relative rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200',
                        'text-gray-400 hover:bg-gray-800/30 hover:text-gray-300',
                        'data-[state=active]:bg-[#a7f950]/10 data-[state=active]:text-[#a7f950]',
                        'data-[state=active]:border data-[state=active]:border-[#a7f950]/30',
                        'focus-visible:ring-2 focus-visible:ring-[#a7f950]/20'
                      )}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className='space-y-8'>
                <TabsContent value='details' className='mt-0'>
                  <ProjectDetails project={project} />
                </TabsContent>
                <TabsContent value='team' className='mt-0'>
                  <ProjectTeam project={project} />
                </TabsContent>
                <TabsContent value='milestones' className='mt-0'>
                  <ProjectMilestone projectId={project._id} project={project} />
                </TabsContent>
                <TabsContent value='voters' className='mt-0'>
                  <ProjectVoters project={project} />
                </TabsContent>
                <TabsContent value='backers' className='mt-0'>
                  <ProjectBackers project={project} />
                </TabsContent>
                <TabsContent value='comments' className='mt-0'>
                  <ProjectComments projectId={project._id} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
