import { ProfileData } from './profile-data';
import { checkAuth } from '@/lib/check-auth';

export default async function MePage() {
  await checkAuth();
  return (
    <section className=''>
      <ProfileData />
    </section>
  );
}
