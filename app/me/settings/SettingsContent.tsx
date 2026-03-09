'use client';
import Profile from '@/components/profile/update/Profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { User } from '@/types/user';
import { getMe } from '@/lib/api/auth';
import { GetMeResponse } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';
import Settings from '@/components/profile/update/Settings';
import TwoFactorTab from '@/components/profile/update/TwoFactorTab';
import SecurityTab from '@/components/profile/update/SecurityTab';
import { IdentityVerificationSection } from '@/components/didit/IdentityVerificationSection';
import { invalidateAuthProfileCache } from '@/hooks/use-auth';
import { useRef } from 'react';
import { Loader2 } from 'lucide-react';

const SettingsContent = () => {
  const searchParams = useSearchParams();
  const fromVerification = searchParams.get('verification') === 'complete';
  const [userData, setUserData] = useState<GetMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Prevent unmounting tabs on background refetches (e.g. after 2FA enable)
  const hasLoadedOnce = useRef(false);

  const fetchUserData = useCallback(async () => {
    try {
      const user = await getMe();
      setUserData(user);
    } catch {
      setUserData(null);
    } finally {
      setIsLoading(false);
      hasLoadedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    // Only set isLoading true on the very first fetch
    if (!hasLoadedOnce.current) {
      setIsLoading(true);
    }
    fetchUserData();
  }, [fetchUserData]);

  const handleVerificationComplete = useCallback(async () => {
    await fetchUserData();
    invalidateAuthProfileCache();
  }, [fetchUserData]);

  // Only show skeleton on first load — not on background refetches
  if (isLoading && !hasLoadedOnce.current) {
    return (
      <div>
        <Skeleton className='h-full w-full' />
      </div>
    );
  }
  return (
    <div className='p-10'>
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
        <Tabs
          defaultValue={fromVerification ? 'identity' : 'profile'}
          className='w-full'
        >
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
            <TabsTrigger
              value='identity'
              className='text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
            >
              Identity
            </TabsTrigger>
          </TabsList>
          <TabsContent value='profile'>
            {userData?.user ? (
              <Profile user={userData.user as User} />
            ) : (
              <div className='flex items-center justify-center p-12'>
                <Loader2 className='mr-2 h-8 w-8 animate-spin text-[#a7f950]' />
                <span className='text-zinc-500'>Loading profile...</span>
              </div>
            )}
          </TabsContent>
          <TabsContent value='settings'>
            <Settings />
          </TabsContent>
          <TabsContent value='notifications' className='space-y-6'>
            <Settings visibleSections={['notifications']} />
          </TabsContent>
          <TabsContent value='privacy' className='space-y-6'>
            <Settings visibleSections={['privacy']} />
          </TabsContent>
          <TabsContent value='preferences' className='space-y-6'>
            <Settings visibleSections={['appearance', 'preferences']} />
          </TabsContent>
          <TabsContent value='security'>
            {userData?.user ? (
              <SecurityTab user={userData.user as User} />
            ) : (
              <div className='flex items-center justify-center p-12'>
                <Loader2 className='mr-2 h-8 w-8 animate-spin text-[#a7f950]' />
                <span className='text-zinc-500'>
                  Loading security settings...
                </span>
              </div>
            )}
          </TabsContent>
          <TabsContent value='2fa'>
            {userData?.user ? (
              <TwoFactorTab
                user={userData.user as User}
                onStatusChange={fetchUserData}
              />
            ) : (
              <div className='flex items-center justify-center p-12'>
                <Loader2 className='mr-2 h-8 w-8 animate-spin text-[#a7f950]' />
                <span className='text-zinc-500'>Loading 2FA settings...</span>
              </div>
            )}
          </TabsContent>
          <TabsContent value='identity' className='space-y-6'>
            <IdentityVerificationSection
              user={userData}
              onVerificationComplete={handleVerificationComplete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsContent;
