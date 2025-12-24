import { ProfileData } from './profile-data';
// import { checkAuth } from '@/lib/check-auth';

export default async function MePage() {
  //Remove this comment when auth is implemented
  // await checkAuth();
  return (
    <section className=''>
      <ProfileData />
    </section>
  );
}
