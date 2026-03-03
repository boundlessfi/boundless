'use client';

import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { getUserProfileByUsername } from '@/lib/api/auth';
import { authClient } from '@/lib/auth-client';
import { PublicUserProfile } from '@/features/projects/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import ActivityTab from '@/components/profile/ActivityTab';
import OrganizationsTab from '@/components/profile/OrganizationsTab';
import ProfileOverviewPublic from '@/components/profile/ProfileOverviewPublic';
import ProjectsTabPublic from '@/components/profile/ProjectsTabPublic';
import PublicEarningsTab from '@/components/profile/PublicEarningsTab';

interface PublicProfileDataProps {
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

const TAB_CLASS =
  'data-[state=active]:border-b-primary/45 rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:text-white';

export function ProfileData({
  username,
}: PublicProfileDataProps): React.ReactElement {
  const [userData, setUserData] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [authUsername, setAuthUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      try {
        setLoading(true);
        const { data: session } = await authClient.getSession();
        setAuthUsername(session?.user?.profile?.username || null);
        setIsAuthenticated(!!session?.user);
        const data = await getUserProfileByUsername(username);
        setUserData(data);
      } catch (err) {
        setError(`Failed to load user profile: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <section className='flex min-h-screen items-center justify-center'>
        <div className='text-white'>Loading profile...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='flex min-h-screen items-center justify-center'>
        <div className='text-red-500'>{error}</div>
      </section>
    );
  }

  if (!userData) {
    return (
      <section className='flex min-h-screen items-center justify-center'>
        <div className='text-red-500'>User not found</div>
      </section>
    );
  }

  const organizationsData =
    userData.organizations?.map(org => ({
      name: org.name,
      avatarUrl: org.logo || '/blog1.jpg',
    })) || [];
  const isOwnProfile = isAuthenticated && authUsername === userData.username;

  return (
    <section className='mt-14 flex flex-col gap-8 lg:flex-row lg:gap-16'>
      <ProfileOverviewPublic
        username={username}
        user={userData}
        isAuthenticated={isAuthenticated}
        isOwnProfile={isOwnProfile}
      />

      <div className='flex-1'>
        <Tabs defaultValue='activity' className='w-full'>
          <div className='border-b border-zinc-800'>
            <TabsList className='h-auto w-full justify-start gap-6 bg-transparent p-0'>
              <TabsTrigger value='activity' className={TAB_CLASS}>
                Activity
              </TabsTrigger>
              <TabsTrigger value='projects' className={TAB_CLASS}>
                Projects
              </TabsTrigger>
              <TabsTrigger value='earnings' className={TAB_CLASS}>
                Earnings
              </TabsTrigger>
              <TabsTrigger
                value='organizations'
                className={`${TAB_CLASS} md:hidden`}
              >
                Organizations
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='mt-6'>
            <TabsContent value='activity' className='mt-0 space-y-6'>
              <ActivityTab user={userData} />

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
            </TabsContent>

            <TabsContent value='projects' className='mt-0'>
              <ProjectsTabPublic user={userData} />
            </TabsContent>

            <TabsContent value='earnings' className='mt-0'>
              <PublicEarningsTab username={username} />
            </TabsContent>

            {isAuthenticated && isOwnProfile && (
              <TabsContent value='organizations' className='mt-0'>
                <OrganizationsTab organizations={organizationsData} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
