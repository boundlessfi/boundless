'use client';
import ProfileDataClient from '@/components/profile/ProfileDataClient';
import { UserPageSkeleton } from '@/components/skeleton/UserPageSkeleton';
import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api/auth';
import { GetMeResponse } from '@/lib/api/types';

export function ProfileData() {
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
  }, []); // Empty dependency array to only fetch once on mount

  if (isLoading) {
    return <UserPageSkeleton />;
  }

  if (!userData) {
    return (
      <div className='min-h-screen bg-black'>
        <div className='mx-auto w-full px-4 py-8 md:px-6 lg:px-8'>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
            <div className='text-center'>
              <h2 className='mb-2 text-lg font-medium text-white'>
                Failed to load profile
              </h2>
              <p className='text-sm text-zinc-500'>
                Please try refreshing the page or contact support if the problem
                persists.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ProfileDataClient user={userData} />;
}
