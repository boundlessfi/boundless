'use client';
import Profile from '@/components/profile/update/Profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { User } from '@/types/user';
import { getMe } from '@/lib/api/auth';
import { GetMeResponse } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';
import Settings from '@/components/profile/update/Settings';
const SettingsContent = () => {
  const [userData, setUserData] = useState<GetMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getMe();
        setUserData(user);
      } catch {
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div>
        <Skeleton className='h-full w-full' />
      </div>
    );
  }
  return (
    <div className=''>
      <div className=''>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-2 text-2xl font-medium text-white'>
            Profile Settings
          </h1>
          <p className='text-sm text-zinc-500'>
            Manage your personal information and public profile
          </p>
        </div>
        <Tabs defaultValue='profile' className='w-full'>
          <TabsList className='inline-flex h-auto gap-6 bg-transparent p-0'>
            <TabsTrigger
              value='profile'
              className='text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value='settings'
              className='text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
            >
              Settings
            </TabsTrigger>
            <TabsTrigger
              value='notifications'
              className='text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value='privacy'
              className='text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
            >
              Privacy
            </TabsTrigger>
            <TabsTrigger
              value='preferences'
              className='text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
            >
              Preferences
            </TabsTrigger>
            <TabsTrigger
              value='security'
              className='text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              value='2fa'
              className='text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
            >
              2FA
            </TabsTrigger>
          </TabsList>
          <TabsContent value='profile'>
            <Profile user={userData?.user as User} />
          </TabsContent>
          <TabsContent value='settings'>
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsContent;
