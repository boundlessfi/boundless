// ProfileDataClient.tsx - Main Component
'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GetMeResponse } from '@/lib/api/types';
import ProfileOverview from './ProfileOverview';
import ActivityTab from './ActivityTab';
import ProjectsTab from './ProjectsTab';
import OrganizationsTab from './OrganizationsTab';
import ActivityFeed from './ActivityFeed';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

interface ProfileDataClientProps {
  user: GetMeResponse;
  username: string;
}

const FILTER_OPTIONS = [
  'All',
  'Today',
  'Yesterday',
  'This Week',
  'This Month',
  'This Year',
  'All Time',
];

export default function ProfileDataClient({
  user,
  username,
}: ProfileDataClientProps) {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const organizationsData =
    user.organizations?.map(org => ({
      name: org.name,
      avatarUrl: org.logo || '/blog1.jpg',
    })) || [];

  return (
    <div className='mt-14 flex flex-col gap-8 lg:flex-row lg:gap-16'>
      <ProfileOverview username={username} user={user} />

      <div className='flex-1'>
        <Tabs defaultValue='activity' className='w-full'>
          <div className='border-b border-zinc-800'>
            <TabsList className='h-auto w-full justify-start gap-6 bg-transparent p-0'>
              <TabsTrigger
                value='activity'
                className='data-[state=active]:border-primary rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:text-white'
              >
                Activity
              </TabsTrigger>
              <TabsTrigger
                value='projects'
                className='data-[state=active]:border-primary rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:text-white'
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value='organizations'
                className='data-[state=active]:border-primary rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:text-white md:hidden'
              >
                Organizations
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='mt-6'>
            <TabsContent value='activity' className='mt-0 space-y-6'>
              <ActivityTab user={user} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    className='gap-2 border-zinc-800 bg-zinc-900/50 text-white hover:bg-zinc-900 hover:text-white!'
                  >
                    <Filter className='h-4 w-4' />
                    {selectedFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='start'
                  className='border-zinc-800 bg-zinc-950 text-white hover:text-white!'
                >
                  {FILTER_OPTIONS.map(filter => (
                    <DropdownMenuItem
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={
                        selectedFilter === filter
                          ? 'bg-zinc-800'
                          : 'hover:!bg-zinc-600/50 hover:!text-white'
                      }
                    >
                      {filter}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <ActivityFeed filter={selectedFilter} user={user} />
            </TabsContent>

            <TabsContent value='projects' className='mt-0'>
              <ProjectsTab user={user} />
            </TabsContent>

            <TabsContent value='organizations' className='mt-0'>
              <OrganizationsTab organizations={organizationsData} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
