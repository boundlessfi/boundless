'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VerificationSubmittedModal } from '@/components/didit/VerificationSubmittedModal';
import { User } from '@/types/user';
import { getMe } from '@/lib/api/auth';
import { GetMeResponse } from '@/lib/api/types';
import Profile from '@/components/profile/update/Profile';
import Settings from '@/components/profile/update/Settings';
import TwoFactorTab from '@/components/profile/update/TwoFactorTab';
import SecurityTab from '@/components/profile/update/SecurityTab';
import RolesTab from '@/components/profile/update/RolesTab';
import { IdentityVerificationSection } from '@/components/didit/IdentityVerificationSection';
import {
  User as UserIcon,
  Briefcase,
  Bell,
  Shield,
  Lock,
  Paintbrush,
  Fingerprint,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'roles', label: 'Roles', icon: Briefcase },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Paintbrush },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'identity', label: 'Identity', icon: Fingerprint },
] as const;

type TabId = (typeof TABS)[number]['id'];

const SettingsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fromVerification = searchParams.get('verification') === 'complete';
  const tabParam = searchParams.get('tab') as TabId | null;

  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && TABS.some(t => t.id === tabParam)
      ? tabParam
      : fromVerification
        ? 'identity'
        : 'profile'
  );
  const [userData, setUserData] = useState<GetMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] =
    useState(fromVerification);
  const hasLoadedOnce = useRef(false);
  const tabsRef = useRef<HTMLDivElement>(null);

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
    if (!hasLoadedOnce.current) setIsLoading(true);
    fetchUserData();
  }, [fetchUserData]);

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (!tabsRef.current) return;
    const activeEl = tabsRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  const handleTabClick = (id: TabId) => {
    setActiveTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', id);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  if (isLoading && !hasLoadedOnce.current) {
    return (
      <div className='p-4 sm:p-6 md:p-8'>
        <Skeleton className='mb-6 h-8 w-48' />
        <Skeleton className='mb-6 h-10 w-full max-w-2xl' />
        <Skeleton className='h-80 w-full rounded-xl' />
      </div>
    );
  }

  const renderLoading = (label: string) => (
    <div className='flex items-center justify-center py-16'>
      <Loader2 className='text-primary mr-2 h-6 w-6 animate-spin' />
      <span className='text-zinc-500'>Loading {label}...</span>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return userData?.user ? (
          <Profile user={userData.user as User} />
        ) : (
          renderLoading('profile')
        );
      case 'roles':
        return <RolesTab />;
      case 'notifications':
        return <Settings visibleSections={['notifications']} />;
      case 'privacy':
        return <Settings visibleSections={['privacy']} />;
      case 'appearance':
        return <Settings visibleSections={['appearance', 'preferences']} />;
      case 'security':
        return userData?.user ? (
          <div className='space-y-8'>
            <SecurityTab user={userData.user as User} />
            <div className='border-t border-zinc-800/50 pt-8'>
              <TwoFactorTab
                user={userData.user as User}
                onStatusChange={fetchUserData}
              />
            </div>
          </div>
        ) : (
          renderLoading('security')
        );
      case 'identity':
        return <IdentityVerificationSection user={userData} />;
      default:
        return null;
    }
  };

  return (
    <div className='p-4 sm:p-6 md:p-8'>
      <VerificationSubmittedModal
        open={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      />

      <div className='mx-auto max-w-3xl'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-xl font-semibold text-white sm:text-2xl'>
            Settings
          </h1>
          <p className='mt-1 text-sm text-zinc-500'>
            Manage your account, preferences, and security
          </p>
        </div>

        {/* Tab bar */}
        <div
          ref={tabsRef}
          className='scrollbar-none -mx-4 mb-6 flex gap-1 overflow-x-auto px-4 pb-px sm:mx-0 sm:px-0'
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-active={isActive}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                <span className='whitespace-nowrap'>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className='min-h-[24rem]'>{renderContent()}</div>
      </div>
    </div>
  );
};

export default SettingsContent;
