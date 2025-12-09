'use client';
import ProfileDataClient from '@/components/profile/ProfileDataClient';
import { authClient } from '@/lib/auth-client';
import { UserPageSkeleton } from '@/components/skeleton/UserPageSkeleton';

export function ProfileData() {
  const { data, isRefetching } = authClient.useSession();

  // Show skeleton loading when refetching
  if (isRefetching || !data?.user) {
    return <UserPageSkeleton />;
  }

  const username =
    data.user.profile?.username || data.user._id || data.user.id || 'me';

  // Type assertion since we know the session user now matches GetMeResponse structure
  return <ProfileDataClient user={data.user as any} username={username} />;
}
