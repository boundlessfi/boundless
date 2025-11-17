import { getMeServer, getUserSettingsServer } from '@/lib/api/auth-server';
import { getServerUser } from '@/lib/auth/server-auth';
import ProfileUpdateScreen from '@/components/profile/ProfileUpdateScreen';

export default async function SettingsPage() {
  const user = await getServerUser();

  // Check if user is authenticated
  if (!user) {
    return (
      <section className='flex min-h-screen items-center justify-center'>
        <div className='text-red-500'>Please sign in to view your settings</div>
      </section>
    );
  }

  try {
    // Fetch user profile data and settings - Use server-side versions that forward cookies from request headers
    const [userData, settingsData] = await Promise.all([
      getMeServer(),
      getUserSettingsServer().catch(() => ({})), // Fallback to empty object if settings don't exist
    ]);

    return (
      <ProfileUpdateScreen user={userData} initialSettings={settingsData} />
    );
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
      error instanceof Error ? error.message : JSON.stringify(error);

    return (
      <section className='flex min-h-screen items-center justify-center'>
        <div className='text-red-500'>{errorMessage}</div>
      </section>
    );
  }
}
