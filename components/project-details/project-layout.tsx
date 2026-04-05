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
import { CampaignEndBanner } from './CampaignEndBanner';
import { cn } from '@/lib/utils';
import type { ProjectViewModel } from '@/features/projects/types/view-model';

export type { ProjectType } from '@/features/projects/types/view-model';

export function ProjectLayout({
  vm,
  hiddenTabs = [],
  onRefresh,
}: {
  vm: ProjectViewModel;
  hiddenTabs?: string[];
  onRefresh?: () => void;
}) {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'details';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLeftScrollable, setIsLeftScrollable] = useState(false);
  const [isRightScrollable, setIsRightScrollable] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);

  const getVisibleTabs = () => {
    const baseTabs = [
      { value: 'details', label: 'Details' },
      { value: 'team', label: 'Team' },
      { value: 'comments', label: 'Comments' },
    ];

    // "About" tab only on small screens (< 768px) where sidebar hides creator/links
    if (isMobile) {
      baseTabs.unshift({ value: 'about', label: 'About' });
    }

    if (vm.projectType === 'campaign') {
      const insertIdx = baseTabs.findIndex(t => t.value === 'comments');
      baseTabs.splice(insertIdx, 0, {
        value: 'milestones',
        label: 'Milestones',
      });
      baseTabs.splice(insertIdx + 1, 0, { value: 'voters', label: 'Voters' });
      baseTabs.splice(insertIdx + 2, 0, { value: 'backers', label: 'Backers' });
    } else if (vm.projectType === 'submission') {
      const insertIdx = baseTabs.findIndex(t => t.value === 'comments');
      baseTabs.splice(insertIdx, 0, { value: 'milestones', label: 'Timeline' });
      baseTabs.splice(insertIdx + 1, 0, { value: 'voters', label: 'Voters' });
    } else {
      const insertIdx = baseTabs.findIndex(t => t.value === 'comments');
      baseTabs.splice(insertIdx, 0, { value: 'voters', label: 'Voters' });
    }

    return baseTabs;
  };

  const visibleTabs = getVisibleTabs().filter(
    tab => !hiddenTabs.includes(tab.value)
  );

  const handleScroll = () => {
    if (tabsListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
      setIsLeftScrollable(scrollLeft > 0);
      setIsRightScrollable(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const tabsList = tabsListRef.current;
    if (tabsList) {
      const checkScroll = () => handleScroll();

      checkScroll();
      const t1 = setTimeout(checkScroll, 50);
      const t2 = setTimeout(checkScroll, 200);
      const t3 = setTimeout(checkScroll, 500);

      tabsList.addEventListener('scroll', handleScroll);

      const resizeObserver = new ResizeObserver(() => handleScroll());
      resizeObserver.observe(tabsList);

      const handleResize = () => setTimeout(handleScroll, 100);
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
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

  const tabContent = (
    <>
      <TabsContent value='about' className='mt-0'>
        <ProjectAbout vm={vm} />
      </TabsContent>
      <TabsContent value='details' className='mt-0'>
        <ProjectDetails vm={vm} />
      </TabsContent>
      <TabsContent value='team' className='mt-0'>
        <ProjectTeam vm={vm} />
      </TabsContent>
      <TabsContent value='milestones' className='mt-0'>
        <ProjectMilestone vm={vm} />
      </TabsContent>
      <TabsContent value='voters' className='mt-0'>
        <ProjectVoters vm={vm} />
      </TabsContent>
      <TabsContent value='backers' className='mt-0'>
        <ProjectBackers vm={vm} />
      </TabsContent>
      <TabsContent value='comments' className='mt-0'>
        <ProjectComments projectId={vm.id} />
      </TabsContent>
    </>
  );

  return (
    <div className='from-background-main-bg to-background-main-bg min-h-screen bg-linear-to-b via-[#0a0a0a]'>
      <div className='mx-auto max-w-7xl 2xl:max-w-[1800px]'>
        <div className='flex flex-col gap-6 sm:gap-8 lg:flex-row lg:gap-8 xl:gap-12'>
          {/* Sidebar — full-width stacked on mobile/tablet, sticky side column on lg+ */}
          <div
            className={cn(
              'w-full',
              'lg:sticky lg:top-8 lg:h-fit lg:max-w-[360px] lg:shrink-0 xl:max-w-[400px] 2xl:max-w-[440px]'
            )}
          >
            <div
              className={cn(
                'rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/50 to-gray-950/50 shadow-xl backdrop-blur-sm',
                'p-4 sm:p-5 lg:p-6'
              )}
            >
              <ProjectSidebar
                vm={vm}
                isMobile={isMobile}
                onRefresh={onRefresh}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className='min-h-0 min-w-0 flex-1'>
            <CampaignEndBanner vm={vm} />
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <div className='bg-background-main-bg/80 bozrder-b sticky top-0 z-30 mb-4 border-gray-800/50 py-0 backdrop-blur-md sm:mb-6 lg:mb-8'>
                <div className='relative'>
                  {isLeftScrollable && (
                    <ChevronLeftCircle
                      className='absolute top-1/2 left-0 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-gray-900/80 text-gray-400 backdrop-blur-sm transition-all hover:bg-gray-800 hover:text-white lg:hidden'
                      onClick={scrollLeft}
                      size={24}
                    />
                  )}

                  {isRightScrollable && (
                    <ChevronRightCircle
                      className='absolute top-1/2 right-0 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-gray-900/80 text-gray-400 backdrop-blur-sm transition-all hover:bg-gray-800 hover:text-white lg:hidden'
                      onClick={scrollRight}
                      size={24}
                    />
                  )}

                  <TabsList
                    className='scrollbar-hide bg-background-card flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg p-1 sm:gap-2'
                    ref={tabsListRef}
                  >
                    {visibleTabs.map(tab => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className={cn(
                          'relative rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200',
                          'sm:px-4 sm:py-2 lg:px-5 lg:py-2.5',
                          'text-gray-400 hover:bg-gray-800/30 hover:text-gray-300',
                          'data-[state=active]:bg-primary/10 data-[state=active]:text-primary',
                          'data-[state=active]:border-primary/30 data-[state=active]:border',
                          'focus-visible:ring-primary/20 focus-visible:ring-2'
                          // 'lg:rounded-t-2xl lg:rounded-b-none'
                        )}
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              {/* Tab Content */}
              <div className='space-y-6 sm:space-y-8'>{tabContent}</div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
