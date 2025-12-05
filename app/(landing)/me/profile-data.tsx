'use client';
import ProfileDataClient from '@/components/profile/ProfileDataClient';
import { authClient } from '@/lib/auth-client';

export function ProfileData() {
  const { data, error, isPending } = authClient.useSession();
  if (isPending) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!data?.user) {
    return <div>Please sign in to view your profile</div>;
  }

  const username =
    data.user.profile?.username || data.user._id || data.user.id || 'me';

  // Type assertion since we know the session user now matches GetMeResponse structure
  return <ProfileDataClient user={data.user as any} username={username} />;
}
