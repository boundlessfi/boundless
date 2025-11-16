'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamList, TeamMember } from '@/components/ui/TeamList';
import { Project } from '@/types/project';
import { ProjectList } from './ProjectList';

interface ModalTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  users?: TeamMember[];
  projects: Project[];
  onMemberClick: (member: TeamMember) => void;
}

const tabs = ['Projects', 'Hackathons', 'Grants', 'Creators'];

export function ModalTabs({
  activeTab,
  setActiveTab,
  users,
  projects,
  onMemberClick,
}: ModalTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
      <div className='bg-background sticky top-0 z-10 mb-6 border-b border-gray-800 py-0'>
        <TabsList className='mb-0 h-auto w-fit justify-start gap-6 rounded-none bg-transparent p-0'>
          {tabs.map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              className='data-[state=active]:border-primary rounded-none border-x-0 border-t-0 bg-transparent px-0 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-300 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:border-b-2 data-[state=active]:text-white'
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value='Projects' className='mt-6'>
        <ProjectList projects={projects} activeTab='Projects' />
      </TabsContent>

      <TabsContent value='Hackathons' className='mt-6'>
        <ProjectList projects={projects} activeTab='Hackathons' />
      </TabsContent>

      <TabsContent value='Grants' className='mt-6'>
        <ProjectList projects={projects} activeTab='Grants' />
      </TabsContent>

      <TabsContent value='Creators' className='mt-6'>
        <TeamList
          members={users || []}
          onMemberClick={onMemberClick}
          emptyStateTitle='No Creators'
          emptyStateDescription='No creators found in this category.'
        />
      </TabsContent>
    </Tabs>
  );
}
