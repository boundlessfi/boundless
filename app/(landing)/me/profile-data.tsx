import { getMeServer } from '@/lib/api/auth-server';
import { getServerUser } from '@/lib/auth/server-auth';
import ProfileDataClient from '@/components/profile/ProfileDataClient';

export async function ProfileData() {
  const user = await getServerUser();

  // Check if user is authenticated
  if (!user) {
    return (
      <section className='flex min-h-screen items-center justify-center'>
        <div className='text-red-500'>Please sign in to view your profile</div>
      </section>
    );
  }

  try {
    // Fetch user profile data - Use server-side version that forwards cookies from request headers
    const userData = await getMeServer();

    // Extract username from user data with proper fallback
    const username =
      userData.profile?.username || userData._id || user.id || 'me';

    return <ProfileDataClient user={userData} username={username} />;
  } catch (error) {
    // Handle authentication errors
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      (error.status === 401 || error.status === 403)
    ) {
      return (
        <section className='flex min-h-screen items-center justify-center'>
          <div className='text-red-500'>
            Session expired. Please sign in again.
          </div>
        </section>
      );
    }

    // Handle other errors
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to load your profile';

    return (
      <section className='flex min-h-screen items-center justify-center'>
        <div className='text-red-500'>{errorMessage}</div>
      </section>
    );
  }
}
