import {
  getUserProfileByUsernameServer,
  getMeServer,
} from '@/lib/api/auth-server';
import { GetMeResponse } from '@/lib/api/types';
import { getServerUser } from '@/lib/auth/server-auth';
import ProfileOverview from '@/components/profile/ProfileOverview';

interface ProfileDataProps {
  username: string;
}

export async function ProfileData({ username }: ProfileDataProps) {
  const user = await getServerUser();

  // Check if user is authenticated
  if (!user) {
    return (
      <section className='flex min-h-screen items-center justify-center'>
        <div className='text-red-500'>Please sign in to view profiles</div>
      </section>
    );
  }

  try {
    // Check if viewing own profile by comparing with user data
    // We need to fetch user data first to get the username
    const currentUserData = await getMeServer();
    const isOwnProfile =
      currentUserData.profile?.username === username ||
      currentUserData._id === username;

    let userData: GetMeResponse;

    // Use server-side versions that forward cookies from request headers
    if (isOwnProfile) {
      // For own profile, use the already fetched user data
      userData = currentUserData;
    } else {
      // For other profiles, fetch by username
      userData = await getUserProfileByUsernameServer(username);
    }

    return <ProfileOverview username={username} user={userData} />;
  } catch (error) {
    // Check if it's an authentication error
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 401
    ) {
      return (
        <section className='flex min-h-screen items-center justify-center'>
          <div className='text-red-500'>
            Session expired. Please sign in again.
          </div>
        </section>
      );
    }

    return (
      <section className='flex min-h-screen items-center justify-center'>
        <div className='text-red-500'>Failed to load user profile</div>
      </section>
    );
  }
}
