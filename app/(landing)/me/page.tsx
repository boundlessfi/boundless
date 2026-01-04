import { AuthGuard } from '@/components/auth';
import { ProfileData } from './profile-data';

export default async function MePage() {
  return (
    <AuthGuard
      redirectTo='/auth?mode=signin'
      fallback={<div className='p-8 text-center'>Authenticating...</div>}
    >
      <section className=''>
        <ProfileData />
      </section>
    </AuthGuard>
  );
}
