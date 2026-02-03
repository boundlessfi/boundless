'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectDetails } from './project-details';
import { ProjectAbout } from './project-about';
import { ProjectTeam } from './project-team';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeftCircle, ChevronRightCircle } from 'lucide-react';
import { ProjectComments } from './comment-section/project-comments';
import ProjectMilestone from './project-milestone';
import ProjectVoters from './project-voters';
import ProjectBackers from './project-backers';
import { ProjectSidebar } from './project-sidebar';
import { cn } from '@/lib/utils';
import { Crowdfunding, CrowdfundingProject } from '@/features/projects/types';
import { getProjectStatus } from './project-sidebar/utils';

export function ProjectLayout({
  project,
  crowdfund,
  hiddenTabs = [],
  hideProgress = false,
}: {
  project: CrowdfundingProject;
  crowdfund: Crowdfunding;
  hiddenTabs?: string[];
  hideProgress?: boolean;
}) {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'details';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLeftScrollable, setIsLeftScrollable] = useState(true);
  const [isRightScrollable, setIsRightScrollable] = useState(true);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const projectStatus = getProjectStatus(project, crowdfund);

  const getVisibleTabs = () => {
    const baseTabs = [
      { value: 'details', label: 'Details' },
      { value: 'team', label: 'Team' },
      { value: 'milestones', label: 'Milestones' },
      { value: 'comments', label: 'Comments' },
    ];

    if (isMobile) {
      baseTabs.unshift({ value: 'about', label: 'About' });
    }

    if (projectStatus === 'Validation') {
      baseTabs.splice(4, 0, { value: 'voters', label: 'Voters' });
    } else if (projectStatus === 'Funding') {
      baseTabs.splice(4, 0, { value: 'voters', label: 'Voters' });
      baseTabs.splice(5, 0, { value: 'backers', label: 'Backers' });
    } else {
      // Funded, Completed, etc.
      baseTabs.splice(4, 0, { value: 'voters', label: 'Voters' });
      baseTabs.splice(5, 0, { value: 'backers', label: 'Backers' });
    }

    return baseTabs;
  };

  const visibleTabs = getVisibleTabs();

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
      <div className='from-background-main-bg to-background-main-bg min-h-screen overflow-x-hidden bg-linear-to-b via-[#0a0a0a]'>
        <div className='w-full'>
          {/* Mobile Header with Sidebar */}
          <div className='from-background-main-bg border-b border-gray-800/50 bg-linear-to-b to-[#0a0a0a] px-4 py-6 backdrop-blur-sm'>
            <ProjectSidebar
              project={project}
              crowdfund={crowdfund}
              isMobile={true}
              hideProgress={hideProgress}
            />
          </div>

          {/* Enhanced Tab Navigation */}
          <div className='bg-background-main-bg/80 sticky top-0 z-40 w-full border-b border-gray-800/50 backdrop-blur-md'>
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

                  {visibleTabs.map(tab => (
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
                <ProjectTeam crowdfund={crowdfund} />
              </TabsContent>
              <TabsContent value='milestones' className='mt-0'>
                <ProjectMilestone crowdfund={crowdfund} />
              </TabsContent>
              <TabsContent value='voters' className='mt-0'>
                <ProjectVoters project={project} />
              </TabsContent>
              <TabsContent value='comments' className='mt-0'>
                <ProjectComments projectId={crowdfund.project.id || ''} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-b'>
      <div className='mx-auto max-w-7xl'>
        <div className='flex gap-8 lg:gap-12'>
          {/* Sidebar - Sticky */}
          <div className='sticky top-8 h-fit w-full max-w-[420px] shrink-0'>
            <div className='rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/50 to-gray-950/50 p-6 shadow-xl backdrop-blur-sm'>
              <ProjectSidebar
                project={project}
                crowdfund={crowdfund}
                isMobile={false}
                hideProgress={hideProgress}
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
              <div className='bg-background-main-bg/80 sticky top-0 z-30 mb-8 border-b border-gray-800/50 py-0 backdrop-blur-md'>
                <TabsList className='h-auto w-fit justify-start gap-2 rounded-none bg-transparent p-0'>
                  {visibleTabs.map(tab => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        'relative rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200',
                        'text-gray-400 hover:bg-gray-800/30 hover:text-gray-300',
                        'data-[state=active]:bg-[#a7f950]/10 data-[state=active]:text-[#a7f950]',
                        'data-[state=active]:border data-[state=active]:border-[#a7f950]/30',
                        'focus-visible:ring-2 focus-visible:ring-[#a7f950]/20',
                        'rounded-t-2xl rounded-b-none'
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
                  <ProjectTeam crowdfund={crowdfund} />
                </TabsContent>
                <TabsContent value='milestones' className='mt-0'>
                  <ProjectMilestone crowdfund={crowdfund} />
                </TabsContent>
                <TabsContent value='voters' className='mt-0'>
                  <ProjectVoters project={project} />
                </TabsContent>
                <TabsContent value='backers' className='mt-0'>
                  <ProjectBackers crowdfund={crowdfund} />
                </TabsContent>
                <TabsContent value='comments' className='mt-0'>
                  <ProjectComments projectId={project.id} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
