'use client';
import Profile from '@/components/profile/update/Profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { VerificationSubmittedModal } from '@/components/didit/VerificationSubmittedModal';
import { User } from '@/types/user';
import { getMe } from '@/lib/api/auth';
import {
  getDiditStatus,
  type VerificationState,
  type VerificationStatus,
} from '@/lib/api/didit';
import { GetMeResponse } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';
import Settings from '@/components/profile/update/Settings';
import TwoFactorTab from '@/components/profile/update/TwoFactorTab';
import SecurityTab from '@/components/profile/update/SecurityTab';
import { IdentityVerificationSection } from '@/components/didit/IdentityVerificationSection';
import { useRef } from 'react';
import { Loader2 } from 'lucide-react';

const KNOWN_VERIFICATION_STATES = new Set<VerificationState>([
  'not_started',
  'in_progress',
  'in_review',
  'approved',
  'declined',
  'abandoned',
  'expired',
]);

const SettingsContent = () => {
  const searchParams = useSearchParams();
  const verificationParam = searchParams.get('verification');
  // Modal is shown when the user just returned from the Didit hosted flow:
  // the legacy callback used `verification=complete`, the new callback
  // forwards the resolved `state` (e.g. `verification=in_review`).
  const fromVerification = Boolean(verificationParam);
  const initialModalState: VerificationState | null =
    verificationParam &&
    KNOWN_VERIFICATION_STATES.has(verificationParam as VerificationState)
      ? (verificationParam as VerificationState)
      : verificationParam === 'complete'
        ? 'in_review'
        : null;
  const [verificationModalStatus, setVerificationModalStatus] =
    useState<VerificationStatus | null>(null);
  const [userData, setUserData] = useState<GetMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] =
    useState(fromVerification);
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
    if (!hasLoadedOnce.current) {
      setIsLoading(true);
    }
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (!fromVerification) return;
    let cancelled = false;
    getDiditStatus()
      .then(status => {
        if (cancelled) return;
        setVerificationModalStatus(status);
      })
      .catch(() => {
        if (cancelled) return;
        if (initialModalState) {
          setVerificationModalStatus({
            state: initialModalState,
            canStartNew: false,
            message: '',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fromVerification, initialModalState]);

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
      <VerificationSubmittedModal
        open={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        status={verificationModalStatus}
      />
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
          defaultValue={
            searchParams.get('tab') === 'identity' || fromVerification
              ? 'identity'
              : 'profile'
          }
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
                <Loader2 className='text-primary mr-2 h-8 w-8 animate-spin' />
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
                <Loader2 className='text-primary mr-2 h-8 w-8 animate-spin' />
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
                <Loader2 className='text-primary mr-2 h-8 w-8 animate-spin' />
                <span className='text-zinc-500'>Loading 2FA settings...</span>
              </div>
            )}
          </TabsContent>
          <TabsContent value='identity' className='space-y-6'>
            <IdentityVerificationSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsContent;
