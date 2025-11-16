'use client';

import { useState } from 'react';
import { ListFilter } from 'lucide-react';
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
import { BoundlessButton } from '../buttons';

interface ProfileDataClientProps {
  user: GetMeResponse;
  username: string;
}

export default function ProfileDataClient({
  user,
  username,
}: ProfileDataClientProps) {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  // Prepare organizations data for the tab
  const organizationsData =
    user.organizations?.map(org => ({
      name: org.name,
      avatarUrl: (org as unknown as { logo?: string }).logo || '/blog1.jpg',
    })) || [];

  return (
    <div className='mt-14 flex flex-col justify-between gap-16 lg:flex-row'>
      <ProfileOverview username={username} user={user} />

      <div className='w-full'>
        <Tabs defaultValue='activity' className='w-full'>
          <div className='mb-6 border-b border-gray-800 py-0'>
            <TabsList className='mb-0 h-auto w-fit justify-start gap-6 rounded-none bg-transparent p-0'>
              <TabsTrigger
                value='activity'
                className='data-[state=active]:border-primary rounded-none border-x-0 border-t-0 bg-transparent px-0 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-300 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:border-b-2 data-[state=active]:text-white'
              >
                Activity
              </TabsTrigger>
              <TabsTrigger
                value='projects'
                className='data-[state=active]:border-primary rounded-none border-x-0 border-t-0 bg-transparent px-0 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-300 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:border-b-2 data-[state=active]:text-white'
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value='organizations'
                className='data-[state=active]:border-primary rounded-none border-x-0 border-t-0 bg-transparent px-0 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-300 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:border-b-2 data-[state=active]:text-white md:hidden'
              >
                Organizations
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='mt-8'>
            <TabsContent value='activity' className='mt-0'>
              <ActivityTab user={user} />
              <div className='mt-6'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <BoundlessButton
                      variant='outline'
                      iconPosition='right'
                      icon={<ListFilter className='size-4' />}
                    >
                      {selectedFilter}
                    </BoundlessButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start'>
                    <DropdownMenuItem onClick={() => handleFilterChange('All')}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange('Today')}
                    >
                      Today
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange('Yesterday')}
                    >
                      Yesterday
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange('This Week')}
                    >
                      This Week
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange('This Month')}
                    >
                      This Month
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange('This Year')}
                    >
                      This Year
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange('All Time')}
                    >
                      All Time
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className='mt-8'>
                <ActivityFeed filter={selectedFilter} user={user} />
              </div>
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
